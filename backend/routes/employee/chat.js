const router = require("express").Router();
const ctrl = require("../../controllers/employee/chatController");
const auth = require("../../middleware/auth");

router.get("/messages/:receiverId", auth, ctrl.getMessages);
router.post("/send", auth, ctrl.sendMessage);

module.exports = router;