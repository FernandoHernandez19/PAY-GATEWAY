import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))

// El SDK de Mercado Pago se simula: ningún test llama a la API real.
vi.mock("mercadopago", () => ({
  MercadoPagoConfig: class {},
  Payment: class {
    create = createMock
    get = vi.fn()
  },
}))

import app from "../app.js"

const MENSAJE_GENERICO = "No pudimos procesar el pago. Intenta nuevamente."

const tarjeta = {
  token: "card_token_dummy",
  payment_method_id: "visa",
  installments: 1,
  issuer_id: 25,
  payer: { email: "ana@correo.com", identification: { type: "DNI", number: "12345678" } },
}

describe("POST /api/mercadopago/process_payment", () => {
  beforeEach(() => {
    createMock.mockReset()
    createMock.mockResolvedValue({ id: 123, status: "approved", status_detail: "accredited" })
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("responde 400 y no llama a Mercado Pago si falta el token", async () => {
    const { token, ...sinToken } = tarjeta
    void token
    const res = await request(app).post("/api/mercadopago/process_payment").send(sinToken)

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Faltan datos de la tarjeta/)
    expect(createMock).not.toHaveBeenCalled()
  })

  it("responde 400 y no llama a Mercado Pago si falta payment_method_id", async () => {
    const { payment_method_id, ...sinMetodo } = tarjeta
    void payment_method_id
    const res = await request(app).post("/api/mercadopago/process_payment").send(sinMetodo)

    expect(res.status).toBe(400)
    expect(createMock).not.toHaveBeenCalled()
  })

  it("devuelve id, status y detail cuando el pago se aprueba", async () => {
    const res = await request(app).post("/api/mercadopago/process_payment").send(tarjeta)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 123, status: "approved", detail: "accredited" })
  })

  it("toma el monto del servidor y no del cliente", async () => {
    await request(app)
      .post("/api/mercadopago/process_payment")
      .send({ ...tarjeta, transaction_amount: 0.01 })

    const { body } = createMock.mock.calls[0]?.[0] as { body: Record<string, unknown> }
    expect(body.transaction_amount).toBe(2.06)
    expect(body.description).toBe("Pago en Veltra")
    expect(body.token).toBe("card_token_dummy")
    expect(body.payment_method_id).toBe("visa")
  })

  it("envía una clave de idempotencia distinta en cada pago", async () => {
    await request(app).post("/api/mercadopago/process_payment").send(tarjeta)
    await request(app).post("/api/mercadopago/process_payment").send(tarjeta)

    const claves = createMock.mock.calls.map(
      (call) => (call[0] as { requestOptions: { idempotencyKey: string } }).requestOptions.idempotencyKey,
    )
    expect(claves).toHaveLength(2)
    expect(claves[0]).toMatch(/^[0-9a-f-]{36}$/)
    expect(claves[0]).not.toBe(claves[1])
  })

  it("devuelve un mensaje amigable según el motivo del rechazo", async () => {
    createMock.mockResolvedValue({
      id: 1,
      status: "rejected",
      status_detail: "cc_rejected_insufficient_amount",
    })

    const res = await request(app).post("/api/mercadopago/process_payment").send(tarjeta)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Fondos insuficientes en la tarjeta." })
  })

  it("usa un mensaje genérico si el motivo del rechazo no está mapeado", async () => {
    createMock.mockResolvedValue({ id: 1, status: "rejected", status_detail: "cc_rejected_otro_motivo" })

    const res = await request(app).post("/api/mercadopago/process_payment").send(tarjeta)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "El pago fue rechazado. Intenta con otro medio de pago." })
  })

  it("no expone el mensaje técnico del SDK cuando falla", async () => {
    createMock.mockRejectedValue(new Error("invalid_token: cause 2006 internal stack"))

    const res = await request(app).post("/api/mercadopago/process_payment").send(tarjeta)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: MENSAJE_GENERICO })
    expect(JSON.stringify(res.body)).not.toContain("2006")
    expect(console.error).toHaveBeenCalled()
  })

  it("responde 500 genérico si falta MP_ACCESS_TOKEN", async () => {
    const original = process.env.MP_ACCESS_TOKEN
    delete process.env.MP_ACCESS_TOKEN
    try {
      const res = await request(app).post("/api/mercadopago/process_payment").send(tarjeta)
      expect(res.status).toBe(500)
      expect(res.body).toEqual({ error: MENSAJE_GENERICO })
    } finally {
      process.env.MP_ACCESS_TOKEN = original
    }
  })
})

describe("POST /api/mercadopago/yape", () => {
  beforeEach(() => {
    createMock.mockReset()
    createMock.mockResolvedValue({ id: 456, status: "approved", status_detail: "accredited" })
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("responde 400 si falta el token de Yape", async () => {
    const res = await request(app).post("/api/mercadopago/yape").send({ payerEmail: "ana@correo.com" })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Falta el token de Yape." })
    expect(createMock).not.toHaveBeenCalled()
  })

  it("responde 400 si falta el email del pagador", async () => {
    const res = await request(app).post("/api/mercadopago/yape").send({ token: "yape_tok" })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Falta el email del pagador." })
    expect(createMock).not.toHaveBeenCalled()
  })

  it("devuelve id y status cuando el pago con Yape se aprueba", async () => {
    const res = await request(app)
      .post("/api/mercadopago/yape")
      .send({ token: "yape_tok", payerEmail: "ana@correo.com" })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 456, status: "approved", detail: "accredited" })
  })

  it("crea el pago con payment_method_id yape, 1 cuota y el monto del servidor", async () => {
    await request(app)
      .post("/api/mercadopago/yape")
      .send({ token: "yape_tok", payerEmail: "ana@correo.com", transaction_amount: 0.01 })

    const { body, requestOptions } = createMock.mock.calls[0]?.[0] as {
      body: Record<string, unknown>
      requestOptions: { idempotencyKey: string }
    }
    expect(body).toMatchObject({
      token: "yape_tok",
      transaction_amount: 2.06,
      installments: 1,
      payment_method_id: "yape",
      payer: { email: "ana@correo.com" },
    })
    expect(requestOptions.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/)
  })

  it("devuelve un mensaje amigable cuando Yape rechaza el pago", async () => {
    createMock.mockResolvedValue({ id: 2, status: "rejected", status_detail: "cc_rejected_other_reason" })

    const res = await request(app)
      .post("/api/mercadopago/yape")
      .send({ token: "yape_tok", payerEmail: "ana@correo.com" })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "El pago con Yape fue rechazado. Verifica tus datos e intenta nuevamente.",
    })
    expect(JSON.stringify(res.body)).not.toContain("cc_rejected")
  })

  it("no expone el mensaje técnico del SDK cuando falla", async () => {
    createMock.mockRejectedValue(new Error("bad_request: secret internal detail"))

    const res = await request(app)
      .post("/api/mercadopago/yape")
      .send({ token: "yape_tok", payerEmail: "ana@correo.com" })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: MENSAJE_GENERICO })
    expect(JSON.stringify(res.body)).not.toContain("secret internal detail")
  })
})

// En Express 5, req.body es undefined cuando no llega un cuerpo JSON: los handlers
// lo normalizan con `?? {}` para que la validación existente responda 400.
describe("peticiones sin cuerpo JSON", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("responde 400 en Mercado Pago cuando no llega ningún cuerpo", async () => {
    const res = await request(app).post("/api/mercadopago/process_payment")
    expect(res.status).toBe(400)
  })

  it("responde 400 en Yape cuando no llega ningún cuerpo", async () => {
    const res = await request(app).post("/api/mercadopago/yape")
    expect(res.status).toBe(400)
  })
})
