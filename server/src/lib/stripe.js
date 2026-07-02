import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️  Falta STRIPE_SECRET_KEY en tu archivo .env — copia server/.env.example a server/.env y agrega tu clave de prueba.",
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")
