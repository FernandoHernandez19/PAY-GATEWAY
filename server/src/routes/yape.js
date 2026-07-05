import { Router } from "express"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { getOrderSummary } from "../lib/orders.js"

const router = Router()

// POST /api/mercadopago/yape
// Recibe el token generado por el SDK JS de MP en el navegador del usuario
// y crea el pago con payment_method_id: "yape"
//
// Documentación oficial:
// https://www.mercadopago.com.pe/developers/es/docs/checkout-api-payments/integration-configuration/yape
router.post("/yape", async (req, res) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error("Falta la variable de entorno MP_ACCESS_TOKEN")
    }

    const { token, payerEmail } = req.body

    if (!token) {
      return res.status(400).json({ error: "Falta el token de Yape." })
    }
    if (!payerEmail) {
      return res.status(400).json({ error: "Falta el email del pagador." })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    // El monto lo tomamos SIEMPRE del backend (nunca del frontend por seguridad)
    const order = getOrderSummary()

    const body = {
      token,                              // Token de un solo uso generado por mp.yape.create()
      transaction_amount: order.totalPEN, // Monto en soles peruanos (PEN)
      description: "Pago en Veltra (Acme Pay)",
      installments: 1,                    // Yape es débito, siempre 1 cuota
      payment_method_id: "yape",          // ID específico para Yape en MP Perú
      payer: {
        email: payerEmail,
      },
    }

    const result = await paymentClient.create({ body })

    if (result.status === "rejected") {
      return res.status(400).json({
        error: `Pago Yape rechazado: ${result.status_detail}`,
      })
    }

    res.json({
      id: result.id,
      status: result.status,
      detail: result.status_detail,
    })
  } catch (error) {
    console.error("Error en pago Yape:", error)
    res.status(500).json({ error: error.message || "Error procesando el pago con Yape" })
  }
})

export default router
