import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js'
import paymentRoutes from './routes/payment.routes.js'

const app = express()

app.set('view engine', 'ejs')
app.use(paymentRoutes)

const corsOptions = {
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true // Permite el envío de cookies y encabezados de autorización
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    req.session.user = data
  } catch (error) { }

  next() // Seguir a la siguiente ruta o middleware
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index', user)
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user._id, username: user.username }
      , SECRET_JWT_KEY, {
        expiresIn: '1h'
      })

    res
      .cookie('access-token', token, {
        httpOnly: true, // La Cookie solo se puede acceder desde el servidor
        secure: process.env.NODE_ENV === 'production', // La Cookie solo se puede acceder en https
        sameSite: 'strict', // Solo se puede acceder desde el mismo dominio
        maxAge: 1000 * 60 * 60 // La Cookie solo tiene un tiempo de validez de una hora
      })
      .send({ user, token })
  } catch (error) {
    res.status(401).send(error.message)
  }
})

app.post('/signup', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)

  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.post('/logout', (req, res) => {
  res
    .clearCookie('access token')
    .send({ message: 'logout successful' })
})

app.get('/proteted', (req, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('Access no authorized')
  res.render('[proteted', user)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
