const router = require("express").Router();
const ctrl = require("../../controllers/admin/chatController");
const auth = require("../../middleware/auth");

router.get("/users", auth, ctrl.getAllUsers);

router.get("/messages/:receiverId", auth, ctrl.getMessages);

router.post("/send", auth, ctrl.sendMessage);

module.exports = router;