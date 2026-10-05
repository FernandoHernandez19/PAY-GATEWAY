import "dotenv/config"
import app from "./app.js"

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`🚀 Servidor de pagos escuchando en http://localhost:${PORT}`)
})
