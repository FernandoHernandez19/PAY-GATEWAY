// Interruptor de Mercado Pago: se activa solo con VITE_ENABLE_MERCADOPAGO="true".
// Si la variable no existe (o tiene cualquier otro valor) se considera desactivado.
export const mercadoPagoEnabled: boolean = import.meta.env.VITE_ENABLE_MERCADOPAGO === "true"
