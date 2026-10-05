import { describe, expect, it } from "vitest"
import {
  CURRENCY,
  ORDER_ITEMS,
  TAX_RATE,
  USD_TO_PEN_RATE,
  getAmountInCentimosPEN,
  getAmountInCents,
  getOrderSummary,
} from "./orders.js"

describe("getOrderSummary", () => {
  it("calcula el subtotal como la suma de los precios de los ítems", () => {
    const suma = ORDER_ITEMS.reduce((acc, item) => acc + item.price, 0)
    expect(getOrderSummary().subtotal).toBe(suma)
    expect(getOrderSummary().subtotal).toBe(0.5)
  })

  it("aplica el impuesto del 9 % redondeado a centavos", () => {
    expect(TAX_RATE).toBe(0.09)
    // 0.50 * 0.09 = 0.045 → se redondea a 0.05 (en coma flotante 0.045 * 100 = 4.5)
    expect(getOrderSummary().tax).toBe(0.05)
  })

  it("el total es subtotal + impuesto con dos decimales", () => {
    const { subtotal, tax, total } = getOrderSummary()
    expect(total).toBe(0.55)
    expect(total).toBe(Math.round((subtotal + tax) * 100) / 100)
  })

  it("convierte el total a soles con la tasa fija y redondea a dos decimales", () => {
    expect(USD_TO_PEN_RATE).toBe(3.75)
    // 0.55 * 3.75 = 2.0625 → 2.06
    expect(getOrderSummary().totalPEN).toBe(2.06)
  })

  it("expone las monedas y los ítems del pedido", () => {
    const resumen = getOrderSummary()
    expect(resumen.currency).toBe(CURRENCY)
    expect(resumen.currency).toBe("usd")
    expect(resumen.currencyPEN).toBe("PEN")
    expect(resumen.items).toEqual(ORDER_ITEMS)
  })

  it("tiene exactamente la forma que consume el frontend", () => {
    expect(Object.keys(getOrderSummary()).sort()).toEqual(
      ["currency", "currencyPEN", "items", "subtotal", "tax", "total", "totalPEN"].sort(),
    )
  })
})

describe("getAmountInCents", () => {
  it("devuelve el total en centavos de dólar como entero", () => {
    expect(getAmountInCents()).toBe(55)
    expect(Number.isInteger(getAmountInCents())).toBe(true)
  })

  it("coincide con el total del resumen multiplicado por 100", () => {
    expect(getAmountInCents()).toBe(Math.round(getOrderSummary().total * 100))
  })

  it("supera el mínimo de 50 centavos que acepta Stripe", () => {
    expect(getAmountInCents()).toBeGreaterThanOrEqual(50)
  })
})

describe("getAmountInCentimosPEN", () => {
  it("devuelve el total en soles en céntimos como entero", () => {
    expect(getAmountInCentimosPEN()).toBe(206)
    expect(Number.isInteger(getAmountInCentimosPEN())).toBe(true)
  })

  it("coincide con totalPEN multiplicado por 100", () => {
    expect(getAmountInCentimosPEN()).toBe(Math.round(getOrderSummary().totalPEN * 100))
  })
})
