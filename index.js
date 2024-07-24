import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js'
import paymentRoutes from './routes/payment.routes.js'

const app = express()

app.set('view engine', 'ejs')

const corsOptions = {
  origin: 'https://glam-tech-shop.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))

// Manejo de preflight antes de las rutas y otros middlewares
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())
app.use(cookieParser())

app.use(async (req, res, next) => {
  const token = req.cookies['access-token']
  req.session = { user: null }

  try {
    if (token) {
      const data = jwt.verify(token, SECRET_JWT_KEY)
      req.session.user = data
    }
  } catch (error) {
    console.error('Token verification failed:', error)
  }

  next()
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index', user || {})
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_JWT_KEY,
      { expiresIn: '1h' }
    )

    res.cookie('access-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60
    })

    return res.json({ user, token })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
})

app.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body)
  const { username, password } = req.body

  try {
    const id = await UserRepository.create({ username, password })
    res.status(201).json({ id })
  } catch (error) {
    console.error('Error de registro:', error)
    res.status(400).json({ message: error.message })
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('access-token').json({ message: 'Logout successful' })
})

app.get('/protected', (req, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('Access not authorized')
  res.render('protected', user)
})

app.use('/api/payment', paymentRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
