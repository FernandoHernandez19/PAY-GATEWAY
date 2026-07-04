import { useEffect, useState } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"
import { ShieldCheck } from "lucide-react"
import ProcessingOverlay from "./ProcessingOverlay"
import { processMercadoPago } from "../../lib/api"

export default function MercadoPagoPayment({ totalPEN, step, setStep, setErrorReason, setPaymentId }) {
  const isProcessing = step === "processing"
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
  }

  const customization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
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

  const onReady = async () => {
    // El brick está listo para usarse
  }

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

        {isReady ? (
          <Payment
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
          />
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Cargando pasarela...</p>
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          Tus datos los procesa Mercado Pago directamente, nunca nuestro servidor.
        </p>
      </fieldset>
    </section>
  )
}
