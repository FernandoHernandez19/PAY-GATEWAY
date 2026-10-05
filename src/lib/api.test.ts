import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  fetchOrderSummary,
  createPaymentIntent,
  processMercadoPago,
  createYapeTokenFallback,
  processYape,
} from "./api"
import type { OrderSummary } from "../types/order"
import type { PaymentResponse } from "../types/payment"

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("fetchOrderSummary", () => {
  it("devuelve el resumen del pedido desde GET /api/order", async () => {
    const resumen: OrderSummary = {
      currency: "usd",
      currencyPEN: "PEN",
      items: [{ id: 1, name: "Demo", desc: "Prueba", price: 0.5 }],
      subtotal: 0.5,
      tax: 0.05,
      total: 0.55,
      totalPEN: 2.06,
    }
    fetchMock.mockResolvedValue(jsonResponse(resumen))

    await expect(fetchOrderSummary()).resolves.toEqual(resumen)
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/order")
  })

  it("lanza un error claro si el servidor responde con fallo", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 500 }))
    await expect(fetchOrderSummary()).rejects.toThrow("No se pudo cargar el resumen del pedido.")
  })
})

describe("createPaymentIntent", () => {
  it("hace POST y devuelve el clientSecret", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ clientSecret: "pi_secret_dummy" }))

    await expect(createPaymentIntent()).resolves.toEqual({ clientSecret: "pi_secret_dummy" })
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/create-payment-intent", {
      method: "POST",
    })
  })

  it("propaga el mensaje de error del servidor", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Stripe caído" }, { status: 500 }))
    await expect(createPaymentIntent()).rejects.toThrow("Stripe caído")
  })

  it("usa un mensaje por defecto si el cuerpo del error no es JSON", async () => {
    fetchMock.mockResolvedValue(new Response("boom", { status: 502 }))
    await expect(createPaymentIntent()).rejects.toThrow("No se pudo iniciar el pago.")
  })
})

describe("processMercadoPago", () => {
  const respuesta: PaymentResponse = { id: 123, status: "approved", detail: "accredited" }

  it("envía los datos como JSON y devuelve la respuesta tipada", async () => {
    fetchMock.mockResolvedValue(jsonResponse(respuesta))
    const datos = { token: "tok", payment_method_id: "visa" }

    await expect(processMercadoPago(datos)).resolves.toEqual(respuesta)
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/mercadopago/process_payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    })
  })

  it("lanza el mensaje que envía el servidor cuando el pago falla", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Fondos insuficientes en la tarjeta." }, { status: 400 }))
    await expect(processMercadoPago({})).rejects.toThrow("Fondos insuficientes en la tarjeta.")
  })

  it("usa el mensaje por defecto si no hay cuerpo JSON", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 500 }))
    await expect(processMercadoPago({})).rejects.toThrow(
      "No se pudo procesar el pago con Mercado Pago.",
    )
  })
})

describe("createYapeTokenFallback", () => {
  it("pide el token a la API de Mercado Pago con la clave pública y devuelve su id", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "yape_tok" }))

    await expect(createYapeTokenFallback("TEST-dummy", "999999999", "123456")).resolves.toBe("yape_tok")
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=TEST-dummy",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: "999999999", otp: "123456" }),
      },
    )
  })

  it("usa el mensaje de Mercado Pago cuando falla", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "OTP inválido" }, { status: 400 }))
    await expect(createYapeTokenFallback("k", "1", "2")).rejects.toThrow("OTP inválido")
  })

  it("usa el mensaje por defecto si no hay cuerpo JSON", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 500 }))
    await expect(createYapeTokenFallback("k", "1", "2")).rejects.toThrow(
      "No se pudo generar el token de Yape.",
    )
  })
})

describe("processYape", () => {
  it("envía token y email al backend y devuelve el pago", async () => {
    const pago: PaymentResponse = { id: "77", status: "approved", detail: "accredited" }
    fetchMock.mockResolvedValue(jsonResponse(pago))

    await expect(processYape("tok", "ana@correo.com")).resolves.toEqual(pago)
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/mercadopago/yape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "tok", payerEmail: "ana@correo.com" }),
    })
  })

  it("lanza el error del servidor si el pago es rechazado", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "El pago con Yape fue rechazado." }, { status: 400 }))
    await expect(processYape("tok", "a@b.co")).rejects.toThrow("El pago con Yape fue rechazado.")
  })

  it("usa el mensaje por defecto si no hay cuerpo JSON", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 500 }))
    await expect(processYape("tok", "a@b.co")).rejects.toThrow("El pago con Yape fue rechazado.")
  })
})
