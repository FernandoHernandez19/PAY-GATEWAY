# Veltra — Pasarela de pagos (React + Vite + Tailwind + Node/Express + Stripe + Mercado Pago)

Landing page + checkout funcional con pagos reales en modo de prueba (sandbox), con dos proveedores:
**Stripe** (tarjetas internacionales) y **Mercado Pago** (pago local en soles, pensado para LATAM).
Ningún dato de tarjeta pasa por el backend propio en ninguno de los dos casos: cada proveedor
captura los datos de forma segura en el navegador (tokenización), y el backend solo confirma
el resultado del cargo.

## Arquitectura

```
Frontend (Vite/React)
  │
  ├─ Pestaña "Tarjeta internacional" ──POST /api/create-payment-intent──▶ Backend ──▶ Stripe API
  │                                    ◀──────────── clientSecret ───────────────────┘
  │                                    Stripe.js (Payment Element) confirma el pago
  │
  └─ Pestaña "Mercado Pago"          ──Payment Brick genera un token en el navegador
                                       │
                                       └─POST /api/mercadopago/process_payment (token)──▶ Backend ──▶ MP API
```

## Requisitos

- Node.js 18+
- Una cuenta gratuita de Stripe (https://dashboard.stripe.com/register) — selecciona "United States" al registrarte; no hace falta para el modo de prueba.
- Una cuenta gratuita de Mercado Pago para desarrolladores (https://www.mercadopago.com/developers).

## 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Completa `server/.env` con:
- `STRIPE_SECRET_KEY` — Dashboard de Stripe → Developers → API keys → "Secret key" (`sk_test_...`)
- `MP_ACCESS_TOKEN` — Panel de desarrolladores de Mercado Pago → Tus integraciones → Credenciales de prueba → Access Token

```bash
npm run dev
```

Debe imprimir: `🚀 Servidor de pagos escuchando en http://localhost:4000`

## 2. Frontend

```bash
cp .env.example .env
```

Completa `.env` (raíz del proyecto) con:
- `VITE_STRIPE_PUBLISHABLE_KEY` — clave **pública** de prueba de Stripe (`pk_test_...`)
- `VITE_MP_PUBLIC_KEY` — Public Key de prueba de Mercado Pago (`TEST-...`)

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`, navega a "Empezar" → verás el checkout real con las dos pestañas de pago.

## 3. Probar un pago (modo test, sin dinero real)

**Con Stripe** — usa cualquiera de sus tarjetas de prueba:

| Escenario | Número de tarjeta |
|---|---|
| Pago exitoso | `4242 4242 4242 4242` |
| Pago rechazado | `4000 0000 0000 0002` |
| Requiere autenticación 3D Secure | `4000 0025 0000 3155` |

Fecha de expiración: cualquier fecha futura. CVC: cualquier 3 dígitos.

**Con Mercado Pago (pestaña local)**:

1. Ingresa a tu panel de desarrolladores en Mercado Pago.
2. Ve a Cuentas de prueba y crea tarjetas de prueba genéricas (ej: terminadas en `0341` para Aprobada).
3. Prueba ingresando cualquier nombre y documento en el formulario seguro (ej: DNI peruano 8 dígitos).

> Nota: el precio en soles se calcula con una tasa de cambio fija en `server/src/lib/orders.js` (`USD_TO_PEN_RATE`), solo para esta demo. Una integración real consultaría un tipo de cambio en vivo o definiría el precio base directamente en soles.

## 4. Webhook de Stripe (opcional)

Con el [Stripe CLI](https://docs.stripe.com/stripe-cli) instalado:

```bash
stripe listen --forward-to localhost:4000/api/webhook
```

Copia el `whsec_...` que imprime y pégalo en `server/.env` como `STRIPE_WEBHOOK_SECRET`. Así el backend confirma cada pago de Stripe de forma independiente al navegador del usuario — la práctica correcta en producción.

## Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Stripe.js / React Stripe.js, @mercadopago/sdk-react, lucide-react.
**Backend:** Node.js, Express 5, Stripe SDK, mercadopago (Node SDK).

## Despliegue

Ver la guía completa de despliegue (Vercel + Render) en la conversación / documentación del proyecto.

## Notas honestas sobre esta demo

- Los precios y el pedido son datos mock — no hay base de datos ni carrito real.
- El tipo de cambio USD→PEN es fijo, no en vivo.
