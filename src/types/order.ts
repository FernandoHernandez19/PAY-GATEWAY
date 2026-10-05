export interface OrderItem {
  id: number
  name: string
  desc: string
  price: number
}

// Forma real de GET /api/order
export interface OrderSummary {
  currency: string
  currencyPEN: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  totalPEN: number
}
