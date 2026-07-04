import { Router } from "express"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { getOrderSummary } from "../lib/orders.js"

const router = Router()

// POST /api/mercadopago/process_payment
router.post("/process_payment", async (req, res) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error("Falta la variable de entorno MP_ACCESS_TOKEN")
    }

    // Inicializa el cliente de MP
    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)

    const order = getOrderSummary()

    // Armamos el payload con los datos que mandó el frontend (Payment Brick)
    // PERO el transaction_amount lo sacamos del backend por seguridad.
    const body = {
      transaction_amount: order.totalPEN,
      token: req.body.token,
      description: "Pago en Veltra (Acme Pay)",
      installments: req.body.installments,
      payment_method_id: req.body.payment_method_id,
      issuer_id: req.body.issuer_id,
      payer: {
        email: req.body.payer?.email,
        identification: req.body.payer?.identification,
      },
    }

    const result = await payment.create({ body })
    
    // Si la pasarela rechaza el pago, MP devuelve estado 201 pero con status "rejected"
    if (result.status === "rejected") {
      return res.status(400).json({ error: "Pago rechazado por Mercado Pago: " + result.status_detail })
    }

    res.json({
      id: result.id,
      status: result.status,
      detail: result.status_detail,
    })
  } catch (error) {
    console.error("Error en MercadoPago:", error)
    res.status(500).json({ error: error.message || "Error procesando el pago" })
  }
})

export default router
