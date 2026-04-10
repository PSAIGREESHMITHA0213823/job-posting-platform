// const router = require('express').Router();
// const { auth, requireRole } = require('../../middleware/auth');
// const ctrl = require('../../controllers/chat/chat.controller');

// router.use(auth);
// router.use(requireRole('employee'));

// // send message to admin
// router.post('/send', ctrl.sendMessage);

// // get messages with admin
// router.get('/:userId', ctrl.getMessages);

// module.exports = router;
// routes/chat/employeeChat.js
const router = require('express').Router();
const { auth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/chat/chat.controller');

router.use(auth);
router.use(requireRole('employee'));

// get all admins
router.get('/admins', ctrl.getAdmins);

// NEW: get full merged thread with all admins (used by ChatBot)
router.get('/my-thread', ctrl.getMyAdminThread);

// send message (broadcasts to all admins if no receiver_id)
router.post('/send', ctrl.sendMessage);

// get conversation with a specific user
router.get('/:userId', ctrl.getMessages);

module.exports = router;