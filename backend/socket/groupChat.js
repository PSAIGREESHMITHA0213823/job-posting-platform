const db = require('../config/db');

module.exports = (socket, io, db, onlineUsers) => {
  
  // ── Join group room ───────────────────────────────────────────────────────
  socket.on('group:join', async ({ group_id, user }) => {
    try {
      const memberCheck = await db.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [group_id, user.id]
      );
      if (memberCheck.rows.length > 0) {
        socket.join(`group_${group_id}`);
        console.log(`[Group] User ${user.email} joined group ${group_id}`);
      } else {
        console.log(`[Group] User ${user.email} is not a member of group ${group_id}`);
      }
    } catch (err) {
      console.error('[Group] join error:', err);
    }
  });

  // ── Leave group room ──────────────────────────────────────────────────────
  socket.on('group:leave', ({ group_id }) => {
    socket.leave(`group_${group_id}`);
    console.log(`[Group] User left group ${group_id}`);
  });

  // ── Send group message ────────────────────────────────────────────────────
  socket.on('group:send', async ({ group_id, content, file_url, file_name, file_type, sender }) => {
    try {
      // Check if user is member
      const memberCheck = await db.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [group_id, sender.id]
      );
      
      if (memberCheck.rows.length === 0) {
        socket.emit('group:error', { message: 'You are not a member of this group' });
        return;
      }

      const result = await db.query(`
        INSERT INTO group_messages (group_id, sender_id, content, file_url, file_name, file_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [group_id, sender.id, content || '', file_url || null, file_name || null, file_type || null]);

      const message = result.rows[0];
      const payload = {
        ...message,
        sender_name: sender.email,
        sender_email: sender.email,
        sender_role: sender.role,
        reactions: [],
        type: 'group'
      };

      io.to(`group_${group_id}`).emit('group:message', payload);
      console.log(`[Group] Message sent to group ${group_id} by ${sender.email}`);

    } catch (err) {
      console.error('[Group] send error:', err);
      socket.emit('group:error', { message: 'Failed to send message' });
    }
  });

  // ── React to group message ────────────────────────────────────────────────
  socket.on('group:react', async ({ message_id, emoji, group_id, sender }) => {
    try {
      const existing = await db.query(
        `SELECT id FROM group_message_reactions 
         WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
        [message_id, sender.id, emoji]
      );

      if (existing.rows.length > 0) {
        await db.query(`DELETE FROM group_message_reactions WHERE id = $1`, [existing.rows[0].id]);
        console.log(`[Group] Reaction removed from message ${message_id}`);
      } else {
        await db.query(
          `INSERT INTO group_message_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)`,
          [message_id, sender.id, emoji]
        );
        console.log(`[Group] Reaction added to message ${message_id}`);
      }

      const reactions = await db.query(`
        SELECT r.emoji, r.user_id, u.email as name
        FROM group_message_reactions r
        JOIN users u ON u.id = r.user_id
        WHERE r.message_id = $1
      `, [message_id]);

      io.to(`group_${group_id}`).emit('group:reactions_update', {
        message_id,
        reactions: reactions.rows
      });

    } catch (err) {
      console.error('[Group] react error:', err);
    }
  });

  // ── Typing indicator ──────────────────────────────────────────────────────
  socket.on('group:typing', ({ group_id, name }) => {
    socket.to(`group_${group_id}`).emit('group:typing', { name });
  });

  // ── Delete group message (admin only) ─────────────────────────────────────
  socket.on('group:delete', async ({ message_id, group_id, sender }) => {
    try {
      // Check if user is admin
      const adminCheck = await db.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
        [group_id, sender.id]
      );
      
      if (adminCheck.rows.length === 0) {
        socket.emit('group:error', { message: 'Only admins can delete messages' });
        return;
      }

      await db.query(
        `UPDATE group_messages 
         SET deleted_for_everyone = TRUE, 
             content = 'This message was deleted'
         WHERE id = $1`,
        [message_id]
      );

      io.to(`group_${group_id}`).emit('group:message_deleted', { message_id });
      console.log(`[Group] Message ${message_id} deleted by admin ${sender.email}`);

    } catch (err) {
      console.error('[Group] delete error:', err);
    }
  });
};