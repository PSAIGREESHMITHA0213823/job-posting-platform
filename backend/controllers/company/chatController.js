const db = require("../../config/db");
exports.getMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;
    const result = await db.query(
      `SELECT * FROM messages
       WHERE (sender_id=$1 AND receiver_id=$2)
          OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY created_at`,
      [senderId, receiverId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;
    const result = await db.query(
      `INSERT INTO messages(sender_id, receiver_id, content)
       VALUES($1,$2,$3) RETURNING *`,
      [senderId, receiver_id, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};