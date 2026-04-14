// // // // const router = require("express").Router();
// // // // const db = require("../../config/db");

// // // // router.get("/users", async (req, res) => {
// // // //   try {
// // // //     const companyId = req.user.company_id; 

// // // //     const result = await db.query(
// // // //       `SELECT id, full_name, email 
// // // //        FROM users 
// // // //        WHERE company_id = $1`,
// // // //       [companyId]
// // // //     );

// // // //     res.json(result.rows);
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: err.message });
// // // //   }
// // // // });

// // // // module.exports = router;
// // // const router   = require("express").Router();
// // // const db       = require("../../config/db");
// // // const { verifyToken } = require("../../middleware/auth"); // adjust path if different

// // // // GET /api/users  ← mounted at /api/users in server.js, so path here is just "/"
// // // router.get("/", verifyToken, async (req, res) => {
// // //   try {
// // //     // Return ALL users except the currently logged-in user
// // //     // Works for any role (admin sees everyone, company sees their users, etc.)
// // //     const result = await db.query(
// // //       `SELECT 
// // //          id,
// // //          full_name  AS name,
// // //          email,
// // //          role,
// // //          avatar_url,
// // //          company_id
// // //        FROM users
// // //        WHERE id != $1
// // //        ORDER BY full_name ASC`,
// // //       [req.user.id]
// // //     );

// // //     res.json({ success: true, data: result.rows });
// // //   } catch (err) {
// // //     console.error("[/api/users] error:", err.message);
// // //     res.status(500).json({ success: false, error: err.message });
// // //   }
// // // });

// // // module.exports = router;
// // const router     = require("express").Router();
// // const db         = require("../../config/db");
// // const { auth }   = require("../../middleware/auth");

// // // GET /api/users
// // router.get("/", auth, async (req, res) => {
// //   try {
// //     const result = await db.query(
// //       `SELECT 
// //          id,
// //          full_name  AS name,
// //          email,
// //          role,
// //          avatar_url,
// //          company_id
// //        FROM users
// //        WHERE id != $1
// //        ORDER BY full_name ASC`,
// //       [req.user.id]
// //     );

// //     res.json({ success: true, data: result.rows });
// //   } catch (err) {
// //     console.error("[/api/users] error:", err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // module.exports = router;
// const router     = require("express").Router();
// const db         = require("../../config/db");
// const { auth }   = require("../../middleware/auth");

// // GET /api/users
// router.get("/", auth, async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT 
//          id,
//          email,
//          role,
//          is_active,
//          photo_url                                    AS avatar_url,
//          raw_user_meta_data->>'name'                  AS name,
//          raw_user_meta_data->>'full_name'             AS full_name,
//          raw_user_meta_data->>'company_id'            AS company_id
//        FROM users
//        WHERE id != $1
//          AND is_active = true
//        ORDER BY email ASC`,
//       [req.user.id]
//     );

//     // Normalise: use name → full_name → email as display name
//     const data = result.rows.map(u => ({
//       ...u,
//       name: u.name || u.full_name || u.email,
//     }));

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("[/api/users] error:", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// module.exports = router;
const router   = require("express").Router();
const db       = require("../../config/db");
const { auth } = require("../../middleware/auth");

// GET /api/users
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         id,
         email,
         role,
         is_active,
         photo_url AS avatar_url
       FROM public.users
       WHERE id != $1
         AND is_active = true
       ORDER BY email ASC`,
      [req.user.id]
    );

    // Use email as display name since there is no name column
    const data = result.rows.map(u => ({
      ...u,
      name: u.email,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("[/api/users] error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;