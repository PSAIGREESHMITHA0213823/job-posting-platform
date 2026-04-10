const express = require('express');
const router = express.Router();
const chatHandler = require('../controllers/chatHandler');
const contactAdminHandler = require('../controllers/contactAdminHandler');
const { getAllChats, getChatById, resolveChat } = require('../controllers/adminChatHandler');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/chat', authMiddleware, chatHandler);
router.post('/chat/contact-admin', authMiddleware, contactAdminHandler);
router.get('/admin/chats', authMiddleware, adminMiddleware, getAllChats);
router.get('/admin/chats/:id', authMiddleware, adminMiddleware, getChatById);
router.patch('/admin/chats/:id/resolve', authMiddleware, adminMiddleware, resolveChat);

module.exports = router;