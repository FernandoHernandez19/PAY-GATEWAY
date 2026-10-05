// Valores ficticios: ningún test necesita claves reales ni llama a Stripe / Mercado Pago
process.env.STRIPE_SECRET_KEY = "sk_test_dummy"
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_dummy"
process.env.MP_ACCESS_TOKEN = "TEST-dummy"
process.env.CLIENT_URL = "http://localhost:5173"
