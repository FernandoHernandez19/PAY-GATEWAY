/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_MP_PUBLIC_KEY: string
  readonly VITE_API_URL?: string
  readonly VITE_ENABLE_MERCADOPAGO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
