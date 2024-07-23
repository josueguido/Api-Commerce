import { config } from 'dotenv'

config()

export const {
  PORT = 3000,
  SECRET_JWT_KEY = '',
  STRIPE_PRIVATE_KEY = ''
} = process.env

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10

if (isNaN(SALT_ROUNDS)) {
  throw new Error('SALT_ROUNDS debe ser un número')
}

if (!SECRET_JWT_KEY) {
  throw new Error('SECRET_JWT_KEY es requerido')
}

if (!STRIPE_PRIVATE_KEY) {
  throw new Error('STRIPE_PRIVATE_KEY es requerido')
}
