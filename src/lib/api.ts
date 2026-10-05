import type { OrderSummary } from "../types/order"
import type { ApiError, PaymentResponse } from "../types/payment"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export async function fetchOrderSummary(): Promise<OrderSummary> {
  const res = await fetch(`${API_URL}/api/order`)
  if (!res.ok) throw new Error("No se pudo cargar el resumen del pedido.")
  return res.json()
}

export async function createPaymentIntent(): Promise<{ clientSecret: string }> {
  const res = await fetch(`${API_URL}/api/create-payment-intent`, { method: "POST" })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>
    throw new Error(body.error || "No se pudo iniciar el pago.")
  }
  return res.json()
}

export async function processMercadoPago(paymentData: unknown): Promise<PaymentResponse> {
  const res = await fetch(`${API_URL}/api/mercadopago/process_payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  })
  
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>
    throw new Error(body.error || "No se pudo procesar el pago con Mercado Pago.")
  }
  return res.json()
}
