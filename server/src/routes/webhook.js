import { Router } from "express"
import { stripe } from "../lib/stripe.js"

const router = Router()

// POST /api/webhook
// Stripe llama a esta ruta directamente (no el navegador del usuario) para
// avisarnos qué pasó realmente con el pago. Es la única fuente de verdad
// confiable: nunca debes marcar un pedido como "pagado" solo porque el
// frontend te lo diga, porque esa respuesta pudo haberse manipulado o
// perderse (usuario cierra la pestaña, se cae el internet, etc).
//
// Esta ruta se monta con express.raw() en index.js (no express.json())
// porque Stripe necesita el body sin procesar para verificar la firma.
router.post("/", (req, res) => {
  const signature = req.headers["stripe-signature"]
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
  } catch (err) {
    console.error("⚠️  Firma de webhook inválida:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object
      console.log(`✅ Pago confirmado: ${pi.id} — ${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`)
      // Aquí, en un proyecto real: guardar en tu base de datos que el
      // pedido quedó pagado, enviar el correo de confirmación, etc.
      break
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object
      console.log(`❌ Pago fallido: ${pi.id}`)
      break
    }
    default:
      console.log(`ℹ️  Evento de Stripe recibido sin manejar: ${event.type}`)
  }

  res.json({ received: true })
})

export default router
