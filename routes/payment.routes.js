import { Router } from 'express'
import { createSession } from '../controllers/payment.controllers.js'
const router = Router()

router.post('/create-checkout-session', createSession)

router.get('/success', (req, res) => {
  res.redirect('https://glam-tech-shop.netlify.app')
})

router.get('/', (req, res) => {
  res.redirect('https://glam-tech-shop.netlify.app')
})

export default router
