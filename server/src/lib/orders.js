// Fuente única de verdad del pedido y su precio.
// IMPORTANTE: el monto a cobrar SIEMPRE se calcula aquí, en el servidor.
// Nunca confíes en un monto que venga del frontend: cualquiera podría
// interceptar la petición y cambiarlo antes de que llegue a tu backend.

export const CURRENCY = "usd"
export const TAX_RATE = 0.09

export const ORDER_ITEMS = [
  { id: 1, name: "Plan Pro — Anual", desc: "Suscripción 12 meses", price: 89.0 },
  { id: 2, name: "Complemento de soporte", desc: "Prioritario 24/7", price: 6.99 },
]

export function getOrderSummary() {
  const subtotal = ORDER_ITEMS.reduce((acc, item) => acc + item.price, 0)
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  return { items: ORDER_ITEMS, subtotal, tax, total, currency: CURRENCY }
}

// Stripe trabaja en la unidad mínima de la moneda (centavos para USD).
export function getAmountInCents() {
  const { total } = getOrderSummary()
  return Math.round(total * 100)
}
