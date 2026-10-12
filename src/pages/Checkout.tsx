import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Elements } from "@stripe/react-stripe-js"
import { Lock, Loader2, Wallet, ArrowLeft } from "lucide-react"

import { stripePromise } from "../lib/stripe"
import { stripeAppearance } from "../lib/stripeAppearance"
import { fetchOrderSummary, createPaymentIntent } from "../lib/api"
import { currency, currencyPEN } from "../lib/format"
import { mercadoPagoEnabled } from "../lib/config"

import OrderSummary from "../components/checkout/OrderSummary"
import CheckoutForm from "../components/checkout/CheckoutForm"
import MercadoPagoPayment from "../components/checkout/MercadoPagoPayment"
import SuccessScreen from "../components/checkout/SuccessScreen"
import ErrorScreen from "../components/checkout/ErrorScreen"
import DemoGuide from "../components/checkout/DemoGuide"

import type { CheckoutStep, PaymentProvider } from "../types/checkout"
import type { OrderSummary as OrderSummaryData } from "../types/order"
import type { PaymentId } from "../types/payment"

function ResultShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}

interface ProviderTabsProps {
  provider: PaymentProvider
  onChange: (next: PaymentProvider) => void
  disabled: boolean
}

function ProviderTabs({ provider, onChange, disabled }: ProviderTabsProps) {
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
            : mercadoPagoEnabled
              ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              : "border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300",
        ].join(" ")}
      >
        {mercadoPagoEnabled ? "Mercado Pago (Local)" : "Pago local (Yape) · Próximamente"}
      </button>
    </div>
  )
}

function LocalPaymentsPaused({ onUseCard }: { onUseCard: () => void }) {
  return (
    <section
      aria-label="Pagos locales en pausa"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm text-slate-600">
        Los pagos locales con Yape están en pausa mientras migramos de proveedor. Puedes probar el flujo
        completo con tarjeta internacional.
      </p>
      <button
        type="button"
        onClick={onUseCard}
        className="mt-5 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:bg-blue-800"
      >
        Pagar con tarjeta internacional
      </button>
    </section>
  )
}

export default function Checkout() {
  const [order, setOrder] = useState<OrderSummaryData | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadError, setLoadError] = useState("")

  const [provider, setProvider] = useState<PaymentProvider>("stripe")

  const [step, setStep] = useState<CheckoutStep>("ready")
  const [errorReason, setErrorReason] = useState("")
  const [paymentId, setPaymentId] = useState<PaymentId>("")

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
        setLoadError((err instanceof Error && err.message) || "No se pudo conectar con el servidor de pagos.")
      }
    }
    bootstrap()
  }, [])

  function resetToStart() {
    setStep("ready")
    setErrorReason("")
  }

  function switchProvider(next: PaymentProvider) {
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

  if (step === "success" && order) {
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
                <span className="text-lg font-semibold text-slate-900">Veltra</span>
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
            ) : !mercadoPagoEnabled ? (
              <LocalPaymentsPaused onUseCard={() => switchProvider("stripe")} />
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
