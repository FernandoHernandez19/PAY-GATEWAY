// Respuesta de los endpoints de pago de Mercado Pago / Yape
export interface PaymentResponse {
  id: number | string
  status: string
  detail: string
}

export interface ApiError {
  error: string
}
