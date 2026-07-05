import { useState } from "react"
import { Mail, ArrowRight } from "lucide-react"

/**
 * Paso previo al Payment Brick de Mercado Pago.
 * Mercado Pago en producción requiere un email REAL del pagador
 * para enviar el comprobante y vincular el pago a una cuenta MP.
 *
 * @param {function} onConfirm - Recibe el email confirmado
 */
export default function EmailStep({ onConfirm }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  function validate() {
    if (!email.trim()) return "El correo es obligatorio."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Ingresa un correo electrónico válido."
    return ""
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    onConfirm(email.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
      aria-label="Ingresa tu correo para continuar con el pago"
    >
      <div>
        <label
          htmlFor="payer-email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="payer-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError("")
            }}
            placeholder="tu@correo.com"
            className={[
              "w-full rounded-xl border py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition",
              "placeholder:text-slate-400",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              error
                ? "border-red-400 bg-red-50 focus:ring-red-400"
                : "border-slate-200 bg-white hover:border-slate-300",
            ].join(" ")}
            aria-describedby={error ? "email-error" : undefined}
            aria-invalid={!!error}
          />
        </div>
        {error && (
          <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-500">
            {error}
          </p>
        )}
        <p className="mt-1.5 text-xs text-slate-400">
          Mercado Pago enviará el comprobante a este correo.
        </p>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:bg-blue-800"
      >
        Continuar al pago
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  )
}
