const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const resumeStorage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, path.join(__dirname, '../uploads/resumes'))
},
filename: (req, file, cb) => {
const ext = path.extname(file.originalname)
cb(null, `resume_${uuidv4()}${ext}`)
}
})

const logoStorage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, path.join(__dirname, '../uploads/logos'))
},
filename: (req, file, cb) => {
const ext = path.extname(file.originalname)
cb(null, `logo_${uuidv4()}${ext}`)
}
})

const resumeFilter = (req, file, cb) => {
const allowed = ['.pdf', '.doc', '.docx']
const ext = path.extname(file.originalname).toLowerCase()
if (allowed.includes(ext)) return cb(null, true)
cb(new Error('Only PDF and Word documents allowed'))
}

const imageFilter = (req, file, cb) => {
const allowed = ['.jpg', '.jpeg', '.png', '.webp']
const ext = path.extname(file.originalname).toLowerCase()
if (allowed.includes(ext)) return cb(null, true)
cb(new Error('Only image files allowed'))
}

const uploadResume = multer({
storage: resumeStorage,
fileFilter: resumeFilter,
limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 }
})

const uploadLogo = multer({
storage: logoStorage,
fileFilter: imageFilter,
limits: { fileSize: 2097152 }
})

module.exports = { uploadResume, uploadLogo }
