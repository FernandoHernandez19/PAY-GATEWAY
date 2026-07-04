import Navbar from "../components/landing/Navbar"
import Hero from "../components/landing/Hero"
import SocialProof from "../components/landing/SocialProof"
import Features from "../components/landing/Features"
import Footer from "../components/landing/Footer"

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] font-sans text-white antialiased selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <Footer />
    </main>
  )
}
