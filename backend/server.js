require('dotenv').config()
console.log("ENV CHECK:", process.env.DB_HOST);
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const adminRoutes = require('./routes/admin/index')
const companyRoutes = require('./routes/company/index')
const employeeRoutes = require('./routes/employee/index')
const authRoutes = require('./routes/auth')

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/employee', employeeRoutes)

app.use((err, req, res, next) => {
console.error(err.stack)
res.status(err.status || 500).json({
success: false,
message: err.message || 'Internal server error'
})
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})

module.exports = app
