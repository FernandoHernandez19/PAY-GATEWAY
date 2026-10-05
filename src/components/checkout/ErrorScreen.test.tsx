import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorScreen from "./ErrorScreen"

describe("ErrorScreen", () => {
  it("muestra el motivo del error recibido", () => {
    render(<ErrorScreen reason="Fondos insuficientes en la tarjeta." onRetry={vi.fn()} />)

    expect(screen.getByRole("alert")).toHaveTextContent("Fondos insuficientes en la tarjeta.")
    expect(screen.getByRole("heading", { name: "No pudimos procesar tu pago" })).toBeInTheDocument()
  })

  it("muestra un mensaje genérico cuando no hay motivo", () => {
    render(<ErrorScreen onRetry={vi.fn()} />)

    expect(screen.getByRole("alert")).toHaveTextContent("Ocurrió un error inesperado. Intenta nuevamente.")
  })

  it("ejecuta onRetry al pulsar el botón de reintento", async () => {
    const onRetry = vi.fn()
    render(<ErrorScreen reason="x" onRetry={onRetry} />)

    await userEvent.click(screen.getByRole("button", { name: /reintentar pago/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
