const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export async function fetchOrderSummary() {
  const res = await fetch(`${API_URL}/api/order`)
  if (!res.ok) throw new Error("No se pudo cargar el resumen del pedido.")
  return res.json()
}

export async function createPaymentIntent() {
  const res = await fetch(`${API_URL}/api/create-payment-intent`, { method: "POST" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "No se pudo iniciar el pago.")
  }
  return res.json()
}
