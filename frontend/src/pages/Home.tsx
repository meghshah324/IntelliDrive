import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import TrustedBy from "../components/landing/TrustedBy";
import Features from "../components/landing/Features";
import ProductPreview from "../components/landing/ProductPreview";
import Security from "../components/landing/Security";
import ComingSoon from "../components/landing/ComingSoon";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <LandingNavbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <ProductPreview />
        <Security />
        <ComingSoon />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
