import { config } from 'dotenv'
config()

export const {
  PORT = 3000,
  SALT_ROUNDS = 10,
  SECRET_JWT_KEY = 'this-is-a-awesome-secret-key-and-more-extense-what-this'
} = process.env

export const STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY
