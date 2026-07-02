import { ShieldCheck, Lock } from "lucide-react"
import { currency } from "../../lib/format"

function TrustBadge({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default function OrderSummary({ items, subtotal, tax, total }) {
  return (
    <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-14 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold text-slate-900">Resumen del pedido</h1>

        <ul className="mt-5 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <span className="text-sm font-medium text-slate-900">{currency(item.price)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="text-slate-700">{currency(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Impuestos (9%)</dt>
            <dd className="text-slate-700">{currency(tax)}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-3">
            <dt className="text-base font-semibold text-slate-900">Total</dt>
            <dd className="text-xl font-bold text-slate-900">{currency(total)}</dd>
          </div>
        </dl>
      </div>

      {/* Insignias de confianza */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TrustBadge
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
          title="Pago 100% seguro"
          subtitle="Cifrado SSL certificado"
        />
        <TrustBadge
          icon={<Lock className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
          title="Datos protegidos"
          subtitle="Cumplimiento PCI-DSS"
        />
      </div>
    </aside>
  )
}
