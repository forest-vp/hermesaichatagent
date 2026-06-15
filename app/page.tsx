import {
  Navbar,
  Hero,
  Problem,
  Features,
  AIShowcase,
  Pricing,
  Testimonials,
  FAQ,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <AIShowcase />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
