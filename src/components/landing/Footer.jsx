import Logo from "./Logo"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
        <Logo />
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Veltra, Inc. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#" className="transition-colors hover:text-white">
            Privacidad
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Términos
          </a>
        </div>
      </div>
    </footer>
  )
}
