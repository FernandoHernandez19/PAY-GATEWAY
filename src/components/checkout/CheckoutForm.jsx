import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Lock, ShieldCheck, Loader2 } from "lucide-react"
import { currency } from "../../lib/format"
import ProcessingOverlay from "./ProcessingOverlay"

export default function CheckoutForm({ total, step, setStep, setErrorReason, setPaymentId }) {
  const stripe = useStripe()
  const elements = useElements()
  const isProcessing = step === "processing"

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return // Stripe.js todavía no terminó de cargar

    setStep("processing")

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Solo se usa si el método de pago elegido exige redirección
        // (por ejemplo, algunas billeteras). Las tarjetas no la necesitan.
        return_url: `${window.location.origin}/checkout`,
      },
      redirect: "if_required",
    })

    if (error) {
      setErrorReason(error.message || "El pago fue rechazado. Intenta con otra tarjeta.")
      setStep("error")
      return
    }

    if (paymentIntent?.status === "succeeded") {
      setPaymentId(paymentIntent.id)
      setStep("success")
    } else {
      // p. ej. "processing" en pagos que se confirman de forma asíncrona
      setErrorReason("Tu pago quedó en confirmación. Te avisaremos por correo en unos minutos.")
      setStep("error")
    }
  }

  return (
    <section
      aria-label="Datos de pago"
      className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {isProcessing && <ProcessingOverlay />}

      <fieldset disabled={isProcessing} className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">Método de pago</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">
          Procesado de forma segura por Stripe. Los datos de tu tarjeta nunca tocan nuestro servidor.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <PaymentElement options={{ layout: "tabs" }} />

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Procesando pago...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" aria-hidden="true" />
                Pagar {currency(total)}
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            Cifrado SSL de 256 bits, directo a Stripe.
          </p>
        </form>
      </fieldset>
    </section>
  )
}
