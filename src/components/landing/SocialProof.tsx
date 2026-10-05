const BRANDS = ["Northwind", "Acme", "Lumen", "Corvex", "Monera", "Quanta"]

export default function SocialProof() {
  return (
    <section id="social-proof" className="border-y border-white/5 py-14">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Confiado por empresas modernas
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="text-lg font-semibold tracking-tight text-slate-500 transition-colors hover:text-slate-300"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
