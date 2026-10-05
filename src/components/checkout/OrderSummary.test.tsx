import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import OrderSummary from "./OrderSummary"
import type { OrderSummary as OrderSummaryData } from "../../types/order"

// Misma forma que devuelve GET /api/order
const pedido: OrderSummaryData = {
  currency: "usd",
  currencyPEN: "PEN",
  items: [
    { id: 1, name: "Demo — Pasarela de Pagos", desc: "Pago de prueba funcional", price: 0.5 },
    { id: 2, name: "Soporte", desc: "Ayuda extra", price: 2 },
  ],
  subtotal: 2.5,
  tax: 0.23,
  total: 2.73,
  totalPEN: 10.24,
}

describe("OrderSummary", () => {
  function renderizar() {
    render(
      <OrderSummary items={pedido.items} subtotal={pedido.subtotal} tax={pedido.tax} total={pedido.total} />,
    )
  }

  it("muestra cada ítem con su nombre, descripción y precio", () => {
    renderizar()
    const lista = screen.getByRole("list")
    expect(within(lista).getByText("Demo — Pasarela de Pagos")).toBeInTheDocument()
    expect(within(lista).getByText("Pago de prueba funcional")).toBeInTheDocument()
    expect(within(lista).getByText("USD 0.50")).toBeInTheDocument()
    expect(within(lista).getByText("Soporte")).toBeInTheDocument()
    expect(within(lista).getByText("USD 2.00")).toBeInTheDocument()
  })

  it("muestra subtotal, impuestos y total", () => {
    renderizar()
    expect(screen.getByText("Subtotal").nextElementSibling).toHaveTextContent("USD 2.50")
    expect(screen.getByText("Impuestos (9%)").nextElementSibling).toHaveTextContent("USD 0.23")
    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent("USD 2.73")
  })

  it("expone el resumen como región accesible y las insignias de confianza", () => {
    renderizar()
    expect(screen.getByRole("complementary", { name: "Resumen del pedido" })).toBeInTheDocument()
    expect(screen.getByText("Pago 100% seguro")).toBeInTheDocument()
    expect(screen.getByText("Datos protegidos")).toBeInTheDocument()
  })
})
