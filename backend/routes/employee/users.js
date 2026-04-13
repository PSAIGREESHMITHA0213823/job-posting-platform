const router = require("express").Router();
const db = require("../../config/db");
const auth = require("../../middleware/auth");

router.get("/users", auth, async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT id, full_name, email 
       FROM users 
       WHERE company_id=$1 AND id != $2`,
      [companyId, req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;