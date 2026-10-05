import { loadStripe } from "@stripe/stripe-js"

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!key) {
  console.warn(
    "⚠️  Falta VITE_STRIPE_PUBLISHABLE_KEY en tu archivo .env — copia .env.example a .env y agrega tu clave pública de prueba.",
  )
}

// loadStripe se llama UNA sola vez a nivel de módulo (no dentro de un
// componente): así Stripe.js no se vuelve a descargar en cada render.
export const stripePromise = loadStripe(key || "")
