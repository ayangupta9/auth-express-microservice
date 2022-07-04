const express = require('express')
// const { pool } = require('../db')
const cookieParser = require('cookie-parser')
const router = express.Router()

router.use(cookieParser())

const {
  registerUser,
  loginUser,
  signAccessToken,
  verifyAccessToken,
  getUser
} = require('../controllers/auth')

router.get('/', (req, res) => {
  res.send('User authentication Express API')
})

router.get('/profile', verifyAccessToken, async (req, res) => {
  const key = req.payload.email
  console.log(35, key)

  const result = await getUser(key)
  console.log(38, result)

  if (result) {
    res.status(200).json({
      status: true,
      user: result
    })
  } else {
    res.status(500).send({
      status: false,
      message: 'Error encountered'
    })
  }
})

router.post('/register', async (req, res) => {
  const user_info = req.body
  const registerRes = await registerUser(user_info)
  if (registerRes) {
    res.status(200).json({
      message: `New user ${user_info.username} registered. Login now`
    })
  } else {
    res.status(500).send({
      message: 'Error encountered during registering.'
    })
  }
})

router.post('/login', async (req, res) => {
  console.log(req.body)
  const user_info = req.body
  const loggedinUser = await loginUser(user_info.email, user_info.password)
  if (loggedinUser) {
    const accesstoken = await signAccessToken(user_info.email)
    console.log(accesstoken)

    res.cookie('accesstoken', accesstoken, {
      httpOnly: true,
      // maxAge: 1000 * 60 * 60 * 10
      maxAge: 18000000,
      sameSite: 'none'
    })

    res.status(200).json({
      message: 'User logged in',
      user: loggedinUser,
      accesstoken: accesstoken
    })
  } else {
    res.status(500).send({
      message: 'Error encountered during registering.'
    })
  }
})

router.get('/logout', verifyAccessToken, async (req, res) => {
  res.cookie('accesstoken', '', {
    maxAge: 1,
    httpOnly: true
  })

  //   res.clearCookie('accesstoken', )

  res.status({
    message: 'User logged out'
  })
})

module.exports = router
