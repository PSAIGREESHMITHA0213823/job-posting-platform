const db = require("../../config/db");

exports.getUsers = async (req, res) => {
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
};