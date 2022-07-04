const { pool } = require('../../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

async function getUser (key) {
  let user = null
  try {
    const result = (
      await pool.query(
        `SELECT * FROM "${process.env.SCHEMA_NAME}".${process.env.USER_TABLE_NAME} WHERE username = $1 OR email = $1`,
        [key]
      )
    ).rows

    if (result && result.length > 0) {
      user = result[0]
    }
  } catch (e) {
    console.error(e)
  } finally {
    return user
  }
}

async function registerUser (user_info) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(user_info.password, saltRounds)

  let registerRes = false

  try {
    const result = await pool.query(
      `INSERT INTO "${process.env.SCHEMA_NAME}".${process.env.USER_TABLE_NAME} ("username","email","hash","joined_on")
          VALUES
          ($1,$2,$3,$4)
          `,
      [
        user_info.username,
        user_info.email,
        hashedPassword.toString(),
        new Date().toLocaleString()
      ]
    )
    if (result) {
      registerRes = true
    }
  } catch (e) {
    console.log(e)
  } finally {
    return registerRes
  }
}

function verifyAccessToken (req, res, next) {
  const ACCESS_TOKEN_SECRET = 'accesstokensecret'

  if (
    !req.cookies.accesstoken ||
    req.cookies.accesstoken === 'undefined' ||
    req.cookies.accesstoken === undefined
  ) {
    return res.status(200).json({
      status: false,
      message: 'No token found. Login again.'
    })
  }

  const token = req.cookies.accesstoken
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      console.error(err)
      return res.status(401).json({
        status: false,
        message: 'Unauthorized. Verification failed'
      })
    }
    req.payload = payload
  })
  next()
}

function signAccessToken (email) {
  return new Promise((resolve, reject) => {
    const payload = { email: email }
    const ACCESS_TOKEN_SECRET = 'accesstokensecret'

    jwt.sign(
      payload,
      ACCESS_TOKEN_SECRET,
      { expiresIn: '10h' },
      (err, token) => {
        if (err) {
          console.error(err)
          reject(err)
        } else resolve(token)
        // usertoken = token
      }
    )
  })
}

async function loginUser (key, password) {
  let loggedinUser = null
  try {
    const user = await getUser(key)
    console.log(user)

    if (user) {
      const { hash } = user
      const passwordsMatch = await bcrypt.compare(password, hash)
      if (passwordsMatch) {
        loggedinUser = user
      } else {
        throw Error('Incorrect Password')
      }
    } else {
      throw Error('Could not find user with this username/email')
    }
  } catch (e) {
    console.error(e)
  } finally {
    return loggedinUser
  }
}

async function getTasks () {
  let tasks = null
  try {
    tasks = (
      await pool.query(
        `SELECT * FROM "${process.env.SCHEMA_NAME}".${process.env.TASK_TABLE_NAME}`
      )
    ).rows
  } catch (e) {
    console.error(e)
  } finally {
    return tasks
  }
}

module.exports = {
  getTasks,
  getUser,
  registerUser,
  loginUser,
  signAccessToken,
  verifyAccessToken
}
