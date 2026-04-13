require('dotenv').config()
console.log("ENV CHECK:", process.env.DB_HOST)

const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const db = require('./config/db')

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

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
    res.status(500).json({ success: false, error: err.message })
  }
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/admin', require('./routes/admin/index'))
app.use('/api/company', require('./routes/company/index'))
app.use('/api/employee', require('./routes/employee/index'))

app.use('/api/chat/employee', require('./routes/chat/employeeChat'))
app.use('/api/chat/admin', require('./routes/chat/adminChat'))
app.use('/api/admin', require('./routes/chat/adminChat'))

app.use('/api/company/users', require('./routes/company/users'))
app.use('/api/company/chat', require('./routes/company/chat'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

let onlineUsers = {}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id
  })

  socket.on('joinChat', (chatId) => {
    socket.join(chatId)
  })

  socket.on('sendMessage', async (data) => {
    try {
      const { sender_id, receiver_id, content } = data

      const result = await db.query(
        `INSERT INTO messages(sender_id, receiver_id, content)
         VALUES($1,$2,$3) RETURNING *`,
        [sender_id, receiver_id, content]
      )

      const message = result.rows[0]

      if (onlineUsers[receiver_id]) {
        io.to(onlineUsers[receiver_id]).emit('receiveMessage', message)
      }

      io.to(socket.id).emit('receiveMessage', message)

    } catch (err) {
      console.error(err)
    }
  })

  socket.on('disconnect', () => {
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId]
        break
      }
    }
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app