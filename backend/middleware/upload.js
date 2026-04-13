
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

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
const memoryStorage = multer.memoryStorage()
const resumeFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowed.includes(ext)) return cb(null, true)
  cb(new Error('Only PDF and Word documents allowed'))
}
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
const uploadResume = multer({
  storage: createDiskStorage('resumes'),
  fileFilter: resumeFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 }
})
const uploadLogo = multer({
  storage: createDiskStorage('logos'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})
const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})
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
module.exports = {
  uploadResume,
  uploadLogo,
  uploadAvatar,
  uploadProfileFiles
}