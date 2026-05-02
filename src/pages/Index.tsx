import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { LuminaLogo } from "@/components/LuminaLogo";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ScannerView } from "@/components/ScannerView";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("decode");
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToScanner = (tab?: Tab) => {
    // Migration: ensure legacy 'vault' tab key maps to 'profile'
    const cleanTab = tab === ("vault" as string) ? "profile" : tab;
    if (cleanTab) setActiveTab(cleanTab as Tab);
    document.querySelector("#scanner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
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
            <div className="rounded-full px-4 py-1.5 flex items-center gap-2 mb-8 border border-border/40 hover:bg-background/40 transition-colors cursor-default group">
              <LuminaLogo size={18} className="object-contain group-hover:rotate-12 transition-transform" />
              <span className="text-muted-foreground text-[10px] font-bold tracking-[0.25em] uppercase">The #1 ATS Optimization Engine</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl text-foreground tracking-[-0.06em] font-serif leading-[0.85] text-balance">
              Land in the <span className="italic text-accent-emerald">top 0.1%</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-8 leading-relaxed font-sans font-medium">
              Paste a job description. Upload your resume. Get your exact match score, skill gaps, and a winning playbook — in seconds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
              {user ? (
                <button 
                  onClick={() => scrollToScanner("decode")}
                  className="group relative px-10 py-5 bg-foreground text-background rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-foreground/20 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Deploy Engine <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ) : (
                <Link 
                  to="/auth"
                  className="group relative px-10 py-5 bg-foreground text-background rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-foreground/20 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Start Decoding Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
              
              <div className="flex items-center gap-6 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                        <span className="text-[8px] font-bold">U{i}</span>
                      </div>
                    ))}
                 </div>
                 <div className="flex flex-col items-start leading-none gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">1,240+ Scientists</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Already Deployed</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2 — SCANNER (The Total Tactical Hub) ── */}
      <section id="scanner" className="relative py-12 bg-background/30 backdrop-blur-sm min-h-fit overflow-hidden">
        {user ? (
          <ScannerView activeTab={activeTab} onTabChange={setActiveTab} />
        ) : (
          <div className="max-w-5xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-white/10 overflow-hidden"
            >
              <div className="relative bg-slate-950/40 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-16 overflow-hidden border border-white/5">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-accent-blue/10 blur-[70px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />
                
                <div className="flex flex-col items-center text-center space-y-10 max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-2xl scale-110">
                    <Lock size={24} />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-serif italic text-white tracking-tight">
                      Intelligence Signal Restricted
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto">
                      Our Total Intelligence Engine is reserved for authenticated strategists. 
                      Sign in to unlock these 3 essential career services.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full pt-4">
                    {[
                      { icon: BrainCircuit, label: "JD Decoder", desc: "Extract hidden metrics and skills" },
                      { icon: ShieldCheck, label: "Gap Analysis", desc: "Deep gap analysis for your target role" },
                      { icon: Sparkles, label: "Resume Tailor", desc: "Blueprint creation as per the JD" }
                    ].map((feature, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 flex flex-col items-center group hover:bg-white/10 transition-colors">
                         <feature.icon className="w-6 h-6 text-primary" />
                         <div className="space-y-1">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{feature.label}</h4>
                           <p className="text-[9px] text-muted-foreground leading-tight">{feature.desc}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <Link 
                      to="/auth"
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-accent-emerald text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent-emerald/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Sign In to Deploy <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <LuminaLogo size={32} className="object-contain" />
            <span className="text-foreground font-display font-black text-xl">Lumina</span>
          </div>
          <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.4em]">
            Built for the modern career strategist
          </p>
          <div className="flex gap-12 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
