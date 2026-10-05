import type { PaymentId } from "./payment"

export type CheckoutStep = "ready" | "processing" | "success" | "error"
export type PaymentProvider = "stripe" | "mercadopago"

// Props que comparten los formularios de pago para reportar su avance a la página
export interface PaymentFormCallbacks {
  step: CheckoutStep
  setStep: (step: CheckoutStep) => void
  setErrorReason: (reason: string) => void
  setPaymentId: (id: PaymentId) => void
}
