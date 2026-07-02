import { XCircle, RotateCcw } from "lucide-react"

export default function ErrorScreen({ reason, onRetry }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <XCircle className="h-9 w-9 text-red-500" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold text-slate-900">No pudimos procesar tu pago</h1>

      <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {reason || "Ocurrió un error inesperado. Intenta nuevamente."}
      </div>

      <p className="mt-4 text-sm text-slate-500">No se realizó ningún cargo. Puedes reintentar con los mismos datos.</p>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:bg-blue-800"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reintentar pago
        </button>
      </div>
    </div>
  )
}
