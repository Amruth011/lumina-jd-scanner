import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

export const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "FREE",
      price: "$0",
      description: "For exploratory job seekers",
      features: [
        { name: "3 JD analyses/mo", included: true },
        { name: "1 resume tailoring", included: true },
        { name: "Basic gap analysis", included: true },
        { name: "PDF export", included: true },
        { name: "DOCX export", included: false },
        { name: "Market Insights", included: false }
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "PRO",
      price: isAnnual ? "$15" : "$19",
      description: "Everything you need to land top 0.1% roles",
      features: [
        { name: "Unlimited JD analyses", included: true },
        { name: "10 resume tailorings", included: true },
        { name: "Full gap analysis", included: true },
        { name: "Market Insights", included: true },
        { name: "Priority AI Engine", included: true },
        { name: "Download PDF + DOCX", included: true }
      ],
      cta: "Get Pro →",
      popular: true
    },
    {
      name: "TEAM",
      price: isAnnual ? "$39" : "$49",
      description: "For agencies and groups",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "5 team seats", included: true },
        { name: "Shared resume library", included: true },
        { name: "Team analytics", included: true },
        { name: "API access", included: true },
        { name: "Dedicated support", included: true }
      ],
      cta: "Start Team Trial",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="bg-background py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#1E2A3A]">
            Simple, transparent <br /> <span className="italic text-[#10B981]">pricing.</span>
          </h2>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-display font-bold ${!isAnnual ? 'text-[#1E2A3A]' : 'text-[#1E2A3A]/40'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 rounded-full bg-muted p-1 flex items-center transition-all duration-300 border border-border/10"
            >
              <motion.div 
                animate={{ x: isAnnual ? 24 : 0 }}
                className="w-6 h-6 rounded-full bg-[#10B981]"
              />
            </button>
            <span className={`text-sm font-display font-bold ${isAnnual ? 'text-[#1E2A3A]' : 'text-[#1E2A3A]/40'}`}>
              Annual <span className="text-[#10B981] ml-1">(save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 ${
                plan.popular 
                  ? "bg-lumina-teal text-white shadow-[0_40px_100px_-20px_rgba(16,185,129,0.35)] scale-[1.05] z-10 border border-lumina-teal" 
                  : "bg-white border border-border/10 text-foreground hover:border-lumina-teal/20 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#10B981] text-[#1E2A3A] text-[10px] font-display font-bold rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8 space-y-2">
                <p className={`text-[12px] font-display font-bold uppercase tracking-widest ${plan.popular ? 'text-white/70' : 'text-muted-foreground/50'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-serif font-bold">{plan.price}</span>
                  <span className={`text-sm font-body ${plan.popular ? 'text-white/70' : 'text-muted-foreground/60'}`}>/ month</span>
                </div>
                <p className={`text-sm font-body leading-relaxed ${plan.popular ? 'text-white/75' : 'text-muted-foreground/60'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-5 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-[#10B981]' : 'text-[#10B981]'}`} />
                    ) : (
                      <X className="w-5 h-5 text-red-500/30" />
                    )}
                    <span className={`text-[14px] font-body ${feature.included ? plan.popular ? 'text-white' : '' : 'text-muted-foreground/40'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 px-6 rounded-full font-display font-bold transition-all ${
                  plan.popular
                    ? "bg-white text-lumina-teal hover:scale-[1.02] shadow-sm"
                    : "border border-lumina-teal text-lumina-teal hover:bg-lumina-teal/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
