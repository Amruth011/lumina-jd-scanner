import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X } from "lucide-react";
import { toast } from "sonner";
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

  const buildFromResumeData = (): GeneratedResume => {
    const snippets = gapResult?.tailored_resume_snippets;
    const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    // ── 1. Professional Summary: Use AI snippet if available, otherwise extract from resume ──
    let professional_summary = snippets?.professional_summary || "";
    if (!professional_summary) {
      // Try to extract existing summary from resume
      let inSummary = false;
      const summaryLines: string[] = [];
      for (const line of lines) {
        if (/^(professional\s+summary|summary|objective|profile)/i.test(line)) {
          inSummary = true;
          continue;
        }
        if (inSummary && /^(experience|education|skills|technical|projects|certifications)/i.test(line)) break;
        if (inSummary && line.length > 10) summaryLines.push(line);
      }
      if (summaryLines.length > 0) {
        professional_summary = summaryLines.join(" ");
      } else {
        // Fallback: build from skills
        const topSkills = skills.slice(0, 5).map(s => s.skill).join(", ");
        professional_summary = `Experienced ${jobTitle || "professional"} with demonstrated expertise in ${topSkills}. Proven ability to deliver impactful results in fast-paced environments.`;
      }
    }

    // ── 2. Skills: Reorganize by JD priority, preserving original ──
    const skillsByCategory: Record<string, string[]> = {};
    skills.forEach(s => {
      if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
      skillsByCategory[s.category].push(s.skill);
    });
    
    // Also extract original skills from resume
    let inSkills = false;
    const originalSkillLines: string[] = [];
    for (const line of lines) {
      if (/^(technical\s+skills|skills|core\s+competencies)/i.test(line)) {
        inSkills = true;
        continue;
      }
      if (inSkills && /^(experience|education|projects|certifications|professional)/i.test(line)) break;
      if (inSkills && line.length > 3) originalSkillLines.push(line);
    }

    // Merge: JD-prioritized categories + original resume skills
    const skills_section = Object.entries(skillsByCategory).map(
      ([cat, items]) => `${cat}: ${items.join(", ")}`
    );
    // Add any original skill lines not already covered
    originalSkillLines.forEach(sl => {
      const alreadyCovered = skills_section.some(s => s.toLowerCase().includes(sl.toLowerCase().split(":")[0]));
      if (!alreadyCovered && sl.includes(":")) skills_section.push(sl);
    });

    // ── 3. Experience: PRESERVE ORIGINAL — do NOT fabricate ──
    const experienceSections: GeneratedResume["experience"] = [];
    let inExperience = false;
    let currentHeading = "";
    let currentContent = "";
    let currentBullets: string[] = [];

    for (const line of lines) {
      if (/^(experience|work\s+experience|employment)/i.test(line)) {
        inExperience = true;
        continue;
      }
      if (inExperience && /^(education|projects|certifications|technical|skills)/i.test(line)) {
        // Save last entry
        if (currentHeading) {
          experienceSections.push({ heading: currentHeading, content: currentContent, bullets: currentBullets });
        }
        inExperience = false;
        continue;
      }
      if (!inExperience) continue;

      // Detect job title lines (usually have dates)
      if (line.match(/\d{4}/) && !line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*") && line.length > 10) {
        if (currentHeading) {
          experienceSections.push({ heading: currentHeading, content: currentContent, bullets: currentBullets });
        }
        currentHeading = line;
        currentContent = "";
        currentBullets = [];
      } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("·")) {
        currentBullets.push(line.replace(/^[•\-*·]\s*/, ""));
      } else if (currentHeading && !currentContent && line.length > 10) {
        currentContent = line;
      }
    }
    if (currentHeading) {
      experienceSections.push({ heading: currentHeading, content: currentContent, bullets: currentBullets });
    }

    // If we couldn't parse, show the raw experience section
    if (experienceSections.length === 0) {
      let rawExp = "";
      let capture = false;
      for (const line of lines) {
        if (/^(experience|work\s+experience)/i.test(line)) { capture = true; continue; }
        if (capture && /^(education|projects|certifications|skills)/i.test(line)) break;
        if (capture) rawExp += line + "\n";
      }
      if (rawExp.trim()) {
        experienceSections.push({ heading: "Experience (from your resume)", content: rawExp.trim(), bullets: [] });
      }
    }

    // ── 4. Education: PRESERVE ORIGINAL ──
    const educationEntries: string[] = [];
    let inEducation = false;
    for (const line of lines) {
      if (/^(education)/i.test(line)) { inEducation = true; continue; }
      if (inEducation && /^(experience|projects|certifications|skills|technical)/i.test(line)) break;
      if (inEducation && line.length > 5) educationEntries.push(line);
    }

    // ── 5. Certifications: PRESERVE ORIGINAL ──
    const certEntries: string[] = [];
    let inCerts = false;
    for (const line of lines) {
      if (/^(certifications?|licenses?)/i.test(line)) { inCerts = true; continue; }
      if (inCerts && /^(education|experience|projects|skills|technical)/i.test(line)) break;
      if (inCerts && line.length > 5) certEntries.push(line.replace(/^[✓✔☑]\s*/, ""));
    }

    // ── 6. Projects: Treat as experience if they exist ──
    let inProjects = false;
    let projHeading = "";
    let projBullets: string[] = [];
    for (const line of lines) {
      if (/^(projects)/i.test(line)) { inProjects = true; continue; }
      if (inProjects && /^(education|experience|certifications|skills|technical)/i.test(line)) {
        if (projHeading) experienceSections.push({ heading: projHeading, content: "", bullets: projBullets });
        inProjects = false;
        continue;
      }
      if (!inProjects) continue;
      if (!line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*") && !line.startsWith("·") && line.length > 10) {
        if (projHeading) experienceSections.push({ heading: projHeading, content: "", bullets: projBullets });
        projHeading = line;
        projBullets = [];
      } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("·")) {
        projBullets.push(line.replace(/^[•\-*·]\s*/, ""));
      }
    }
    if (projHeading) experienceSections.push({ heading: projHeading, content: "", bullets: projBullets });

    return {
      professional_summary,
      skills_section,
      experience: experienceSections,
      education: educationEntries.length > 0 ? educationEntries : ["(Preserved from your original resume)"],
      certifications: certEntries.length > 0 ? certEntries : undefined,
    };
  };

  const handleGenerate = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      toast.error("Please upload your resume first in the Gap Analyzer above.");
      return;
    }
    setIsGenerating(true);
    
    // Build directly from the resume + gap analysis data
    // This preserves original content and only enhances summary/skills
    await new Promise(r => setTimeout(r, 500)); // Small delay for UX
    const generatedResume = buildFromResumeData();
    setResume(generatedResume);
    setIsOpen(true);
    toast.success("ATS Resume generated from your analysis data!");
    setIsGenerating(false);
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

      // Professional Summary
      addText("PROFESSIONAL SUMMARY", 12, true, [30, 30, 30]);
      addLine();
      addText(resume.professional_summary, 10);
      y += 3;

      // Skills
      addText("TECHNICAL SKILLS", 12, true, [30, 30, 30]);
      addLine();
      resume.skills_section.forEach(skill => { addText(skill, 10); });
      y += 3;

      // Experience & Projects
      addText("EXPERIENCE & PROJECTS", 12, true, [30, 30, 30]);
      addLine();
      resume.experience.forEach(exp => {
        addText(exp.heading, 10.5, true);
        if (exp.content) addText(exp.content, 9.5, false, [70, 70, 70]);
        exp.bullets?.forEach(bullet => { addText(`•  ${bullet}`, 9.5); });
        y += 2;
      });

      // Education
      if (resume.education.length > 0) {
        addText("EDUCATION", 12, true, [30, 30, 30]);
        addLine();
        resume.education.forEach(edu => { addText(edu, 10); });
      }

      // Certifications
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
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </motion.div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">ATS Resume Generator</h3>
            <p className="text-xs text-muted-foreground">Reorganizes your resume with JD keywords — preserves your real experience</p>
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
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Resume — ATS Optimized</span>
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

              {/* Education */}
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
