

export const CURRENCY = "usd"
export const TAX_RATE = 0.09


export const USD_TO_PEN_RATE = 3.75

export const ORDER_ITEMS = [
  { id: 1, name: "Plan Pro — Anual", desc: "Suscripción 12 meses", price: 89.0 },
  { id: 2, name: "Complemento de soporte", desc: "Prioritario 24/7", price: 6.99 },
]

export function getOrderSummary() {
  const subtotal = ORDER_ITEMS.reduce((acc, item) => acc + item.price, 0)
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  const totalPEN = Math.round(total * USD_TO_PEN_RATE * 100) / 100
  return { items: ORDER_ITEMS, subtotal, tax, total, currency: CURRENCY, totalPEN, currencyPEN: "PEN" }
}

// Stripe trabaja en la unidad mínima de la moneda (centavos para USD).
export function getAmountInCents() {
  const { total } = getOrderSummary()
  return Math.round(total * 100)
}

// Culqi también trabaja en la unidad mínima (céntimos de sol).
export function getAmountInCentimosPEN() {
  const { totalPEN } = getOrderSummary()
  return Math.round(totalPEN * 100)
}
