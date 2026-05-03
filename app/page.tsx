import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import SocialProofBar from '../components/landing/SocialProofBar';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import LiveDemoStrip from '../components/landing/LiveDemoStrip';
import Testimonials from '../components/landing/Testimonials';
import StatsSection from '../components/landing/StatsSection';
import PricingSection from '../components/landing/PricingSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-lumina-bg selection:bg-lumina-teal/30 selection:text-lumina-navy">
      <Navbar />
      <Hero />
      <SocialProofBar />
      <ProblemSection />
      <HowItWorks />
      <FeaturesGrid />
      <LiveDemoStrip />
      <Testimonials />
      <StatsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
