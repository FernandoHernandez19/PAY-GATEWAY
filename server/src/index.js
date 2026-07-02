import "dotenv/config"
import express from "express"
import cors from "cors"

import orderRouter from "./routes/order.js"
import paymentIntentRouter from "./routes/paymentIntent.js"
import webhookRouter from "./routes/webhook.js"

const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"

app.use(cors({ origin: CLIENT_URL }))

// El webhook necesita el body "crudo" (sin parsear a JSON) para poder
// verificar la firma de Stripe, así que se monta ANTES de express.json()
// y solo para esta ruta específica.
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRouter)

// El resto de rutas sí trabaja con JSON normal.
app.use(express.json())
app.use("/api/order", orderRouter)
app.use("/api/create-payment-intent", paymentIntentRouter)

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "pay-gateway-server" })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de pagos escuchando en http://localhost:${PORT}`)
})
