import Stripe from 'stripe'

const stripe = new Stripe('')

export const createSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          product_data: {
            name: 'T-Shirt',
            description: 'Blue Color'
          },
          currency: 'usd',
          unit_amount: 20000 // centavos
        },
        quantity: 2
      },
      {
        price_data: {
          product_data: {
            name: 'short',
            description: 'Red Color'
          },
          currency: 'usd',
          unit_amount: 10000
        },
        quantity: 1
      }
    ],
    mode: 'payment', // payment: one-time payment
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel'
  })
  return res.json(session)
}
