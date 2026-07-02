import { Router } from "express"
import { stripe } from "../lib/stripe.js"
import { getAmountInCents, getOrderSummary, CURRENCY } from "../lib/orders.js"

const router = Router()

// POST /api/create-payment-intent
// Crea la "intención de pago" en Stripe. El frontend usa el clientSecret
// que devolvemos para montar el formulario seguro de Stripe (Payment Element).
router.post("/", async (req, res) => {
  try {
    const amount = getAmountInCents()
    const order = getOrderSummary()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: order.items.map((i) => i.name).join(", "),
      },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error("Error creando el PaymentIntent:", err.message)
    res.status(500).json({ error: "No se pudo iniciar el pago. Intenta nuevamente en unos segundos." })
  }
})

export default router
