import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    // El servidor tiene su propia configuración de tests
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['server/**', 'node_modules/**', 'dist/**'],
    // Claves ficticias: ningún test necesita credenciales reales
    env: {
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_dummy',
      VITE_MP_PUBLIC_KEY: 'TEST-dummy',
      VITE_API_URL: 'http://api.test',
    },
  },
})
