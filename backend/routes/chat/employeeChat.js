
// const router = require('express').Router();
// const path   = require('path');
// const fs     = require('fs');
// const multer = require('multer');
// const { auth, requireRole } = require('../../middleware/auth');
// const ctrl = require('../../controllers/chat/chat.controller');

// // ─── Multer storage for chat files ────────────────────────────────────────────
// const uploadDir = path.join(__dirname, '../../uploads/chat');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, uploadDir),
//   filename:    (_req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
//     const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
//     if (allowed.test(ext)) cb(null, true);
//     else cb(new Error('File type not allowed'));
//   },
// });

// // ─── Multer storage for profile photos ───────────────────────────────────────
// const photoDir = path.join(__dirname, '../../uploads/photos');
// if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

// const photoStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, photoDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `user_${req.userId}${ext}`);
//   },
// });
// const uploadPhoto = multer({
//   storage: photoStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// // ─── Auth ─────────────────────────────────────────────────────────────────────
// router.use(auth);
// router.use(requireRole('employee'));

// // ─── Chat Routes ──────────────────────────────────────────────────────────────
// router.get('/admins',             ctrl.getAdmins);
// router.get('/my-thread',          ctrl.getMyAdminThread);
// router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
// router.put('/:id',                ctrl.editMessage);
// router.delete('/:id',             ctrl.deleteMessage);
// router.post('/:id/delete-for-me', ctrl.deleteForMe);
// router.post('/:id/react',         ctrl.reactToMessage);

// // ─── Profile Routes ───────────────────────────────────────────────────────────
// // ✅ FIX: ChatBot.jsx calls /api/chat/employee/profile — registered here

// /**
//  * GET /api/chat/employee/profile
//  * Returns employee profile including photo_url
//  */
// router.get('/profile', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT id, email, full_name, photo_url FROM users WHERE id = ?`,
//       [req.userId]
//     );
//     if (!rows.length) return res.status(404).json({ success: false });
//     res.json({ success: true, ...rows[0] });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * POST /api/chat/employee/profile/photo
//  * Upload / replace profile photo
//  * Form field: "photo"
//  */
// router.post('/profile/photo', uploadPhoto.single('photo'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
//     const photoUrl = `/uploads/photos/${req.file.filename}`;
//     await db.query(`UPDATE users SET photo_url = ? WHERE id = ?`, [photoUrl, req.userId]);
//     res.json({ success: true, photo_url: photoUrl });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─── Call Signalling Routes ───────────────────────────────────────────────────
// // ✅ FIX: ChatBot.jsx calls /api/chat/calls/... but should call /api/chat/employee/calls/...
// // These routes are registered here so they resolve correctly.

// /**
//  * POST /api/chat/employee/calls/initiate
//  * Employee initiates a call to admin.
//  * Body: { type: 'voice' | 'video', receiver_id?: number }
//  * If receiver_id is omitted, picks first available admin automatically.
//  */
// router.post('/calls/initiate', async (req, res) => {
//   try {
//     const { receiver_id, type } = req.body;

//     let actualReceiverId = receiver_id;
//     if (!actualReceiverId) {
//       const [admins] = await db.query(
//         `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
//       );
//       if (!admins.length) {
//         return res.status(404).json({ success: false, message: 'No admin available' });
//       }
//       actualReceiverId = admins[0].id;
//     }

//     const [result] = await db.query(
//       `INSERT INTO calls (caller_id, receiver_id, type, status, created_at)
//        VALUES (?, ?, ?, 'pending', NOW())`,
//       [req.userId, actualReceiverId, type]
//     );
//     res.json({ success: true, callId: result.insertId });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * GET /api/chat/employee/calls/:id/status
//  * Employee polls to find out if their call was accepted/declined/cancelled.
//  */
// router.get('/calls/:id/status', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT status FROM calls WHERE id = ? AND caller_id = ?`,
//       [req.params.id, req.userId]
//     );
//     if (!rows.length) return res.status(404).json({ success: false });
//     res.json({ success: true, status: rows[0].status }); // pending | accepted | declined | cancelled
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * POST /api/chat/employee/calls/:id/cancel
//  * Employee cancels the call before it is answered.
//  */
// router.post('/calls/:id/cancel', async (req, res) => {
//   try {
//     await db.query(
//       `UPDATE calls SET status = 'cancelled' WHERE id = ? AND caller_id = ?`,
//       [req.params.id, req.userId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;
const router = require('express').Router();
const path   = require('path');
const fs     = require('fs');
const multer = require('multer');
const { auth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/chat/chat.controller');
const db   = require('../../config/db');

const getUid = (req) => {
  const id = req.userId || req.user?.id || req.user?.userId || req.user?.sub;
  return id ? String(id) : null;
};

// ─── Multer: chat files ───────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/chat');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename:    (_req, file, cb) => {
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
    ok.test(path.extname(file.originalname).toLowerCase().replace('.', ''))
      ? cb(null, true) : cb(new Error('File type not allowed'));
  },
});

// ─── Multer: profile photos ───────────────────────────────────────────────────
const photoDir = path.join(__dirname, '../../uploads/photos');
if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, photoDir),
    filename: (req, file, cb) => {
      const uid = getUid(req) || 'unknown';
      cb(null, `user_${uid}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(auth);
router.use(requireRole('employee'));

// ─── Profile ──────────────────────────────────────────────────────────────────

// Returns basic profile — no photo_url since your users table doesn't have it
router.get('/profile', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const result = await db.query(
      `SELECT id, email FROM users WHERE id::TEXT = $1`, [uid]
    );
    if (!result.rows.length) return res.status(404).json({ success: false });
    res.json({ success: true, ...result.rows[0], photo_url: null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Photo upload — stores file locally, no DB column update since column doesn't exist
router.post('/profile/photo', uploadPhoto.single('photo'), async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const photoUrl = `/uploads/photos/${req.file.filename}`;
    res.json({ success: true, photo_url: photoUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Calls ────────────────────────────────────────────────────────────────────

router.post('/calls/initiate', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const { receiver_id, type } = req.body;
    let actualReceiverId = receiver_id;
    if (!actualReceiverId) {
      const admins = await db.query(
        `SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`
      );
      if (!admins.rows.length)
        return res.status(404).json({ success: false, message: 'No admin available' });
      actualReceiverId = admins.rows[0].id;
    }
    const result = await db.query(
      `INSERT INTO calls (caller_id, receiver_id, type, status, created_at)
       VALUES ($1::UUID, $2::UUID, $3, 'pending', NOW()) RETURNING id`,
      [uid, String(actualReceiverId), type]
    );
    res.json({ success: true, callId: result.rows[0].id });
  } catch (err) {
    console.error('employee calls/initiate error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/calls/:id/status', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const result = await db.query(
      `SELECT status FROM calls WHERE id::TEXT=$1 AND caller_id::TEXT=$2`,
      [req.params.id, uid]
    );
    if (!result.rows.length) return res.status(404).json({ success: false });
    res.json({ success: true, status: result.rows[0].status });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/calls/:id/cancel', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query(
      `UPDATE calls SET status='cancelled', updated_at=NOW() WHERE id::TEXT=$1 AND caller_id::TEXT=$2`,
      [req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── Chat Routes ──────────────────────────────────────────────────────────────
router.get('/admins',             ctrl.getAdmins);
router.get('/my-thread',          ctrl.getMyAdminThread);
router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
router.put('/:id',                ctrl.editMessage);
router.delete('/:id',             ctrl.deleteMessage);
router.post('/:id/delete-for-me', ctrl.deleteForMe);
router.post('/:id/react',         ctrl.reactToMessage);

module.exports = router;