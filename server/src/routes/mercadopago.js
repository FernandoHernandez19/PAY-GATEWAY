import { Router } from "express"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { getOrderSummary } from "../lib/orders.js"

const router = Router()

const FRIENDLY_ERROR = "No pudimos procesar el pago. Intenta nuevamente."

const REJECTION_MESSAGES = {
  cc_rejected_insufficient_amount: "Fondos insuficientes en la tarjeta.",
  cc_rejected_bad_filled_security_code: "El código de seguridad es incorrecto.",
  cc_rejected_bad_filled_date: "La fecha de vencimiento es incorrecta.",
  cc_rejected_bad_filled_other: "Revisa los datos de la tarjeta e intenta nuevamente.",
  cc_rejected_call_for_authorize: "Debes autorizar el pago con tu banco.",
}

// POST /api/mercadopago/process_payment
router.post("/process_payment", async (req, res) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error("Falta la variable de entorno MP_ACCESS_TOKEN")
    }

    if (!req.body.token || !req.body.payment_method_id) {
      return res.status(400).json({ error: "Faltan datos de la tarjeta. Revisa la información e intenta nuevamente." })
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

    console.log("MP payer:", req.body.payer?.email, "| method:", req.body.payment_method_id)

    const result = await payment.create({ body })

    // Si la pasarela rechaza el pago, MP devuelve estado 201 pero con status "rejected"
    if (result.status === "rejected") {
      return res.status(400).json({ error: REJECTION_MESSAGES[result.status_detail] || "El pago fue rechazado. Intenta con otro medio de pago." })
    }

    res.json({
      id: result.id,
      status: result.status,
      detail: result.status_detail,
    })
  } catch (error) {
    console.error("Error en MercadoPago:", error)
    res.status(500).json({ error: FRIENDLY_ERROR })
  }
})

export default router
