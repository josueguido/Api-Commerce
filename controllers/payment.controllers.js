import Stripe from 'stripe'
import fetch from 'node-fetch'
import { STRIPE_PRIVATE_KEY } from '../config.js'

const stripe = new Stripe(STRIPE_PRIVATE_KEY)

export const createSession = async (req, res) => {
  const { productId, cart } = req.body

  if (productId) {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`)
      const product = await response.json()

      if (!product || Object.keys(product).length === 0) {
        throw new Error('Could not get product')
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
      return res.status(500).json({ error: 'Error creating payment session' })
    }
  } else if (cart && Array.isArray(cart) && cart.length > 0) {
    try {
      const lineItems = await Promise.all(cart.map(async (item) => {
        const response = await fetch(`https://fakestoreapi.com/products/${item.id}`)
        const product = await response.json()

        if (!product || Object.keys(product).length === 0) {
          throw new Error('Could not get product')
        }

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description
            },
            unit_amount: product.price * 100
          },
          quantity: item.quantity
        }
      }))

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:5173/success',
        cancel_url: 'http://localhost:5173/cancel'
      })

      return res.json(session)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error creating payment session' })
    }
  } else {
    return res.status(400).json({ error: 'ID product or cart is required' })
  }
}
