// Funciones puras de formato y validación para el checkout.
// No dependen de React: se pueden probar de forma aislada.

export const currency = (n) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "USD" })

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(.{4})/g, "$1 ").trim()
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function detectBrand(number) {
  const n = number.replace(/\s/g, "")
  if (/^4/.test(n)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard"
  if (/^3[47]/.test(n)) return "Amex"
  return "Tarjeta"
}

export function validateCard(data) {
  const errors = {}
  if (!data.name.trim() || data.name.trim().length < 3) {
    errors.name = "Ingresa el nombre del titular."
  }
  const digits = data.number.replace(/\s/g, "")
  if (digits.length < 15) {
    errors.number = "El número de tarjeta está incompleto."
  }
  const [mm, yy] = data.expiry.split("/")
  if (!mm || !yy || Number(mm) < 1 || Number(mm) > 12) {
    errors.expiry = "Fecha inválida (MM/AA)."
  }
  if (data.cvc.replace(/\D/g, "").length < 3) {
    errors.cvc = "CVC inválido."
  }
  return errors
}
