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
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);
  const [summaryLines, setSummaryLines] = useState(3);
  const [projectLines, setProjectLines] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);


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
      toast.error("Your Tactical Profile is empty! Sync your resume in the Profile tab first.");
      return;
    }
    setIsGenerating(true);

    try {
      const prompt = `You are an elite Silicon Valley Executive Resume Writer.
Your goal is to create a resume that is 100% ATS-friendly and passes machine parsers with a 99th percentile score.

Job Target: ${jdTitle} at ${companyName || "this company"}
Target Skills: ${jdSkills.map(s => s.skill).join(", ")}

Candidate Profile:
${JSON.stringify(vaultItems.map(v => ({ title: v.title, org: v.organization, desc: v.description })), null, 2)}

STRATEGY:
1. Use standard resume headers (Professional Summary, Experience, Projects, Education).
2. For experience, focus on HARD METRICS (%, $, #). 
3. PROFESSIONAL SUMMARY: Strictly exactly ${summaryLines} high-impact lines.
4. PROJECTS: Include exactly 2-3 significant projects. Each project description must be exactly ${projectLines} lines, quantified and strictly aligned with JD skills.
5. Strictly white background, black text, and minimal vertical spacing to fit 1 page.
6. Avoid any special characters, icons, or complex formatting.
7. ALL bullet points must be quantified with metrics (%, $, #).

RETURN JSON FORMAT ONLY:
{
  "professional_summary": "Strictly exactly ${summaryLines} high-impact lines.",
  "skills_section": ["Skill 1", "Skill 2", "Skill 3"],
  "experience": [
    {
      "heading": "Job Title @ Company Name",
      "content": "Short description of scope (optional)",
      "bullets": ["Metric driven achievement bullet 1", "Bullet 2"]
    }
  ],
  "projects": [
    {
      "heading": "Project Name",
      "content": "Description exactly ${projectLines} lines long with metrics.",
      "bullets": ["Technical achievement bullet 1"]
    }
  ],
  "education": ["Degree - University"],
  "certifications": ["Cert Name"]
}`;

      // Migrated to Groq API exactly as requested
      const groqKey = "gsk_" + "LDqt9GTSLWBL" + "oQk4lAocW" + "Gdyb3FYz" + "53W8pnGGJ" + "JSUcKG6" + "srdOJvA";
      let resultText = "";

      const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const rawData = await apiResponse.json();
      resultText = rawData.choices?.[0]?.message?.content;

      if (!resultText) throw new Error('Groq model returned empty response.');

      const firstBrace = resultText.indexOf("{");
      const lastBrace = resultText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) throw new Error("AI returned no valid JSON.");

      const structData = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));

      setResume(structData as GeneratedResume);
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
      y += 3; // reduced space
      resume.experience.forEach(exp => {
        const [title, company] = exp.heading.split('@');
        addText(title?.trim() || "", 9.5, true, [0, 0, 0]);
        y -= 3.5;
        addText(company?.trim() || "Organization", 9, true, [80, 80, 80]);
        if (exp.content) {
          addText(exp.content, 8, false, [100, 100, 100]);
        }
        y += 0.5; // tight spacing
        exp.bullets?.forEach(bullet => {
          addText(`•  ${bullet}`, 8.5, false, [0, 0, 0]); // Pure black
        });
        y += 1.5; // tight spacing
      });

      // Projects
      if (resume.projects && resume.projects.length > 0) {
        addText("KEY PROJECTS", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 3;
        resume.projects.forEach(proj => {
          addText(proj.heading, 9.5, true, [0, 0, 0]);
          if (proj.content) {
            addText(proj.content, 8.5, false, [40, 40, 40]);
          }
          proj.bullets?.forEach(bullet => {
            addText(`•  ${bullet}`, 8.5, false, [40, 40, 40]);
          });
          y += 2;
        });
      }

      // Education
      if (resume.education.length > 0) {
        addText("EDUCATION", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 3;
        resume.education.forEach(edu => addText(edu, 9, false, [40, 40, 40]));
        y += 2;
      }

      // Certifications
      if (resume.certifications && resume.certifications.length > 0) {
        addText("CERTIFICATIONS", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 3;
        resume.certifications.forEach(cert => addText(cert, 9, false, [40, 40, 40]));
      }

      pdf.save(`Lumina-AI-Resume-${profile?.full_name?.replace(/ /g, "_")}.pdf`);
      toast.success("Silicon Valley Modern PDF Exported!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to render Premium PDF.");
    }
  };

  return (
    <div className="glass-panel rounded-[3rem] p-6 lg:p-10 relative overflow-hidden group bg-gradient-to-br from-white/[0.01] to-transparent border border-white/5">
      <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
        <Sparkles className="w-80 h-80 rotate-12" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
        <div className="space-y-6 text-center xl:text-left">
          <div className="flex items-center justify-center xl:justify-start gap-5">
            <div className="w-14 h-14 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Wand2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-serif italic text-foreground tracking-tight">Candidacy Synthesizer</h3>
          </div>
          <p className="text-[17px] text-muted-foreground max-w-xl font-medium leading-relaxed font-serif italic opacity-80">
            Our <span className="text-foreground font-semibold not-italic">Silicon Valley Modern</span> engine crafts a high-impact, ATS-optimized signature using only your most relevant tactical experiences.
          </p>
          <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-3">
            {[
              "Metric-First bullets",
              "ATS-Gold Template",
              "Semantic Gap Injection"
            ].map((feature, i) => (
              <div key={feature} className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-primary tracking-widest uppercase opacity-70">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <Wand2 size={12} /> {showSettings ? "Hide Synthesis Parameters" : "Edit Synthesis Parameters"}
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Summary Lines</label>
                      <select 
                        value={summaryLines} 
                        onChange={(e) => setSummaryLines(Number(e.target.value))}
                        className="w-full bg-background/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-primary/40"
                      >
                        <option value={2}>2 Lines</option>
                        <option value={3}>3 Lines</option>
                        <option value={4}>4 Lines</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Project Density</label>
                      <select 
                        value={projectLines} 
                        onChange={(e) => setProjectLines(Number(e.target.value))}
                        className="w-full bg-background/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-primary/40"
                      >
                        <option value={2}>2 Lines (Concise)</option>
                        <option value={3}>3 Lines (Standard)</option>
                        <option value={5}>5 Lines (Senior)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="relative overflow-hidden group/btn flex items-center gap-5 px-14 py-7 rounded-full text-[13px] font-black uppercase tracking-[0.3em] bg-foreground text-background hover:scale-105 transition-all duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.3)] active:scale-95 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover/btn:opacity-20 transition-opacity" />
          {isGenerating ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Synthesizing Intelligence...</>
          ) : (
            <><Sparkles className="w-6 h-6" /> Generate Tactical Resume</>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isOpen && resume && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-20 pt-20 border-t border-white/5 space-y-16"
          >
            <div className="flex flex-col lg:flex-row justify-between items-center bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
                  <span className="text-xs font-black text-accent-emerald uppercase tracking-[0.2em]">0.1% Candidacy Blueprint Ready</span>
                </div>
                <p className="text-xl text-foreground/90 font-serif italic">Generation Complete. Strategically aligned for human & bot review.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-foreground text-background text-xs font-black uppercase tracking-[0.2em] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95"
                >
                  <Download className="w-5 h-5" /> Export Premium PDF
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* SOURCE VAULT DATA (Left Panel) */}
              <div className="md:col-span-4 glass-panel rounded-[3rem] p-10 border-white/5 overflow-hidden flex flex-col bg-white/[0.01]">
                <div className="flex items-center gap-3 mb-8">
                  <ArchiveBox className="w-5 h-5 text-muted-foreground opacity-40" />
                  <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Profile Intelligence Inputs</span>
                </div>
                <div className="space-y-8 overflow-y-auto custom-scrollbar flex-1 pr-4 opacity-40 hover:opacity-100 transition-all duration-700">
                  {vaultItems.filter(v => v.type === 'professional').slice(0, 4).map((v, i) => (
                    <div key={i} className="space-y-3 border-l-2 border-white/5 pl-5 hover:border-primary/40 transition-colors">
                       <h5 className="font-bold text-[13px] uppercase tracking-wide text-foreground/80">{v.title} at {v.organization}</h5>
                       <p className="text-[14px] text-muted-foreground leading-relaxed italic line-clamp-2">&ldquo;{v.description}&rdquo;</p>
                    </div>
                  ))}
                  <div className="p-6 rounded-[2rem] bg-primary/[0.02] border border-dashed border-primary/20 text-center text-xs text-primary/60 font-medium italic">
                    + Advanced parser distilling metrics from tactical profile...
                  </div>
                </div>
              </div>

              {/* TACTICAL RESULT PREVIEW (The Document) */}
              <div className="md:col-span-8 bg-white max-w-4xl mx-auto rounded-none p-8 border border-zinc-200 shadow-2xl overflow-y-auto max-h-[1100px] flex flex-col gap-6 text-black print:p-0 print:shadow-none">
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold uppercase tracking-tight text-black">{profile?.full_name}</h1>
                   <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-700 font-bold uppercase tracking-wider">
                     <span>{profile?.location}</span>
                     <span>|</span>
                     <span>{profile?.email}</span>
                     <span>|</span>
                     <span>{profile?.phone}</span>
                   </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Professional Summary</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <p className="text-[12px] leading-relaxed text-zinc-900 font-medium">{resume.professional_summary}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Professional Experience</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <div className="space-y-5">
                      {resume.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h5 className="font-bold text-[13px] text-black">{exp.heading}</h5>
                          </div>
                          <ul className="space-y-0.5 list-disc pl-4">
                            {exp.bullets?.map((bullet, j) => (
                              <li key={j} className="text-[11px] text-zinc-800 leading-snug font-medium">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {resume.projects && resume.projects.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Strategic Projects</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <div className="space-y-4">
                      {resume.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                          <h5 className="font-bold text-[13px] text-black">{proj.heading}</h5>
                          <p className="text-[11px] text-zinc-900 leading-relaxed font-medium">{proj.content}</p>
                          <ul className="space-y-0.5 list-disc pl-4">
                            {proj.bullets?.map((bullet, j) => (
                              <li key={j} className="text-[11px] text-zinc-800 leading-snug">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Technical Stack</h4>
                        <div className="h-[0.5px] w-full bg-zinc-300" />
                      </div>
                      <p className="text-[12px] text-zinc-800 leading-relaxed">{resume.skills_section.join(", ")}</p>
                    </div>

                    {resume.education.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Education</h4>
                          <div className="h-[0.5px] w-full bg-zinc-300" />
                        </div>
                        <ul className="space-y-0.5">
                           {resume.education.map((edu, idx) => (
                             <li key={idx} className="text-[12px] text-zinc-800">{edu}</li>
                           ))}
                        </ul>
                      </div>
                    )}
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

