// backend/routes/chat/directChat.routes.js
// Save to: backend/routes/chat/directChat.routes.js
// Add to server.js: app.use('/api/direct-chat', require('./routes/chat/directChat.routes'))

const router   = require('express').Router()
const multer   = require('multer')
const path     = require('path')
const fs       = require('fs')
const { auth } = require('../../middleware/auth')
const db       = require('../../config/db')

// ── File upload setup ─────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'chat')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip/
    cb(null, ok.test(file.mimetype) || ok.test(path.extname(file.originalname).toLowerCase()))
  },
})

// ── GET /api/direct-chat/users  — get all users in the same company ──────────
// For company_manager: returns all users linked to their company
// For employee: returns all users in same company
// For admin: returns all users
router.get('/users', auth, async (req, res) => {
  try {
    let users = []
    const role = req.user.role

    if (role === 'admin') {
      // Admin sees everyone
      const r = await db.query(`
        SELECT id, name, email, role, avatar_url
        FROM users
        WHERE id != $1
        ORDER BY name ASC
      `, [req.user.id])
      users = r.rows

    } else if (role === 'company_manager') {
      // Company manager sees all users in their company + all employees who applied
      const mgr = await db.query(
        'SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id]
      )
      const cid = mgr.rows[0]?.company_id
      const r = await db.query(`
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar_url
        FROM users u
        WHERE u.id != $1
          AND (
            u.role = 'admin'
            OR u.id IN (
              SELECT cm2.user_id FROM company_managers cm2 WHERE cm2.company_id = $2
            )
            OR u.id IN (
              SELECT ep.user_id FROM employee_profiles ep
              JOIN job_applications ja ON ja.employee_id = ep.id
              JOIN job_postings jp ON jp.id = ja.job_id
              WHERE jp.company_id = $2
            )
          )
        ORDER BY u.name ASC
      `, [req.user.id, cid])
      users = r.rows

    } else {
      // Employee sees company managers they applied to + admins
      const r = await db.query(`
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar_url
        FROM users u
        WHERE u.id != $1
          AND (
            u.role = 'admin'
            OR u.id IN (
              SELECT cm.user_id FROM company_managers cm
              JOIN job_postings jp ON jp.company_id = cm.company_id
              JOIN job_applications ja ON ja.job_id = jp.id
              JOIN employee_profiles ep ON ep.id = ja.employee_id
              WHERE ep.user_id = $1
            )
          )
        ORDER BY u.name ASC
      `, [req.user.id])
      users = r.rows
    }

    // Attach last message + unread count for each user
    const withMeta = await Promise.all(users.map(async (u) => {
      const last = await db.query(`
        SELECT content, created_at FROM direct_messages
        WHERE (sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY created_at DESC LIMIT 1
      `, [req.user.id, u.id])

      const unread = await db.query(`
        SELECT COUNT(*) FROM direct_messages
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
      `, [u.id, req.user.id])

      return {
        ...u,
        last_message:    last.rows[0]?.content || null,
        last_message_at: last.rows[0]?.created_at || null,
        unread_count:    parseInt(unread.rows[0].count),
      }
    }))

    // Sort: users with messages first, then by last message time
    withMeta.sort((a, b) => {
      if (a.last_message_at && b.last_message_at)
        return new Date(b.last_message_at) - new Date(a.last_message_at)
      if (a.last_message_at) return -1
      if (b.last_message_at) return 1
      return (a.name || '').localeCompare(b.name || '')
    })

    res.json({ success: true, data: withMeta })
  } catch (err) {
    console.error('[DirectChat] users error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch users' })
  }
})

// ── GET /api/direct-chat/messages/:userId  — get conversation ────────────────
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit

    const r = await db.query(`
      SELECT
        dm.*,
        su.name  AS sender_name,
        su.email AS sender_email,
        su.role  AS sender_role,
        COALESCE(
          json_agg(
            json_build_object('emoji', dr.emoji, 'user_id', dr.user_id, 'name', COALESCE(ru.name, ru.email))
          ) FILTER (WHERE dr.id IS NOT NULL), '[]'
        ) AS reactions
      FROM direct_messages dm
      JOIN  users su ON su.id = dm.sender_id
      LEFT JOIN dm_reactions dr ON dr.message_id = dm.id
      LEFT JOIN users ru        ON ru.id = dr.user_id
      WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
         OR (dm.sender_id = $2 AND dm.receiver_id = $1)
      GROUP BY dm.id, su.name, su.email, su.role
      ORDER BY dm.created_at DESC
      LIMIT $3 OFFSET $4
    `, [req.user.id, userId, limit, offset])

    // Mark messages from other user as read
    await db.query(`
      UPDATE direct_messages
      SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
    `, [userId, req.user.id])

    res.json({ success: true, data: r.rows.reverse() })
  } catch (err) {
    console.error('[DirectChat] messages error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch messages' })
  }
})

// ── POST /api/direct-chat/upload  — upload file ──────────────────────────────
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' })
  res.json({
    success:   true,
    file_url:  `/uploads/chat/${req.file.filename}`,
    file_name: req.file.originalname,
    file_type: req.file.mimetype,
  })
})

module.exports = router