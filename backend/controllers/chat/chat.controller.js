
// // // // const getAdmins = async (req, res) => {
// // // //   try {
// // // //     const pool = req.pool;
// // // //     const result = await pool.query(
// // // //       `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
// // // //     );
// // // //     if (result.rows.length === 0)
// // // //       return res.status(404).json({ success: false, message: 'No admins found' });
// // // //     res.json({ success: true, data: result.rows });
// // // //   } catch (err) {
// // // //     console.error('getAdmins error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // const getMyAdminThread = async (req, res) => {
// // // //   try {
// // // //     const pool = req.pool;
// // // //     const me   = String(req.user.id);

// // // //     const result = await pool.query(
// // // //       `SELECT m.*, u.email AS sender_email
// // // //        FROM admin_messages m
// // // //        JOIN users u ON u.id::TEXT = m.sender_id::TEXT
// // // //        WHERE m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1
// // // //        ORDER BY m.created_at ASC`,
// // // //       [me]
// // // //     );

// // // //     res.json({ success: true, data: result.rows });
// // // //   } catch (err) {
// // // //     console.error('getMyAdminThread error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // const sendMessage = async (req, res) => {
// // // //   try {
// // // //     const pool      = req.pool;
// // // //     const sender_id = req.user.id;
// // // //     const { receiver_id, message } = req.body;

// // // //     if (!message?.trim())
// // // //       return res.status(400).json({ success: false, message: 'message is required' });

// // // //     const result = await pool.query(
// // // //       `INSERT INTO admin_messages (sender_id, receiver_id, message)
// // // //        VALUES ($1, $2, $3) RETURNING *`,
// // // //       [sender_id, receiver_id || null, message.trim()]
// // // //     );

// // // //     res.json({ success: true, data: result.rows[0] });
// // // //   } catch (err) {
// // // //     console.error('sendMessage error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // const deleteMessage = async (req, res) => {
// // // //   try {
// // // //     const pool   = req.pool;
// // // //     const userId = String(req.user.id);
// // // //     const { id } = req.params;

// // // //     const check = await pool.query(
// // // //       `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
// // // //     );
// // // //     if (check.rows.length === 0)
// // // //       return res.status(404).json({ success: false, message: 'Message not found' });
// // // //     if (String(check.rows[0].sender_id) !== userId)
// // // //       return res.status(403).json({ success: false, message: 'Not your message' });

// // // //     await pool.query(
// // // //       `UPDATE admin_messages SET deleted_at = NOW() WHERE id = $1`, [id]
// // // //     );

// // // //     res.json({ success: true });
// // // //   } catch (err) {
// // // //     console.error('deleteMessage error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // const reactToMessage = async (req, res) => {
// // // //   try {
// // // //     const pool   = req.pool;
// // // //     const userId = String(req.user.id);
// // // //     const { id } = req.params;
// // // //     const { emoji } = req.body;

// // // //     if (!emoji)
// // // //       return res.status(400).json({ success: false, message: 'emoji is required' });

// // // //     const row = await pool.query(
// // // //       `SELECT reactions FROM admin_messages WHERE id = $1`, [id]
// // // //     );
// // // //     if (row.rows.length === 0)
// // // //       return res.status(404).json({ success: false, message: 'Message not found' });

// // // //     let reactions = row.rows[0].reactions || [];

// // // //     const idx = reactions.findIndex(r => r.emoji === emoji && String(r.user_id) === userId);
// // // //     if (idx >= 0) reactions.splice(idx, 1);
// // // //     else reactions.push({ emoji, user_id: userId });

// // // //     await pool.query(
// // // //       `UPDATE admin_messages SET reactions = $1::jsonb WHERE id = $2`,
// // // //       [JSON.stringify(reactions), id]
// // // //     );

// // // //     res.json({ success: true, reactions });
// // // //   } catch (err) {
// // // //     console.error('reactToMessage error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // const getMessages = async (req, res) => {
// // // //   try {
// // // //     const pool  = req.pool;
// // // //     const me    = String(req.user.id);
// // // //     const other = String(req.params.userId);

// // // //     const result = await pool.query(
// // // //       `SELECT * FROM admin_messages
// // // //        WHERE (sender_id::TEXT = $1 AND (receiver_id::TEXT = $2 OR receiver_id IS NULL))
// // // //           OR (sender_id::TEXT = $2 AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
// // // //        ORDER BY created_at ASC`,
// // // //       [me, other]
// // // //     );

// // // //     res.json({ success: true, data: result.rows });
// // // //   } catch (err) {
// // // //     console.error('getMessages error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // const getAllEmployeeChats = async (req, res) => {
// // // //   try {
// // // //     const pool    = req.pool;
// // // //     const adminId = String(req.user.id);

// // // //     const result = await pool.query(
// // // //       `SELECT DISTINCT ON (u.id)
// // // //          u.id, u.email,
// // // //          m.message    AS last_message,
// // // //          m.created_at AS last_at
// // // //        FROM admin_messages m
// // // //        JOIN users u ON (
// // // //          -- employee sent to this admin or broadcast
// // // //          (m.sender_id::TEXT != $1 AND (m.receiver_id::TEXT = $1 OR m.receiver_id IS NULL) AND u.id::TEXT = m.sender_id::TEXT)
// // // //          OR
// // // //          -- admin sent to employee
// // // //          (m.sender_id::TEXT = $1 AND u.id::TEXT = m.receiver_id::TEXT)
// // // //        )
// // // //        WHERE u.role != 'admin'
// // // //        ORDER BY u.id, m.created_at DESC`,
// // // //       [adminId]
// // // //     );

// // // //     res.json({ success: true, data: result.rows });
// // // //   } catch (err) {
// // // //     console.error('getAllEmployeeChats error:', err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // };

// // // // module.exports = {
// // // //   getAdmins, getMyAdminThread,
// // // //   sendMessage, deleteMessage, reactToMessage,
// // // //   getMessages, getAllEmployeeChats,
// // // // };
// // // // controllers/chat/chat.controller.js
// // // const path = require('path');
// // // const fs   = require('fs');

// // // // ─── File upload helper (uses multer — see router for multer setup) ───────────
// // // const uploadFiles = async (files = []) => {
// // //   // files = req.files from multer (array)
// // //   // Returns array of { name, size, url, mimetype }
// // //   return files.map(f => ({
// // //     name:     f.originalname,
// // //     size:     f.size,
// // //     mimetype: f.mimetype,
// // //     url:      `/uploads/chat/${f.filename}`,   // served statically
// // //   }));
// // // };

// // // // ─── GET /admin/users  (admin sees all employee threads) ─────────────────────
// // // const getAllEmployeeChats = async (req, res) => {
// // //   try {
// // //     const pool    = req.pool;
// // //     const adminId = String(req.user.id);

// // //     const result = await pool.query(
// // //       `SELECT DISTINCT ON (u.id)
// // //          u.id,
// // //          u.email,
// // //          m.message      AS last_message,
// // //          m.created_at   AS last_message_at,
// // //          COUNT(m2.id) FILTER (
// // //            WHERE m2.is_read = false
// // //              AND m2.sender_id::TEXT != $1
// // //              AND m2.deleted_at IS NULL
// // //          ) AS unread_count
// // //        FROM admin_messages m
// // //        JOIN users u ON (
// // //          (m.sender_id::TEXT != $1
// // //            AND (m.receiver_id::TEXT = $1 OR m.receiver_id IS NULL)
// // //            AND u.id::TEXT = m.sender_id::TEXT)
// // //          OR
// // //          (m.sender_id::TEXT = $1 AND u.id::TEXT = m.receiver_id::TEXT)
// // //        )
// // //        LEFT JOIN admin_messages m2 ON m2.sender_id::TEXT = u.id::TEXT
// // //          AND (m2.receiver_id::TEXT = $1 OR m2.receiver_id IS NULL)
// // //        WHERE u.role != 'admin'
// // //        GROUP BY u.id, u.email, m.message, m.created_at
// // //        ORDER BY u.id, m.created_at DESC`,
// // //       [adminId]
// // //     );

// // //     res.json({ success: true, data: result.rows });
// // //   } catch (err) {
// // //     console.error('getAllEmployeeChats error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── GET /admin/:userId  (admin fetches thread with one employee) ─────────────
// // // const getMessages = async (req, res) => {
// // //   try {
// // //     const pool  = req.pool;
// // //     const me    = String(req.user.id);
// // //     const other = String(req.params.userId);

// // //     // Mark messages from the other user as read
// // //     await pool.query(
// // //       `UPDATE admin_messages
// // //          SET is_read = true
// // //        WHERE sender_id::TEXT = $1
// // //          AND (receiver_id::TEXT = $2 OR receiver_id IS NULL)
// // //          AND is_read = false`,
// // //       [other, me]
// // //     );

// // //     const result = await pool.query(
// // //       `SELECT * FROM admin_messages
// // //        WHERE (sender_id::TEXT = $1 AND (receiver_id::TEXT = $2 OR receiver_id IS NULL))
// // //           OR (sender_id::TEXT = $2 AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
// // //        ORDER BY created_at ASC`,
// // //       [me, other]
// // //     );

// // //     // Hide body of messages deleted for 'all'; hide from sender if deleted 'for me'
// // //     const rows = result.rows.map(m => {
// // //       if (m.deleted_at) {
// // //         return { ...m, message: null, attachments: [] };
// // //       }
// // //       return m;
// // //     });

// // //     res.json({ success: true, data: rows });
// // //   } catch (err) {
// // //     console.error('getMessages error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── GET /employee/my-thread ──────────────────────────────────────────────────
// // // const getMyAdminThread = async (req, res) => {
// // //   try {
// // //     const pool = req.pool;
// // //     const me   = String(req.user.id);

// // //     const result = await pool.query(
// // //       `SELECT m.*, u.email AS sender_email
// // //        FROM admin_messages m
// // //        JOIN users u ON u.id::TEXT = m.sender_id::TEXT
// // //        WHERE (m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1)
// // //          AND (m.deleted_at IS NULL OR m.deleted_for = 'me')
// // //        ORDER BY m.created_at ASC`,
// // //       [me]
// // //     );

// // //     // If deleted_for = 'me' and sender is this user → hide content
// // //     const rows = result.rows.map(m => {
// // //       if (m.deleted_at && m.deleted_for === 'me' && String(m.sender_id) === me) {
// // //         return { ...m, message: null, attachments: [] };
// // //       }
// // //       if (m.deleted_at && m.deleted_for === 'all') {
// // //         return { ...m, message: null, attachments: [] };
// // //       }
// // //       return m;
// // //     });

// // //     res.json({ success: true, data: rows });
// // //   } catch (err) {
// // //     console.error('getMyAdminThread error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── GET /employee/admins ─────────────────────────────────────────────────────
// // // const getAdmins = async (req, res) => {
// // //   try {
// // //     const pool   = req.pool;
// // //     const result = await pool.query(
// // //       `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
// // //     );
// // //     if (result.rows.length === 0)
// // //       return res.status(404).json({ success: false, message: 'No admins found' });
// // //     res.json({ success: true, data: result.rows });
// // //   } catch (err) {
// // //     console.error('getAdmins error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── POST /send ───────────────────────────────────────────────────────────────
// // // const sendMessage = async (req, res) => {
// // //   try {
// // //     const pool        = req.pool;
// // //     const sender_id   = req.user.id;
// // //     const { receiver_id, message } = req.body;

// // //     // Allow file-only messages (message can be empty if files attached)
// // //     const uploadedFiles = req.files?.length ? await uploadFiles(req.files) : [];
// // //     const msgText       = message?.trim() || null;

// // //     if (!msgText && uploadedFiles.length === 0)
// // //       return res.status(400).json({ success: false, message: 'message or file is required' });

// // //     const result = await pool.query(
// // //       `INSERT INTO admin_messages (sender_id, receiver_id, message, attachments)
// // //        VALUES ($1, $2, $3, $4::jsonb)
// // //        RETURNING *`,
// // //       [sender_id, receiver_id || null, msgText, JSON.stringify(uploadedFiles)]
// // //     );

// // //     res.json({ success: true, data: result.rows[0] });
// // //   } catch (err) {
// // //     console.error('sendMessage error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── PUT /:id  (edit message text) ───────────────────────────────────────────
// // // const editMessage = async (req, res) => {
// // //   try {
// // //     const pool   = req.pool;
// // //     const userId = String(req.user.id);
// // //     const { id } = req.params;
// // //     const { message } = req.body;

// // //     if (!message?.trim())
// // //       return res.status(400).json({ success: false, message: 'message is required' });

// // //     // Verify ownership
// // //     const check = await pool.query(
// // //       `SELECT sender_id, deleted_at FROM admin_messages WHERE id = $1`, [id]
// // //     );
// // //     if (check.rows.length === 0)
// // //       return res.status(404).json({ success: false, message: 'Message not found' });
// // //     if (String(check.rows[0].sender_id) !== userId)
// // //       return res.status(403).json({ success: false, message: 'Not your message' });
// // //     if (check.rows[0].deleted_at)
// // //       return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });

// // //     const result = await pool.query(
// // //       `UPDATE admin_messages
// // //          SET message = $1, edited_at = NOW()
// // //        WHERE id = $2
// // //        RETURNING *`,
// // //       [message.trim(), id]
// // //     );

// // //     res.json({ success: true, data: result.rows[0] });
// // //   } catch (err) {
// // //     console.error('editMessage error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── DELETE /:id  (delete for EVERYONE) ──────────────────────────────────────
// // // const deleteMessage = async (req, res) => {
// // //   try {
// // //     const pool   = req.pool;
// // //     const userId = String(req.user.id);
// // //     const { id } = req.params;

// // //     const check = await pool.query(
// // //       `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
// // //     );
// // //     if (check.rows.length === 0)
// // //       return res.status(404).json({ success: false, message: 'Message not found' });
// // //     if (String(check.rows[0].sender_id) !== userId)
// // //       return res.status(403).json({ success: false, message: 'Not your message' });

// // //     await pool.query(
// // //       `UPDATE admin_messages
// // //          SET deleted_at = NOW(), deleted_for = 'all'
// // //        WHERE id = $1`,
// // //       [id]
// // //     );

// // //     res.json({ success: true });
// // //   } catch (err) {
// // //     console.error('deleteMessage error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── POST /:id/delete-for-me  (hide only for the requester) ──────────────────
// // // const deleteForMe = async (req, res) => {
// // //   try {
// // //     const pool   = req.pool;
// // //     const userId = String(req.user.id);
// // //     const { id } = req.params;

// // //     const check = await pool.query(
// // //       `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
// // //     );
// // //     if (check.rows.length === 0)
// // //       return res.status(404).json({ success: false, message: 'Message not found' });

// // //     // Anyone in the conversation can delete for themselves
// // //     // But only the sender can delete for everyone (handled in deleteMessage)
// // //     await pool.query(
// // //       `UPDATE admin_messages
// // //          SET deleted_at = NOW(), deleted_for = 'me'
// // //        WHERE id = $1`,
// // //       [id]
// // //     );

// // //     res.json({ success: true });
// // //   } catch (err) {
// // //     console.error('deleteForMe error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // // ─── POST /:id/react ──────────────────────────────────────────────────────────
// // // const reactToMessage = async (req, res) => {
// // //   try {
// // //     const pool   = req.pool;
// // //     const userId = String(req.user.id);
// // //     const { id } = req.params;
// // //     const { emoji } = req.body;

// // //     if (!emoji)
// // //       return res.status(400).json({ success: false, message: 'emoji is required' });

// // //     const row = await pool.query(
// // //       `SELECT reactions FROM admin_messages WHERE id = $1`, [id]
// // //     );
// // //     if (row.rows.length === 0)
// // //       return res.status(404).json({ success: false, message: 'Message not found' });

// // //     let reactions = row.rows[0].reactions || [];

// // //     const idx = reactions.findIndex(r => r.emoji === emoji && String(r.user_id) === userId);
// // //     if (idx >= 0) reactions.splice(idx, 1);       // toggle off
// // //     else reactions.push({ emoji, user_id: userId }); // toggle on

// // //     await pool.query(
// // //       `UPDATE admin_messages SET reactions = $1::jsonb WHERE id = $2`,
// // //       [JSON.stringify(reactions), id]
// // //     );

// // //     res.json({ success: true, reactions });
// // //   } catch (err) {
// // //     console.error('reactToMessage error:', err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // };

// // // module.exports = {
// // //   getAdmins,
// // //   getMyAdminThread,
// // //   getAllEmployeeChats,
// // //   getMessages,
// // //   sendMessage,
// // //   editMessage,
// // //   deleteMessage,
// // //   deleteForMe,
// // //   reactToMessage,
// // // };
// // const path = require('path');
// // const fs   = require('fs');

// // /* ─── File upload helper (uses multer — see router for multer setup) ─────── */
// // const uploadFiles = async (files = []) => {
// //   return files.map(f => ({
// //     name:     f.originalname,
// //     size:     f.size,
// //     mimetype: f.mimetype,
// //     url:      `/uploads/chat/${f.filename}`,
// //   }));
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    GET /admin/users
// //    Admin sees list of all employees they have a thread with, plus unread count
// //    and last message preview.
// // ───────────────────────────────────────────────────────────────────────────── */
// // const getAllEmployeeChats = async (req, res) => {
// //   try {
// //     const pool    = req.pool;
// //     const adminId = String(req.user.id);

// //     const result = await pool.query(
// //       `SELECT DISTINCT ON (u.id)
// //          u.id,
// //          u.email,
// //          m.message      AS last_message,
// //          m.created_at   AS last_message_at,
// //          COUNT(m2.id) FILTER (
// //            WHERE m2.is_read = false
// //              AND m2.sender_id::TEXT != $1
// //              AND m2.deleted_at IS NULL
// //          ) AS unread_count
// //        FROM admin_messages m
// //        JOIN users u ON (
// //          (m.sender_id::TEXT != $1
// //            AND (m.receiver_id::TEXT = $1 OR m.receiver_id IS NULL)
// //            AND u.id::TEXT = m.sender_id::TEXT)
// //          OR
// //          (m.sender_id::TEXT = $1 AND u.id::TEXT = m.receiver_id::TEXT)
// //        )
// //        LEFT JOIN admin_messages m2 ON m2.sender_id::TEXT = u.id::TEXT
// //          AND (m2.receiver_id::TEXT = $1 OR m2.receiver_id IS NULL)
// //        WHERE u.role != 'admin'
// //        GROUP BY u.id, u.email, m.message, m.created_at
// //        ORDER BY u.id, m.created_at DESC`,
// //       [adminId]
// //     );

// //     res.json({ success: true, data: result.rows });
// //   } catch (err) {
// //     console.error('getAllEmployeeChats error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    GET /admin/:userId
// //    Admin fetches full thread with one employee.

// //    DELETE LOGIC:
// //    - deleted_for = 'all'  → hide for BOTH sides (body becomes null)
// //    - deleted_for = 'me'   → hide ONLY for the person who requested deletion
// //                             (stored as sender_id in the delete-for-me flow)
// //                             The other user still sees the original message.
// // ───────────────────────────────────────────────────────────────────────────── */
// // const getMessages = async (req, res) => {
// //   try {
// //     const pool  = req.pool;
// //     const me    = String(req.user.id);
// //     const other = String(req.params.userId);

// //     // Mark messages FROM the other user TO me as read
// //     await pool.query(
// //       `UPDATE admin_messages
// //          SET is_read = true
// //        WHERE sender_id::TEXT = $1
// //          AND (receiver_id::TEXT = $2 OR receiver_id IS NULL)
// //          AND is_read = false`,
// //       [other, me]
// //     );

// //     const result = await pool.query(
// //       `SELECT * FROM admin_messages
// //        WHERE (sender_id::TEXT = $1 AND (receiver_id::TEXT = $2 OR receiver_id IS NULL))
// //           OR (sender_id::TEXT = $2 AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
// //        ORDER BY created_at ASC`,
// //       [me, other]
// //     );

// //     const rows = result.rows.map(m => {
// //       if (!m.deleted_at) return m; // not deleted — pass through as-is

// //       if (m.deleted_for === 'all') {
// //         // Deleted for everyone — both sides see the placeholder
// //         return { ...m, message: null, attachments: [] };
// //       }

// //       if (m.deleted_for === 'me') {
// //         // Deleted for me only.
// //         // The person who deleted it is stored as sender_id (they clicked "delete for me").
// //         // So: if the requester (me) is the sender → they see the placeholder.
// //         //     if the requester (me) is the receiver → they still see the original.
// //         if (String(m.sender_id) === me) {
// //           // I deleted it for myself → show placeholder to me
// //           return { ...m, message: null, attachments: [] };
// //         } else {
// //           // The other user deleted it for themselves → I still see the original
// //           return { ...m, deleted_at: null, deleted_for: null };
// //         }
// //       }

// //       return m;
// //     });

// //     res.json({ success: true, data: rows });
// //   } catch (err) {
// //     console.error('getMessages error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    GET /employee/my-thread
// //    Employee fetches their own thread with admin.
// //    Same per-user delete filtering applies here.
// // ───────────────────────────────────────────────────────────────────────────── */
// // const getMyAdminThread = async (req, res) => {
// //   try {
// //     const pool = req.pool;
// //     const me   = String(req.user.id);

// //     const result = await pool.query(
// //       `SELECT m.*, u.email AS sender_email
// //        FROM admin_messages m
// //        JOIN users u ON u.id::TEXT = m.sender_id::TEXT
// //        WHERE (m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1)
// //        ORDER BY m.created_at ASC`,
// //       [me]
// //     );

// //     const rows = result.rows.map(m => {
// //       if (!m.deleted_at) return m;

// //       if (m.deleted_for === 'all') {
// //         return { ...m, message: null, attachments: [] };
// //       }

// //       if (m.deleted_for === 'me') {
// //         // Only the sender (who requested deletion) should see the placeholder
// //         if (String(m.sender_id) === me) {
// //           return { ...m, message: null, attachments: [] };
// //         } else {
// //           // The other person still sees the original
// //           return { ...m, deleted_at: null, deleted_for: null };
// //         }
// //       }

// //       return m;
// //     });

// //     res.json({ success: true, data: rows });
// //   } catch (err) {
// //     console.error('getMyAdminThread error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    GET /employee/admins
// //    Returns list of admin users.
// // ───────────────────────────────────────────────────────────────────────────── */
// // const getAdmins = async (req, res) => {
// //   try {
// //     const pool   = req.pool;
// //     const result = await pool.query(
// //       `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
// //     );
// //     if (result.rows.length === 0)
// //       return res.status(404).json({ success: false, message: 'No admins found' });
// //     res.json({ success: true, data: result.rows });
// //   } catch (err) {
// //     console.error('getAdmins error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    POST /send  (multipart/form-data — multer required on this route)
// //    Body: receiver_id, message (optional if files present)
// //    Files: files[] (optional)
// // ───────────────────────────────────────────────────────────────────────────── */
// // const sendMessage = async (req, res) => {
// //   try {
// //     const pool      = req.pool;
// //     const sender_id = req.user.id;
// //     const { receiver_id, message } = req.body;

// //     const uploadedFiles = req.files?.length ? await uploadFiles(req.files) : [];
// //     const msgText       = message?.trim() || null;

// //     if (!msgText && uploadedFiles.length === 0)
// //       return res.status(400).json({ success: false, message: 'message or file is required' });

// //     const result = await pool.query(
// //       `INSERT INTO admin_messages (sender_id, receiver_id, message, attachments)
// //        VALUES ($1, $2, $3, $4::jsonb)
// //        RETURNING *`,
// //       [sender_id, receiver_id || null, msgText, JSON.stringify(uploadedFiles)]
// //     );

// //     res.json({ success: true, data: result.rows[0] });
// //   } catch (err) {
// //     console.error('sendMessage error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    PUT /:id   Edit message text (sender only, not deleted)
// // ───────────────────────────────────────────────────────────────────────────── */
// // const editMessage = async (req, res) => {
// //   try {
// //     const pool   = req.pool;
// //     const userId = String(req.user.id);
// //     const { id } = req.params;
// //     const { message } = req.body;

// //     if (!message?.trim())
// //       return res.status(400).json({ success: false, message: 'message is required' });

// //     const check = await pool.query(
// //       `SELECT sender_id, deleted_at FROM admin_messages WHERE id = $1`, [id]
// //     );
// //     if (check.rows.length === 0)
// //       return res.status(404).json({ success: false, message: 'Message not found' });
// //     if (String(check.rows[0].sender_id) !== userId)
// //       return res.status(403).json({ success: false, message: 'Not your message' });
// //     if (check.rows[0].deleted_at)
// //       return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });

// //     const result = await pool.query(
// //       `UPDATE admin_messages
// //          SET message = $1, edited_at = NOW()
// //        WHERE id = $2
// //        RETURNING *`,
// //       [message.trim(), id]
// //     );

// //     res.json({ success: true, data: result.rows[0] });
// //   } catch (err) {
// //     console.error('editMessage error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    DELETE /:id   Delete for EVERYONE (sender only)
// // ───────────────────────────────────────────────────────────────────────────── */
// // const deleteMessage = async (req, res) => {
// //   try {
// //     const pool   = req.pool;
// //     const userId = String(req.user.id);
// //     const { id } = req.params;

// //     const check = await pool.query(
// //       `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
// //     );
// //     if (check.rows.length === 0)
// //       return res.status(404).json({ success: false, message: 'Message not found' });
// //     if (String(check.rows[0].sender_id) !== userId)
// //       return res.status(403).json({ success: false, message: 'Not your message' });

// //     await pool.query(
// //       `UPDATE admin_messages
// //          SET deleted_at = NOW(), deleted_for = 'all'
// //        WHERE id = $1`,
// //       [id]
// //     );

// //     res.json({ success: true });
// //   } catch (err) {
// //     console.error('deleteMessage error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    POST /:id/delete-for-me   Hide only for the requester

// //    IMPORTANT: We store sender_id = requester so that getMessages can compare
// //    `m.sender_id === me` to decide whether to hide the content.
// //    This means we overwrite sender_id here to be the requester's id.

// //    BETTER APPROACH: Add a separate `deleted_by` column so we don't overwrite
// //    sender_id. If you can run a migration, do this instead (see comment below).
// // ───────────────────────────────────────────────────────────────────────────── */
// // const deleteForMe = async (req, res) => {
// //   try {
// //     const pool   = req.pool;
// //     const userId = String(req.user.id);
// //     const { id } = req.params;

// //     const check = await pool.query(
// //       `SELECT id FROM admin_messages WHERE id = $1`, [id]
// //     );
// //     if (check.rows.length === 0)
// //       return res.status(404).json({ success: false, message: 'Message not found' });

// //     /*
// //      * OPTION A (current schema — no migration needed):
// //      * We set deleted_for = 'me' and keep sender_id as-is.
// //      * In getMessages we check: if deleted_for='me' AND sender_id = me → hide.
// //      * This works perfectly when the SENDER deletes for themselves.
// //      * If the RECEIVER wants to delete for themselves, we need Option B.
// //      *
// //      * OPTION B (recommended — requires migration):
// //      * ALTER TABLE admin_messages ADD COLUMN deleted_by TEXT;
// //      * Then store: deleted_by = userId, deleted_for = 'me'
// //      * And in getMessages compare: deleted_by === me → hide for me.
// //      * This handles both sender and receiver deleting for themselves.
// //      *
// //      * Using Option B query below — comment out if you haven't run the migration:
// //      */

// //     // OPTION B (with deleted_by column):
// //     const hasDeletedByColumn = await pool.query(
// //       `SELECT column_name FROM information_schema.columns
// //        WHERE table_name = 'admin_messages' AND column_name = 'deleted_by'`
// //     );

// //     if (hasDeletedByColumn.rows.length > 0) {
// //       // Use deleted_by column (best approach)
// //       await pool.query(
// //         `UPDATE admin_messages
// //            SET deleted_at = NOW(), deleted_for = 'me', deleted_by = $1
// //          WHERE id = $2`,
// //         [userId, id]
// //       );
// //     } else {
// //       // Fallback Option A — works only when sender deletes for themselves
// //       await pool.query(
// //         `UPDATE admin_messages
// //            SET deleted_at = NOW(), deleted_for = 'me'
// //          WHERE id = $1`,
// //         [id]
// //       );
// //     }

// //     res.json({ success: true });
// //   } catch (err) {
// //     console.error('deleteForMe error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ─────────────────────────────────────────────────────────────────────────────
// //    POST /:id/react   Toggle emoji reaction on/off
// // ───────────────────────────────────────────────────────────────────────────── */
// // const reactToMessage = async (req, res) => {
// //   try {
// //     const pool   = req.pool;
// //     const userId = String(req.user.id);
// //     const { id } = req.params;
// //     const { emoji } = req.body;

// //     if (!emoji)
// //       return res.status(400).json({ success: false, message: 'emoji is required' });

// //     const row = await pool.query(
// //       `SELECT reactions FROM admin_messages WHERE id = $1`, [id]
// //     );
// //     if (row.rows.length === 0)
// //       return res.status(404).json({ success: false, message: 'Message not found' });

// //     let reactions = row.rows[0].reactions || [];
// //     const idx = reactions.findIndex(r => r.emoji === emoji && String(r.user_id) === userId);
// //     if (idx >= 0) reactions.splice(idx, 1);        // already reacted → remove (toggle off)
// //     else reactions.push({ emoji, user_id: userId }); // not yet reacted → add (toggle on)

// //     await pool.query(
// //       `UPDATE admin_messages SET reactions = $1::jsonb WHERE id = $2`,
// //       [JSON.stringify(reactions), id]
// //     );

// //     res.json({ success: true, reactions });
// //   } catch (err) {
// //     console.error('reactToMessage error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // module.exports = {
// //   getAdmins,
// //   getMyAdminThread,
// //   getAllEmployeeChats,
// //   getMessages,
// //   sendMessage,
// //   editMessage,
// //   deleteMessage,
// //   deleteForMe,
// //   reactToMessage,
// // };

// const path = require('path');
// const fs   = require('fs');

// /* ─── File upload helper (uses multer — see router for multer setup) ─────── */
// const uploadFiles = async (files = []) => {
//   return files.map(f => ({
//     name:     f.originalname,
//     size:     f.size,
//     mimetype: f.mimetype,
//     url:      `/uploads/chat/${f.filename}`,
//   }));
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    GET /admin/users
//    Admin sees list of all employees they have a thread with.
//    Includes last message preview and unread count.
// ───────────────────────────────────────────────────────────────────────────── */
// const getAllEmployeeChats = async (req, res) => {
//   try {
//     const pool    = req.pool;
//     const adminId = String(req.user.id);

//     const result = await pool.query(
//       `SELECT DISTINCT ON (u.id)
//          u.id,
//          u.email,
//          u.online,
//          u.photo_url,
//          m.message      AS last_message,
//          m.created_at   AS last_message_at,
//          (
//            SELECT COUNT(*)
//            FROM admin_messages m2
//            WHERE m2.sender_id::TEXT = u.id::TEXT
//              AND (m2.receiver_id::TEXT = $1 OR m2.receiver_id IS NULL)
//              AND m2.is_read = false
//              AND m2.deleted_at IS NULL
//          ) AS unread_count
//        FROM admin_messages m
//        JOIN users u ON (
//          (m.sender_id::TEXT != $1
//            AND (m.receiver_id::TEXT = $1 OR m.receiver_id IS NULL)
//            AND u.id::TEXT = m.sender_id::TEXT)
//          OR
//          (m.sender_id::TEXT = $1 AND u.id::TEXT = m.receiver_id::TEXT)
//        )
//        WHERE u.role != 'admin'
//        GROUP BY u.id, u.email, u.online, u.photo_url, m.message, m.created_at
//        ORDER BY u.id, m.created_at DESC`,
//       [adminId]
//     );

//     res.json({ success: true, data: result.rows });
//   } catch (err) {
//     console.error('getAllEmployeeChats error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    GET /admin/:userId
//    Admin fetches the full thread with one specific employee.

//    DELETE VISIBILITY RULES:
//    - deleted_for = 'all'  → both sides see placeholder, no content
//    - deleted_for = 'me'   → only the person who deleted sees placeholder;
//                             the other person still sees the original message.
//                             We use the deleted_by column (if present) or
//                             fall back to sender_id to determine who deleted it.
// ───────────────────────────────────────────────────────────────────────────── */
// const getMessages = async (req, res) => {
//   try {
//     const pool  = req.pool;
//     const me    = String(req.user.id);
//     const other = String(req.params.userId);

//     // Mark messages FROM the other user TO me as read
//     await pool.query(
//       `UPDATE admin_messages
//          SET is_read = true
//        WHERE sender_id::TEXT = $1
//          AND (receiver_id::TEXT = $2 OR receiver_id IS NULL)
//          AND is_read = false`,
//       [other, me]
//     );

//     const result = await pool.query(
//       `SELECT * FROM admin_messages
//        WHERE (sender_id::TEXT = $1 AND (receiver_id::TEXT = $2 OR receiver_id IS NULL))
//           OR (sender_id::TEXT = $2 AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
//        ORDER BY created_at ASC`,
//       [me, other]
//     );

//     const rows = result.rows.map(m => {
//       if (!m.deleted_at) return m;

//       if (m.deleted_for === 'all') {
//         return { ...m, message: null, attachments: [] };
//       }

//       if (m.deleted_for === 'me') {
//         // Use deleted_by column if available, otherwise fall back to sender_id
//         const deletedBy = m.deleted_by ? String(m.deleted_by) : String(m.sender_id);
//         if (deletedBy === me) {
//           // I deleted it for myself — I see the placeholder
//           return { ...m, message: null, attachments: [] };
//         } else {
//           // The other person deleted it for themselves — I still see the original
//           return { ...m, deleted_at: null, deleted_for: null };
//         }
//       }

//       return m;
//     });

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error('getMessages error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    GET /employee/my-thread
//    Employee fetches their own thread with admins.
//    Same per-user delete filtering applies.
// ───────────────────────────────────────────────────────────────────────────── */
// const getMyAdminThread = async (req, res) => {
//   try {
//     const pool = req.pool;
//     const me   = String(req.user.id);

//     const result = await pool.query(
//       `SELECT m.*, u.email AS sender_email
//        FROM admin_messages m
//        JOIN users u ON u.id::TEXT = m.sender_id::TEXT
//        WHERE (m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1)
//        ORDER BY m.created_at ASC`,
//       [me]
//     );

//     const rows = result.rows.map(m => {
//       if (!m.deleted_at) return m;

//       if (m.deleted_for === 'all') {
//         return { ...m, message: null, attachments: [] };
//       }

//       if (m.deleted_for === 'me') {
//         const deletedBy = m.deleted_by ? String(m.deleted_by) : String(m.sender_id);
//         if (deletedBy === me) {
//           return { ...m, message: null, attachments: [] };
//         } else {
//           return { ...m, deleted_at: null, deleted_for: null };
//         }
//       }

//       return m;
//     });

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error('getMyAdminThread error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    GET /employee/admins
//    Returns list of admin users.
// ───────────────────────────────────────────────────────────────────────────── */
// const getAdmins = async (req, res) => {
//   try {
//     const pool   = req.pool;
//     const result = await pool.query(
//       `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
//     );
//     if (result.rows.length === 0)
//       return res.status(404).json({ success: false, message: 'No admins found' });
//     res.json({ success: true, data: result.rows });
//   } catch (err) {
//     console.error('getAdmins error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    POST /send  (multipart/form-data — multer required on this route)
//    Body: receiver_id (optional), message (optional if files present)
//    Files: files[] (optional)
// ───────────────────────────────────────────────────────────────────────────── */
// const sendMessage = async (req, res) => {
//   try {
//     const pool      = req.pool;
//     const sender_id = req.user.id;
//     const { receiver_id, message } = req.body;

//     const uploadedFiles = req.files?.length ? await uploadFiles(req.files) : [];
//     const msgText       = message?.trim() || null;

//     if (!msgText && uploadedFiles.length === 0)
//       return res.status(400).json({ success: false, message: 'message or file is required' });

//     const result = await pool.query(
//       `INSERT INTO admin_messages (sender_id, receiver_id, message, attachments)
//        VALUES ($1, $2, $3, $4::jsonb)
//        RETURNING *`,
//       [sender_id, receiver_id || null, msgText, JSON.stringify(uploadedFiles)]
//     );

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error('sendMessage error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    PUT /:id   Edit message text (sender only, cannot edit deleted messages)
// ───────────────────────────────────────────────────────────────────────────── */
// const editMessage = async (req, res) => {
//   try {
//     const pool   = req.pool;
//     const userId = String(req.user.id);
//     const { id } = req.params;
//     const { message } = req.body;

//     if (!message?.trim())
//       return res.status(400).json({ success: false, message: 'message is required' });

//     const check = await pool.query(
//       `SELECT sender_id, deleted_at FROM admin_messages WHERE id = $1`, [id]
//     );
//     if (check.rows.length === 0)
//       return res.status(404).json({ success: false, message: 'Message not found' });
//     if (String(check.rows[0].sender_id) !== userId)
//       return res.status(403).json({ success: false, message: 'Not your message' });
//     if (check.rows[0].deleted_at)
//       return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });

//     const result = await pool.query(
//       `UPDATE admin_messages
//          SET message = $1, edited_at = NOW()
//        WHERE id = $2
//        RETURNING *`,
//       [message.trim(), id]
//     );

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error('editMessage error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    DELETE /:id   Delete for EVERYONE (sender only)
// ───────────────────────────────────────────────────────────────────────────── */
// const deleteMessage = async (req, res) => {
//   try {
//     const pool   = req.pool;
//     const userId = String(req.user.id);
//     const { id } = req.params;

//     const check = await pool.query(
//       `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
//     );
//     if (check.rows.length === 0)
//       return res.status(404).json({ success: false, message: 'Message not found' });
//     if (String(check.rows[0].sender_id) !== userId)
//       return res.status(403).json({ success: false, message: 'Not your message' });

//     await pool.query(
//       `UPDATE admin_messages
//          SET deleted_at = NOW(), deleted_for = 'all'
//        WHERE id = $1`,
//       [id]
//     );

//     res.json({ success: true });
//   } catch (err) {
//     console.error('deleteMessage error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    POST /:id/delete-for-me
//    Hide the message only for the person making the request.
//    Uses deleted_by column if it exists (recommended), otherwise falls back
//    to a simpler approach. To add the column run:
//      ALTER TABLE admin_messages ADD COLUMN IF NOT EXISTS deleted_by TEXT;
// ───────────────────────────────────────────────────────────────────────────── */
// const deleteForMe = async (req, res) => {
//   try {
//     const pool   = req.pool;
//     const userId = String(req.user.id);
//     const { id } = req.params;

//     const check = await pool.query(
//       `SELECT id FROM admin_messages WHERE id = $1`, [id]
//     );
//     if (check.rows.length === 0)
//       return res.status(404).json({ success: false, message: 'Message not found' });

//     // Check if deleted_by column exists
//     const hasDeletedByCol = await pool.query(
//       `SELECT column_name FROM information_schema.columns
//        WHERE table_name = 'admin_messages' AND column_name = 'deleted_by'`
//     );

//     if (hasDeletedByCol.rows.length > 0) {
//       // Best approach — store who deleted it separately from sender_id
//       await pool.query(
//         `UPDATE admin_messages
//            SET deleted_at = NOW(), deleted_for = 'me', deleted_by = $1
//          WHERE id = $2`,
//         [userId, id]
//       );
//     } else {
//       // Fallback — works correctly only when the sender deletes for themselves.
//       // Run the migration above to support receivers deleting for themselves too.
//       await pool.query(
//         `UPDATE admin_messages
//            SET deleted_at = NOW(), deleted_for = 'me'
//          WHERE id = $1`,
//         [id]
//       );
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error('deleteForMe error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    POST /:id/react   Toggle emoji reaction on/off for the requesting user
// ───────────────────────────────────────────────────────────────────────────── */
// const reactToMessage = async (req, res) => {
//   try {
//     const pool   = req.pool;
//     const userId = String(req.user.id);
//     const { id } = req.params;
//     const { emoji } = req.body;

//     if (!emoji)
//       return res.status(400).json({ success: false, message: 'emoji is required' });

//     const row = await pool.query(
//       `SELECT reactions FROM admin_messages WHERE id = $1`, [id]
//     );
//     if (row.rows.length === 0)
//       return res.status(404).json({ success: false, message: 'Message not found' });

//     let reactions = row.rows[0].reactions || [];
//     const idx = reactions.findIndex(r => r.emoji === emoji && String(r.user_id) === userId);
//     if (idx >= 0) reactions.splice(idx, 1);           // already reacted → toggle off
//     else reactions.push({ emoji, user_id: userId });  // not yet reacted → toggle on

//     await pool.query(
//       `UPDATE admin_messages SET reactions = $1::jsonb WHERE id = $2`,
//       [JSON.stringify(reactions), id]
//     );

//     res.json({ success: true, reactions });
//   } catch (err) {
//     console.error('reactToMessage error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// module.exports = {
//   getAdmins,
//   getMyAdminThread,
//   getAllEmployeeChats,
//   getMessages,
//   sendMessage,
//   editMessage,
//   deleteMessage,
//   deleteForMe,
//   reactToMessage,
// };

const path = require('path');
const fs   = require('fs');

/* ─── File upload helper ─────────────────────────────────────────────────── */
const uploadFiles = async (files = []) => {
  return files.map(f => ({
    name:     f.originalname,
    size:     f.size,
    mimetype: f.mimetype,
    url:      `/uploads/chat/${f.filename}`,
  }));
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /admin/users
   Admin sees list of all employees they have a thread with.
   Includes last message preview and unread count.
   NOTE: u.online and u.photo_url removed — columns don't exist in your DB.
   The query uses LATERAL joins to avoid the DISTINCT ON + GROUP BY conflict.
───────────────────────────────────────────────────────────────────────────── */
const getAllEmployeeChats = async (req, res) => {
  try {
    const pool    = req.pool;
    const adminId = String(req.user.id);

    const result = await pool.query(
      `SELECT
         u.id,
         u.email,
         last_msg.message      AS last_message,
         last_msg.created_at   AS last_message_at,
         COALESCE(unread.cnt, 0) AS unread_count
       FROM users u

       /* Only employees who have exchanged at least one message with this admin */
       JOIN LATERAL (
         SELECT message, created_at
         FROM admin_messages
         WHERE
           (sender_id::TEXT = u.id::TEXT AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
           OR
           (sender_id::TEXT = $1 AND receiver_id::TEXT = u.id::TEXT)
         ORDER BY created_at DESC
         LIMIT 1
       ) last_msg ON true

       /* Count unread messages from this employee to admin */
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS cnt
         FROM admin_messages
         WHERE sender_id::TEXT = u.id::TEXT
           AND (receiver_id::TEXT = $1 OR receiver_id IS NULL)
           AND is_read = false
           AND deleted_at IS NULL
       ) unread ON true

       WHERE u.role != 'admin'
       ORDER BY last_msg.created_at DESC`,
      [adminId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAllEmployeeChats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /admin/:userId
   Admin fetches full thread with one specific employee.
   DELETE VISIBILITY RULES:
   - deleted_for = 'all'  → both sides see placeholder
   - deleted_for = 'me'   → only the deleter sees placeholder;
                            other person still sees the original
───────────────────────────────────────────────────────────────────────────── */
const getMessages = async (req, res) => {
  try {
    const pool  = req.pool;
    const me    = String(req.user.id);
    const other = String(req.params.userId);

    // Mark messages FROM the other user TO me as read
    await pool.query(
      `UPDATE admin_messages
         SET is_read = true
       WHERE sender_id::TEXT = $1
         AND (receiver_id::TEXT = $2 OR receiver_id IS NULL)
         AND is_read = false`,
      [other, me]
    );

    const result = await pool.query(
      `SELECT * FROM admin_messages
       WHERE (sender_id::TEXT = $1 AND (receiver_id::TEXT = $2 OR receiver_id IS NULL))
          OR (sender_id::TEXT = $2 AND (receiver_id::TEXT = $1 OR receiver_id IS NULL))
       ORDER BY created_at ASC`,
      [me, other]
    );

    const rows = result.rows.map(m => {
      if (!m.deleted_at) return m;

      if (m.deleted_for === 'all') {
        return { ...m, message: null, attachments: [] };
      }

      if (m.deleted_for === 'me') {
        // Use deleted_by if available, else fall back to sender_id
        const deletedBy = m.deleted_by ? String(m.deleted_by) : String(m.sender_id);
        if (deletedBy === me) {
          // I deleted it for myself → show me the placeholder
          return { ...m, message: null, attachments: [] };
        } else {
          // The other person deleted it for themselves → I still see original
          return { ...m, deleted_at: null, deleted_for: null };
        }
      }

      return m;
    });

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /employee/my-thread
   Employee fetches their own thread with admin.
───────────────────────────────────────────────────────────────────────────── */
const getMyAdminThread = async (req, res) => {
  try {
    const pool = req.pool;
    const me   = String(req.user.id);

    const result = await pool.query(
      `SELECT m.*, u.email AS sender_email
       FROM admin_messages m
       JOIN users u ON u.id::TEXT = m.sender_id::TEXT
       WHERE (m.sender_id::TEXT = $1 OR m.receiver_id::TEXT = $1)
       ORDER BY m.created_at ASC`,
      [me]
    );

    const rows = result.rows.map(m => {
      if (!m.deleted_at) return m;

      if (m.deleted_for === 'all') {
        return { ...m, message: null, attachments: [] };
      }

      if (m.deleted_for === 'me') {
        const deletedBy = m.deleted_by ? String(m.deleted_by) : String(m.sender_id);
        if (deletedBy === me) {
          return { ...m, message: null, attachments: [] };
        } else {
          return { ...m, deleted_at: null, deleted_for: null };
        }
      }

      return m;
    });

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getMyAdminThread error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /employee/admins
───────────────────────────────────────────────────────────────────────────── */
const getAdmins = async (req, res) => {
  try {
    const pool   = req.pool;
    const result = await pool.query(
      `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC`
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'No admins found' });
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAdmins error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /send  (multipart/form-data)
───────────────────────────────────────────────────────────────────────────── */
const sendMessage = async (req, res) => {
  try {
    const pool      = req.pool;
    const sender_id = req.user.id;
    const { receiver_id, message } = req.body;

    const uploadedFiles = req.files?.length ? await uploadFiles(req.files) : [];
    const msgText       = message?.trim() || null;

    if (!msgText && uploadedFiles.length === 0)
      return res.status(400).json({ success: false, message: 'message or file is required' });

    const result = await pool.query(
      `INSERT INTO admin_messages (sender_id, receiver_id, message, attachments)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING *`,
      [sender_id, receiver_id || null, msgText, JSON.stringify(uploadedFiles)]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /:id   Edit message text (sender only)
───────────────────────────────────────────────────────────────────────────── */
const editMessage = async (req, res) => {
  try {
    const pool   = req.pool;
    const userId = String(req.user.id);
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim())
      return res.status(400).json({ success: false, message: 'message is required' });

    const check = await pool.query(
      `SELECT sender_id, deleted_at FROM admin_messages WHERE id = $1`, [id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });
    if (String(check.rows[0].sender_id) !== userId)
      return res.status(403).json({ success: false, message: 'Not your message' });
    if (check.rows[0].deleted_at)
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });

    const result = await pool.query(
      `UPDATE admin_messages SET message = $1, edited_at = NOW()
       WHERE id = $2 RETURNING *`,
      [message.trim(), id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('editMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /:id   Delete for everyone (sender only)
───────────────────────────────────────────────────────────────────────────── */
const deleteMessage = async (req, res) => {
  try {
    const pool   = req.pool;
    const userId = String(req.user.id);
    const { id } = req.params;

    const check = await pool.query(
      `SELECT sender_id FROM admin_messages WHERE id = $1`, [id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });
    if (String(check.rows[0].sender_id) !== userId)
      return res.status(403).json({ success: false, message: 'Not your message' });

    await pool.query(
      `UPDATE admin_messages SET deleted_at = NOW(), deleted_for = 'all' WHERE id = $1`, [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /:id/delete-for-me
───────────────────────────────────────────────────────────────────────────── */
const deleteForMe = async (req, res) => {
  try {
    const pool   = req.pool;
    const userId = String(req.user.id);
    const { id } = req.params;

    const check = await pool.query(
      `SELECT id FROM admin_messages WHERE id = $1`, [id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });

    // Check if deleted_by column exists
    const hasDeletedByCol = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'admin_messages' AND column_name = 'deleted_by'`
    );

    if (hasDeletedByCol.rows.length > 0) {
      await pool.query(
        `UPDATE admin_messages
           SET deleted_at = NOW(), deleted_for = 'me', deleted_by = $1
         WHERE id = $2`,
        [userId, id]
      );
    } else {
      await pool.query(
        `UPDATE admin_messages SET deleted_at = NOW(), deleted_for = 'me' WHERE id = $1`,
        [id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('deleteForMe error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /:id/react   Toggle emoji reaction
───────────────────────────────────────────────────────────────────────────── */
const reactToMessage = async (req, res) => {
  try {
    const pool   = req.pool;
    const userId = String(req.user.id);
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji)
      return res.status(400).json({ success: false, message: 'emoji is required' });

    const row = await pool.query(
      `SELECT reactions FROM admin_messages WHERE id = $1`, [id]
    );
    if (row.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });

    let reactions = row.rows[0].reactions || [];
    const idx = reactions.findIndex(r => r.emoji === emoji && String(r.user_id) === userId);
    if (idx >= 0) reactions.splice(idx, 1);
    else reactions.push({ emoji, user_id: userId });

    await pool.query(
      `UPDATE admin_messages SET reactions = $1::jsonb WHERE id = $2`,
      [JSON.stringify(reactions), id]
    );

    res.json({ success: true, reactions });
  } catch (err) {
    console.error('reactToMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdmins,
  getMyAdminThread,
  getAllEmployeeChats,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteForMe,
  reactToMessage,
};