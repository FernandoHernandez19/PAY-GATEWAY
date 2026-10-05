// SDK v2 de Mercado Pago, cargado dinámicamente por YapePayment.
// Solo se declara la parte que usa la app.
interface MercadoPagoYape {
  create: () => Promise<{ id: string }>
}

interface MercadoPagoInstance {
  yape?: (options: { otp: string; phoneNumber: string }) => MercadoPagoYape
}

interface Window {
  MercadoPago?: new (publicKey: string) => MercadoPagoInstance
}
