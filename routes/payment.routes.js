import { Router } from 'express'
import { createSession } from '../controllers/payment.controllers.js'
const router = Router()

router.post('/create-checkout-session', createSession)

router.get('/success', (req, res) => {
  res.redirect('http://localhost:5173/success')
})

router.get('/', (req, res) => {
  res.redirect('http://localhost:5173')
})

export default router
