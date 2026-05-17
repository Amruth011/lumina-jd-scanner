"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from "@/lib/gsap";



const chapters = [
  {
    id: 'jd-decoder',
    title: 'Decode Every Hidden Requirement',
    description: 'Our neural analysis engine scans the JD to surface implicit keywords, mission-critical skills, and cultural signals that typical scanners miss.',
    visual: (
      <div className="bg-white rounded-2xl p-8 font-mono text-sm border border-border/20 shadow-sm w-full h-full flex flex-col gap-4">
        <div className="text-lumina-navy/40 border-b border-lumina-navy/10 pb-4">scanning_job_description.raw</div>
        <div className="space-y-2">
          <p className="text-lumina-navy/80">"Seeking a <span className="bg-lumina-teal/20 text-lumina-teal rounded px-1">Senior AI Engineer</span> with experience in <span className="bg-lumina-teal/20 text-lumina-teal rounded px-1">RAG systems</span> and <span className="bg-lumina-teal/20 text-lumina-teal rounded px-1">LLM orchestration</span>..."</p>
          <p className="text-lumina-navy/30">Candidate must demonstrate leadership in distributed...</p>
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
      <div className="bg-white rounded-2xl p-6 h-full w-full border border-border/20 shadow-sm flex flex-col gap-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-lumina-navy/50 font-bold uppercase tracking-widest">Skill Gaps Detected</span>
          </div>
          <span className="text-xs font-mono text-lumina-teal bg-lumina-teal/10 px-2 py-1 rounded">Match: 64%</span>
        </div>
        
        <div className="space-y-3">
          {/* Missing Skill */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-red-400/20 bg-red-400/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-red-400/10 flex items-center justify-center text-red-400 font-bold text-xs">!</div>
              <div className="text-sm font-medium text-lumina-navy">System Design</div>
            </div>
            <div className="text-[10px] text-red-400 font-medium whitespace-nowrap hidden sm:block">Missing from Profile</div>
          </div>
          
          {/* Matching Skill */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-lumina-teal/20 bg-lumina-teal/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-lumina-teal/10 flex items-center justify-center text-lumina-teal font-bold text-xs">✓</div>
              <div className="text-sm font-medium text-lumina-navy">React & Next.js</div>
            </div>
            <div className="text-[10px] text-lumina-teal font-medium hidden sm:block">Verified</div>
          </div>

          {/* Missing Skill */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-red-400/20 bg-red-400/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-red-400/10 flex items-center justify-center text-red-400 font-bold text-xs">!</div>
              <div className="text-sm font-medium text-lumina-navy">GraphQL</div>
            </div>
            <div className="text-[10px] text-red-400 font-medium whitespace-nowrap hidden sm:block">Missing from Profile</div>
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
      <div className="bg-white rounded-2xl p-6 h-full w-full border border-border/20 shadow-sm flex flex-col gap-4 relative overflow-hidden">
        
        {/* Before */}
        <div className="space-y-2 opacity-60">
          <div className="text-[10px] text-lumina-navy/40 font-bold uppercase tracking-widest">Before</div>
          <div className="p-3 bg-slate-50 border border-border/10 rounded-lg">
            <p className="text-xs font-body text-lumina-navy/60 line-through decoration-red-400/50">
              Worked on a database migration project that made things faster.
            </p>
          </div>
        </div>

        {/* Arrow/Divider */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-lumina-teal text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
             ↓
          </div>
        </div>

        {/* After */}
        <div className="space-y-2 relative pt-2">
          <div className="absolute -inset-2 bg-lumina-teal/5 rounded-xl blur-md -z-10" />
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-lumina-teal font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lumina-teal animate-pulse" />
              Lumina AI Tailored
            </div>
          </div>
          <div className="p-4 bg-white border border-lumina-teal/30 rounded-lg shadow-sm">
            <p className="text-sm font-body text-lumina-navy leading-relaxed">
              Spearheaded migration of <span className="text-lumina-teal font-semibold">10TB+ PostgreSQL databases</span> with zero downtime, reducing average query latency by <span className="text-lumina-teal font-semibold">45%</span> and saving <span className="text-lumina-teal font-semibold">$12k/mo</span>.
            </p>
          </div>
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
    if (!containerRef.current || !visualsRef.current) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.chapter-text') as HTMLElement[];
      const visuals = gsap.utils.toArray('.chapter-visual') as HTMLElement[];

      // Initial state
      gsap.set(visuals, { opacity: 0, scale: 0.9, y: 50 });
      gsap.set(visuals[0], { opacity: 1, scale: 1, y: 0 });

      sections.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            visuals.forEach((v, idx) => {
              if (idx === i) gsap.to(v, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true });
              else gsap.to(v, { opacity: 0, scale: 0.9, y: -20, duration: 0.4, overwrite: true });
            });
          },
          onEnterBack: () => {
            visuals.forEach((v, idx) => {
              if (idx === i) gsap.to(v, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true });
              else gsap.to(v, { opacity: 0, scale: 0.9, y: 20, duration: 0.4, overwrite: true });
            });
          }
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section id="how-it-works" ref={containerRef} className="bg-background text-lumina-navy relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-start gap-16">
        
        {/* Left: Dynamic Visuals (Sticky on Desktop) */}
        <div ref={visualsRef} className="w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen flex items-center justify-center hidden lg:flex">
          <div className="w-full max-w-md aspect-square relative">
            {chapters.map((chapter, i) => (
              <div 
                key={`visual-${chapter.id}`} 
                className="chapter-visual absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full">
                  {chapter.visual}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chapter Content (Scrolling) */}
        <div className="w-full lg:w-1/2 py-20 lg:py-[15vh]">
          {chapters.map((chapter, i) => (
            <div 
              key={`text-${chapter.id}`} 
              className="chapter-text min-h-[50vh] lg:min-h-[85vh] flex flex-col justify-center gap-6"
            >
              <div className="space-y-6">
                <span className="inline-block text-lumina-teal font-display font-bold text-xs uppercase tracking-widest bg-lumina-teal/10 px-3 py-1 rounded-full w-fit">Chapter {i + 1}</span>
                <h3 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-lumina-navy">{chapter.title}</h3>
                <p className="text-lg text-lumina-navy/50 font-body leading-relaxed max-w-md">
                  {chapter.description}
                </p>
              </div>

              {/* Mobile Visual Inline */}
              <div className="block lg:hidden mt-8 w-full">
                {chapter.visual}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
