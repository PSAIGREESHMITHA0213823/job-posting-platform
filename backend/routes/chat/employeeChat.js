const router = require('express').Router();
const { auth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/chat/chat.controller');

router.use(auth);
router.use(requireRole('employee'));

router.get('/admins',      ctrl.getAdmins);
router.get('/my-thread',   ctrl.getMyAdminThread);
router.post('/send',       ctrl.sendMessage);
router.delete('/:id',      ctrl.deleteMessage);
router.post('/:id/react',  ctrl.reactToMessage);
router.get('/:userId',     ctrl.getMessages);

module.exports = router;