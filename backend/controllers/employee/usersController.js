const db = require("../../config/db");

exports.getUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT id, full_name, email FROM users WHERE company_id=$1`,
      [companyId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("USERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};