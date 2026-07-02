// Tema visual del formulario de Stripe (Payment Element), para que combine
// con el resto del checkout en vez de verse como un widget ajeno.
// Referencia: https://docs.stripe.com/elements/appearance-api

export const stripeAppearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2563eb", // blue-600, mismo azul del botón "Pagar"
    colorBackground: "#ffffff",
    colorText: "#0f172a", // slate-900
    colorDanger: "#ef4444", // red-500
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #cbd5e1", // slate-300
      boxShadow: "none",
      padding: "12px",
    },
    ".Input:focus": {
      border: "1px solid #2563eb",
      boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.15)",
    },
    ".Label": {
      fontWeight: "500",
      color: "#334155", // slate-700
      marginBottom: "6px",
    },
    ".Tab": {
      border: "1px solid #e2e8f0", // slate-200
      borderRadius: "12px",
    },
    ".Tab--selected": {
      border: "2px solid #2563eb",
      backgroundColor: "#eff6ff", // blue-50
    },
  },
}
