
// require('dotenv').config()
// console.log("ENV CHECK:", process.env.DB_HOST)

// const express = require('express')
// const cors    = require('cors')
// const path    = require('path')
// const db      = require('./config/db')  // pg pool — already works with Supabase

// const app = express()
// app.use('/api', require('./routes/chatRoutes'))
// app.use(cors())
// app.use(express.json({ limit: '10mb' }))
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
// app.use((req, res, next) => {
//   req.pool = db
//   next()
// })
// app.get('/api/test-db', async (req, res) => {
//   try {
//     const result = await db.query('SELECT NOW()')
//     res.json({ success: true, time: result.rows[0].now })
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message, code: err.code })
//   }
// })
// app.use('/api/auth',     require('./routes/auth'))
// app.use('/api/admin',    require('./routes/admin/index'))
// app.use('/api/company',  require('./routes/company/index'))
// app.use('/api/employee', require('./routes/employee/index'))
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal server error'
//   })
// })

// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// module.exports = app

require('dotenv').config()
console.log("ENV CHECK:", process.env.DB_HOST)

const express = require('express')
const cors    = require('cors')
const path    = require('path')
const db      = require('./config/db')  // pg pool — already works with Supabase

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use((req, res, next) => {
  req.pool = db
  next()
})
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()')
    res.json({ success: true, time: result.rows[0].now })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: err.code })
  }
})
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/admin',    require('./routes/admin/index'))
app.use('/api/company',  require('./routes/company/index'))
app.use('/api/employee', require('./routes/employee/index'))
app.use('/api/chat/employee', require('./routes/chat/employeeChat'));
app.use('/api/chat/admin', require('./routes/chat/adminChat'));
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = app