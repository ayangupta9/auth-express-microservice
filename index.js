require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRouter = require('./api/authRouter')

// const { pool } = require('./db')
// const { getTasks } = require('./controllers/auth')
const app = express()

const PORT = process.env.PORT || 8080
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.set(
  express.urlencoded({
    extended: false
  })
)

app.use('/api/', authRouter)

app.listen(PORT, () => {
  console.log(`Listening at ${PORT}...`)
})
