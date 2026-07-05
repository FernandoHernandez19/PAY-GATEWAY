import { useRef } from "react"
import { CheckCircle2, Download, ArrowLeft } from "lucide-react"
import html2canvas from "html2canvas"

export default function SuccessScreen({ formattedTotal, receiptId, onHome }) {
  const receiptRef = useRef(null)

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    
    try {
      // Tomamos una "foto" del componente
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Doble resolución para que se vea nítido
        backgroundColor: "#ffffff", // Fondo blanco
      });
      
      // Convertimos el canvas a una URL de imagen (PNG)
      const dataUrl = canvas.toDataURL("image/png");
      
      // Forzamos la descarga automática
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Recibo_${receiptId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al generar el recibo:", error);
    }
  }
  return (
    <div ref={receiptRef} className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50" data-html2canvas-ignore="true">
        <CheckCircle2 className="h-9 w-9 animate-[pulse_1.2s_ease-in-out_1] text-emerald-500" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold text-slate-900">¡Pago completado!</h1>
      <p className="mt-2 text-sm text-slate-500">
        Gracias por tu compra. Enviamos el comprobante a tu correo electrónico.
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

      <div className="mt-6 grid gap-3" data-html2canvas-ignore="true">
        <button
          type="button"
          onClick={handleDownload}
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
