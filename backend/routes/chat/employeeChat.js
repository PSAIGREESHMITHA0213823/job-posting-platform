
// const router = require('express').Router();
// const path   = require('path');
// const fs     = require('fs');
// const multer = require('multer');
// const { auth, requireRole } = require('../../middleware/auth');
// const ctrl = require('../../controllers/chat/chat.controller');
// const db   = require('../../config/db');

// const getUid = (req) => {
//   const id = req.userId || req.user?.id || req.user?.userId || req.user?.sub;
//   return id ? String(id) : null;
// };

// // ─── Multer: chat files ───────────────────────────────────────────────────────
// const uploadDir = path.join(__dirname, '../../uploads/chat');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (_req, _file, cb) => cb(null, uploadDir),
//     filename:    (_req, file, cb) => {
//       cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
//     },
//   }),
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const ok = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
//     ok.test(path.extname(file.originalname).toLowerCase().replace('.', ''))
//       ? cb(null, true) : cb(new Error('File type not allowed'));
//   },
// });

// // ─── Multer: profile photos ───────────────────────────────────────────────────
// const photoDir = path.join(__dirname, '../../uploads/photos');
// if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

// const uploadPhoto = multer({
//   storage: multer.diskStorage({
//     destination: (_req, _file, cb) => cb(null, photoDir),
//     filename: (req, file, cb) => {
//       const uid = getUid(req) || 'unknown';
//       cb(null, `user_${uid}${path.extname(file.originalname)}`);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// router.use(auth);
// router.use(requireRole('employee'));

// // ─── Profile ──────────────────────────────────────────────────────────────────

// // Returns basic profile — no photo_url since your users table doesn't have it
// router.get('/profile', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     const result = await db.query(
//       `SELECT id, email FROM users WHERE id::TEXT = $1`, [uid]
//     );
//     if (!result.rows.length) return res.status(404).json({ success: false });
//     res.json({ success: true, ...result.rows[0], photo_url: null });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Photo upload — stores file locally, no DB column update since column doesn't exist
// router.post('/profile/photo', uploadPhoto.single('photo'), async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
//     const photoUrl = `/uploads/photos/${req.file.filename}`;
//     res.json({ success: true, photo_url: photoUrl });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─── Calls ────────────────────────────────────────────────────────────────────

// router.post('/calls/initiate', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     const { receiver_id, type } = req.body;
//     let actualReceiverId = receiver_id;
//     if (!actualReceiverId) {
//       const admins = await db.query(
//         `SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`
//       );
//       if (!admins.rows.length)
//         return res.status(404).json({ success: false, message: 'No admin available' });
//       actualReceiverId = admins.rows[0].id;
//     }
//     const result = await db.query(
//       `INSERT INTO calls (caller_id, receiver_id, type, status, created_at)
//        VALUES ($1::UUID, $2::UUID, $3, 'pending', NOW()) RETURNING id`,
//       [uid, String(actualReceiverId), type]
//     );
//     res.json({ success: true, callId: result.rows[0].id });
//   } catch (err) {
//     console.error('employee calls/initiate error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.get('/calls/:id/status', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     const result = await db.query(
//       `SELECT status FROM calls WHERE id::TEXT=$1 AND caller_id::TEXT=$2`,
//       [req.params.id, uid]
//     );
//     if (!result.rows.length) return res.status(404).json({ success: false });
//     res.json({ success: true, status: result.rows[0].status });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// router.post('/calls/:id/cancel', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     await db.query(
//       `UPDATE calls SET status='cancelled', updated_at=NOW() WHERE id::TEXT=$1 AND caller_id::TEXT=$2`,
//       [req.params.id, uid]
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });
// // ─────────────────────────────────────────────────────────────────────────────
// // ADD THESE ROUTES to BOTH chat.admin.routes.js and chat.employee.routes.js
// // Place them alongside the other /calls/* routes (before /:userId)
// // ─────────────────────────────────────────────────────────────────────────────

// /**
//  * POST /calls/:id/offer
//  * Caller saves their WebRTC offer SDP
//  */
// router.post('/calls/:id/offer', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false });
//   try {
//     const { offer } = req.body;
//     await db.query(
//       `UPDATE calls SET offer = $1, updated_at = NOW() WHERE id::TEXT = $2 AND caller_id::TEXT = $3`,
//       [JSON.stringify(offer), req.params.id, uid]
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// /**
//  * POST /calls/:id/answer
//  * Callee saves their WebRTC answer SDP
//  */
// router.post('/calls/:id/answer', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false });
//   try {
//     const { answer } = req.body;
//     await db.query(
//       `UPDATE calls SET answer = $1, status = 'accepted', updated_at = NOW()
//        WHERE id::TEXT = $2 AND receiver_id::TEXT = $3`,
//       [JSON.stringify(answer), req.params.id, uid]
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// /**
//  * POST /calls/:id/ice
//  * Either side adds ICE candidates
//  * Body: { candidate, role: 'caller' | 'callee' }
//  */
// router.post('/calls/:id/ice', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false });
//   try {
//     const { candidate, role } = req.body;
//     const col = role === 'caller' ? 'caller_ice' : 'callee_ice';
//     await db.query(
//       `UPDATE calls SET ${col} = ${col} || $1::jsonb, updated_at = NOW()
//        WHERE id::TEXT = $2`,
//       [JSON.stringify([candidate]), req.params.id]
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// /**
//  * GET /calls/:id/signal
//  * Poll for the full signal state (offer, answer, ICE candidates)
//  */
// router.get('/calls/:id/signal', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false });
//   try {
//     const result = await db.query(
//       `SELECT status, offer, answer, caller_ice, callee_ice FROM calls WHERE id::TEXT = $1`,
//       [req.params.id]
//     );
//     if (!result.rows.length) return res.status(404).json({ success: false });
//     const row = result.rows[0];
//     res.json({
//       success: true,
//       status:     row.status,
//       offer:      row.offer      ? JSON.parse(row.offer)  : null,
//       answer:     row.answer     ? JSON.parse(row.answer) : null,
//       callerIce:  row.caller_ice || [],
//       calleeIce:  row.callee_ice || [],
//     });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });
// // ─────────────────────────────────────────────────────────────────────────────
// // ADD THIS ROUTE to chat.employee.routes.js
// // Place it alongside the other /calls/* routes (BEFORE /:id chat routes)
// //
// // This is the MISSING PIECE that allows employees to receive calls from admins.
// // Without this, the employee's ChatBot had no way to know an admin was calling.
// // ─────────────────────────────────────────────────────────────────────────────

// /**
//  * GET /api/chat/employee/calls/pending
//  * Employee polls this to detect an incoming call from an admin.
//  * Returns the oldest pending call where receiver_id = current employee.
//  */
// router.get('/calls/pending', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     const result = await db.query(
//       `SELECT c.id AS "callId", c.type, c.caller_id AS "userId",
//               u.email, NULL AS "photoUrl"
//        FROM calls c
//        JOIN users u ON u.id::TEXT = c.caller_id::TEXT
//        WHERE c.receiver_id::TEXT = $1 AND c.status = 'pending'
//        ORDER BY c.created_at ASC LIMIT 1`,
//       [uid]
//     );
//     res.json({ success: true, call: result.rows[0] || null });
//   } catch (err) {
//     console.error('employee calls/pending error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Also add /calls/:id/decline so employee can decline admin-initiated calls:
// router.post('/calls/:id/decline', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     await db.query(
//       `UPDATE calls SET status='declined', updated_at=NOW() WHERE id::TEXT=$1 AND receiver_id::TEXT=$2`,
//       [req.params.id, uid]
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });
// // ─── Chat Routes ──────────────────────────────────────────────────────────────
// router.get('/admins',             ctrl.getAdmins);
// router.get('/my-thread',          ctrl.getMyAdminThread);
// router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
// router.put('/:id',                ctrl.editMessage);
// router.delete('/:id',             ctrl.deleteMessage);
// router.post('/:id/delete-for-me', ctrl.deleteForMe);
// router.post('/:id/react',         ctrl.reactToMessage);

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

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/chat/employee/profile
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

// POST /api/chat/employee/profile/photo
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

// ─────────────────────────────────────────────────────────────────────────────
// CALLS ROUTES
// CRITICAL: All /calls/pending and /calls/initiate MUST come BEFORE /calls/:id
// because Express matches /:id first and would treat "pending" as an id param.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/chat/employee/calls/pending
// Employee polls to detect an incoming call from an admin
router.get('/calls/pending', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const result = await db.query(
      `SELECT c.id AS "callId", c.type, c.caller_id AS "userId",
              u.email, NULL AS "photoUrl"
       FROM calls c
       JOIN users u ON u.id::TEXT = c.caller_id::TEXT
       WHERE c.receiver_id::TEXT = $1 AND c.status = 'pending'
       ORDER BY c.created_at ASC LIMIT 1`,
      [uid]
    );
    res.json({ success: true, call: result.rows[0] || null });
  } catch (err) {
    console.error('employee calls/pending error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/initiate
// Employee initiates a call — auto-picks the first available admin if no receiver_id given
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

// GET /api/chat/employee/calls/:id/status
router.get('/calls/:id/status', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const result = await db.query(
      `SELECT status FROM calls WHERE id::TEXT=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false });
    res.json({ success: true, status: result.rows[0].status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/:id/cancel
// Employee (caller) cancels the call they initiated
router.post('/calls/:id/cancel', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query(
      `UPDATE calls SET status='cancelled', updated_at=NOW()
       WHERE id::TEXT=$1 AND caller_id::TEXT=$2`,
      [req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/:id/decline
// Employee (callee) declines an incoming admin call
router.post('/calls/:id/decline', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query(
      `UPDATE calls SET status='declined', updated_at=NOW()
       WHERE id::TEXT=$1 AND receiver_id::TEXT=$2`,
      [req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/:id/accept
router.post('/calls/:id/accept', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await db.query(
      `UPDATE calls SET status='accepted', updated_at=NOW()
       WHERE id::TEXT=$1 AND receiver_id::TEXT=$2`,
      [req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/:id/offer
// Caller (employee) saves their WebRTC offer SDP
router.post('/calls/:id/offer', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false });
  try {
    const { offer } = req.body;
    await db.query(
      `UPDATE calls SET offer = $1, updated_at = NOW()
       WHERE id::TEXT = $2 AND caller_id::TEXT = $3`,
      [JSON.stringify(offer), req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/:id/answer
// Callee (employee receiving admin call) saves WebRTC answer SDP
router.post('/calls/:id/answer', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false });
  try {
    const { answer } = req.body;
    await db.query(
      `UPDATE calls SET answer = $1, status = 'accepted', updated_at = NOW()
       WHERE id::TEXT = $2 AND receiver_id::TEXT = $3`,
      [JSON.stringify(answer), req.params.id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/employee/calls/:id/ice
// Either side posts ICE candidates
router.post('/calls/:id/ice', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false });
  try {
    const { candidate, role } = req.body;
    const col = role === 'caller' ? 'caller_ice' : 'callee_ice';
    await db.query(
      `UPDATE calls SET ${col} = ${col} || $1::jsonb, updated_at = NOW()
       WHERE id::TEXT = $2`,
      [JSON.stringify([candidate]), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/employee/calls/:id/signal
// Poll for full WebRTC signal state
router.get('/calls/:id/signal', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false });
  try {
    const result = await db.query(
      `SELECT status, offer, answer, caller_ice, callee_ice
       FROM calls WHERE id::TEXT = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false });
    const row = result.rows[0];
    res.json({
      success:    true,
      status:     row.status,
      offer:      row.offer     ? JSON.parse(row.offer)  : null,
      answer:     row.answer    ? JSON.parse(row.answer) : null,
      callerIce:  row.caller_ice || [],
      calleeIce:  row.callee_ice || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT ROUTES — /:id catch-alls MUST be LAST
// ─────────────────────────────────────────────────────────────────────────────

router.get('/admins',             ctrl.getAdmins);
router.get('/my-thread',          ctrl.getMyAdminThread);
router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
router.put('/:id',                ctrl.editMessage);
router.delete('/:id',             ctrl.deleteMessage);
router.post('/:id/delete-for-me', ctrl.deleteForMe);
router.post('/:id/react',         ctrl.reactToMessage);

module.exports = router;