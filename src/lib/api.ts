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

// Fallback de Yape: pide el token directo a la API de Mercado Pago cuando el SDK JS no está disponible.
export async function createYapeTokenFallback(
  mpKey: string,
  phoneNumber: string,
  otp: string,
): Promise<string> {
  const tokenRes = await fetch(
    `https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=${mpKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, otp }),
    }
  )
  if (!tokenRes.ok) {
    const err = (await tokenRes.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message || "No se pudo generar el token de Yape.")
  }
  const tokenData = (await tokenRes.json()) as { id: string }
  return tokenData.id
}

export async function processYape(token: string, payerEmail: string): Promise<PaymentResponse> {
  const res = await fetch(`${API_URL}/api/mercadopago/yape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, payerEmail }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>
    throw new Error(body.error || "El pago con Yape fue rechazado.")
  }

  return res.json()
}
