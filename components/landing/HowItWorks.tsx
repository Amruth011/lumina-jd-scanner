"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const chapters = [
  {
    id: 'jd-decoder',
    title: 'Decode Every Hidden Requirement',
    description: 'Our neural analysis engine scans the JD to surface implicit keywords, mission-critical skills, and cultural signals that typical scanners miss.',
    visual: (
      <div className="bg-white/5 rounded-2xl p-8 font-mono text-sm border border-white/10 w-full h-full flex flex-col gap-4">
        <div className="text-white/40 border-b border-white/10 pb-4">scanning_job_description.raw</div>
        <div className="space-y-2">
          <p className="text-white/80">"Seeking a <span className="bg-lumina-teal/20 text-lumina-teal rounded px-1">Senior AI Engineer</span> with experience in <span className="bg-lumina-teal/20 text-lumina-teal rounded px-1">RAG systems</span> and <span className="bg-lumina-teal/20 text-lumina-teal rounded px-1">LLM orchestration</span>..."</p>
          <p className="text-white/30">Candidate must demonstrate leadership in distributed...</p>
        </div>
        <div className="mt-auto flex gap-2">
          <div className="w-2 h-2 rounded-full bg-lumina-teal animate-pulse" />
          <div className="text-[10px] text-lumina-teal uppercase font-bold tracking-widest">Keywords Extracted</div>
        </div>
      </div>
    )
  },
  {
    id: 'gap-analysis',
    title: 'See Every Gap Before the Recruiter Does',
    description: 'We map your profile directly against the target role, highlighting exactly where you fall short and where you exceed expectations.',
    visual: (
      <div className="grid grid-cols-2 gap-4 h-full w-full">
        <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-4 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase font-bold">Your Profile</p>
          <div className="space-y-3">
            <div className="h-2 w-full bg-lumina-teal/40 rounded-full" />
            <div className="h-2 w-3/4 bg-lumina-teal/40 rounded-full" />
            <div className="h-2 w-1/2 bg-red-500/40 rounded-full relative">
               <div className="absolute -right-2 -top-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-4 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase font-bold">Target Role</p>
          <div className="space-y-3">
            <div className="h-2 w-full bg-white/20 rounded-full" />
            <div className="h-2 w-full bg-white/20 rounded-full" />
            <div className="h-2 w-full bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'resume-tailor',
    title: 'Architect the Resume That Wins',
    description: 'Lumina rewrites your bullet points with precision-engineered verbs and metric-driven results that trigger ATS systems and impress hiring managers.',
    visual: (
      <div className="bg-white rounded-2xl p-8 h-full w-full shadow-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="text-2xl font-serif font-bold text-lumina-teal">94</div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-lumina-teal/5 border border-lumina-teal/20 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-lumina-teal" />
            <p className="text-xs font-mono text-lumina-navy">
              "Fine-tuned Llama-3 models resulting in <span className="font-bold">42% improvement</span> in inference speed."
            </p>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-2 w-5/6 bg-gray-100 rounded-full" />
        </div>
      </div>
    )
  },
  {
    id: 'market-insights',
    title: 'Know the Market Better Than Your Interviewer',
    description: 'Get real-time data on salary ranges, competitor trends, and seniority calibration for the specific role you are targeting.',
    visual: (
      <div className="bg-lumina-navy-dark rounded-2xl p-8 h-full w-full border border-white/5 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-[10px] text-white/40 uppercase font-bold">Market Average</p>
            <p className="text-2xl font-serif text-white">$165,000</p>
          </div>
          <div className="h-20 w-32 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path 
                d="M0,50 Q25,10 50,30 T100,0" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2" 
                className="animate-draw"
              />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-lumina-teal w-1/2" />
          </div>)}
        </div>
      </div>
    )
  }
];

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualsRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !visualsRef.current || !textRef.current) return;

    const sections = gsap.utils.toArray('.chapter-text');
    const visuals = gsap.utils.toArray('.chapter-visual');

    gsap.set(visuals, { opacity: 0, scale: 0.9, y: 50 });
    gsap.set(visuals[0], { opacity: 1, scale: 1, y: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 1,
        // markers: true,
      }
    });

    sections.forEach((section, i) => {
      if (i > 0) {
        tl.to(visuals[i-1], { opacity: 0, scale: 0.8, y: -50, duration: 1 }, i)
          .to(visuals[i], { opacity: 1, scale: 1, y: 0, duration: 1 }, i)
          .to(section as Element, { opacity: 1, duration: 1 }, i);
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className="bg-lumina-navy text-white min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-screen flex items-center gap-16">
        {/* Left: Dynamic Visuals */}
        <div className="flex-1 h-[500px] relative hidden lg:block">
          {chapters.map((chapter, i) => (
            <div 
              key={chapter.id} 
              className="chapter-visual absolute inset-0 flex items-center justify-center"
            >
              <div className="w-full h-full max-w-md max-h-md">
                {chapter.visual}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Chapter Content */}
        <div className="flex-1 space-y-32">
          {chapters.map((chapter, i) => (
            <div 
              key={chapter.id} 
              className={`chapter-text flex flex-col gap-6 ${i === 0 ? 'opacity-1' : 'opacity-20'}`}
            >
              <span className="text-lumina-teal font-display font-bold text-xs uppercase tracking-widest">Chapter {i + 1}</span>
              <h3 className="text-4xl md:text-5xl font-serif font-bold leading-tight">{chapter.title}</h3>
              <p className="text-lg text-white/60 font-body leading-relaxed max-w-md">
                {chapter.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
