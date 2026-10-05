import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import Logo from "./Logo"

const LINKS = [
  { label: "Características", href: "#features" },
  { label: "Sobre el Desarrollador", href: "https://github.com/FernandoHernandez19", external: true },
  { label: "Código Fuente", href: "https://github.com/FernandoHernandez19/PAY-GATEWAY", external: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]"
        >
          <Logo />
        </Link>

        {/* Enlaces de escritorio */}
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] rounded"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] sm:inline-flex"
          >
            Iniciar Sesión
          </button>
          <Link
            to="/checkout"
            className="hidden rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] sm:inline-flex"
          >
            Empezar
          </Link>

          {/* Botón de menú móvil */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {open && (
        <div className="border-t border-white/5 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              className="mt-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Iniciar Sesión
            </button>
            <Link
              to="/checkout"
              className="mt-1 rounded-lg bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#0A0A0B] transition-colors hover:bg-slate-200"
            >
              Empezar
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
