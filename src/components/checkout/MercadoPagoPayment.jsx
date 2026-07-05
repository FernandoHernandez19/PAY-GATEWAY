import { useEffect, useState } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"
import { ShieldCheck } from "lucide-react"
import ProcessingOverlay from "./ProcessingOverlay"
import EmailStep from "./EmailStep"
import YapePayment from "./YapePayment"
import { processMercadoPago } from "../../lib/api"

// Sub-tabs internos de Mercado Pago
const MP_METHODS = [
  { id: "card", label: "Tarjeta" },
  { id: "yape", label: "🟣 Yape" },
]

export default function MercadoPagoPayment({ totalPEN, step, setStep, setErrorReason, setPaymentId }) {
  const isProcessing = step === "processing"

  // Paso 1: capturar email | Paso 2: elegir método y pagar
  const [payerEmail, setPayerEmail] = useState(null)
  const [mpMethod, setMpMethod] = useState("card") // "card" | "yape"
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY
    if (!mpKey) {
      console.warn("⚠️ Falta VITE_MP_PUBLIC_KEY en el archivo .env")
    } else {
      initMercadoPago(mpKey, { locale: "es-PE" })
      setIsReady(true)
    }
  }, [])

  const initialization = {
    amount: totalPEN,
    payer: {
      email: payerEmail ?? "",
    },
  }

  const customization = {
    paymentMethods: {
      // Solo tarjetas (crédito/débito) — Yape tiene su propio formulario
      creditCard: "all",
      debitCard: "all",
      maxInstallments: 1,
    },
    visual: {
      style: {
        theme: "default",
      },
    },
  }

  const onSubmit = async (formData) => {
    setStep("processing")
    try {
      const result = await processMercadoPago(formData)
      setPaymentId(result.id)
      setStep("success")
    } catch (err) {
      setErrorReason(err.message || "El pago con Mercado Pago fue rechazado.")
      setStep("error")
    }
  }

  const onError = async (error) => {
    console.error(error)
    setErrorReason("Ocurrió un error en la pasarela de Mercado Pago.")
    setStep("error")
  }

  const onReady = async () => {}

  return (
    <section
      aria-label="Pago con Mercado Pago"
      className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {isProcessing && <ProcessingOverlay />}

      <fieldset disabled={isProcessing} className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">Mercado Pago</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">
          Procesado de forma segura en soles peruanos.
        </p>

        {/* Paso 1: capturar email real del pagador */}
        {!payerEmail ? (
          <EmailStep onConfirm={(email) => setPayerEmail(email)} />
        ) : (
          <>
            {/* Sub-tabs: Tarjeta vs Yape */}
            <div
              role="tablist"
              aria-label="Método de pago"
              className="mb-5 grid grid-cols-2 gap-2"
            >
              {MP_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mpMethod === m.id}
                  onClick={() => setMpMethod(m.id)}
                  disabled={isProcessing}
                  className={[
                    "rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    mpMethod === m.id
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Paso 2a: Pago con tarjeta (Payment Brick) */}
            {mpMethod === "card" && (
              isReady ? (
                <Payment
                  initialization={initialization}
                  customization={customization}
                  onSubmit={onSubmit}
                  onReady={onReady}
                  onError={onError}
                />
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Cargando pasarela...</p>
              )
            )}

            {/* Paso 2b: Pago con Yape (formulario propio según docs MP) */}
            {mpMethod === "yape" && (
              <YapePayment
                totalPEN={totalPEN}
                payerEmail={payerEmail}
                step={step}
                setStep={setStep}
                setErrorReason={setErrorReason}
                setPaymentId={setPaymentId}
              />
            )}
          </>
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          Tus datos los procesa Mercado Pago directamente, nunca nuestro servidor.
        </p>
      </fieldset>
    </section>
  )
}
