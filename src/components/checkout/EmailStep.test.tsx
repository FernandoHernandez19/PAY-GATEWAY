import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EmailStep from "./EmailStep"

describe("EmailStep", () => {
  it("muestra el error y no continúa si el correo está vacío", async () => {
    const onConfirm = vi.fn()
    render(<EmailStep onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole("button", { name: /continuar al pago/i }))

    expect(screen.getByRole("alert")).toHaveTextContent("El correo es obligatorio.")
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("muestra el error y no continúa si el correo es inválido", async () => {
    const onConfirm = vi.fn()
    render(<EmailStep onConfirm={onConfirm} />)

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "no-es-un-correo")
    await userEvent.click(screen.getByRole("button", { name: /continuar al pago/i }))

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido.")
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("aria-invalid", "true")
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("llama a onConfirm con el correo sin espacios cuando es válido", async () => {
    const onConfirm = vi.fn()
    render(<EmailStep onConfirm={onConfirm} />)

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "  ana@correo.com ")
    await userEvent.click(screen.getByRole("button", { name: /continuar al pago/i }))

    expect(onConfirm).toHaveBeenCalledExactlyOnceWith("ana@correo.com")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("quita el error en cuanto el usuario vuelve a escribir", async () => {
    render(<EmailStep onConfirm={vi.fn()} />)

    await userEvent.click(screen.getByRole("button", { name: /continuar al pago/i }))
    expect(screen.getByRole("alert")).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "a")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})
