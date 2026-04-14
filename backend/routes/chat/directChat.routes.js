
// const router = require('express').Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { auth } = require('../../middleware/auth');
// const db = require('../../config/db');

// // ── File upload setup ─────────────────────────────────────────────
// const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'chat');

// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_, file, cb) => cb(null, uploadDir),
//   filename: (_, file, cb) => {
//     const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
//     cb(null, `${Date.now()}-${safe}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (_, file, cb) => {
//     const ok = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip/;
//     cb(null, ok.test(file.mimetype) || ok.test(path.extname(file.originalname).toLowerCase()));
//   },
// });

// // ==================== DIRECT MESSAGE ROUTES ====================

// // ── GET USERS FOR DM ─────────────────────────────────────────────────────
// router.get('/users', auth, async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT id, email, email as name, role, NULL as avatar_url
//       FROM users
//       WHERE id != $1
//       ORDER BY email ASC
//     `, [req.user.id]);

//     // Attach last message and unread count
//     const withMeta = await Promise.all(
//       result.rows.map(async (user) => {
//         const last = await db.query(`
//           SELECT content, created_at
//           FROM direct_messages
//           WHERE (sender_id = $1 AND receiver_id = $2)
//              OR (sender_id = $2 AND receiver_id = $1)
//              AND COALESCE(deleted_for_everyone, FALSE) = FALSE
//           ORDER BY created_at DESC LIMIT 1
//         `, [req.user.id, user.id]);

//         const unread = await db.query(`
//           SELECT COUNT(*)
//           FROM direct_messages
//           WHERE sender_id = $1 AND receiver_id = $2 
//             AND is_read = FALSE
//             AND COALESCE(deleted_for_everyone, FALSE) = FALSE
//         `, [user.id, req.user.id]);

//         return {
//           ...user,
//           type: 'direct',
//           last_message: last.rows[0]?.content || null,
//           last_message_at: last.rows[0]?.created_at || null,
//           unread_count: parseInt(unread.rows[0].count),
//         };
//       })
//     );

//     res.json({ success: true, data: withMeta });
//   } catch (err) {
//     console.error('[DirectChat] users error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── GET DM MESSAGES ─────────────────────────────────────────────────────
// router.get('/messages/:userId', auth, async (req, res) => {
//   try {
//     const currentUserId = req.user.id;
//     const otherUserId = req.params.userId;

//     const messages = await db.query(`
//       SELECT 
//         dm.*,
//         sender.id as sender_id,
//         sender.email as sender_name,
//         sender.role as sender_role,
//         CASE 
//           WHEN COALESCE(dm.deleted_for_everyone, FALSE) = TRUE THEN 'This message was deleted'
//           WHEN (COALESCE(dm.deleted_by_sender, FALSE) = TRUE AND dm.sender_id = $1) THEN 'You deleted this message'
//           WHEN (COALESCE(dm.deleted_by_receiver, FALSE) = TRUE AND dm.receiver_id = $1) THEN 'You deleted this message'
//           ELSE dm.content
//         END as display_content,
//         COALESCE(dm.deleted_for_everyone, FALSE) as deleted_for_everyone,
//         COALESCE(dm.deleted_by_sender, FALSE) as deleted_by_sender,
//         COALESCE(dm.deleted_by_receiver, FALSE) as deleted_by_receiver,
//         COALESCE(
//           (
//             SELECT json_agg(
//               json_build_object(
//                 'emoji', r.emoji,
//                 'user_id', r.user_id,
//                 'name', u.email
//               )
//             )
//             FROM dm_reactions r
//             JOIN users u ON u.id = r.user_id
//             WHERE r.message_id = dm.id
//           ),
//           '[]'::json
//         ) as reactions
//       FROM direct_messages dm
//       JOIN users sender ON sender.id = dm.sender_id
//       WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
//          OR (dm.sender_id = $2 AND dm.receiver_id = $1)
//       ORDER BY dm.created_at ASC
//     `, [currentUserId, otherUserId]);

//     // Mark as read
//     await db.query(`
//       UPDATE direct_messages
//       SET is_read = TRUE
//       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
//     `, [otherUserId, currentUserId]);

//     const transformedMessages = messages.rows.map(msg => ({
//       ...msg,
//       content: msg.display_content,
//       type: 'direct',
//       is_deleted_for_me: (msg.deleted_by_sender && msg.sender_id === currentUserId) ||
//                          (msg.deleted_by_receiver && msg.receiver_id === currentUserId),
//       is_deleted_for_everyone: msg.deleted_for_everyone
//     }));

//     res.json({ success: true, data: transformedMessages });
//   } catch (err) {
//     console.error('[DirectChat] messages error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── SEND DM MESSAGE ─────────────────────────────────────────────────────
// router.post('/messages', auth, async (req, res) => {
//   try {
//     const { receiver_id, content, file_url, file_name, file_type } = req.body;
//     const sender_id = req.user.id;

//     if (!content?.trim() && !file_url) {
//       return res.status(400).json({ success: false, message: 'Message content or file is required' });
//     }

//     const result = await db.query(`
//       INSERT INTO direct_messages (sender_id, receiver_id, content, file_url, file_name, file_type)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `, [sender_id, receiver_id, content?.trim() || '', file_url || null, file_name || null, file_type || null]);

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error('[DirectChat] send message error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── DELETE DM FOR ME ─────────────────────────────────────────────────────
// router.delete('/messages/:messageId/for-me', auth, async (req, res) => {
//   try {
//     const messageId = req.params.messageId;
//     const userId = req.user.id;

//     const messageCheck = await db.query(
//       `SELECT sender_id, receiver_id FROM direct_messages WHERE id = $1`,
//       [messageId]
//     );

//     if (messageCheck.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Message not found' });
//     }

//     const message = messageCheck.rows[0];
    
//     if (message.sender_id === userId) {
//       await db.query(`UPDATE direct_messages SET deleted_by_sender = TRUE WHERE id = $1`, [messageId]);
//     } else if (message.receiver_id === userId) {
//       await db.query(`UPDATE direct_messages SET deleted_by_receiver = TRUE WHERE id = $1`, [messageId]);
//     } else {
//       return res.status(403).json({ success: false, message: 'Not authorized' });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error('[DirectChat] delete for me error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── DELETE DM FOR EVERYONE ─────────────────────────────────────────────────────
// router.delete('/messages/:messageId/for-everyone', auth, async (req, res) => {
//   try {
//     const messageId = req.params.messageId;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     const messageCheck = await db.query(
//       `SELECT sender_id FROM direct_messages WHERE id = $1`,
//       [messageId]
//     );

//     if (messageCheck.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Message not found' });
//     }

//     const message = messageCheck.rows[0];
    
//     if (userRole !== 'admin' && message.sender_id !== userId) {
//       return res.status(403).json({ success: false, message: 'Only admin or message sender can delete for everyone' });
//     }

//     await db.query(
//       `UPDATE direct_messages 
//        SET deleted_for_everyone = TRUE, 
//            is_deleted = TRUE,
//            original_content = content,
//            content = 'This message was deleted'
//        WHERE id = $1`,
//       [messageId]
//     );

//     res.json({ success: true });
//   } catch (err) {
//     console.error('[DirectChat] delete for everyone error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── DM REACTION ─────────────────────────────────────────────────────
// router.post('/messages/:messageId/reactions', auth, async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const { emoji } = req.body;
    
//     const existing = await db.query(
//       `SELECT id FROM dm_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
//       [messageId, req.user.id, emoji]
//     );
    
//     if (existing.rows.length > 0) {
//       await db.query(`DELETE FROM dm_reactions WHERE id = $1`, [existing.rows[0].id]);
//     } else {
//       await db.query(
//         `INSERT INTO dm_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)`,
//         [messageId, req.user.id, emoji]
//       );
//     }
    
//     res.json({ success: true });
//   } catch (err) {
//     console.error('[DirectChat] reaction error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ==================== GROUP CHAT ROUTES ====================

// // ── GET ALL GROUPS FOR CURRENT USER ─────────────────────────────────────
// router.get('/groups', auth, async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT 
//         g.id, 
//         g.name, 
//         g.description, 
//         g.avatar_url, 
//         g.created_by, 
//         g.created_at,
//         'group' as type,
//         COUNT(DISTINCT gm.user_id) as member_count,
//         (
//           SELECT json_agg(json_build_object('user_id', gm2.user_id, 'email', u.email, 'role', gm2.role))
//           FROM group_members gm2
//           JOIN users u ON u.id = gm2.user_id
//           WHERE gm2.group_id = g.id
//           LIMIT 5
//         ) as recent_members,
//         (
//           SELECT content FROM group_messages gm3
//           WHERE gm3.group_id = g.id AND gm3.deleted_for_everyone = FALSE
//           ORDER BY gm3.created_at DESC LIMIT 1
//         ) as last_message,
//         (
//           SELECT created_at FROM group_messages gm4
//           WHERE gm4.group_id = g.id AND gm4.deleted_for_everyone = FALSE
//           ORDER BY gm4.created_at DESC LIMIT 1
//         ) as last_message_at,
//         (
//           SELECT COUNT(*) FROM group_messages gm5
//           WHERE gm5.group_id = g.id 
//             AND gm5.created_at > COALESCE((
//               SELECT last_read_at FROM group_read_receipts 
//               WHERE group_id = g.id AND user_id = $1
//             ), '1970-01-01')
//             AND gm5.sender_id != $1
//         ) as unread_count
//       FROM groups g
//       JOIN group_members gm ON gm.group_id = g.id
//       WHERE gm.user_id = $1
//       GROUP BY g.id
//       ORDER BY last_message_at DESC NULLS LAST
//     `, [req.user.id]);

//     res.json({ success: true, data: result.rows });
//   } catch (err) {
//     console.error('[GroupChat] fetch groups error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── CREATE NEW GROUP ─────────────────────────────────────────────────────
// router.post('/groups', auth, async (req, res) => {
//   try {
//     const { name, description, member_ids } = req.body;
    
//     console.log('[GroupChat] Create group request:', { name, member_ids, userId: req.user.id });

//     if (!name || !member_ids || !member_ids.length) {
//       return res.status(400).json({ success: false, message: 'Name and members required' });
//     }

//     // Insert group
//     const groupResult = await db.query(
//       `INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, created_at`,
//       [name, description || '', req.user.id]
//     );
    
//     const group = groupResult.rows[0];
//     console.log('[GroupChat] Group created:', group);

//     // Add creator as admin
//     await db.query(
//       `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')`,
//       [group.id, req.user.id]
//     );
//     console.log('[GroupChat] Creator added as admin');

//     // Add other members
//     for (const memberId of member_ids) {
//       await db.query(
//         `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT (group_id, user_id) DO NOTHING`,
//         [group.id, memberId]
//       );
//     }
//     console.log('[GroupChat] Members added:', member_ids);

//     res.json({ success: true, data: group });
//   } catch (err) {
//     console.error('[GroupChat] create group error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── GET GROUP DETAILS ─────────────────────────────────────────────────────
// router.get('/groups/:groupId', auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;
    
//     // Check membership
//     const memberCheck = await db.query(
//       `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
//       [groupId, req.user.id]
//     );
    
//     if (memberCheck.rows.length === 0) {
//       return res.status(403).json({ success: false, message: 'Not a member of this group' });
//     }

//     // Get group info
//     const groupResult = await db.query(`
//       SELECT g.*, COUNT(gm.user_id) as member_count
//       FROM groups g
//       JOIN group_members gm ON gm.group_id = g.id
//       WHERE g.id = $1
//       GROUP BY g.id
//     `, [groupId]);

//     // Get members
//     const membersResult = await db.query(`
//       SELECT u.id, u.email, u.email as name, gm.role as member_role, gm.joined_at
//       FROM group_members gm
//       JOIN users u ON u.id = gm.user_id
//       WHERE gm.group_id = $1
//       ORDER BY gm.role DESC, u.email ASC
//     `, [groupId]);

//     res.json({ 
//       success: true, 
//       data: { ...groupResult.rows[0], members: membersResult.rows, type: 'group' } 
//     });
//   } catch (err) {
//     console.error('[GroupChat] get group error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── GET GROUP MESSAGES ─────────────────────────────────────────────────────
// router.get('/groups/:groupId/messages', auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { limit = 50, offset = 0 } = req.query;
    
//     // Check membership
//     const memberCheck = await db.query(
//       `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
//       [groupId, req.user.id]
//     );
    
//     if (memberCheck.rows.length === 0) {
//       return res.status(403).json({ success: false, message: 'Not a member of this group' });
//     }

//     // Get messages
//     const messages = await db.query(`
//       SELECT 
//         gm.*, 
//         u.id as sender_id,
//         u.email as sender_name,
//         u.role as sender_role,
//         'group' as type,
//         COALESCE(
//           (
//             SELECT json_agg(
//               json_build_object('emoji', r.emoji, 'user_id', r.user_id, 'name', u2.email)
//             )
//             FROM group_message_reactions r
//             JOIN users u2 ON u2.id = r.user_id
//             WHERE r.message_id = gm.id
//           ),
//           '[]'::json
//         ) as reactions
//       FROM group_messages gm 
//       JOIN users u ON u.id = gm.sender_id
//       WHERE gm.group_id = $1 AND gm.deleted_for_everyone = FALSE
//       ORDER BY gm.created_at ASC
//       LIMIT $2 OFFSET $3
//     `, [groupId, limit, offset]);

//     // Update read receipt
//     await db.query(`
//       INSERT INTO group_read_receipts (group_id, user_id, last_read_at)
//       VALUES ($1, $2, NOW())
//       ON CONFLICT (group_id, user_id) DO UPDATE SET last_read_at = NOW()
//     `, [groupId, req.user.id]);

//     res.json({ success: true, data: messages.rows });
//   } catch (err) {
//     console.error('[GroupChat] get messages error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── SEND GROUP MESSAGE ─────────────────────────────────────────────────────
// router.post('/groups/:groupId/messages', auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { content, file_url, file_name, file_type } = req.body;
    
//     // Check membership
//     const memberCheck = await db.query(
//       `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
//       [groupId, req.user.id]
//     );
    
//     if (memberCheck.rows.length === 0) {
//       return res.status(403).json({ success: false, message: 'Not a member of this group' });
//     }

//     const result = await db.query(`
//       INSERT INTO group_messages (group_id, sender_id, content, file_url, file_name, file_type)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `, [groupId, req.user.id, content || '', file_url || null, file_name || null, file_type || null]);

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error('[GroupChat] send message error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── ADD MEMBER TO GROUP ─────────────────────────────────────────────────────
// router.post('/groups/:groupId/members', auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { user_id } = req.body;
    
//     // Check if current user is admin
//     const adminCheck = await db.query(
//       `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
//       [groupId, req.user.id]
//     );
    
//     if (adminCheck.rows.length === 0) {
//       return res.status(403).json({ success: false, message: 'Only admins can add members' });
//     }
    
//     await db.query(
//       `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT (group_id, user_id) DO NOTHING`,
//       [groupId, user_id]
//     );
    
//     res.json({ success: true });
//   } catch (err) {
//     console.error('[GroupChat] add member error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── LEAVE GROUP ─────────────────────────────────────────────────────
// router.post('/groups/:groupId/leave', auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     await db.query(`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, [groupId, req.user.id]);
//     res.json({ success: true });
//   } catch (err) {
//     console.error('[GroupChat] leave group error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── FILE UPLOAD ───────────────────────────────────────────────────
// router.post('/upload', auth, upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, message: 'No file uploaded' });
//   }

//   res.json({
//     success: true,
//     file_url: `/uploads/chat/${req.file.filename}`,
//     file_name: req.file.originalname,
//     file_type: req.file.mimetype,
//   });
// });

// module.exports = router;


const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../../middleware/auth');
const db = require('../../config/db');

// ── File upload setup ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'chat');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, file, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip/;
    cb(null, ok.test(file.mimetype) || ok.test(path.extname(file.originalname).toLowerCase()));
  },
});

// ==================== DIRECT MESSAGE ROUTES ====================

// ── GET USERS FOR DM ─────────────────────────────────────────────────────
router.get('/users', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, email as name, role, NULL as avatar_url
      FROM users
      WHERE id != $1
      ORDER BY email ASC
    `, [req.user.id]);

    const withMeta = await Promise.all(
      result.rows.map(async (user) => {
        const last = await db.query(`
          SELECT content, created_at
          FROM direct_messages
          WHERE (sender_id = $1 AND receiver_id = $2)
             OR (sender_id = $2 AND receiver_id = $1)
             AND COALESCE(deleted_for_everyone, FALSE) = FALSE
          ORDER BY created_at DESC LIMIT 1
        `, [req.user.id, user.id]);

        const unread = await db.query(`
          SELECT COUNT(*)
          FROM direct_messages
          WHERE sender_id = $1 AND receiver_id = $2 
            AND is_read = FALSE
            AND COALESCE(deleted_for_everyone, FALSE) = FALSE
        `, [user.id, req.user.id]);

        return {
          ...user,
          type: 'direct',
          last_message: last.rows[0]?.content || null,
          last_message_at: last.rows[0]?.created_at || null,
          unread_count: parseInt(unread.rows[0].count),
        };
      })
    );

    res.json({ success: true, data: withMeta });
  } catch (err) {
    console.error('[DirectChat] users error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET DM MESSAGES ─────────────────────────────────────────────────────
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await db.query(`
      SELECT 
        dm.*,
        sender.id as sender_id,
        sender.email as sender_name,
        sender.role as sender_role,
        CASE 
          WHEN COALESCE(dm.deleted_for_everyone, FALSE) = TRUE THEN 'This message was deleted'
          WHEN (COALESCE(dm.deleted_by_sender, FALSE) = TRUE AND dm.sender_id = $1) THEN 'You deleted this message'
          WHEN (COALESCE(dm.deleted_by_receiver, FALSE) = TRUE AND dm.receiver_id = $1) THEN 'You deleted this message'
          ELSE dm.content
        END as display_content,
        COALESCE(dm.deleted_for_everyone, FALSE) as deleted_for_everyone,
        COALESCE(dm.deleted_by_sender, FALSE) as deleted_by_sender,
        COALESCE(dm.deleted_by_receiver, FALSE) as deleted_by_receiver,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'emoji', r.emoji,
                'user_id', r.user_id,
                'name', u.email
              )
            )
            FROM dm_reactions r
            JOIN users u ON u.id = r.user_id
            WHERE r.message_id = dm.id
          ),
          '[]'::json
        ) as reactions
      FROM direct_messages dm
      JOIN users sender ON sender.id = dm.sender_id
      WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
         OR (dm.sender_id = $2 AND dm.receiver_id = $1)
      ORDER BY dm.created_at ASC
    `, [currentUserId, otherUserId]);

    await db.query(`
      UPDATE direct_messages
      SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
    `, [otherUserId, currentUserId]);

    const transformedMessages = messages.rows.map(msg => ({
      ...msg,
      content: msg.display_content,
      type: 'direct',
      is_deleted_for_me: (msg.deleted_by_sender && msg.sender_id === currentUserId) ||
                         (msg.deleted_by_receiver && msg.receiver_id === currentUserId),
      is_deleted_for_everyone: msg.deleted_for_everyone
    }));

    res.json({ success: true, data: transformedMessages });
  } catch (err) {
    console.error('[DirectChat] messages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SEND DM MESSAGE ─────────────────────────────────────────────────────
router.post('/messages', auth, async (req, res) => {
  try {
    const { receiver_id, content, file_url, file_name, file_type } = req.body;
    const sender_id = req.user.id;

    if (!content?.trim() && !file_url) {
      return res.status(400).json({ success: false, message: 'Message content or file is required' });
    }

    const result = await db.query(`
      INSERT INTO direct_messages (sender_id, receiver_id, content, file_url, file_name, file_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [sender_id, receiver_id, content?.trim() || '', file_url || null, file_name || null, file_type || null]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[DirectChat] send message error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE DM FOR ME ─────────────────────────────────────────────────────
router.delete('/messages/:messageId/for-me', auth, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const messageCheck = await db.query(
      `SELECT sender_id, receiver_id FROM direct_messages WHERE id = $1`,
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const message = messageCheck.rows[0];
    
    if (message.sender_id === userId) {
      await db.query(`UPDATE direct_messages SET deleted_by_sender = TRUE WHERE id = $1`, [messageId]);
    } else if (message.receiver_id === userId) {
      await db.query(`UPDATE direct_messages SET deleted_by_receiver = TRUE WHERE id = $1`, [messageId]);
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[DirectChat] delete for me error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE DM FOR EVERYONE ─────────────────────────────────────────────────────
router.delete('/messages/:messageId/for-everyone', auth, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const messageCheck = await db.query(
      `SELECT sender_id FROM direct_messages WHERE id = $1`,
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const message = messageCheck.rows[0];
    
    if (userRole !== 'admin' && message.sender_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only admin or message sender can delete for everyone' });
    }

    await db.query(
      `UPDATE direct_messages 
       SET deleted_for_everyone = TRUE, 
           is_deleted = TRUE,
           original_content = content,
           content = 'This message was deleted'
       WHERE id = $1`,
      [messageId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[DirectChat] delete for everyone error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DM REACTION ─────────────────────────────────────────────────────
router.post('/messages/:messageId/reactions', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    const existing = await db.query(
      `SELECT id FROM dm_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
      [messageId, req.user.id, emoji]
    );
    
    if (existing.rows.length > 0) {
      await db.query(`DELETE FROM dm_reactions WHERE id = $1`, [existing.rows[0].id]);
    } else {
      await db.query(
        `INSERT INTO dm_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)`,
        [messageId, req.user.id, emoji]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('[DirectChat] reaction error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== GROUP CHAT ROUTES ====================

// ── GET ALL GROUPS FOR CURRENT USER ─────────────────────────────────────
router.get('/groups', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        g.id, 
        g.name, 
        g.description, 
        g.avatar_url, 
        g.created_by, 
        g.created_at,
        'group' as type,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
        (
          SELECT json_agg(json_build_object('user_id', u.id, 'email', u.email, 'role', gm.role))
          FROM group_members gm
          JOIN users u ON u.id = gm.user_id
          WHERE gm.group_id = g.id
        ) as all_members,
        (
          SELECT content FROM group_messages gm3
          WHERE gm3.group_id = g.id AND gm3.deleted_for_everyone = FALSE
          ORDER BY gm3.created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM group_messages gm4
          WHERE gm4.group_id = g.id AND gm4.deleted_for_everyone = FALSE
          ORDER BY gm4.created_at DESC LIMIT 1
        ) as last_message_at,
        (
          SELECT COUNT(*) FROM group_messages gm5
          WHERE gm5.group_id = g.id 
            AND gm5.created_at > COALESCE((
              SELECT last_read_at FROM group_read_receipts 
              WHERE group_id = g.id AND user_id = $1
            ), '1970-01-01')
            AND gm5.sender_id != $1
            AND gm5.deleted_for_everyone = FALSE
        ) as unread_count
      FROM groups g
      WHERE EXISTS (
        SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = $1
      )
      ORDER BY last_message_at DESC NULLS LAST
    `, [req.user.id]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[GroupChat] fetch groups error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CREATE NEW GROUP ─────────────────────────────────────────────────────
router.post('/groups', auth, async (req, res) => {
  try {
    const { name, description, member_ids } = req.body;
    
    console.log('[GroupChat] Create group request:', { name, member_ids, userId: req.user.id });

    if (!name || !member_ids || !member_ids.length) {
      return res.status(400).json({ success: false, message: 'Name and members required' });
    }

    const groupResult = await db.query(
      `INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, created_at`,
      [name, description || '', req.user.id]
    );
    
    const group = groupResult.rows[0];

    await db.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')`,
      [group.id, req.user.id]
    );

    for (const memberId of member_ids) {
      await db.query(
        `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT (group_id, user_id) DO NOTHING`,
        [group.id, memberId]
      );
    }

    res.json({ success: true, data: group });
  } catch (err) {
    console.error('[GroupChat] create group error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET GROUP DETAILS WITH ALL MEMBERS ─────────────────────────────────────
router.get('/groups/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const memberCheck = await db.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    const groupResult = await db.query(`
      SELECT 
        g.*, 
        COUNT(DISTINCT gm.user_id) as member_count
      FROM groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id
      WHERE g.id = $1
      GROUP BY g.id
    `, [groupId]);

    const membersResult = await db.query(`
      SELECT 
        u.id, 
        u.email, 
        u.email as name, 
        gm.role as member_role, 
        gm.joined_at,
        CASE WHEN gm.user_id = g.created_by THEN true ELSE false END as is_creator
      FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      CROSS JOIN groups g
      WHERE gm.group_id = $1 AND g.id = $1
      ORDER BY 
        CASE WHEN gm.user_id = g.created_by THEN 0 ELSE 1 END,
        gm.role DESC, 
        u.email ASC
    `, [groupId]);

    res.json({ 
      success: true, 
      data: { 
        ...groupResult.rows[0], 
        members: membersResult.rows,
        type: 'group',
        all_members: membersResult.rows 
      } 
    });
  } catch (err) {
    console.error('[GroupChat] get group error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET GROUP MESSAGES ─────────────────────────────────────────────────────
router.get('/groups/:groupId/messages', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const memberCheck = await db.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    const messages = await db.query(`
      SELECT 
        gm.*, 
        u.id as sender_id,
        u.email as sender_name,
        u.role as sender_role,
        'group' as type,
        CASE 
          WHEN gm.deleted_for_everyone = TRUE THEN 'This message was deleted'
          ELSE gm.content
        END as display_content,
        gm.deleted_for_everyone,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('emoji', r.emoji, 'user_id', r.user_id, 'name', u2.email)
            )
            FROM group_message_reactions r
            JOIN users u2 ON u2.id = r.user_id
            WHERE r.message_id = gm.id
          ),
          '[]'::json
        ) as reactions
      FROM group_messages gm 
      JOIN users u ON u.id = gm.sender_id
      WHERE gm.group_id = $1
      ORDER BY gm.created_at ASC
      LIMIT $2 OFFSET $3
    `, [groupId, limit, offset]);

    await db.query(`
      INSERT INTO group_read_receipts (group_id, user_id, last_read_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (group_id, user_id) DO UPDATE SET last_read_at = NOW()
    `, [groupId, req.user.id]);

    const transformedMessages = messages.rows.map(msg => ({
      ...msg,
      content: msg.display_content,
      is_deleted_for_everyone: msg.deleted_for_everyone
    }));

    res.json({ success: true, data: transformedMessages });
  } catch (err) {
    console.error('[GroupChat] get messages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SEND GROUP MESSAGE ─────────────────────────────────────────────────────
router.post('/groups/:groupId/messages', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, file_url, file_name, file_type } = req.body;
    
    const memberCheck = await db.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    const result = await db.query(`
      INSERT INTO group_messages (group_id, sender_id, content, file_url, file_name, file_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [groupId, req.user.id, content || '', file_url || null, file_name || null, file_type || null]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[GroupChat] send message error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE GROUP MESSAGE FOR EVERYONE (Admin or Sender only) ─────────────────
router.delete('/groups/messages/:messageId/for-everyone', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Get message details
    const messageCheck = await db.query(
      `SELECT gm.group_id, gm.sender_id, gm.content 
       FROM group_messages gm
       WHERE gm.id = $1`,
      [messageId]
    );
    
    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    const message = messageCheck.rows[0];
    
    // Check if user is admin of the group OR the message sender
    const adminCheck = await db.query(
      `SELECT * FROM group_members 
       WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
      [message.group_id, req.user.id]
    );
    
    const isAuthorized = (adminCheck.rows.length > 0 || message.sender_id === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only group admins or message sender can delete messages for everyone' 
      });
    }
    
    // Soft delete - update content
    await db.query(
      `UPDATE group_messages 
       SET deleted_for_everyone = TRUE, 
           original_content = content,
           content = 'This message was deleted'
       WHERE id = $1`,
      [messageId]
    );
    
    res.json({ success: true, message: 'Message deleted for everyone' });
  } catch (err) {
    console.error('[GroupChat] delete for everyone error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADD REACTION TO GROUP MESSAGE ──────────────────────────────────────────
router.post('/groups/messages/:messageId/reactions', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    const existing = await db.query(
      `SELECT id FROM group_message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
      [messageId, req.user.id, emoji]
    );
    
    if (existing.rows.length > 0) {
      await db.query(`DELETE FROM group_message_reactions WHERE id = $1`, [existing.rows[0].id]);
    } else {
      await db.query(
        `INSERT INTO group_message_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)`,
        [messageId, req.user.id, emoji]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('[GroupChat] reaction error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADD MEMBER TO GROUP ─────────────────────────────────────────────────────
router.post('/groups/:groupId/members', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id } = req.body;
    
    const adminCheck = await db.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
      [groupId, req.user.id]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Only admins can add members' });
    }
    
    await db.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT (group_id, user_id) DO NOTHING`,
      [groupId, user_id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('[GroupChat] add member error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LEAVE GROUP ─────────────────────────────────────────────────────
router.post('/groups/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    await db.query(`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, [groupId, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[GroupChat] leave group error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── FILE UPLOAD ───────────────────────────────────────────────────
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    file_url: `/uploads/chat/${req.file.filename}`,
    file_name: req.file.originalname,
    file_type: req.file.mimetype,
  });
});

module.exports = router;