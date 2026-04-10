const getAdmins = async (req, res) => {
  try {
    const pool = req.pool;
    const result = await pool.query(
      `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No admins found' });
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAdmins error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get ALL messages for the employee across ALL admins (merged thread) ─────
// This is the key fix: instead of fetching only with admins[0],
// we fetch every row where the employee is sender OR receiver,
// and the other party is any admin. Replies from any admin show up.
const getMyAdminThread = async (req, res) => {
  try {
    const pool = req.pool;
    const me   = String(req.user.id);

    const result = await pool.query(
      `SELECT m.*, u.email AS sender_email
       FROM admin_messages m
       JOIN users u ON u.id::TEXT = m.sender_id::TEXT
       WHERE m.sender_id::TEXT = $1
          OR m.receiver_id::TEXT = $1
       ORDER BY m.created_at ASC`,
      [me]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMyAdminThread error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Send a message ───────────────────────────────────────────────────────────
// receiver_id provided → single admin
// no receiver_id       → broadcast to ALL admins
const sendMessage = async (req, res) => {
  try {
    const pool      = req.pool;
    const sender_id = req.user.id;
    const { receiver_id, message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    if (receiver_id) {
      const result = await pool.query(
        `INSERT INTO admin_messages (sender_id, receiver_id, message)
         VALUES ($1, $2, $3) RETURNING *`,
        [sender_id, receiver_id, message.trim()]
      );
      return res.json({ success: true, data: result.rows[0] });
    }

    // broadcast to all admins
    const admins = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
    if (admins.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No admins available' });
    }

    const inserts = await Promise.all(
      admins.rows.map(admin =>
        pool.query(
          `INSERT INTO admin_messages (sender_id, receiver_id, message)
           VALUES ($1, $2, $3) RETURNING *`,
          [sender_id, admin.id, message.trim()]
        )
      )
    );

    res.json({ success: true, data: inserts.map(r => r.rows[0]) });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get conversation between two specific users ─────────────────────────────
const getMessages = async (req, res) => {
  try {
    const pool  = req.pool;
    const me    = String(req.user.id);
    const other = String(req.params.userId);

    const result = await pool.query(
      `SELECT * FROM admin_messages
       WHERE (sender_id::TEXT = $1 AND receiver_id::TEXT = $2)
          OR (sender_id::TEXT = $2 AND receiver_id::TEXT = $1)
       ORDER BY created_at ASC`,
      [me, other]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: get all employees who have chatted with this admin ───────────────
const getAllEmployeeChats = async (req, res) => {
  try {
    const pool    = req.pool;
    const adminId = String(req.user.id);

    const result = await pool.query(
      `SELECT DISTINCT ON (u.id)
         u.id,
         u.email,
         m.message    AS last_message,
         m.created_at AS last_at
       FROM admin_messages m
       JOIN users u
         ON u.id::TEXT = CASE
              WHEN m.sender_id::TEXT = $1 THEN m.receiver_id::TEXT
              ELSE m.sender_id::TEXT
            END
       WHERE m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1
       ORDER BY u.id, m.created_at DESC`,
      [adminId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAllEmployeeChats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAdmins, getMyAdminThread, sendMessage, getMessages, getAllEmployeeChats };