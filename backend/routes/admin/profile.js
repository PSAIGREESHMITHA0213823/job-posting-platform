// const express = require('express');
// const router  = express.Router();

// const { auth } = require('../../middleware/auth');  // ✅ FIXED
// const { uploadAvatar } = require('../../middleware/multer');

// const {
//   getProfile,
//   updateProfile,
//   uploadAvatarHandler,
//   changePassword
// } = requaire('../../controllers/admin/profileController');

// router.use(auth);  // ✅ FIXED

// router.get('/', getProfile);
// router.put('/', updateProfile);
// router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarHandler);
// router.put('/password', changePassword);

// module.exports = router;
const express = require('express');
const router  = express.Router();
const { auth } = require('../../middleware/auth');
const { uploadAvatar } = require('../../middleware/upload'); // ✅ now exists

const {
  getProfile,
  updateProfile,
  uploadAvatarHandler,
  changePassword,
} = require('../../controllers/admin/profileController');

router.use(auth);

router.get('/',        getProfile);
router.put('/',        updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarHandler);
router.put('/password', changePassword);

module.exports = router;