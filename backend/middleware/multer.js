// const multer = require('multer');
// const path   = require('path');
// const { v4: uuidv4 } = require('uuid');

// // ── Resume storage ────────────────────────────────────────────────────────────
// const resumeStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../uploads/resumes'));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `resume_${uuidv4()}${ext}`);
//   },
// });

// // ── Logo storage ──────────────────────────────────────────────────────────────
// const logoStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../uploads/logos'));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `logo_${uuidv4()}${ext}`);
//   },
// });

// // ── Avatar storage ────────────────────────────────────────────────────────────
// // FIX: this was completely missing — the /api/admin/profile/avatar endpoint
// // had no multer middleware to receive the file, causing all uploads to fail.
// const avatarStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../uploads/avatars'));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(null, `avatar_${uuidv4()}${ext}`);
//   },
// });

// // ── File filters ──────────────────────────────────────────────────────────────
// const resumeFilter = (req, file, cb) => {
//   const allowed = ['.pdf', '.doc', '.docx'];
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowed.includes(ext)) return cb(null, true);
//   cb(new Error('Only PDF and Word documents allowed'));
// };

// const imageFilter = (req, file, cb) => {
//   const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowed.includes(ext)) return cb(null, true);
//   cb(new Error('Only image files allowed (jpg, jpeg, png, webp, gif)'));
// };

// // ── Multer instances ──────────────────────────────────────────────────────────
// const uploadResume = multer({
//   storage:    resumeStorage,
//   fileFilter: resumeFilter,
//   limits:     { fileSize: process.env.MAX_FILE_SIZE || 5_242_880 }, // 5 MB
// });

// const uploadLogo = multer({
//   storage:    logoStorage,
//   fileFilter: imageFilter,
//   limits:     { fileSize: 2_097_152 }, // 2 MB
// });

// const uploadAvatar = multer({
//   storage:    avatarStorage,
//   fileFilter: imageFilter,
//   limits:     { fileSize: 2_097_152 }, // 2 MB
// });

// module.exports = { uploadResume, uploadLogo, uploadAvatar };
const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${uuidv4()}${ext}`);
  },
});

const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { uploadAvatar };