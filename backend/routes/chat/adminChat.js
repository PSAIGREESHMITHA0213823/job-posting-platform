
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
//   limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB per file
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
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
// });

// // ─── Auth ─────────────────────────────────────────────────────────────────────
// router.use(auth);
// router.use(requireRole('admin'));

// // ─── Chat Routes ──────────────────────────────────────────────────────────────
// router.get('/users',              ctrl.getAllEmployeeChats);            // GET    /api/chat/admin/users
// router.post('/send',              upload.array('files', 5), ctrl.sendMessage); // POST /api/chat/admin/send
// router.put('/:id',                ctrl.editMessage);                   // PUT    /api/chat/admin/:id
// router.delete('/:id',             ctrl.deleteMessage);                 // DELETE /api/chat/admin/:id
// router.post('/:id/delete-for-me', ctrl.deleteForMe);                   // POST   /api/chat/admin/:id/delete-for-me
// router.post('/:id/react',         ctrl.reactToMessage);                // POST   /api/chat/admin/:id/react
// router.get('/:userId',            ctrl.getMessages);                   // GET    /api/chat/admin/:userId

// // ─── Call Signalling Routes ───────────────────────────────────────────────────

// /**
//  * GET /api/chat/admin/calls/pending
//  * Admin polls this to detect an incoming call meant for them.
//  * Returns the oldest pending call where receiver_id = current admin.
//  */
// router.get('/calls/pending', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT c.id AS callId, c.type, c.caller_id AS userId,
//               u.email, u.photo_url AS photoUrl
//        FROM calls c
//        JOIN users u ON u.id = c.caller_id
//        WHERE c.receiver_id = ? AND c.status = 'pending'
//        ORDER BY c.created_at ASC
//        LIMIT 1`,
//       [req.userId]
//     );
//     if (rows.length === 0) return res.json({ success: true, call: null });
//     res.json({ success: true, call: rows[0] });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * POST /api/chat/admin/calls/:id/accept
//  * Admin accepts an incoming call.
//  */
// router.post('/calls/:id/accept', async (req, res) => {
//   try {
//     await db.query(
//       `UPDATE calls SET status = 'accepted' WHERE id = ? AND receiver_id = ?`,
//       [req.params.id, req.userId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * POST /api/chat/admin/calls/:id/decline
//  * Admin declines an incoming call.
//  */
// router.post('/calls/:id/decline', async (req, res) => {
//   try {
//     await db.query(
//       `UPDATE calls SET status = 'declined' WHERE id = ? AND receiver_id = ?`,
//       [req.params.id, req.userId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * POST /api/chat/admin/calls/:id/cancel
//  * Admin cancels a call they initiated before it was answered.
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

// /**
//  * GET /api/chat/admin/calls/:id/status
//  * Admin (as caller) polls to see if call was accepted/declined.
//  */
// router.get('/calls/:id/status', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT status FROM calls WHERE id = ? AND caller_id = ?`,
//       [req.params.id, req.userId]
//     );
//     if (!rows.length) return res.status(404).json({ success: false });
//     res.json({ success: true, status: rows[0].status });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * POST /api/chat/admin/calls/initiate
//  * Admin initiates a call to an employee.
//  * Body: { receiver_id: number, type: 'voice' | 'video' }
//  */
// router.post('/calls/initiate', async (req, res) => {
//   try {
//     const { receiver_id, type } = req.body;
//     const call = await db.query(
//       `INSERT INTO calls (caller_id, receiver_id, type, status, created_at)
//        VALUES (?, ?, ?, 'pending', NOW())`,
//       [req.userId, receiver_id, type]
//     );
//     res.json({ success: true, callId: call.insertId });
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

// ─── Multer ───────────────────────────────────────────────────────────────────
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

router.use(auth);
router.use(requireRole('admin'));

// ── /calls/* MUST come before /:userId ───────────────────────────────────────

router.get('/calls/pending', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const result = await db.query(
      `SELECT c.id AS "callId", c.type, c.caller_id AS "userId", u.email,
              NULL AS "photoUrl"
       FROM calls c
       JOIN users u ON u.id::TEXT = c.caller_id::TEXT
       WHERE c.receiver_id::TEXT = $1 AND c.status = 'pending'
       ORDER BY c.created_at ASC LIMIT 1`,
      [uid]
    );
    res.json({ success: true, call: result.rows[0] || null });
  } catch (err) {
    console.error('calls/pending error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/calls/initiate', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const { receiver_id, type } = req.body;
    if (!receiver_id) return res.status(400).json({ success: false, message: 'receiver_id is required' });
    if (!type)        return res.status(400).json({ success: false, message: 'type is required' });
    const result = await db.query(
      `INSERT INTO calls (caller_id, receiver_id, type, status, created_at)
       VALUES ($1::UUID, $2::UUID, $3, 'pending', NOW()) RETURNING id`,
      [uid, String(receiver_id), type]
    );
    res.json({ success: true, callId: result.rows[0].id });
  } catch (err) {
    console.error('calls/initiate error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/calls/:id/accept', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query(
      `UPDATE calls SET status='accepted', updated_at=NOW() WHERE id::TEXT=$1 AND receiver_id::TEXT=$2`,
      [req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/calls/:id/decline', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query(
      `UPDATE calls SET status='declined', updated_at=NOW() WHERE id::TEXT=$1 AND receiver_id::TEXT=$2`,
      [req.params.id, uid]
    );
    res.json({ success: true });
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

// ── Chat routes — /:userId LAST ───────────────────────────────────────────────
router.get('/users',              ctrl.getAllEmployeeChats);
router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
router.put('/:id',                ctrl.editMessage);
router.delete('/:id',             ctrl.deleteMessage);
router.post('/:id/delete-for-me', ctrl.deleteForMe);
router.post('/:id/react',         ctrl.reactToMessage);
router.get('/:userId',            ctrl.getMessages);

module.exports = router;