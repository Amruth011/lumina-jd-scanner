"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for casual applicants.',
    features: [
      { text: '3 JD Analyses / mo', included: true },
      { text: 'Basic Match Score', included: true },
      { text: 'Keyword Suggestions', included: true },
      { text: 'Full Resume Tailoring', included: false },
      { text: 'Market Insights', included: false },
    ],
    cta: 'Start Now',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For ambitious job seekers.',
    features: [
      { text: 'Unlimited JD Analyses', included: true },
      { text: 'Advanced Intelligence Report', included: true },
      { text: 'Full Resume Tailoring', included: true },
      { text: 'Market Insights', included: true },
      { text: 'Priority Processing', included: true },
    ],
    cta: 'Get Pro Access',
    highlight: true,
    badge: 'Most Popular'
  },
  {
    name: 'Team',
    price: '$49',
    period: '/mo',
    description: 'For agencies and groups.',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '5 User Seats', included: true },
      { text: 'Shared Workspace', included: true },
      { text: 'API Access', included: true },
      { text: 'Custom Training', included: true },
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="bg-lumina-bg py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="text-lumina-teal font-display font-bold text-xs uppercase tracking-[0.3em]">Transparent Pricing</span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-lumina-navy">Invest in your <span className="italic text-lumina-teal">next big offer.</span></h2>
          <p className="text-lg md:text-xl text-lumina-navy/60 font-body">Scale your applications with the intelligence engine that wins.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-[2.5rem] p-10 flex flex-col gap-10 shadow-sm border transition-all hover:scale-[1.02] ${
                tier.highlight 
                ? 'bg-lumina-navy text-white border-lumina-teal/30 shadow-[0_20px_50px_rgba(16,185,129,0.15)]' 
                : 'bg-white text-lumina-navy border-black/5'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-lumina-teal text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-4">
                <p className={`text-xs font-display font-bold uppercase tracking-widest ${tier.highlight ? 'text-lumina-teal' : 'text-lumina-navy/40'}`}>
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-serif font-bold">{tier.price}</span>
                  <span className={`text-sm font-body ${tier.highlight ? 'text-white/40' : 'text-lumina-navy/40'}`}>{tier.period}</span>
                </div>
                <p className={`text-sm font-body ${tier.highlight ? 'text-white/60' : 'text-lumina-navy/60'}`}>
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 flex-1">
                {tier.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check size={18} className="text-lumina-teal" />
                    ) : (
                      <X size={18} className="text-red-500/50" />
                    )}
                    <span className={`text-sm font-body ${tier.highlight ? 'text-white/80' : 'text-lumina-navy/80'} ${!feature.included && 'opacity-50'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Link to="/dashboard" className="w-full">
                <button className={`w-full py-4 rounded-full font-bold text-sm transition-all ${
                  tier.highlight 
                  ? 'bg-lumina-teal text-lumina-navy hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                  : 'bg-lumina-navy text-white hover:bg-lumina-navy-dark'
                }`}>
                  {tier.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
