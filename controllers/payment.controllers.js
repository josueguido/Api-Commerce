import Stripe from 'stripe'
import fetch from 'node-fetch'
import { STRIPE_PRIVATE_KEY } from '../config.js'

const stripe = new Stripe(STRIPE_PRIVATE_KEY)

export const createSession = async (req, res) => {
  const { productId } = req.body

  if (!productId) {
    return res.status(400).json({ error: 'ID del producto es requerido' })
  }

  try {
    const response = await fetch(`https://fakestoreapi.com/products/${productId}`)
    const product = await response.json()

    if (!product || Object.keys(product).length === 0) {
      throw new Error('No se pudo obtener el producto')
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: product.title,
              description: product.description
            },
            currency: 'usd',
            unit_amount: product.price * 100
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel'
    })

    return res.json(session)
  } catch (error) {
    console.error('Error al crear la sesión de pago:', error)
    return res.status(500).json({ error: 'Error al crear la sesión de pago' })
  }
}
