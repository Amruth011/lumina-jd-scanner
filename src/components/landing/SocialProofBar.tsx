import React from "react";

export const SocialProofBar = () => {
  const companies = [
    "Google", "Amazon", "Meta", "McKinsey", "Deloitte", "OpenAI", "Microsoft",
    "Stripe", "Netflix", "Apple", "Uber", "Airbnb", "Goldman Sachs"
  ];

  return (
    <section className="bg-[#1E2A3A] py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        <p className="text-center font-body text-[12px] font-bold text-[#10B981] uppercase tracking-[0.2em]">
          Trusted by professionals at
        </p>

        <div className="relative flex overflow-x-hidden group [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-4 group-hover:pause">
            {companies.map((company, i) => (
              <span
                key={i}
                className="text-[18px] md:text-[22px] font-serif font-medium text-white/40 hover:text-white/80 transition-colors cursor-default"
              >
                {company}
              </span>
            ))}
          </div>

          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 py-4 group-hover:pause" aria-hidden="true">
            {companies.map((company, i) => (
              <span
                key={`clone-${i}`}
                className="text-[18px] md:text-[22px] font-serif font-medium text-white/40 hover:text-white/80 transition-colors cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 30s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default SocialProofBar;
