import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ScannerView } from "@/components/ScannerView";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturedSection } from "@/components/FeaturedSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { ServicesSection } from "@/components/ServicesSection";
import { MasterVault } from "@/components/MasterVault";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dot-grid-bg grain-overlay font-sans text-foreground">
      <GlobalNavbar />

      {/* ── SECTION 1 — HERO ── */}
      <section className="min-h-screen relative flex flex-col overflow-hidden">
        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[5%] md:-translate-y-[10%]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2 mb-8 border border-border/40 hover:bg-background/40 transition-colors cursor-default group">
              <Sparkles size={14} className="text-accent-blue group-hover:rotate-12 transition-transform" />
              <span className="text-muted-foreground text-[10px] font-bold tracking-[0.25em] uppercase">The #1 ATS Optimization Engine</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl text-foreground tracking-[-0.06em] font-serif leading-[0.85] text-balance">
              Land in the <span className="italic text-accent-blue drop-shadow-[0_0_25px_rgba(var(--accent-blue-rgb),0.2)]">top 0.1%</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-8 leading-relaxed font-sans font-medium">
              Paste a job description. Upload your resume. Get your exact match score, skill gaps, and a winning playbook — in seconds.
            </p>

            {/* Dual CTA */}
            <div className="flex gap-4 mt-10 justify-center flex-wrap">
              <button
                onClick={() => document.querySelector("#scanner")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-accent-blue hover:opacity-90 text-white rounded-full px-10 py-5 text-base font-semibold flex items-center gap-2 transition-all shadow-xl shadow-accent-blue/20 group"
              >
                Analyze My JD Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="liquid-glass-refractive rounded-full px-10 py-5 text-foreground text-sm font-display font-bold transition-all hover:bg-white/60 active:scale-95">
                See a Sample Report
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-4 mt-12 flex-wrap">
              {[
                "50,000+ JDs Decoded",
                "94% Interview Rate",
                "ATS Bypass Playbook Included"
              ].map((stat, i) => (
                <div key={i} className="liquid-glass-refractive rounded-full px-6 py-3 text-muted-foreground text-[11px] font-display font-bold uppercase tracking-[0.15em] border-white/40">
                  {stat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2 — SCANNER (The "Working" Part) ── */}
      <section id="scanner" className="relative py-20 bg-background/30 backdrop-blur-sm border-y border-border/40">
        <div className="max-w-7xl mx-auto text-center mb-16 px-6">
          <h2 className="text-5xl md:text-7xl text-foreground tracking-[-0.05em] font-serif mb-6 leading-[0.95]">
            Ready to <em className="italic text-accent-blue">decode</em> your next role?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Our high-precision engine extracts the exact DNA of the job description to give you an unfair advantage.
          </p>
        </div>
        <ScannerView />
      </section>

      {/* ── SECTION 3 — MASTER VAULT (The Archive) ── */}
      <section id="master-vault" className="relative py-32 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-[10px] font-black uppercase tracking-[0.3em] mb-6">
               <ArrowRight size={10} /> Persistent Career Library
             </div>
             <h2 className="text-6xl md:text-8xl text-foreground tracking-[-0.05em] font-serif mb-8 leading-none">
               Your <em className="italic text-accent-blue">Master Vault</em>
             </h2>
             <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
               Sync your professional history once. Let our AI tailor your profile for every single opportunity, perfectly.
             </p>
          </div>
          
          <div className="p-1 rounded-[48px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-3xl">
             <div className="bg-background/80 backdrop-blur-3xl rounded-[44px] p-8 md:p-12 border border-white/5">
                <MasterVault />
             </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="features">
        <FeaturedSection />
      </div>
      <PhilosophySection />
      <ServicesSection />

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent-blue" />
            <span className="text-foreground font-bold">Lumina JD</span>
          </div>
          <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.3em]">
            Built for the modern career strategist
          </p>
          <div className="flex gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
