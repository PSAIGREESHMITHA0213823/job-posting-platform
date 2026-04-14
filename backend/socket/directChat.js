// backend/socket/directChat.js
// Save to: backend/socket/directChat.js
//
// In server.js inside io.on('connection', (socket) => { ... }) add:
//   const setupDirectChat = require('./socket/directChat')
//   setupDirectChat(socket, io, db, onlineUsers)

const db = require('../config/db')

const setupDirectChat = (socket, io, db, onlineUsers) => {

  // ── Send direct message ───────────────────────────────────────────────────
  socket.on('dm:send', async ({ receiver_id, content, file_url, file_name, file_type, sender }) => {
    const u = sender || socket.dmUser
    if (!u || !receiver_id || (!content?.trim() && !file_url)) return

    try {
      const res = await db.query(`
        INSERT INTO direct_messages (sender_id, receiver_id, content, file_url, file_name, file_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [u.id, receiver_id, content?.trim() || '', file_url || null, file_name || null, file_type || null])

      const msg = res.rows[0]

      const payload = {
        ...msg,
        sender_name:  u.name  || u.email,
        sender_email: u.email,
        sender_role:  u.role,
        reactions:    [],
      }

      // Send to sender
      socket.emit('dm:message', payload)

      // Send to receiver if online
      const receiverSocketId = onlineUsers[receiver_id]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('dm:message', payload)
        // Also send unread badge update
        io.to(receiverSocketId).emit('dm:unread', { from_user_id: u.id })
      }
    } catch (err) {
      console.error('[DM] send error:', err.message)
      socket.emit('dm:error', { message: 'Failed to send message' })
    }
  })

  // ── React to a DM ─────────────────────────────────────────────────────────
  socket.on('dm:react', async ({ message_id, emoji, receiver_id, sender }) => {
    const u = sender || socket.dmUser
    if (!u || !message_id || !emoji) return

    try {
      const ex = await db.query(
        'SELECT id FROM dm_reactions WHERE message_id=$1 AND user_id=$2 AND emoji=$3',
        [message_id, u.id, emoji]
      )
      if (ex.rows.length) {
        await db.query('DELETE FROM dm_reactions WHERE id=$1', [ex.rows[0].id])
      } else {
        await db.query(
          'INSERT INTO dm_reactions (message_id, user_id, emoji) VALUES ($1,$2,$3)',
          [message_id, u.id, emoji]
        )
      }

      const updated = await db.query(`
        SELECT r.emoji, r.user_id, COALESCE(u.name, u.email) AS name
        FROM dm_reactions r JOIN users u ON u.id = r.user_id
        WHERE r.message_id = $1
      `, [message_id])

      const reactionPayload = { message_id, reactions: updated.rows }

      socket.emit('dm:reactions_update', reactionPayload)
      const receiverSocketId = onlineUsers[receiver_id]
      if (receiverSocketId) io.to(receiverSocketId).emit('dm:reactions_update', reactionPayload)

    } catch (err) {
      console.error('[DM] react error:', err.message)
    }
  })

  // ── Typing indicator ──────────────────────────────────────────────────────
  socket.on('dm:typing', ({ receiver_id, name }) => {
    const receiverSocketId = onlineUsers[receiver_id]
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('dm:typing', { from_user_id: socket.dmUser?.id, name })
    }
  })

  // ── Mark as read ──────────────────────────────────────────────────────────
  socket.on('dm:read', async ({ sender_id }) => {
    const u = socket.dmUser
    if (!u) return
    try {
      await db.query(
        'UPDATE direct_messages SET is_read=TRUE WHERE sender_id=$1 AND receiver_id=$2 AND is_read=FALSE',
        [sender_id, u.id]
      )
    } catch (err) {
      console.error('[DM] read error:', err.message)
    }
  })
}

module.exports = setupDirectChat