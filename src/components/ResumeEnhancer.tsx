import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Skill, Deduction, GeneratedResume, ResumeGapResult } from "@/types/jd";
import jsPDF from "jspdf";

interface ResumeEnhancerProps {
  resumeText: string;
  skills: Skill[];
  deductions?: Deduction[];
  jobTitle?: string;
  gapResult?: ResumeGapResult | null;
}

export const ResumeEnhancer = ({ resumeText, skills, deductions, jobTitle, gapResult }: ResumeEnhancerProps) => {
  // Version: 1.0.1 - Force build to resolve production ReferenceError
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      toast.error("Please upload your resume first in the Gap Analyzer above.");
      return;
    }
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: {
          resumeText,
          skills,
          deductions: deductions || gapResult?.deductions || [],
          jobTitle: jobTitle || "this position",
          gapSummary: gapResult?.summary || "",
        },
      });

      if (error) {
        console.error("Invoke Error:", error);
        throw new Error(`AI Engine Offline: ${error.message || "Connection timed out"}`);
      }
      
      if (!data) throw new Error("AI Engine returned no data.");
      
      if (data.error) {
        throw new Error(`AI Engine Error: ${data.error}`);
      }

      setResume({
        professional_summary: data.professional_summary || "",
        skills_section: data.skills_section || [],
        experience: data.experience || [],
        education: data.education || [],
        certifications: data.certifications || undefined,
      });
      setIsOpen(true);
      toast.success("ATS-optimized resume generated!");
    } catch (err: unknown) {
      console.error("Resume generation error:", err);
      toast.error("Tailoring engine failed", {
        description: err instanceof Error ? err.message : "The AI is currently under high load. Please try again in 30 seconds.",
        duration: 6000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    if (!resume) return;
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 20;
      let y = margin;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;

      const addText = (text: string, size: number, isBold = false, color: number[] = [0, 0, 0]) => {
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, contentWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
          pdf.text(line, margin, y);
          y += size * 0.35;
        });
        y += size * 0.02;
      };

      const addLine = () => {
        if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.setDrawColor(180, 180, 180);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 0.5;
      };

      addText("PROFESSIONAL SUMMARY", 12, true, [30, 30, 30]);
      addLine();
      addText(resume.professional_summary, 10);
      y += 0.5;

      addText("TECHNICAL SKILLS", 12, true, [30, 30, 30]);
      addLine();
      resume.skills_section.forEach(skill => { addText(skill, 10); });
      y += 0.5;

      addText("EXPERIENCE & PROJECTS", 12, true, [30, 30, 30]);
      addLine();
      resume.experience.forEach(exp => {
        addText(exp.heading, 10.5, true);
        if (exp.content) addText(exp.content, 9.5, false, [70, 70, 70]);
        exp.bullets?.forEach(bullet => { addText(`•  ${bullet}`, 9.5); });
        y += 0.2;
      });

      if (resume.education.length > 0) {
        addText("EDUCATION", 12, true, [30, 30, 30]);
        addLine();
        resume.education.forEach(edu => { addText(edu, 10); });
      }

      if (resume.certifications?.length) {
        y += 1.0;
        addText("CERTIFICATIONS", 12, true, [30, 30, 30]);
        addLine();
        resume.certifications.forEach(cert => { addText(cert, 10); });
      }

      pdf.save(`ATS-Resume-${(jobTitle || "Optimized").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      toast.success("ATS Resume PDF downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    }
  };

  const copyFullResume = () => {
    if (!resume) return;
    let full = `PROFESSIONAL SUMMARY\n${resume.professional_summary}\n\nTECHNICAL SKILLS\n${resume.skills_section.join("\n")}\n\nEXPERIENCE & PROJECTS\n`;
    resume.experience.forEach(exp => {
      full += `${exp.heading}\n`;
      if (exp.content) full += `${exp.content}\n`;
      exp.bullets?.forEach(b => { full += `• ${b}\n`; });
      full += "\n";
    });
    full += `EDUCATION\n${resume.education.join("\n")}`;
    if (resume.certifications?.length) {
      full += `\n\nCERTIFICATIONS\n${resume.certifications.join("\n")}`;
    }
    navigator.clipboard.writeText(full);
    toast.success("Full resume copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="premium-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between flex-wrap gap-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 flex items-center justify-center border border-accent-emerald/10">
            <Wand2 className="w-6 h-6 text-accent-emerald" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl text-foreground tracking-tight leading-none mb-1.5">
              AI Resume Enhancer
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium font-sans">Optimizing uploaded resume for this JD</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98, y: 0 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="relative overflow-hidden flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold bg-accent-emerald text-white hover:bg-accent-emerald/90 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enhancing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Enhance Uploaded Resume</>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && resume && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-10 border-t border-border/40 pt-10"
          >
            <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="font-display font-bold text-[10px] uppercase tracking-[0.25em] text-accent-emerald leading-none">Enhancement Preview</span>
                <span className="text-[11px] text-muted-foreground/70 font-mono font-bold uppercase tracking-tighter">Enterprise Standard Optimization</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyFullResume}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold bg-muted/30 text-muted-foreground border border-border/40 hover:bg-muted/50 transition-all uppercase tracking-widest">
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </motion.button>
                <motion.button whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 1, y: 0 }} onClick={handleDownloadPDF}
                  className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold bg-accent-emerald text-white hover:bg-accent-emerald/90 transition-all uppercase tracking-widest">
                  <Download className="w-4 h-4" /> Download PDF
                </motion.button>
                <button onClick={() => setIsOpen(false)} className="p-3 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all border border-transparent hover:border-border/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-background/40 border border-border/40 rounded-3xl p-6 sm:p-12 space-y-12 max-h-[750px] overflow-y-auto custom-scrollbar">
              {/* Professional Summary */}
              <div className="relative group/section">
                <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-3">
                  <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Professional Summary</h4>
                  <button onClick={() => handleCopy(resume.professional_summary)} className="opacity-0 group-hover/section:opacity-100 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-all border border-accent-blue/20 uppercase tracking-widest">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <p className="text-[14.5px] text-foreground/80 leading-[1.7] font-medium">{resume.professional_summary}</p>
              </div>

              {/* Technical Skills */}
              <div className="group/section">
                <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-3">
                  <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Technical Skills</h4>
                  <button onClick={() => handleCopy(resume.skills_section.join("\n"))} className="opacity-0 group-hover/section:opacity-100 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-all border border-accent-blue/20 uppercase tracking-widest">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {resume.skills_section.map((skill, i) => (
                    <span key={i} className="px-3.5 py-2 bg-muted/20 border border-border/30 rounded-xl text-xs font-bold text-foreground/80 tracking-tight">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Experience & Projects */}
              <div className="group/section">
                <div className="flex items-center justify-between mb-8 border-b border-border/10 pb-3">
                  <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Experience & Projects</h4>
                  <button onClick={() => {
                    let expText = "";
                    resume.experience.forEach(exp => {
                      expText += `${exp.heading}\n`;
                      if (exp.content) expText += `${exp.content}\n`;
                      exp.bullets?.forEach(b => { expText += `• ${b}\n`; });
                      expText += "\n";
                    });
                    handleCopy(expText);
                  }} className="opacity-0 group-hover/section:opacity-100 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-all border border-accent-blue/20 uppercase tracking-widest">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="space-y-10">
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-accent-emerald/20">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-accent-emerald" />
                      <h5 className="text-[15px] font-display font-bold text-foreground tracking-tight mb-1.5">{exp.heading}</h5>
                      {exp.content && <p className="text-[10px] text-muted-foreground/70 font-mono font-bold tracking-[0.1em] uppercase mb-4">{exp.content}</p>}
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="space-y-3.5 mt-3">
                          {exp.bullets.map((bullet, j) => (
                            <li key={j} className="text-[13.5px] text-foreground flex gap-3.5 leading-[1.6]">
                              <span className="text-accent-emerald/40 mt-2 w-1.5 h-[1px] bg-current shrink-0" />
                              <span className="font-medium">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              {resume.education.length > 0 && (
                <div className="group/section">
                  <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-3">
                    <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Education</h4>
                    <button onClick={() => handleCopy(resume.education.join("\n"))} className="opacity-0 group-hover/section:opacity-100 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-all border border-accent-blue/20 uppercase tracking-widest">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <div className="space-y-3">
                    {resume.education.map((edu, i) => (
                      <p key={i} className="text-[14px] text-foreground/80 font-bold tracking-tight">{edu}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <div className="group/section">
                  <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-3">
                    <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Certifications</h4>
                    <button onClick={() => handleCopy(resume.certifications!.join("\n"))} className="opacity-0 group-hover/section:opacity-100 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-all border border-accent-blue/20 uppercase tracking-widest">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <div className="space-y-3">
                    {resume.certifications.map((cert, i) => (
                      <p key={i} className="text-[14px] text-foreground/80 font-bold tracking-tight">{cert}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
