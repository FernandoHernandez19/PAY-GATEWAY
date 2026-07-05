import { CheckCircle2, Download, ArrowLeft } from "lucide-react"

/**
 * Genera un recibo como archivo HTML y lo descarga.
 * Este enfoque es 100% confiable: no depende de html2canvas ni de
 * renderizado de SVGs en un canvas. El HTML generado es auto-contenido
 * (estilos inline) y se puede abrir en cualquier navegador o imprimir.
 */
function downloadReceiptHTML({ receiptId, formattedTotal }) {
  const now = new Date().toLocaleString("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Lima",
  })

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recibo ${receiptId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 2.5rem 2rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,.08);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      background: #ecfdf5;
      border-radius: 50%;
      margin-bottom: 1.25rem;
      font-size: 2rem;
    }
    h1 { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .subtitle { margin-top: .5rem; font-size: .875rem; color: #64748b; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
    .data { background: #f8fafc; border-radius: .75rem; padding: 1rem; text-align: left; }
    .row { display: flex; justify-content: space-between; font-size: .875rem; padding: .375rem 0; }
    .row:not(:last-child) { border-bottom: 1px solid #e2e8f0; }
    .label { color: #64748b; }
    .value { font-weight: 600; color: #0f172a; font-family: monospace; }
    .status { color: #059669; font-weight: 600; }
    .amount { color: #0f172a; font-size: 1rem; font-weight: 700; font-family: inherit; }
    .footer { margin-top: 1.5rem; font-size: .75rem; color: #94a3b8; }
    .brand { font-weight: 700; color: #475569; letter-spacing: .05em; }
    @media print {
      body { background: white; }
      .card { box-shadow: none; border: 1px solid #ccc; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✅</div>
    <h1>¡Pago completado!</h1>
    <p class="subtitle">Tu transacción fue procesada exitosamente.</p>
    <hr class="divider" />
    <div class="data">
      <div class="row">
        <span class="label">N.º de recibo</span>
        <span class="value">${receiptId}</span>
      </div>
      <div class="row">
        <span class="label">Monto pagado</span>
        <span class="amount">${formattedTotal}</span>
      </div>
      <div class="row">
        <span class="label">Estado</span>
        <span class="status">Aprobado</span>
      </div>
      <div class="row">
        <span class="label">Fecha</span>
        <span class="value" style="font-family:inherit;font-size:.8rem">${now}</span>
      </div>
    </div>
    <p class="footer">
      Emitido por <span class="brand">Acme Pay</span> · Conserva este documento como comprobante de tu pago.
    </p>
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Recibo_${receiptId}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function SuccessScreen({ formattedTotal, receiptId, onHome }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2
          className="h-9 w-9 animate-[pulse_1.2s_ease-in-out_1] text-emerald-500"
          aria-hidden="true"
        />
      </div>

      <h1 className="text-xl font-semibold text-slate-900">¡Pago completado!</h1>
      <p className="mt-2 text-sm text-slate-500">
        Guarda tu número de recibo como comprobante de tu pago.
      </p>

      <dl className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Recibo</dt>
          <dd className="font-mono font-medium text-slate-900">{receiptId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Monto pagado</dt>
          <dd className="font-semibold text-slate-900">{formattedTotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Estado</dt>
          <dd className="font-medium text-emerald-600">Aprobado</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => downloadReceiptHTML({ receiptId, formattedTotal })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:bg-blue-800"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Descargar recibo
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/25 active:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
