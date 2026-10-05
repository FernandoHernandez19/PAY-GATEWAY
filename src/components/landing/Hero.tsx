import { Link } from "react-router-dom"
import { ArrowRight, BookText } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Resplandor de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute left-1/4 top-[20%] h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Nueva API v2 — ya disponible
        </div>

        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Los pagos online,{" "}
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            por fin simples
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
          Veltra es la pasarela de pagos para equipos modernos. Acepta pagos en minutos con una integración limpia,
          seguridad de nivel bancario y una velocidad que tus usuarios notarán.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/checkout"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] active:scale-[0.99] sm:w-auto"
          >
            Iniciar Pasarela
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="https://github.com/FernandoHernandez19/PAY-GATEWAY#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] sm:w-auto"
          >
            <BookText className="h-4 w-4" />
            Ver Documentación
          </a>
        </div>

        {/* Mock de vista previa de código */}
        <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0E0E10] text-left shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs text-slate-500">checkout.ts</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed">
            <code className="font-mono">
              <span className="text-slate-500">{"// Cobra en una sola llamada"}</span>
              {"\n"}
              <span className="text-blue-400">const</span>
              <span className="text-slate-200"> pago </span>
              <span className="text-slate-500">=</span>
              <span className="text-blue-400"> await</span>
              <span className="text-emerald-400"> veltra</span>
              <span className="text-slate-200">.charges.</span>
              <span className="text-emerald-400">create</span>
              <span className="text-slate-200">{"({"}</span>
              {"\n  "}
              <span className="text-slate-300">amount</span>
              <span className="text-slate-500">:</span>
              <span className="text-amber-300"> 10395</span>
              <span className="text-slate-500">,</span>
              {"\n  "}
              <span className="text-slate-300">currency</span>
              <span className="text-slate-500">:</span>
              <span className="text-emerald-300">{' "usd"'}</span>
              <span className="text-slate-500">,</span>
              {"\n"}
              <span className="text-slate-200">{"})"}</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  )
}
