// const router = require("express").Router();
// const db = require("../../config/db");
// const { auth } = require("../../middleware/auth");
// const ctrl = require("../../controllers/employee/usersController");

// router.get("/users", auth, async (req, res) => {
//   try {
//     const companyId = req.user.company_id;

//     const result = await db.query(
//       `SELECT id, full_name, email 
//        FROM users 
//        WHERE company_id=$1 AND id != $2`,
//       [companyId, req.user.id]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
const router   = require("express").Router();
const db       = require("../../config/db");
const { auth } = require("../../middleware/auth"); // ✅ correct import

// GET /api/users  ← mounted at /api/users in server.js, so path here is just "/"
router.get("/", auth, async (req, res) => {
  try {
    // Return ALL users except the currently logged-in user
    // Works for any role (admin sees everyone, company sees their users, etc.)
    const result = await db.query(
      `SELECT 
         id,
         full_name  AS name,
         email,
         role,
         avatar_url,
         company_id
       FROM users
       WHERE id != $1
       ORDER BY full_name ASC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("[/api/users] error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;