import { Loader2 } from "lucide-react"

export default function ProcessingOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">Procesando pago...</p>
        <p className="text-xs text-slate-500">No cierres ni actualices esta ventana.</p>
      </div>
      <div className="w-40 space-y-2">
        <div className="h-2 animate-pulse rounded-full bg-slate-200" />
        <div className="h-2 w-3/4 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  )
}
