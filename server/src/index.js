import "dotenv/config"
import express from "express"
import cors from "cors"

import orderRouter from "./routes/order.js"
import paymentIntentRouter from "./routes/paymentIntent.js"
import webhookRouter from "./routes/webhook.js"
import mercadopagoRouter from "./routes/mercadopago.js"
import webhookMercadoPagoRouter from "./routes/webhookMercadoPago.js"

const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"

app.use(cors({ origin: CLIENT_URL }))

// El webhook de Stripe necesita body RAW (sin parsear) para verificar la firma
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRouter)

// El webhook de Mercado Pago envía JSON normal (no necesita body raw)
app.use("/api/mercadopago/webhook", express.json(), webhookMercadoPagoRouter)

// El resto de rutas trabaja con JSON normal
app.use(express.json())
app.use("/api/order", orderRouter)
app.use("/api/create-payment-intent", paymentIntentRouter)
app.use("/api/mercadopago", mercadopagoRouter)

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "pay-gateway-server" })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de pagos escuchando en http://localhost:${PORT}`)
})
