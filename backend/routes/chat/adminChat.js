
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

// // ─── Multer ───────────────────────────────────────────────────────────────────
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

// router.use(auth);
// router.use(requireRole('admin'));

// // ── /calls/* MUST come before /:userId ───────────────────────────────────────

// router.get('/calls/pending', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     const result = await db.query(
//       `SELECT c.id AS "callId", c.type, c.caller_id AS "userId", u.email,
//               NULL AS "photoUrl"
//        FROM calls c
//        JOIN users u ON u.id::TEXT = c.caller_id::TEXT
//        WHERE c.receiver_id::TEXT = $1 AND c.status = 'pending'
//        ORDER BY c.created_at ASC LIMIT 1`,
//       [uid]
//     );
//     res.json({ success: true, call: result.rows[0] || null });
//   } catch (err) {
//     console.error('calls/pending error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.post('/calls/initiate', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     const { receiver_id, type } = req.body;
//     if (!receiver_id) return res.status(400).json({ success: false, message: 'receiver_id is required' });
//     if (!type)        return res.status(400).json({ success: false, message: 'type is required' });
//     const result = await db.query(
//       `INSERT INTO calls (caller_id, receiver_id, type, status, created_at)
//        VALUES ($1::UUID, $2::UUID, $3, 'pending', NOW()) RETURNING id`,
//       [uid, String(receiver_id), type]
//     );
//     res.json({ success: true, callId: result.rows[0].id });
//   } catch (err) {
//     console.error('calls/initiate error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.post('/calls/:id/accept', async (req, res) => {
//   const uid = getUid(req);
//   if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
//   try {
//     await db.query(
//       `UPDATE calls SET status='accepted', updated_at=NOW() WHERE id::TEXT=$1 AND receiver_id::TEXT=$2`,
//       [req.params.id, uid]
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

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
// // ── Chat routes — /:userId LAST ───────────────────────────────────────────────
// router.get('/users',              ctrl.getAllEmployeeChats);
// router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
// router.put('/:id',                ctrl.editMessage);
// router.delete('/:id',             ctrl.deleteMessage);
// router.post('/:id/delete-for-me', ctrl.deleteForMe);
// router.post('/:id/react',         ctrl.reactToMessage);
// router.get('/:userId',            ctrl.getMessages);

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

// ─────────────────────────────────────────────────────────────────────────────
// CALLS ROUTES — all /calls/* MUST come before /:userId and /:id catch-alls
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/chat/admin/calls/pending
// Admin polls to detect incoming calls from employees
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
    console.error('admin calls/pending error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/admin/calls/initiate
// Admin initiates a call to an employee
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
    console.error('admin calls/initiate error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/admin/chat-sessions
// Admin fetches call sessions by status (e.g. ?status=waiting_admin or ?status=pending)
router.get('/chat-sessions', async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const { status } = req.query;
    const result = await db.query(
      `SELECT c.id AS "callId", c.type, c.status,
              c.caller_id, u.email, c.created_at
       FROM calls c
       JOIN users u ON u.id::TEXT = c.caller_id::TEXT
       WHERE c.status = $1
       ORDER BY c.created_at ASC`,
      [status || 'pending']
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('admin chat-sessions error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/admin/calls/:id/accept
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

// POST /api/chat/admin/calls/:id/decline
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

// POST /api/chat/admin/calls/:id/cancel
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

// GET /api/chat/admin/calls/:id/status
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

// POST /api/chat/admin/calls/:id/offer
// Caller (admin) saves their WebRTC offer SDP
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

// POST /api/chat/admin/calls/:id/answer
// Callee (admin receiving employee call) saves WebRTC answer SDP
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

// POST /api/chat/admin/calls/:id/ice
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

// GET /api/chat/admin/calls/:id/signal
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
// CHAT ROUTES — /:userId and /:id MUST be LAST (they are catch-alls)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/users',              ctrl.getAllEmployeeChats);
router.post('/send',              upload.array('files', 5), ctrl.sendMessage);
router.put('/:id',                ctrl.editMessage);
router.delete('/:id',             ctrl.deleteMessage);
router.post('/:id/delete-for-me', ctrl.deleteForMe);
router.post('/:id/react',         ctrl.reactToMessage);
router.get('/:userId',            ctrl.getMessages);

module.exports = router;