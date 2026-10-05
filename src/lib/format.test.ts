import { describe, it, expect } from "vitest"
import {
  currency,
  currencyPEN,
  formatCardNumber,
  formatExpiry,
  detectBrand,
  validateCard,
} from "./format"

describe("currency / currencyPEN", () => {
  it("formatea dólares con dos decimales", () => {
    expect(currency(0.55)).toContain("0.55")
    expect(currency(1234.5)).toContain("1,234.50")
  })

  it("formatea soles con el símbolo S/", () => {
    expect(currencyPEN(2.06)).toContain("S/")
    expect(currencyPEN(2.06)).toContain("2.06")
  })

  it("formatea el cero", () => {
    expect(currency(0)).toContain("0.00")
  })
})

describe("formatCardNumber", () => {
  it("agrupa los dígitos de 4 en 4", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242")
  })

  it("ignora caracteres que no son dígitos", () => {
    expect(formatCardNumber("4242-4242 abcd")).toBe("4242 4242")
  })

  it("limita a 16 dígitos", () => {
    expect(formatCardNumber("42424242424242429999")).toBe("4242 4242 4242 4242")
  })

  it("devuelve cadena vacía si no hay dígitos", () => {
    expect(formatCardNumber("abc")).toBe("")
  })
})

describe("formatExpiry", () => {
  it("no agrega la barra con dos dígitos o menos", () => {
    expect(formatExpiry("1")).toBe("1")
    expect(formatExpiry("12")).toBe("12")
  })

  it("inserta la barra a partir del tercer dígito", () => {
    expect(formatExpiry("1228")).toBe("12/28")
    expect(formatExpiry("122")).toBe("12/2")
  })

  it("limita a cuatro dígitos y descarta no numéricos", () => {
    expect(formatExpiry("12/28999")).toBe("12/28")
  })
})

describe("detectBrand", () => {
  it.each([
    ["4242 4242 4242 4242", "Visa"],
    ["5555 5555 5555 4444", "Mastercard"],
    ["2221 0000 0000 0009", "Mastercard"],
    ["3782 822463 10005", "Amex"],
    ["3714 496353 98431", "Amex"],
    ["6011 0000 0000 0004", "Tarjeta"],
    ["", "Tarjeta"],
  ])("detecta %s como %s", (numero, marca) => {
    expect(detectBrand(numero)).toBe(marca)
  })
})

describe("validateCard", () => {
  const valida = { name: "Ana Pérez", number: "4242 4242 4242 4242", expiry: "12/30", cvc: "123" }

  it("no devuelve errores con datos válidos", () => {
    expect(validateCard(valida)).toEqual({})
  })

  it("exige un nombre de al menos 3 caracteres", () => {
    expect(validateCard({ ...valida, name: "  Al " }).name).toBe("Ingresa el nombre del titular.")
    expect(validateCard({ ...valida, name: "" }).name).toBeDefined()
  })

  it("marca el número incompleto (menos de 15 dígitos)", () => {
    expect(validateCard({ ...valida, number: "4242 4242" }).number).toBe(
      "El número de tarjeta está incompleto.",
    )
  })

  it("acepta 15 dígitos (Amex)", () => {
    expect(validateCard({ ...valida, number: "3782 822463 10005" }).number).toBeUndefined()
  })

  it.each(["", "12", "13/30", "00/30"])("rechaza la fecha inválida '%s'", (expiry) => {
    expect(validateCard({ ...valida, expiry }).expiry).toBe("Fecha inválida (MM/AA).")
  })

  it("rechaza un CVC de menos de 3 dígitos", () => {
    expect(validateCard({ ...valida, cvc: "12" }).cvc).toBe("CVC inválido.")
  })

  it("acumula varios errores a la vez", () => {
    const errores = validateCard({ name: "", number: "", expiry: "", cvc: "" })
    expect(Object.keys(errores).sort()).toEqual(["cvc", "expiry", "name", "number"])
  })
})
