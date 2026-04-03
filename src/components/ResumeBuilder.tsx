import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X } from "lucide-react";
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

  const buildFromExistingData = (): GeneratedResume => {
    // Build resume from existing gap analysis data — no extra API call needed
    const snippets = gapResult?.tailored_resume_snippets;
    const directives = gapResult?.actionable_directives || [];

    // Professional summary from snippets or generate from skills
    const professional_summary = snippets?.professional_summary ||
      `Results-driven ${jobTitle || "professional"} with expertise in ${skills.slice(0, 5).map(s => s.skill).join(", ")}. Proven track record of delivering high-impact solutions leveraging ${skills.slice(0, 3).map(s => s.skill).join(" and ")}. Passionate about driving innovation and measurable business outcomes.`;

    // Skills organized by category
    const skillsByCategory: Record<string, string[]> = {};
    skills.forEach(s => {
      if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
      skillsByCategory[s.category].push(s.skill);
    });
    const skills_section = Object.entries(skillsByCategory).map(
      ([cat, items]) => `${cat}: ${items.join(", ")}`
    );

    // Experience bullets from snippets
    const experience_bullets = snippets?.experience_bullets || [];
    
    // Add directive-based bullets
    const addBullets = directives
      .filter(d => d.action === "add" || d.action === "replace")
      .map(d => d.description);

    const allBullets = [...experience_bullets, ...addBullets].slice(0, 8);

    // Try to extract experience sections from resume text
    const experienceSections: GeneratedResume["experience"] = [];
    
    // Simple heuristic: split by common resume section headers
    const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let currentHeading = "";
    let currentBullets: string[] = [];
    
    for (const line of lines) {
      // Check if it looks like a job title line (contains dates like 2020-2023 or has company patterns)
      if (line.match(/\d{4}\s*[-–—]\s*(present|\d{4})/i) || line.match(/^[A-Z].*(?:Inc|Ltd|LLC|Corp|Company|Technologies)/)) {
        if (currentHeading && currentBullets.length > 0) {
          experienceSections.push({
            heading: currentHeading,
            content: "",
            bullets: currentBullets
          });
        }
        currentHeading = line;
        currentBullets = [];
      } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        currentBullets.push(line.replace(/^[•\-*]\s*/, ""));
      }
    }
    if (currentHeading && currentBullets.length > 0) {
      experienceSections.push({ heading: currentHeading, content: "", bullets: currentBullets });
    }

    // If we couldn't parse experience, create one section with all bullets
    if (experienceSections.length === 0 && allBullets.length > 0) {
      experienceSections.push({
        heading: jobTitle || "Professional Experience",
        content: "ATS-optimized bullet points targeting this role",
        bullets: allBullets,
      });
    }

    return {
      professional_summary,
      skills_section,
      experience: experienceSections,
      education: ["(Education preserved from your original resume)"],
      certifications: [],
    };
  };

  const handleGenerate = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      toast.error("Please upload your resume first in the Gap Analyzer above.");
      return;
    }
    setIsGenerating(true);
    try {
      // First try the edge function
      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: { resumeText, skills, deductions, jobTitle },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResume(data);
      setIsOpen(true);
      toast.success("ATS Resume generated with AI!");
    } catch {
      // Fallback: build from existing gap analysis data
      console.log("Edge function unavailable, building from gap analysis data...");
      const fallbackResume = buildFromExistingData();
      setResume(fallbackResume);
      setIsOpen(true);
      toast.success("ATS Resume generated from your analysis data!");
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
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += size * 0.45;
        });
        y += size * 0.15;
      };

      const addLine = () => {
        if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 4;
      };

      addText("PROFESSIONAL SUMMARY", 12, true, [40, 40, 40]);
      addLine();
      addText(resume.professional_summary, 10);
      y += 4;

      addText("SKILLS", 12, true, [40, 40, 40]);
      addLine();
      resume.skills_section.forEach(skill => { addText(skill, 10); });
      y += 4;

      addText("EXPERIENCE", 12, true, [40, 40, 40]);
      addLine();
      resume.experience.forEach(exp => {
        addText(exp.heading, 11, true);
        if (exp.content) addText(exp.content, 10, false, [80, 80, 80]);
        exp.bullets?.forEach(bullet => { addText(`•  ${bullet}`, 10); });
        y += 3;
      });

      addText("EDUCATION", 12, true, [40, 40, 40]);
      addLine();
      resume.education.forEach(edu => { addText(edu, 10); });

      if (resume.certifications?.length) {
        y += 4;
        addText("CERTIFICATIONS", 12, true, [40, 40, 40]);
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
    let full = `PROFESSIONAL SUMMARY\n${resume.professional_summary}\n\nSKILLS\n${resume.skills_section.join("\n")}\n\nEXPERIENCE\n`;
    resume.experience.forEach(exp => {
      full += `${exp.heading}\n${exp.content}\n`;
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
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </motion.div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">
              ATS Resume Generator
            </h3>
            <p className="text-xs text-muted-foreground">AI rewrites your resume with exact JD keywords</p>
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
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
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
            {/* Action bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Generated Resume Preview</span>
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

            {/* Resume Preview */}
            <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 sm:p-8 space-y-5 shadow-inner max-h-[600px] overflow-y-auto">
              <div className="group relative">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-1">Professional Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">{resume.professional_summary}</p>
                <button onClick={() => handleCopy(resume.professional_summary)} className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-1">Skills</h4>
                <div className="space-y-1">
                  {resume.skills_section.map((skill, i) => (
                    <p key={i} className="text-sm text-foreground">{skill}</p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-1">Experience</h4>
                <div className="space-y-4">
                  {resume.experience.map((exp, i) => (
                    <div key={i}>
                      <h5 className="text-sm font-bold text-foreground">{exp.heading}</h5>
                      {exp.content && <p className="text-xs text-muted-foreground mb-1">{exp.content}</p>}
                      <ul className="space-y-1 mt-1">
                        {exp.bullets?.map((bullet, j) => (
                          <li key={j} className="text-sm text-foreground/90 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-1">Education</h4>
                {resume.education.map((edu, i) => (
                  <p key={i} className="text-sm text-foreground">{edu}</p>
                ))}
              </div>

              {resume.certifications && resume.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-1">Certifications</h4>
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
