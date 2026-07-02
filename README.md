# Veltra — Pasarela de pagos (React + Vite + Tailwind + Node/Express + Stripe)

Landing page + checkout funcional con pagos reales en modo de prueba (sandbox) usando Stripe.
Ningún dato de tarjeta pasa por el backend propio: Stripe los captura de forma segura vía
Payment Element, y el backend solo crea el cargo y confirma su resultado.

## Arquitectura

```
Frontend (Vite/React) ──POST /api/create-payment-intent──▶ Backend (Express)
        │                                                        │
        │◀────────────── clientSecret ──────────────────────────┘
        │
        ▼
  Stripe.js (Payment Element) ── confirmPayment ──▶ Stripe API
                                                        │
                                          Webhook ──────┘
                                     (confirma el pago de forma
                                      independiente al navegador)
```

## Requisitos

- Node.js 18+
- Una cuenta gratuita de Stripe (https://dashboard.stripe.com/register) — no requiere datos bancarios para usar el modo de prueba.

## 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Completa `server/.env` con tu clave secreta de prueba (Dashboard de Stripe → Developers → API keys → "Secret key", empieza con `sk_test_`).

```bash
npm run dev
```

Debe imprimir: `🚀 Servidor de pagos escuchando en http://localhost:4000`

## 2. Frontend

```bash
cp .env.example .env
```

Completa `.env` (raíz del proyecto) con tu clave **pública** de prueba (empieza con `pk_test_`).

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`, navega a "Empezar" → verás el checkout real con Payment Element.

## 3. Probar un pago (modo test, sin dinero real)

Usa cualquiera de las tarjetas de prueba de Stripe:

| Escenario | Número de tarjeta |
|---|---|
| Pago exitoso | `4242 4242 4242 4242` |
| Pago rechazado | `4000 0000 0000 0002` |
| Requiere autenticación 3D Secure | `4000 0025 0000 3155` |

Fecha de expiración: cualquier fecha futura. CVC: cualquier 3 dígitos.

## 4. Webhook (opcional pero recomendado para el portafolio)

Con el [Stripe CLI](https://docs.stripe.com/stripe-cli) instalado:

```bash
stripe listen --forward-to localhost:4000/api/webhook
```

Copia el `whsec_...` que imprime y pégalo en `server/.env` como `STRIPE_WEBHOOK_SECRET`. Así el backend confirma cada pago de forma independiente al navegador del usuario — la práctica correcta en producción.

## Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Stripe.js / React Stripe.js, lucide-react.
**Backend:** Node.js, Express 5, Stripe SDK.

## Despliegue

Ver la guía completa de despliegue (Vercel + Render) en la conversación / documentación del proyecto.
