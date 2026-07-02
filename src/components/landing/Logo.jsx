export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/20">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M13.5 2.5 5 13.2c-.4.5-.05 1.3.6 1.3H11l-1.4 7.1c-.14.7.76 1.1 1.2.5L19 10.8c.4-.5.05-1.3-.6-1.3H13l1.7-6.5c.18-.7-.73-1.14-1.2-.5Z"
            fill="white"
          />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">Veltra</span>
    </span>
  )
}
