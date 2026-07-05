import { useState } from "react"
import { FlaskConical, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"

const STRIPE_CARDS = [
  { label: "Pago exitoso", number: "4242 4242 4242 4242", badge: "✅", color: "emerald" },
  { label: "Pago rechazado", number: "4000 0000 0000 0002", badge: "❌", color: "red" },
  { label: "Requiere 3D Secure", number: "4000 0025 0000 3155", badge: "🔐", color: "amber" },
]

const YAPE_CASES = [
  { phone: "111111111", otp: "123456", label: "Aprobado", badge: "✅", color: "emerald" },
  { phone: "111111112", otp: "123456", label: "Rechazado", badge: "❌", color: "red" },
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className="ml-2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

/**
 * Panel desplegable con datos de prueba para que reclutadores
 * puedan probar la pasarela sin necesidad de tarjetas reales.
 *
 * Stripe siempre usa datos de prueba (modo test / sandbox).
 * Mercado Pago en modo test también tiene tarjetas y datos Yape de prueba.
 */
export default function DemoGuide({ provider }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 text-sm">
      {/* Header del panel */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-semibold text-amber-800">
          <FlaskConical className="h-4 w-4 text-amber-600" aria-hidden="true" />
          Modo demo — datos de prueba
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-amber-600" />
          : <ChevronDown className="h-4 w-4 text-amber-600" />}
      </button>

      {open && (
        <div className="border-t border-amber-200 px-4 pb-4 pt-3 space-y-4">
          {/* ── Stripe ── */}
          {provider === "stripe" && (
            <div>
              <p className="mb-2 font-medium text-amber-900">Tarjetas de prueba (Stripe)</p>
              <p className="mb-3 text-xs text-amber-700">
                Fecha: cualquier mes/año futuros · CVC: cualquier 3 dígitos
              </p>
              <div className="space-y-2">
                {STRIPE_CARDS.map((card) => (
                  <div
                    key={card.number}
                    className="flex items-center justify-between rounded-lg bg-white border border-amber-100 px-3 py-2"
                  >
                    <span className="text-slate-500">{card.badge} {card.label}</span>
                    <span className="flex items-center font-mono text-xs text-slate-800">
                      {card.number}
                      <CopyButton text={card.number.replace(/ /g, "")} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Mercado Pago — Tarjeta ── */}
          {provider === "mercadopago" && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium text-amber-900">Tarjeta de prueba (Mercado Pago)</p>
                <div className="rounded-lg bg-white border border-amber-100 px-3 py-2 space-y-1.5">
                  {[
                    { label: "N.º de tarjeta", value: "4509 9535 6623 3704" },
                    { label: "Vencimiento", value: "11/25" },
                    { label: "CVC", value: "123" },
                    { label: "Nombre", value: "APRO" },
                    { label: "DNI", value: "12345678" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="flex items-center font-mono text-slate-800">
                        {value}
                        <CopyButton text={value.replace(/ /g, "")} />
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-amber-700">
                  Tip: el nombre <strong>APRO</strong> simula pago aprobado · <strong>OTHE</strong> simula rechazo.
                </p>
              </div>

              {/* ── Yape ── */}
              <div>
                <p className="mb-2 font-medium text-amber-900">Datos de prueba — Yape</p>
                <div className="space-y-2">
                  {YAPE_CASES.map((c) => (
                    <div
                      key={c.phone}
                      className="rounded-lg bg-white border border-amber-100 px-3 py-2"
                    >
                      <p className="mb-1.5 text-xs font-medium text-slate-700">
                        {c.badge} {c.label}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Celular</span>
                          <span className="flex items-center font-mono text-slate-800">
                            {c.phone}
                            <CopyButton text={c.phone} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">OTP</span>
                          <span className="flex items-center font-mono text-slate-800">
                            {c.otp}
                            <CopyButton text={c.otp} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-amber-700">
                  Ingresa cualquier correo (ej: <strong>demo@test.com</strong>) en el paso anterior.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
