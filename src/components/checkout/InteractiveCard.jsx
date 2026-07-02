import { detectBrand } from "../../lib/format"

export default function InteractiveCard({ card }) {
  const brand = detectBrand(card.number)
  const number = card.number || "•••• •••• •••• ••••"

  return (
    <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-slate-900 p-5 text-white shadow-lg sm:p-6">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-600/20" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-500/10" aria-hidden="true" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-200 to-amber-400/80" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-wide text-white/90">{brand}</span>
        </div>

        <p className="font-mono text-lg tracking-[0.15em] text-white sm:text-xl">{number}</p>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/50">Titular</p>
            <p className="truncate text-sm font-medium uppercase text-white/90">
              {card.name || "NOMBRE APELLIDO"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Expira</p>
            <p className="font-mono text-sm text-white/90">{card.expiry || "MM/AA"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
