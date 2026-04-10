// // const multer = require('multer')
// // const path = require('path')
// // const { v4: uuidv4 } = require('uuid')

// // const resumeStorage = multer.diskStorage({
// // destination: (req, file, cb) => {
// // cb(null, path.join(__dirname, '../uploads/resumes'))
// // },
// // filename: (req, file, cb) => {
// // const ext = path.extname(file.originalname)
// // cb(null, `resume_${uuidv4()}${ext}`)
// // }
// // })

// // const logoStorage = multer.diskStorage({
// // destination: (req, file, cb) => {
// // cb(null, path.join(__dirname, '../uploads/logos'))
// // },
// // filename: (req, file, cb) => {
// // const ext = path.extname(file.originalname)
// // cb(null, `logo_${uuidv4()}${ext}`)
// // }
// // })

// // const resumeFilter = (req, file, cb) => {
// // const allowed = ['.pdf', '.doc', '.docx']
// // const ext = path.extname(file.originalname).toLowerCase()
// // if (allowed.includes(ext)) return cb(null, true)
// // cb(new Error('Only PDF and Word documents allowed'))
// // }

// // const imageFilter = (req, file, cb) => {
// // const allowed = ['.jpg', '.jpeg', '.png', '.webp']
// // const ext = path.extname(file.originalname).toLowerCase()
// // if (allowed.includes(ext)) return cb(null, true)
// // cb(new Error('Only image files allowed'))
// // }

// // const uploadResume = multer({
// // storage: resumeStorage,
// // fileFilter: resumeFilter,
// // limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 }
// // })

// // const uploadLogo = multer({
// // storage: logoStorage,
// // fileFilter: imageFilter,
// // limits: { fileSize: 2097152 }
// // })

// // module.exports = { uploadResume, uploadLogo }
// const multer  = require('multer');
// const path    = require('path');
// const { v4: uuidv4 } = require('uuid');

// // ── Resume (disk) ──────────────────────────────────────────────
// const resumeStorage = multer.diskStorage({
//   destination: (req, file, cb) =>
//     cb(null, path.join(__dirname, '../uploads/resumes')),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `resume_${uuidv4()}${ext}`);
//   },
// });

// // ── Logo (disk) ────────────────────────────────────────────────
// const logoStorage = multer.diskStorage({
//   destination: (req, file, cb) =>
//     cb(null, path.join(__dirname, '../uploads/logos')),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `logo_${uuidv4()}${ext}`);
//   },
// });

// // ── Avatar → memoryStorage (goes to Supabase, not disk) ────────
// const avatarStorage = multer.memoryStorage(); // ✅ buffer in req.file.buffer

// // ── Filters ────────────────────────────────────────────────────
// const resumeFilter = (req, file, cb) => {
//   const allowed = ['.pdf', '.doc', '.docx'];
//   const ext = path.extname(file.originalname).toLowerCase();
//   allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and Word documents allowed'));
// };
// const imageFilter = (req, file, cb) => {
//   // ✅ Check mimetype instead of extension — browsers report this reliably
//   const allowedMimes = [
//     'image/jpeg',
//     'image/jpg', 
//     'image/png',
//     'image/webp',
//     'image/gif',
//   ];
  
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`Only image files allowed. Got: ${file.mimetype}`));
//   }
// };

// // ── Multer instances ───────────────────────────────────────────
// const uploadResume = multer({
//   storage: resumeStorage,
//   fileFilter: resumeFilter,
//   limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 },
// });

// const uploadLogo = multer({
//   storage: logoStorage,
//   fileFilter: imageFilter,
//   limits: { fileSize: 2097152 },
// });

// const uploadAvatar = multer({       // ✅ was missing entirely
//   storage: avatarStorage,
//   fileFilter: imageFilter,
//   limits: { fileSize: 2097152 },    // 2 MB
// });

// module.exports = { uploadResume, uploadLogo, uploadAvatar };
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// ─────────────────────────────────────────────
// Ensure directory exists
// ─────────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ─────────────────────────────────────────────
// Storage Creators
// ─────────────────────────────────────────────

// Disk storage (for resume, logo)
const createDiskStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(__dirname, `../uploads/${folder}`)
      ensureDir(dest)
      cb(null, dest)
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `${folder}_${uuidv4()}${ext}`)
    }
  })

// Memory storage (for avatar → Supabase upload)
const memoryStorage = multer.memoryStorage()

// ─────────────────────────────────────────────
// File Filters
// ─────────────────────────────────────────────

// Resume filter
const resumeFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowed.includes(ext)) return cb(null, true)
  cb(new Error('Only PDF and Word documents allowed'))
}

// Image filter (better: mimetype)
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Only image files allowed. Got: ${file.mimetype}`))
  }
}

// ─────────────────────────────────────────────
// Upload Instances
// ─────────────────────────────────────────────

// ✅ Resume (disk)
const uploadResume = multer({
  storage: createDiskStorage('resumes'),
  fileFilter: resumeFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 }
})

// ✅ Logo (disk)
const uploadLogo = multer({
  storage: createDiskStorage('logos'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

// ✅ Avatar (memory → Supabase)
const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

// ─────────────────────────────────────────────
// Combined Upload (avatar + resume)
// ─────────────────────────────────────────────
const uploadProfileFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = 'misc'

      if (file.fieldname === 'avatar') folder = 'avatars'
      if (file.fieldname === 'resume') folder = 'resumes'

      const dest = path.join(__dirname, `../uploads/${folder}`)
      ensureDir(dest)
      cb(null, dest)
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `${file.fieldname}_${uuidv4()}${ext}`)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
])

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
module.exports = {
  uploadResume,
  uploadLogo,
  uploadAvatar,
  uploadProfileFiles
}