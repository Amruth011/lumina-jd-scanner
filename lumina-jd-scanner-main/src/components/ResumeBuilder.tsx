import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Skill, Deduction, GeneratedResume, ResumeGapResult } from "@/types/jd";
import jsPDF from "jspdf";

interface ResumeBuilderProps {
  resumeText: string;
  skills: Skill[];
  deductions?: Deduction[];
  jobTitle?: string;
  gapResult?: ResumeGapResult | null;
}

export const ResumeBuilder = ({ resumeText, skills, deductions, jobTitle, gapResult }: ResumeBuilderProps) => {
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

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResume({
        professional_summary: data.professional_summary || "",
        skills_section: data.skills_section || [],
        experience: data.experience || [],
        education: data.education || [],
        certifications: data.certifications || undefined,
      });
      setIsOpen(true);
      toast.success("ATS-optimized resume generated!");
    } catch (err: any) {
      console.error("Resume generation error:", err);
      toast.error(err.message || "Failed to generate resume. Please try again.");
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
          y += size * 0.45;
        });
        y += size * 0.15;
      };

      const addLine = () => {
        if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.setDrawColor(180, 180, 180);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 4;
      };

      addText("PROFESSIONAL SUMMARY", 12, true, [30, 30, 30]);
      addLine();
      addText(resume.professional_summary, 10);
      y += 3;

      addText("TECHNICAL SKILLS", 12, true, [30, 30, 30]);
      addLine();
      resume.skills_section.forEach(skill => { addText(skill, 10); });
      y += 3;

      addText("EXPERIENCE & PROJECTS", 12, true, [30, 30, 30]);
      addLine();
      resume.experience.forEach(exp => {
        addText(exp.heading, 10.5, true);
        if (exp.content) addText(exp.content, 9.5, false, [70, 70, 70]);
        exp.bullets?.forEach(bullet => { addText(`•  ${bullet}`, 9.5); });
        y += 2;
      });

      if (resume.education.length > 0) {
        addText("EDUCATION", 12, true, [30, 30, 30]);
        addLine();
        resume.education.forEach(edu => { addText(edu, 10); });
      }

      if (resume.certifications?.length) {
        y += 3;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 10 }} className="p-2 rounded-lg bg-emerald-500/10">
            <Wand2 className="w-5 h-5 text-emerald-500" />
          </motion.div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">AI Resume Generator</h3>
            <p className="text-xs text-muted-foreground">AI rewrites your resume with JD keywords — preserves your real experience</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-md"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> AI Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate ATS Resume</>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && resume && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Resume — AI Optimized for ATS</span>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyFullResume}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                  <Copy className="w-3 h-3" /> Copy All
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                  <Download className="w-3 h-3" /> Download PDF
                </motion.button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 sm:p-8 space-y-5 shadow-inner max-h-[600px] overflow-y-auto">
              {/* Professional Summary */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2 border-b border-border pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Professional Summary</h4>
                  <button onClick={() => handleCopy(resume.professional_summary)} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{resume.professional_summary}</p>
              </div>

              {/* Technical Skills */}
              <div>
                <div className="flex items-center justify-between mb-2 border-b border-border pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Technical Skills</h4>
                  <button onClick={() => handleCopy(resume.skills_section.join("\n"))} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="space-y-1">
                  {resume.skills_section.map((skill, i) => (
                    <p key={i} className="text-sm text-foreground">{skill}</p>
                  ))}
                </div>
              </div>

              {/* Experience & Projects */}
              <div>
                <div className="flex items-center justify-between mb-2 border-b border-border pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Experience & Projects</h4>
                  <button onClick={() => {
                    let expText = "";
                    resume.experience.forEach(exp => {
                      expText += `${exp.heading}\n`;
                      if (exp.content) expText += `${exp.content}\n`;
                      exp.bullets?.forEach(b => { expText += `• ${b}\n`; });
                      expText += "\n";
                    });
                    handleCopy(expText);
                  }} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="space-y-4">
                  {resume.experience.map((exp, i) => (
                    <div key={i}>
                      <h5 className="text-sm font-bold text-foreground">{exp.heading}</h5>
                      {exp.content && <p className="text-xs text-muted-foreground mt-0.5">{exp.content}</p>}
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {exp.bullets.map((bullet, j) => (
                            <li key={j} className="text-sm text-foreground flex gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{bullet}</span>
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
                <div>
                  <div className="flex items-center justify-between mb-2 border-b border-border pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Education</h4>
                    <button onClick={() => handleCopy(resume.education.join("\n"))} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  {resume.education.map((edu, i) => (
                    <p key={i} className="text-sm text-foreground">{edu}</p>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 border-b border-border pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Certifications</h4>
                    <button onClick={() => handleCopy(resume.certifications!.join("\n"))} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  {resume.certifications.map((cert, i) => (
                    <p key={i} className="text-sm text-foreground">{cert}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
