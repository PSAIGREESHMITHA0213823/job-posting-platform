
const getAdmins = async (req, res) => {
  try {
    const pool = req.pool;
    const result = await pool.query(
      `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'No admins found' });
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAdmins error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyAdminThread = async (req, res) => {
  try {
    const pool = req.pool;
    const me   = String(req.user.id);

    const result = await pool.query(
      `SELECT m.*, u.email AS sender_email
       FROM admin_messages m
       JOIN users u ON u.id::TEXT = m.sender_id::TEXT
       WHERE m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1
       ORDER BY m.created_at ASC`,
      [me]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMyAdminThread error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const pool      = req.pool;
    const sender_id = req.user.id;
    const { receiver_id, message } = req.body;

    if (!message?.trim())
      return res.status(400).json({ success: false, message: 'message is required' });

    const result = await pool.query(
      `INSERT INTO admin_messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [sender_id, receiver_id || null, message.trim()]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const pool   = req.pool;
    const userId = String(req.user.id);
    const { id } = req.params;

    const check = await pool.query(
      `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });
    if (String(check.rows[0].sender_id) !== userId)
      return res.status(403).json({ success: false, message: 'Not your message' });

    await pool.query(
      `UPDATE admin_messages SET deleted_at = NOW() WHERE id = $1`, [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const reactToMessage = async (req, res) => {
  try {
    const pool   = req.pool;
    const userId = String(req.user.id);
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji)
      return res.status(400).json({ success: false, message: 'emoji is required' });

    const row = await pool.query(
      `SELECT reactions FROM admin_messages WHERE id = $1`, [id]
    );
    if (row.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });

    let reactions = row.rows[0].reactions || [];

    const idx = reactions.findIndex(r => r.emoji === emoji && String(r.user_id) === userId);
    if (idx >= 0) reactions.splice(idx, 1);
    else reactions.push({ emoji, user_id: userId });

    await pool.query(
      `UPDATE admin_messages SET reactions = $1::jsonb WHERE id = $2`,
      [JSON.stringify(reactions), id]
    );

    res.json({ success: true, reactions });
  } catch (err) {
    console.error('reactToMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const pool  = req.pool;
    const me    = String(req.user.id);
    const other = String(req.params.userId);

    const result = await pool.query(
      `SELECT * FROM admin_messages
       WHERE (sender_id::TEXT = $1 AND (receiver_id::TEXT = $2 OR receiver_id IS NULL))
          OR (sender_id::TEXT = $2 AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
       ORDER BY created_at ASC`,
      [me, other]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllEmployeeChats = async (req, res) => {
  try {
    const pool    = req.pool;
    const adminId = String(req.user.id);

    const result = await pool.query(
      `SELECT DISTINCT ON (u.id)
         u.id, u.email,
         m.message    AS last_message,
         m.created_at AS last_at
       FROM admin_messages m
       JOIN users u ON (
         -- employee sent to this admin or broadcast
         (m.sender_id::TEXT != $1 AND (m.receiver_id::TEXT = $1 OR m.receiver_id IS NULL) AND u.id::TEXT = m.sender_id::TEXT)
         OR
         -- admin sent to employee
         (m.sender_id::TEXT = $1 AND u.id::TEXT = m.receiver_id::TEXT)
       )
       WHERE u.role != 'admin'
       ORDER BY u.id, m.created_at DESC`,
      [adminId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAllEmployeeChats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdmins, getMyAdminThread,
  sendMessage, deleteMessage, reactToMessage,
  getMessages, getAllEmployeeChats,
};