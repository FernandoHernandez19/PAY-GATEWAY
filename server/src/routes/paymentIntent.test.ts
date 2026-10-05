import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))

// El SDK de Stripe se simula: ningún test llama a la API real.
vi.mock("../lib/stripe.js", () => ({
  stripe: { paymentIntents: { create: createMock } },
}))

import app from "../app.js"

describe("POST /api/create-payment-intent", () => {
  beforeEach(() => {
    createMock.mockReset()
    createMock.mockResolvedValue({ id: "pi_dummy", client_secret: "pi_dummy_secret_dummy" })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("devuelve el clientSecret del PaymentIntent creado", async () => {
    const res = await request(app).post("/api/create-payment-intent")

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ clientSecret: "pi_dummy_secret_dummy" })
  })

  it("calcula el monto en el servidor (55 centavos de USD)", async () => {
    await request(app).post("/api/create-payment-intent")

    expect(createMock).toHaveBeenCalledTimes(1)
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 55, currency: "usd" }),
    )
  })

  it("ignora un monto enviado por el cliente", async () => {
    await request(app).post("/api/create-payment-intent").send({ amount: 1, currency: "eur" })

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 55, currency: "usd" }),
    )
  })

  it("limita el PaymentIntent a pagos con tarjeta", async () => {
    await request(app).post("/api/create-payment-intent")

    const params = createMock.mock.calls[0]?.[0] as Record<string, unknown>
    expect(params.payment_method_types).toEqual(["card"])
    expect(params).not.toHaveProperty("automatic_payment_methods")
  })

  it("guarda en metadata los nombres de los ítems del pedido", async () => {
    await request(app).post("/api/create-payment-intent")

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { items: "Demo — Pasarela de Pagos" } }),
    )
  })

  it("responde 500 con un mensaje controlado si Stripe falla", async () => {
    const consola = vi.spyOn(console, "error").mockImplementation(() => {})
    createMock.mockRejectedValue(new Error("Invalid API Key provided: sk_test_***"))

    const res = await request(app).post("/api/create-payment-intent")

    expect(res.status).toBe(500)
    expect(res.body).toEqual({
      error: "No se pudo iniciar el pago. Intenta nuevamente en unos segundos.",
    })
    expect(JSON.stringify(res.body)).not.toContain("API Key")
    expect(consola).toHaveBeenCalled()
  })
})
