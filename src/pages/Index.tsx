import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ScannerView } from "@/components/ScannerView";

export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("decode");

  const scrollToScanner = (tab?: Tab) => {
    // Migration: ensure legacy 'vault' tab key maps to 'profile'
    const cleanTab = tab === ("vault" as string) ? "profile" : tab;
    if (cleanTab) setActiveTab(cleanTab as Tab);
    document.querySelector("#scanner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background dot-grid-bg grain-overlay font-sans text-foreground">
      <GlobalNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── SECTION 1 — HERO ── */}
      <section className="min-h-[70vh] relative flex flex-col overflow-hidden">
        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
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
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2 — SCANNER (The Total Tactical Hub) ── */}
      <section id="scanner" className="relative py-12 bg-background/30 backdrop-blur-sm border-t border-border/40 min-h-screen">
        <ScannerView activeTab={activeTab} onTabChange={setActiveTab} />
      </section>

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
