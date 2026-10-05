import { describe, it, expect } from "vitest"

describe("entorno de pruebas", () => {
  it("expone las claves ficticias del frontend", () => {
    expect(import.meta.env.VITE_API_URL).toBe("http://api.test")
  })
})
