import { CreditCard, Wallet } from "lucide-react"

function AppleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.417 2.2-1.11 2.98-.75.85-1.98 1.5-3.02 1.42-.13-1.1.42-2.26 1.09-3 .74-.83 2.02-1.45 3.04-1.4zM20.5 17.02c-.55 1.27-.81 1.83-1.52 2.95-.99 1.57-2.39 3.52-4.12 3.53-1.54.02-1.93-.99-4.02-.98-2.09.01-2.52 1-4.06.97-1.73-.02-3.05-1.79-4.04-3.35C.16 15.78-.15 10.6 1.63 7.85c1.03-1.6 2.66-2.61 4.19-2.61 1.56 0 2.54 1 3.83 1 1.25 0 2.01-1 3.82-1 1.36 0 2.8.74 3.83 2.02-3.36 1.84-2.81 6.63.2 7.76z" />
    </svg>
  )
}

function MethodCard({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/25",
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  )
}

export function AltMethodNotice({ method }) {
  const copy =
    method === "paypal"
      ? "Serás redirigido a PayPal para completar el pago de forma segura."
      : "Confirma el pago con Face ID o Touch ID en tu dispositivo Apple."
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <p className="text-sm text-slate-600">{copy}</p>
    </div>
  )
}

export default function PaymentMethodSelector({ method, onChange }) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Método de pago">
      <MethodCard
        active={method === "card"}
        onClick={() => onChange("card")}
        icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
        label="Tarjeta"
      />
      <MethodCard
        active={method === "paypal"}
        onClick={() => onChange("paypal")}
        icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
        label="PayPal"
      />
      <MethodCard
        active={method === "apple"}
        onClick={() => onChange("apple")}
        icon={<AppleIcon className="h-5 w-5" />}
        label="Apple Pay"
      />
    </div>
  )
}
