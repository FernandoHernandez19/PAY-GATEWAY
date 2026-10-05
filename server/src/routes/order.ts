import { Router } from "express"
import { getOrderSummary } from "../lib/orders.js"

const router = Router()

// GET /api/order — el frontend consulta aquí qué se está cobrando.
// Así el precio vive en un solo lugar (el backend), no duplicado en el cliente.
router.get("/", (req, res) => {
  res.json(getOrderSummary())
})

export default router
