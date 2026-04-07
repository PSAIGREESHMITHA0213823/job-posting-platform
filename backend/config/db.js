require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('connect', () => console.log('✅ Connected to Supabase Postgres!'))

pool.on('error', (err) => {
  console.error('❌ DB error:', err)
  process.exit(-1)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}