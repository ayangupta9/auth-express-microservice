const pg = require('pg')
require('dotenv').config()
const pgOptions = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT)
  // ssl: true
}

const pool = new pg.Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = {
  pool
}
