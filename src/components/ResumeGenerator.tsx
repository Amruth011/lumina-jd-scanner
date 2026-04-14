import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2, FileText, CheckCircle2, AlertCircle, ArrowRight, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Skill, VaultItem, UserProfileWithVault, GeneratedResume } from "@/types/jd";
import jsPDF from "jspdf";

interface ResumeGeneratorProps {
  jdTitle: string;
  jdSkills: Skill[];
  companyName?: string;
}

export const ResumeGenerator = ({ jdTitle, jdSkills, companyName }: ResumeGeneratorProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);

  useEffect(() => {
    if (user) {
      loadVault();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadVault = async () => {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
    const { data: vaultData } = await supabase.from("master_vault").select("*").eq("user_id", user?.id);
    setProfile(profileData as UserProfileWithVault);
    setVaultItems(vaultData as VaultItem[] || []);
  };

  const handleGenerate = async () => {
    if (vaultItems.length === 0) {
      toast.error("Your Master Vault is empty! Sync your resume in the Vault tab first.");
      return;
    }
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("tailor-resume", {
        body: {
          jd_title: jdTitle,
          jd_skills: jdSkills,
          company_name: companyName || "this company",
          vault_items: vaultItems,
          personal_info: profile,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResume(data as GeneratedResume);
      setIsOpen(true);
      toast.success("Silicon Valley Modern resume generated!");
    } catch (err) {
      console.error(err);
      toast.error("Tailoring engine failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!resume) return;
    try {
      // SILICON VALLEY MODERN: High-legibility Sans-Serif (Helvetica/Arial)
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 15;
      let y = margin;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;

      const addText = (text: string, size: number, isBold = false, color: number[] = [0, 0, 0], align: "left" | "center" = "left") => {
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, contentWidth);
        lines.forEach((line: string) => {
          if (y > 280) { pdf.addPage(); y = margin; }
          const xPos = align === "center" ? (pageWidth - pdf.getTextWidth(line)) / 2 : margin;
          pdf.text(line, xPos, y);
          y += size * 0.4;
        });
        y += size * 0.1;
      };

      // Header: Ultra-clean center aligned
      addText(profile?.full_name?.toUpperCase() || "CANDIDATE NAME", 18, true, [0, 0, 0], "center");
      y += 2;
      const contactInfo = [
        profile?.email,
        profile?.phone,
        profile?.location,
      ].filter(Boolean).join("  •  ");
      addText(contactInfo, 8.5, false, [80, 80, 80], "center");
      
      const links = [
        profile?.linkedin_url?.replace(/^https?:\/\//, ''),
        profile?.github_url?.replace(/^https?:\/\//, ''),
        profile?.website_url?.replace(/^https?:\/\//, '')
      ].filter(Boolean).join("  |  ");
      if (links) {
        y += 1;
        addText(links, 8.5, false, [0, 102, 204], "center");
      }
      y += 6;

      // Summary
      addText("PROFESSIONAL SUMMARY", 10, true, [0, 0, 0]);
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 4;
      addText(resume.professional_summary, 9.5, false, [40, 40, 40]);
      y += 4;

      // Skills: Modern Pill style simulated
      addText("CORE COMPETENCIES", 10, true, [0, 0, 0]);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 4;
      addText(resume.skills_section.join("  •  "), 9, false, [40, 40, 40]);
      y += 5;

      // Experience: The meat of the resume
      addText("EXPERIENCE", 10, true, [0, 0, 0]);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 4;
      resume.experience.forEach(exp => {
        const [title, company] = exp.heading.split('@');
        addText(title?.trim() || "", 10, true, [0, 0, 0]);
        y -= 3.5;
        // Right align company/period if needed, or keeping it clean single column
        addText(company?.trim() || "Organization", 9.5, true, [80, 80, 80]);
        if (exp.content) {
          addText(exp.content, 8.5, false, [100, 100, 100]);
        }
        y += 1;
        exp.bullets?.forEach(bullet => {
          // Identify numbers/percentages for bolding? jsPDF doesn't support rich text inline easily
          // We'll keep bullets clean and precise
          addText(`•  ${bullet}`, 9.2, false, [40, 40, 40]);
        });
        y += 4;
      });

      // Education
      if (resume.education.length > 0) {
        addText("EDUCATION", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 4;
        resume.education.forEach(edu => addText(edu, 9.5, false, [40, 40, 40]));
        y += 4;
      }

      // Certifications
      if (resume.certifications && resume.certifications.length > 0) {
        addText("CERTIFICATIONS", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 4;
        resume.certifications.forEach(cert => addText(cert, 9.5, false, [40, 40, 40]));
      }

      pdf.save(`Lumina-AI-Resume-${profile?.full_name?.replace(/ /g, "_")}.pdf`);
      toast.success("Silicon Valley Modern PDF Exported!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to render Premium PDF.");
    }
  };

  return (
    <div className="premium-card p-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Sparkles className="w-64 h-64 rotate-12" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="space-y-4 text-center xl:text-left">
          <div className="flex items-center justify-center xl:justify-start gap-4">
            <div className="w-12 h-12 rounded-[20px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold">Resonating Resume Generator</h3>
          </div>
          <p className="text-base text-muted-foreground max-w-xl">
            Our <span className="text-foreground font-semibold">Silicon Valley Modern</span> engine crafts a high-impact, ATS-optimized resume using only your most relevant experiences.
          </p>
          <div className="flex flex-wrap justify-center xl:justify-start gap-3 pt-2">
            {[
              "Metric-First bullets",
              "ATS-Gold Template",
              "Keyword Infusion"
            ].map((feature, i) => (
              <div key={feature} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary italic lowercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="relative overflow-hidden group/btn flex items-center gap-4 px-12 py-6 rounded-[32px] text-base font-bold bg-foreground text-background hover:scale-105 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] active:scale-95 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover/btn:opacity-20 transition-opacity" />
          {isGenerating ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Distilling Success...</>
          ) : (
            <><Sparkles className="w-6 h-6" /> Generate Tailored Resume</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && resume && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mt-16 pt-16 border-t border-white/5 space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-center bg-muted/20 backdrop-blur-md p-8 rounded-[40px] border border-white/5 gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Optimized for humans & bots</span>
                </div>
                <p className="text-lg text-foreground/90 font-bold">Generation Complete. Previewing your 0.1% candidacy.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-foreground text-background text-sm font-bold transition-all hover:shadow-2xl hover:shadow-foreground/20 active:scale-95"
                >
                  <Download className="w-5 h-5" /> Export Modern PDF
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-4 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SIDE-BY-SIDE PREVIEW SIMULATION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
              {/* SOURCE VAULT DATA (Brief) */}
              <div className="bg-muted/10 rounded-[40px] p-8 border border-white/5 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <ArchiveBox className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected From Vault</span>
                </div>
                <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  {vaultItems.filter(v => v.type === 'professional').slice(0, 3).map((v, i) => (
                    <div key={i} className="space-y-2">
                       <h5 className="font-bold text-xs uppercase">{v.title} at {v.organization}</h5>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2">"{v.description}"</p>
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-primary/5 border border-dashed border-primary/20 text-center text-[10px] text-primary/60 font-medium">
                    + Tailoring engine distilling more accomplishments...
                  </div>
                </div>
              </div>

              {/* TAILORED RESULT PREVIEW (Silicon Valley Modern) */}
              <div className="bg-background rounded-[40px] p-10 border border-white/10 shadow-3xl overflow-y-auto custom-scrollbar flex flex-col gap-8">
                {/* Visual Resume Simulation */}
                <div className="text-center space-y-2 mb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-tight">{profile?.full_name}</h1>
                   <div className="flex justify-center gap-3 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                     <span>{profile?.location}</span>
                     <span>•</span>
                     <span>{profile?.email}</span>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] border-b border-white/5 pb-1">Professional Summary</h4>
                    <p className="text-[12px] leading-relaxed text-foreground/80">{resume.professional_summary}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] border-b border-white/5 pb-1">Experience</h4>
                    <div className="space-y-8">
                      {resume.experience.map((exp, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex justify-between items-baseline">
                            <h5 className="font-bold text-sm tracking-tight">{exp.heading}</h5>
                          </div>
                          <ul className="space-y-2.5">
                            {exp.bullets?.map((bullet, j) => (
                              <li key={j} className="text-[12px] text-foreground/70 flex gap-4">
                                <span className="text-primary mt-2 w-1.5 h-1.5 rounded-full bg-current shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                <span className="leading-relaxed">
                                  {/* Visual highlight for numbers to show the Quantifier Engine worked */}
                                  {bullet.split(/(\d+%?)/).map((part, k) => 
                                    /(\d+%?)/.test(part) ? <span key={k} className="text-foreground font-black underline decoration-primary/30 decoration-2 underline-offset-2">{part}</span> : part
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple Icon fallback if Box is missing
const ArchiveBox = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

