// Respuesta de los endpoints de pago de Mercado Pago / Yape
export type PaymentId = number | string

export interface PaymentResponse {
  id: PaymentId
  status: string
  detail: string
}

export interface ApiError {
  error: string
}
