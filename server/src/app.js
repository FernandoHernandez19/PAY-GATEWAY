import express from "express"
import cors from "cors"

import orderRouter from "./routes/order.js"
import paymentIntentRouter from "./routes/paymentIntent.js"
import webhookRouter from "./routes/webhook.js"
import mercadopagoRouter from "./routes/mercadopago.js"
import webhookMercadoPagoRouter from "./routes/webhookMercadoPago.js"
import yapeRouter from "./routes/yape.js"

const app = express()
const CLIENT_URL = process.env.CLIENT_URL || "https://pay-gateway-teal.vercel.app"


const allowedOrigins = [CLIENT_URL, 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin origin (como Postman o curl)
    if (!origin) return callback(null, true);

    // Permite dominios exactos en la lista o cualquier subdominio de preview de Vercel
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Bloqueado por CORS'));
  },
  credentials: true
}));



// El webhook de Stripe necesita body RAW (sin parsear) para verificar la firma
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRouter)

// El webhook de Mercado Pago envía JSON normal (no necesita body raw)
app.use("/api/mercadopago/webhook", express.json(), webhookMercadoPagoRouter)

// El resto de rutas trabaja con JSON normal
app.use(express.json())
app.use("/api/order", orderRouter)
app.use("/api/create-payment-intent", paymentIntentRouter)
app.use("/api/mercadopago", mercadopagoRouter)
app.use("/api/mercadopago", yapeRouter)   // POST /api/mercadopago/yape

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "pay-gateway-server" })
})

export default app
