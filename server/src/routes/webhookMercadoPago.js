import { Router } from "express"
import { MercadoPagoConfig, Payment } from "mercadopago"

const router = Router()

// POST /api/mercadopago/webhook
// Mercado Pago llama aquí para avisarnos el resultado REAL de cada pago.
// Es especialmente crítico para métodos asíncronos como Yape, donde el
// usuario paga en su app minutos después de iniciar el flujo en el sitio.
//
// Documentación oficial:
// https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks
router.post("/webhook", async (req, res) => {
  // MP envía la notificación con el tipo de evento y el ID del recurso
  const { type, data } = req.body

  // Responder 200 inmediatamente: MP reintenta si no recibe respuesta rápida
  res.sendStatus(200)

  // Solo nos interesan las notificaciones de pagos
  if (type !== "payment") {
    console.log(`ℹ️  Webhook MP — tipo ignorado: ${type}`)
    return
  }

  const paymentId = data?.id
  if (!paymentId) {
    console.warn("⚠️  Webhook MP sin ID de pago en data")
    return
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN")

    // Consultamos el pago directamente a la API de MP para obtener el
    // estado real (nunca confiamos únicamente en el payload del webhook)
    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    const { status, status_detail, transaction_amount, id } = payment

    console.log(`📦 Webhook MP — Pago #${id}`)
    console.log(`   Estado   : ${status} (${status_detail})`)
    console.log(`   Monto    : S/ ${transaction_amount}`)

    switch (status) {
      case "approved":
        console.log(`✅ Pago aprobado: #${id}`)
        // TODO (producción real): marcar el pedido como pagado en tu BD,
        // enviar correo de confirmación, activar suscripción, etc.
        break

      case "pending":
        console.log(`⏳ Pago pendiente: #${id} — esperando confirmación del usuario`)
        // Típico de Yape: el usuario aún no abrió su app para confirmar
        break

      case "rejected":
        console.log(`❌ Pago rechazado: #${id} — motivo: ${status_detail}`)
        // TODO: notificar al usuario para que reintente
        break

      case "cancelled":
        console.log(`🚫 Pago cancelado: #${id}`)
        break

      default:
        console.log(`ℹ️  Estado no manejado: ${status}`)
    }
  } catch (err) {
    console.error("Error procesando webhook de MP:", err.message)
    // No relanzamos el error: ya respondimos 200 a MP para evitar reintentos
  }
})

export default router
