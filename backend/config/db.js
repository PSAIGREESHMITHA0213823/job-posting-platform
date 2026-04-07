// // // const { Pool } = require('pg')

// // // const pool = new Pool({
// // // host: process.env.DB_HOST || 'localhost',
// // // port: process.env.DB_PORT || 5432,
// // // database: process.env.DB_NAME || 'jobportal',
// // // user: process.env.DB_USER || 'postgres',
// // // password: process.env.DB_PASSWORD || '',
// // // max: 20,
// // // idleTimeoutMillis: 30000,
// // // connectionTimeoutMillis: 2000
// // // })

// // // pool.on('error', (err) => {
// // // console.error('Unexpected DB client error', err)
// // // process.exit(-1)
// // // })

// // // module.exports = {
// // // query: (text, params) => pool.query(text, params),
// // // pool
// // // }

// // // db.js
// // import pkg from 'pg';
// // const { Pool } = pkg;

// // const pool = new Pool({
// //   host: process.env.DB_HOST,
// //   port: process.env.DB_PORT,
// //   database: process.env.DB_NAME,
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASSWORD,
// // });

// // pool.on('connect', () => {
// //   console.log('Connected to Supabase PostgreSQL!');
// // });

// // export default pool;
// // config/db.js
// const { Pool } = require('pg');

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

// pool.on('connect', () => console.log('Connected to Supabase Postgres!'));

// pool.on('error', (err) => {
//   console.error('Unexpected DB client error', err);
//   process.exit(-1);
// });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   pool,
// };
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('Connected to Supabase Postgres!'));

pool.on('error', (err) => {
  console.error('Unexpected DB client error', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};