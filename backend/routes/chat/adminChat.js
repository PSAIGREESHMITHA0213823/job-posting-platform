const router = require('express').Router();
const { auth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/chat/chat.controller');

router.use(auth);
router.use(requireRole('admin'));

// see all employee chats
router.get('/users', ctrl.getAllEmployeeChats);

// send reply
router.post('/send', ctrl.sendMessage);

// get chat with specific employee
router.get('/:userId', ctrl.getMessages);

module.exports = router;