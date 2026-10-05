import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import type { ReactNode } from "react"
import Checkout from "./Checkout"
import { createPaymentIntent, fetchOrderSummary } from "../lib/api"
import type { OrderSummary } from "../types/order"

// Nada de scripts externos ni de SDKs reales: se simulan los módulos de terceros.
vi.mock("../lib/stripe", () => ({ stripePromise: Promise.resolve(null) }))

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="stripe-payment-element" />,
  useStripe: () => null,
  useElements: () => null,
}))

vi.mock("@mercadopago/sdk-react", () => ({
  initMercadoPago: vi.fn(),
  Payment: () => <div data-testid="mp-payment-brick" />,
}))

vi.mock("../lib/api", () => ({
  fetchOrderSummary: vi.fn(),
  createPaymentIntent: vi.fn(),
  processMercadoPago: vi.fn(),
  processYape: vi.fn(),
  createYapeTokenFallback: vi.fn(),
}))

const pedido: OrderSummary = {
  currency: "usd",
  currencyPEN: "PEN",
  items: [{ id: 1, name: "Demo — Pasarela de Pagos", desc: "Pago de prueba funcional", price: 0.5 }],
  subtotal: 0.5,
  tax: 0.05,
  total: 0.55,
  totalPEN: 2.06,
}

function renderizar() {
  render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>,
  )
}

describe("Checkout", () => {
  beforeEach(() => {
    vi.mocked(fetchOrderSummary).mockResolvedValue(pedido)
    vi.mocked(createPaymentIntent).mockResolvedValue({ clientSecret: "pi_secret_dummy" })
  })

  it("muestra el estado de carga mientras prepara el pago", () => {
    vi.mocked(fetchOrderSummary).mockReturnValue(new Promise(() => {}))
    renderizar()

    expect(screen.getByText("Preparando tu pago de forma segura...")).toBeInTheDocument()
  })

  it("muestra el formulario de Stripe por defecto", async () => {
    renderizar()

    expect(await screen.findByTestId("stripe-payment-element")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tarjeta internacional" })).toHaveAttribute("aria-selected", "true")
    expect(screen.queryByTestId("mp-payment-brick")).not.toBeInTheDocument()
  })

  it("cambia al panel de Mercado Pago y vuelve al de Stripe", async () => {
    renderizar()
    await screen.findByTestId("stripe-payment-element")

    await userEvent.click(screen.getByRole("tab", { name: "Mercado Pago (Local)" }))

    expect(screen.getByRole("heading", { name: "Mercado Pago" })).toBeInTheDocument()
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument()
    expect(screen.queryByTestId("stripe-payment-element")).not.toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Mercado Pago (Local)" })).toHaveAttribute("aria-selected", "true")

    await userEvent.click(screen.getByRole("tab", { name: "Tarjeta internacional" }))

    expect(await screen.findByTestId("stripe-payment-element")).toBeInTheDocument()
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument()
  })

  it("muestra la guía de pruebas del proveedor activo", async () => {
    renderizar()
    await screen.findByTestId("stripe-payment-element")
    expect(screen.getByText("Tarjetas de prueba (Stripe)")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("tab", { name: "Mercado Pago (Local)" }))
    expect(screen.queryByText("Tarjetas de prueba (Stripe)")).not.toBeInTheDocument()
  })

  it("muestra el resumen del pedido recibido del servidor", async () => {
    renderizar()

    expect(await screen.findByText("Demo — Pasarela de Pagos")).toBeInTheDocument()
    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent("USD 0.55")
  })

  it("muestra la pantalla de error si el servidor no responde", async () => {
    vi.mocked(fetchOrderSummary).mockRejectedValue(new Error("No se pudo cargar el resumen del pedido."))
    renderizar()

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cargar el resumen del pedido.")
    expect(screen.getByRole("alert")).toHaveTextContent("VITE_API_URL")
  })
})
