import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/Landing"
import CheckoutPage from "./pages/Checkout"

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>

  )
}

export default App
