import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import { ProductPreview } from '@/components/landing/ProductPreview';
import SocialProofBar from '@/components/landing/SocialProofBar';
import ProblemSection from '@/components/landing/ProblemSection';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import LiveDemoStrip from '@/components/landing/LiveDemoStrip';
import Testimonials from '@/components/landing/Testimonials';
import StatsSection from '@/components/landing/StatsSection';
import PricingSection from '@/components/landing/PricingSection';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <main className="min-h-screen bg-background selection:bg-[#10B981]/30 selection:text-[#1E2A3A]">
      <Navbar />
      <Hero />
      <ProductPreview />
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
};

export default Index;
