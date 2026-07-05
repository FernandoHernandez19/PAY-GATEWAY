import { useState, useEffect } from "react"
import { Smartphone, Shield, Loader2, ArrowRight } from "lucide-react"

/**
 * Formulario de pago con Yape.
 *
 * Flujo según documentación oficial MP:
 * https://www.mercadopago.com.pe/developers/es/docs/checkout-api-payments/integration-configuration/yape
 *
 * 1. El usuario ingresa su número de celular + OTP de la app Yape
 * 2. El frontend llama a la API de MP para generar un token de un solo uso
 * 3. El token se envía al backend para crear el pago con payment_method_id: "yape"
 */
export default function YapePayment({ totalPEN, payerEmail, step, setStep, setErrorReason, setPaymentId }) {
  const isProcessing = step === "processing"

  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState({})
  const [mpInstance, setMpInstance] = useState(null)

  // Inicializar el SDK de MP (v2) para generar el token de Yape
  useEffect(() => {
    const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY
    if (!mpKey) {
      console.warn("⚠️ Falta VITE_MP_PUBLIC_KEY")
      return
    }
    // Cargamos el SDK v2 de MP dinámicamente (requerido para mp.yape.create)
    if (window.MercadoPago) {
      setMpInstance(new window.MercadoPago(mpKey))
      return
    }
    const script = document.createElement("script")
    script.src = "https://sdk.mercadopago.com/js/v2"
    script.async = true
    script.onload = () => setMpInstance(new window.MercadoPago(mpKey))
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  function validate() {
    const errs = {}
    const cleanPhone = phone.replace(/\D/g, "")
    if (!cleanPhone || cleanPhone.length < 9) {
      errs.phone = "Ingresa tu número de celular (9 dígitos)."
    }
    const cleanOtp = otp.replace(/\D/g, "")
    if (!cleanOtp || cleanOtp.length !== 6) {
      errs.otp = "El código OTP tiene 6 dígitos."
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setStep("processing")

    try {
      // Paso 1: Generar token de Yape usando el SDK JS de MP
      let token
      if (mpInstance?.yape) {
        // Método preferido: SDK JS genera el token de forma segura
        const yapeOptions = {
          otp: otp.replace(/\D/g, ""),
          phoneNumber: phone.replace(/\D/g, ""),
        }
        const yape = mpInstance.yape(yapeOptions)
        const yapeToken = await yape.create()
        token = yapeToken.id
      } else {
        // Fallback: llamar directamente a la API de MP para obtener el token
        const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY
        const tokenRes = await fetch(
          `https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=${mpKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: phone.replace(/\D/g, ""),
              otp: otp.replace(/\D/g, ""),
            }),
          }
        )
        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}))
          throw new Error(err?.message || "No se pudo generar el token de Yape.")
        }
        const tokenData = await tokenRes.json()
        token = tokenData.id
      }

      // Paso 2: Enviar token al backend para crear el pago
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"
      const res = await fetch(`${API_URL}/api/mercadopago/yape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, payerEmail }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "El pago con Yape fue rechazado.")
      }

      const result = await res.json()
      setPaymentId(result.id)
      setStep("success")
    } catch (err) {
      setErrorReason(err.message || "Ocurrió un error al procesar el pago con Yape.")
      setStep("error")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
      aria-label="Pago con Yape"
    >
      {/* Logo / Header Yape */}
      <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm flex-shrink-0">
          Y
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-900">Pagar con Yape</p>
          <p className="text-xs text-purple-600">Abre tu app Yape para obtener el código OTP</p>
        </div>
      </div>

      {/* Campo: Número de celular */}
      <div>
        <label htmlFor="yape-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
          Número de celular vinculado a Yape
        </label>
        <div className="relative">
          <Smartphone
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="yape-phone"
            type="tel"
            inputMode="numeric"
            maxLength={9}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
              if (errors.phone) setErrors((p) => ({ ...p, phone: "" }))
            }}
            placeholder="987 654 321"
            disabled={isProcessing}
            className={[
              "w-full rounded-xl border py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition",
              "placeholder:text-slate-400 disabled:opacity-60",
              "focus:ring-2 focus:ring-purple-500 focus:ring-offset-1",
              errors.phone
                ? "border-red-400 bg-red-50 focus:ring-red-400"
                : "border-slate-200 bg-white hover:border-slate-300",
            ].join(" ")}
            aria-invalid={!!errors.phone}
          />
        </div>
        {errors.phone && (
          <p role="alert" className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* Campo: OTP */}
      <div>
        <label htmlFor="yape-otp" className="mb-1.5 block text-sm font-medium text-slate-700">
          Código OTP (6 dígitos de tu app Yape)
        </label>
        <div className="relative">
          <Shield
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="yape-otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              if (errors.otp) setErrors((p) => ({ ...p, otp: "" }))
            }}
            placeholder="123456"
            disabled={isProcessing}
            className={[
              "w-full rounded-xl border py-3 pl-9 pr-4 text-sm tracking-[0.3em] text-slate-900 outline-none transition",
              "placeholder:tracking-normal placeholder:text-slate-400 disabled:opacity-60",
              "focus:ring-2 focus:ring-purple-500 focus:ring-offset-1",
              errors.otp
                ? "border-red-400 bg-red-50 focus:ring-red-400"
                : "border-slate-200 bg-white hover:border-slate-300",
            ].join(" ")}
            aria-invalid={!!errors.otp}
          />
        </div>
        {errors.otp && (
          <p role="alert" className="mt-1.5 text-xs text-red-500">{errors.otp}</p>
        )}
        <p className="mt-1.5 text-xs text-slate-400">
          En la app Yape: Cobros → Código QR → el número de 6 dígitos que aparece.
        </p>
      </div>

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={isProcessing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 active:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Procesando pago...
          </>
        ) : (
          <>
            Pagar S/ {totalPEN?.toFixed(2)} con Yape
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
