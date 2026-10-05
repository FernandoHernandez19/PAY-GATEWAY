import { describe, expect, it } from "vitest"
import request from "supertest"
import app from "../app.js"
import { getOrderSummary } from "../lib/orders.js"

// Supertest recibe la app directamente: no se abre ningún puerto.
describe("GET /api/order", () => {
  it("responde 200 con el resumen del pedido calculado por el servidor", async () => {
    const res = await request(app).get("/api/order")

    expect(res.status).toBe(200)
    expect(res.headers["content-type"]).toMatch(/application\/json/)
    expect(res.body).toEqual(getOrderSummary())
  })

  it("devuelve la forma que consume el frontend", async () => {
    const res = await request(app).get("/api/order")

    expect(res.body).toMatchObject({
      currency: "usd",
      currencyPEN: "PEN",
      subtotal: 0.5,
      tax: 0.05,
      total: 0.55,
      totalPEN: 2.06,
    })
    expect(res.body.items).toEqual([
      { id: 1, name: "Demo — Pasarela de Pagos", desc: "Pago de prueba funcional", price: 0.5 },
    ])
  })
})

describe("GET /api/health", () => {
  it("responde 200 indicando que el servicio está vivo", async () => {
    const res = await request(app).get("/api/health")

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, service: "pay-gateway-server" })
  })
})

describe("rutas inexistentes", () => {
  it("responde 404 en una ruta que no existe", async () => {
    const res = await request(app).get("/api/no-existe")
    expect(res.status).toBe(404)
  })
})

describe("CORS", () => {
  it("permite el origen del frontend en desarrollo", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://localhost:5173")
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173")
  })

  it("permite los subdominios de preview de Vercel", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://mi-rama.vercel.app")
    expect(res.headers["access-control-allow-origin"]).toBe("https://mi-rama.vercel.app")
  })

  it("no devuelve cabeceras CORS para un origen no permitido", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://sitio-malicioso.com")
    expect(res.headers["access-control-allow-origin"]).toBeUndefined()
  })
})
