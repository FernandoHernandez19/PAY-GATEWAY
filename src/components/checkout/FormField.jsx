import { CheckCircle2, XCircle } from "lucide-react"

export default function FormField({
  id,
  label,
  value,
  onChange,
  onBlur,
  state,
  error,
  placeholder,
  inputMode,
  autoComplete,
  trailing,
}) {
  const border =
    state === "error"
      ? "border-red-500 focus-visible:ring-red-500/25"
      : state === "success"
        ? "border-emerald-500 focus-visible:ring-emerald-500/25"
        : "border-slate-300 focus-visible:ring-blue-600/25"

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-invalid={state === "error"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-4",
            trailing ? "pr-11" : "",
            border,
          ].join(" ")}
        />
        {(trailing || state !== "idle") && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {state === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            ) : state === "error" ? (
              <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
            ) : (
              trailing
            )}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
