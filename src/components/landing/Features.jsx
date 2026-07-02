import { ShieldCheck, Zap, Plug, Check } from "lucide-react"

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Seguridad",
    desc: "Cifrado de extremo a extremo, cumplimiento PCI DSS Nivel 1 y detección de fraude impulsada por IA en cada transacción.",
    points: ["PCI DSS Nivel 1", "3D Secure 2", "Tokenización"],
    accent: "emerald",
  },
  {
    icon: Zap,
    title: "Velocidad",
    desc: "Confirmaciones en menos de 200 ms y liquidaciones aceleradas para que el dinero llegue a tu cuenta más rápido.",
    points: ["Latencia < 200ms", "Liquidación en 1 día", "99.99% uptime"],
    accent: "blue",
  },
  {
    icon: Plug,
    title: "Fácil Integración",
    desc: "SDKs limpios, documentación clara y un entorno de pruebas completo. Pon en marcha tu pasarela en una tarde.",
    points: ["SDK en 6 lenguajes", "Webhooks", "Modo sandbox"],
    accent: "blue",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Todo lo que necesitas para cobrar
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-slate-400">
            Una infraestructura de pagos completa diseñada para escalar contigo, desde tu primera venta hasta
            millones de transacciones.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            const iconClasses =
              f.accent === "emerald"
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                : "bg-blue-500/10 text-blue-400 ring-blue-500/20"
            return (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${iconClasses}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                <ul className="mt-5 space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
