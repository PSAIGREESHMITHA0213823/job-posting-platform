
const db = require('../config/db');

const setupDirectChat = (socket, io, db, onlineUsers) => {

  // ── Register user on connect ──────────────────────────────────────────────
  socket.on('dm:register', (user) => {
    if (user && user.id) {
      socket.dmUser = user;
      onlineUsers[user.id] = socket.id;
      console.log(`[DM] User ${user.id} (${user.email}) registered, online:`, Object.keys(onlineUsers));
    }
  });

  // ── Send direct message ───────────────────────────────────────────────────
  socket.on('dm:send', async ({ receiver_id, content, file_url, file_name, file_type, sender }) => {
    const u = sender || socket.dmUser;
    if (!u || !receiver_id || (!content?.trim() && !file_url)) return;

    try {
      const res = await db.query(`
        INSERT INTO direct_messages (sender_id, receiver_id, content, file_url, file_name, file_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [u.id, receiver_id, content?.trim() || '', file_url || null, file_name || null, file_type || null]);

      const msg = res.rows[0];

      const payload = {
        ...msg,
        sender_name: u.email,
        sender_email: u.email,
        sender_role: u.role,
        reactions: [],
      };

      socket.emit('dm:message', { ...payload, __own: true });

      const receiverSocketId = onlineUsers[receiver_id];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('dm:message', payload);
        io.to(receiverSocketId).emit('dm:unread', { from_user_id: u.id });
      }
    } catch (err) {
      console.error('[DM] send error:', err.message);
      socket.emit('dm:error', { message: 'Failed to send message' });
    }
  });

  // ── React to a DM ─────────────────────────────────────────────────────────
  socket.on('dm:react', async ({ message_id, emoji, receiver_id, sender }) => {
    const u = sender || socket.dmUser;
    if (!u || !message_id || !emoji) return;

    try {
      console.log(`[DM] Reaction: User ${u.id} adding ${emoji} to message ${message_id}`);

      const ex = await db.query(
        `SELECT id FROM dm_reactions 
         WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
        [message_id, u.id, emoji]
      );
      
      if (ex.rows.length > 0) {
        await db.query('DELETE FROM dm_reactions WHERE id = $1', [ex.rows[0].id]);
        console.log(`[DM] Reaction removed`);
      } else {
        await db.query(
          `INSERT INTO dm_reactions (message_id, user_id, emoji) 
           VALUES ($1, $2, $3)`,
          [message_id, u.id, emoji]
        );
        console.log(`[DM] Reaction added`);
      }

      const updated = await db.query(`
        SELECT 
          r.emoji, 
          r.user_id, 
          u.email as name
        FROM dm_reactions r 
        JOIN users u ON u.id = r.user_id
        WHERE r.message_id = $1
      `, [message_id]);

      const reactionPayload = { 
        message_id: parseInt(message_id), 
        reactions: updated.rows 
      };

      const messageInfo = await db.query(
        `SELECT sender_id, receiver_id FROM direct_messages WHERE id = $1`,
        [message_id]
      );

      if (messageInfo.rows[0]) {
        const { sender_id, receiver_id: msg_receiver_id } = messageInfo.rows[0];
        
        const senderSocketId = onlineUsers[sender_id];
        if (senderSocketId) {
          io.to(senderSocketId).emit('dm:reactions_update', reactionPayload);
        }
        
        const receiverSocketId = onlineUsers[msg_receiver_id];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('dm:reactions_update', reactionPayload);
        }
      }

    } catch (err) {
      console.error('[DM] react error:', err.message);
      socket.emit('dm:error', { message: 'Failed to add reaction' });
    }
  });

  // ── Delete for Me ─────────────────────────────────────────────────────────
  socket.on('dm:delete_for_me', async ({ message_id, receiver_id, sender }) => {
    const u = sender || socket.dmUser;
    if (!u || !message_id) return;

    try {
      const messageCheck = await db.query(
        `SELECT sender_id, receiver_id FROM direct_messages WHERE id = $1`,
        [message_id]
      );

      if (messageCheck.rows.length === 0) return;

      const message = messageCheck.rows[0];
      
      if (message.sender_id === u.id) {
        await db.query(`UPDATE direct_messages SET deleted_by_sender = TRUE WHERE id = $1`, [message_id]);
        console.log(`[DM] User ${u.id} deleted message ${message_id} for themselves (sender)`);
      } else if (message.receiver_id === u.id) {
        await db.query(`UPDATE direct_messages SET deleted_by_receiver = TRUE WHERE id = $1`, [message_id]);
        console.log(`[DM] User ${u.id} deleted message ${message_id} for themselves (receiver)`);
      }

      socket.emit('dm:message_deleted', { message_id, deleted_for: 'me', user_id: u.id });

      const otherSocketId = onlineUsers[receiver_id];
      if (otherSocketId) {
        io.to(otherSocketId).emit('dm:message_deleted_for_other', { message_id, deleted_by: u.id });
      }
    } catch (err) {
      console.error('[DM] delete for me error:', err.message);
    }
  });

  // ── Delete for Everyone ───────────────────────────────────────────────────
  socket.on('dm:delete_for_everyone', async ({ message_id, receiver_id, sender }) => {
    const u = sender || socket.dmUser;
    if (!u || !message_id) return;

    try {
      const originalMsg = await db.query(
        `SELECT content, sender_id, receiver_id FROM direct_messages WHERE id = $1`,
        [message_id]
      );

      if (originalMsg.rows.length === 0) return;

      const msg = originalMsg.rows[0];
      const isAuthorized = (u.role === 'admin' || msg.sender_id === u.id);
      
      if (!isAuthorized) {
        socket.emit('dm:error', { message: 'Not authorized to delete for everyone' });
        return;
      }

      await db.query(
        `UPDATE direct_messages 
         SET deleted_for_everyone = TRUE, 
             is_deleted = TRUE,
             original_content = content,
             content = 'This message was deleted'
         WHERE id = $1`,
        [message_id]
      );

      console.log(`[DM] User ${u.id} deleted message ${message_id} for everyone`);

      const deletePayload = { 
        message_id, 
        content: 'This message was deleted', 
        deleted_for_everyone: true 
      };

      const senderSocketId = onlineUsers[msg.sender_id];
      if (senderSocketId) {
        io.to(senderSocketId).emit('dm:message_deleted_for_everyone', deletePayload);
      }

      const receiverSocketId = onlineUsers[msg.receiver_id];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('dm:message_deleted_for_everyone', deletePayload);
      }

    } catch (err) {
      console.error('[DM] delete for everyone error:', err.message);
      socket.emit('dm:error', { message: 'Failed to delete message for everyone' });
    }
  });

  // ── Typing indicator ──────────────────────────────────────────────────────
  socket.on('dm:typing', ({ receiver_id, name }) => {
    const receiverSocketId = onlineUsers[receiver_id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('dm:typing', { 
        from_user_id: socket.dmUser?.id, 
        name: name || socket.dmUser?.email 
      });
    }
  });

  // ── Mark as read ──────────────────────────────────────────────────────────
  socket.on('dm:read', async ({ sender_id }) => {
    const u = socket.dmUser;
    if (!u) return;
    
    try {
      const result = await db.query(
        `UPDATE direct_messages 
         SET is_read = TRUE 
         WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
         RETURNING id`,
        [sender_id, u.id]
      );
      
      if (result.rows.length > 0) {
        console.log(`[DM] Marked ${result.rows.length} messages as read from ${sender_id}`);
        
        const senderSocketId = onlineUsers[sender_id];
        if (senderSocketId) {
          io.to(senderSocketId).emit('dm:messages_read', { 
            by_user_id: u.id, 
            count: result.rows.length 
          });
        }
      }
    } catch (err) {
      console.error('[DM] read error:', err.message);
    }
  });

  // ── Mark single message as read ───────────────────────────────────────────
  socket.on('dm:read_single', async ({ message_id }) => {
    const u = socket.dmUser;
    if (!u || !message_id) return;

    try {
      const result = await db.query(
        `UPDATE direct_messages 
         SET is_read = TRUE 
         WHERE id = $1 AND receiver_id = $2 AND is_read = FALSE
         RETURNING sender_id`,
        [message_id, u.id]
      );

      if (result.rows[0]) {
        const senderSocketId = onlineUsers[result.rows[0].sender_id];
        if (senderSocketId) {
          io.to(senderSocketId).emit('dm:message_read', { 
            message_id, 
            by_user_id: u.id 
          });
        }
      }
    } catch (err) {
      console.error('[DM] read single error:', err.message);
    }
  });

  // ── Get user online status ────────────────────────────────────────────────
  socket.on('dm:get_online_status', ({ user_id }, callback) => {
    const isOnline = !!onlineUsers[user_id];
    if (callback && typeof callback === 'function') {
      callback({ online: isOnline });
    }
  });

  // ── Handle disconnect ─────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    if (socket.dmUser && socket.dmUser.id) {
      delete onlineUsers[socket.dmUser.id];
      console.log(`[DM] User ${socket.dmUser.id} disconnected. Online:`, Object.keys(onlineUsers));
      
      // Broadcast offline status to all connected users
      io.emit('dm:online', { user_id: socket.dmUser.id, online: false });
    }
  });
};

module.exports = setupDirectChat;