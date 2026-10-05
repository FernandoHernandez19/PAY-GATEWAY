import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"
import Stripe from "stripe"
import app from "../app.js"

// Aquí NO se simula Stripe: se usa el SDK real con un secreto ficticio para
// generar y verificar firmas localmente (no hay llamadas de red).
const WEBHOOK_SECRET = "whsec_test_dummy"
const stripeLocal = new Stripe("sk_test_dummy")

const evento = {
  id: "evt_test_1",
  object: "event",
  type: "payment_intent.succeeded",
  data: { object: { id: "pi_test_1", object: "payment_intent", amount: 55, currency: "usd" } },
}

function firmar(payload: string, secret = WEBHOOK_SECRET): string {
  return stripeLocal.webhooks.generateTestHeaderString({ payload, secret })
}

describe("POST /api/webhook (Stripe)", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("acepta un evento con firma válida y responde 200", async () => {
    const payload = JSON.stringify(evento)

    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", firmar(payload))
      .send(payload)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true })
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Pago confirmado: pi_test_1"))
  })

  it("verifica la firma sobre los bytes exactos (express.raw va antes de express.json)", async () => {
    // JSON con sangría: si express.json lo reparseara antes, los bytes cambiarían
    // y la firma dejaría de coincidir. Que pase demuestra que el body llega crudo.
    const payload = JSON.stringify(evento, null, 4)

    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", firmar(payload))
      .send(payload)

    expect(res.status).toBe(200)
  })

  it("rechaza con 400 una firma inválida", async () => {
    const payload = JSON.stringify(evento)

    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "t=123,v1=firma_falsa")
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.text).toMatch(/^Webhook Error:/)
  })

  it("rechaza con 400 una firma generada con otro secreto", async () => {
    const payload = JSON.stringify(evento)

    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", firmar(payload, "whsec_otro_secreto"))
      .send(payload)

    expect(res.status).toBe(400)
  })

  it("rechaza con 400 si el cuerpo fue alterado después de firmar", async () => {
    const payload = JSON.stringify(evento)
    const alterado = payload.replace('"amount":55', '"amount":1')

    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", firmar(payload))
      .send(alterado)

    expect(res.status).toBe(400)
  })

  it("rechaza con 400 si falta la cabecera stripe-signature", async () => {
    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(evento))

    expect(res.status).toBe(400)
  })

  it("responde 200 a un evento válido de un tipo que no se maneja", async () => {
    const payload = JSON.stringify({ ...evento, type: "charge.refunded" })

    const res = await request(app)
      .post("/api/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", firmar(payload))
      .send(payload)

    expect(res.status).toBe(200)
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("sin manejar: charge.refunded"))
  })
})
