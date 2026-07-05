import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Elements } from "@stripe/react-stripe-js"
import { Lock, Loader2, Wallet, ArrowLeft } from "lucide-react"

import { stripePromise } from "../lib/stripe"
import { stripeAppearance } from "../lib/stripeAppearance"
import { fetchOrderSummary, createPaymentIntent } from "../lib/api"
import { currency, currencyPEN } from "../lib/format"

import OrderSummary from "../components/checkout/OrderSummary"
import CheckoutForm from "../components/checkout/CheckoutForm"
import MercadoPagoPayment from "../components/checkout/MercadoPagoPayment"
import SuccessScreen from "../components/checkout/SuccessScreen"
import ErrorScreen from "../components/checkout/ErrorScreen"
import DemoGuide from "../components/checkout/DemoGuide"

function ResultShell({ children }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}

function ProviderTabs({ provider, onChange, disabled }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2" role="tablist" aria-label="Proveedor de pago">
      <button
        type="button"
        role="tab"
        aria-selected={provider === "stripe"}
        disabled={disabled}
        onClick={() => onChange("stripe")}
        className={[
          "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          provider === "stripe"
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
        ].join(" ")}
      >
        Tarjeta internacional
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={provider === "mercadopago"}
        disabled={disabled}
        onClick={() => onChange("mercadopago")}
        className={[
          "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          provider === "mercadopago"
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
        ].join(" ")}
      >
        Mercado Pago (Local)
      </button>
    </div>
  )
}

export default function Checkout() {
  const [order, setOrder] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [loadError, setLoadError] = useState("")

  const [provider, setProvider] = useState("stripe") // "stripe" | "mercadopago"

  // "ready" | "processing" | "success" | "error"
  const [step, setStep] = useState("ready")
  const [errorReason, setErrorReason] = useState("")
  const [paymentId, setPaymentId] = useState("")

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1) ¿Qué se está cobrando? Se lo preguntamos al backend, no lo
        //    inventamos en el frontend.
        const summary = await fetchOrderSummary()
        setOrder(summary)

        // 2) Abrimos la "intención de pago" en Stripe para ese monto.
        //    (Mercado Pago generará su token al usar el Payment Brick)
        const { clientSecret } = await createPaymentIntent()
        setClientSecret(clientSecret)
      } catch (err) {
        setLoadError(err.message || "No se pudo conectar con el servidor de pagos.")
      }
    }
    bootstrap()
  }, [])

  function resetToStart() {
    setStep("ready")
    setErrorReason("")
  }

  function switchProvider(next) {
    setProvider(next)
    setStep("ready")
    setErrorReason("")
  }

  // --- Pantallas de resultado a pantalla completa ---

  if (loadError) {
    return (
      <ResultShell>
        <ErrorScreen
          reason={`${loadError} Verifica que el backend esté corriendo en la URL configurada en VITE_API_URL.`}
          onRetry={() => window.location.reload()}
        />
      </ResultShell>
    )
  }

  if (step === "success") {
    const formattedTotal = provider === "mercadopago" ? currencyPEN(order.totalPEN) : currency(order.total)
    return (
      <ResultShell>
        <SuccessScreen formattedTotal={formattedTotal} receiptId={paymentId} onHome={() => (window.location.href = "/")} />
      </ResultShell>
    )
  }

  if (step === "error") {
    return (
      <ResultShell>
        <ErrorScreen reason={errorReason} onRetry={resetToStart} />
      </ResultShell>
    )
  }

  if (!order || !clientSecret) {
    return (
      <ResultShell>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-sm text-slate-500">Preparando tu pago de forma segura...</p>
        </div>
      </ResultShell>
    )
  }

  // --- Checkout normal ---

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Volver al inicio"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Wallet className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-semibold text-slate-900">Acme Pay</span>
              </div>
            </div>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 sm:w-auto">
            <Lock className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            Conexión cifrada
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.1fr]">
          <OrderSummary items={order.items} subtotal={order.subtotal} tax={order.tax} total={order.total} />

          <div>
            <ProviderTabs provider={provider} onChange={switchProvider} disabled={step === "processing"} />
            <DemoGuide provider={provider} />

            {provider === "stripe" ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                <CheckoutForm
                  total={order.total}
                  step={step}
                  setStep={setStep}
                  setErrorReason={setErrorReason}
                  setPaymentId={setPaymentId}
                />
              </Elements>
            ) : (
              <MercadoPagoPayment
                totalPEN={order.totalPEN}
                step={step}
                setStep={setStep}
                setErrorReason={setErrorReason}
                setPaymentId={setPaymentId}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
