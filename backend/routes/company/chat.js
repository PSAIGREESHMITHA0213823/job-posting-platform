const router = require("express").Router();
const db = require("../../config/db");
router.get("/messages/:receiverId", async (req, res) => {
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
});

router.post("/send", async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, content } = req.body;

  const result = await db.query(
    `INSERT INTO messages(sender_id, receiver_id, content)
     VALUES($1,$2,$3) RETURNING *`,
    [senderId, receiver_id, content]
  );

  res.json(result.rows[0]);
});

module.exports = router;