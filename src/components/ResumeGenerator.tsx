import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2, FileText, CheckCircle2, AlertCircle, ArrowRight, Github, Linkedin, Mail, MapPin, Plus, Minus } from "lucide-react";
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
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);
  const [summaryLines, setSummaryLines] = useState(3);
  const [projectLines, setProjectLines] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [fontFamily, setFontFamily] = useState<"Inter" | "Roboto" | "Merriweather" | "Arial">("Inter");
  const [isEditing, setIsEditing] = useState(false);
  const [editableResume, setEditableResume] = useState<GeneratedResume | null>(null);
  const [editableHeader, setEditableHeader] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    github: ""
  });
  const [tone, setTone] = useState<"Professional" | "Modern" | "Aggressive">("Modern");

  const formatUrl = (url: string) => {
    if (!url) return "";
    let formatted = url.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      // If it starts with linkedin.com or github.com, we add https://
      formatted = `https://${formatted}`;
    }
    return formatted;
  };


  useEffect(() => {
    if (user) {
      loadVault();
      loadDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, jdTitle]);

  const loadDraft = async () => {
    if (!user || !jdTitle) return;
    try {
      const { data, error } = await supabase
        .from("generated_resumes")
        .select("*")
        .eq("user_id", user.id)
        .eq("job_title", jdTitle)
        .maybeSingle();

      if (data) {
        setResume(data.content as GeneratedResume);
        setEditableResume(data.content as GeneratedResume);
        setEditableHeader(data.header_data as typeof editableHeader);
        setIsOpen(true);
        toast.success("Resumed from your previous draft!");
      }
    } catch (err) {
      console.error("Load draft error:", err);
    }
  };

  const loadVault = async () => {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
    const { data: vaultData } = await supabase.from("master_vault").select("*").eq("user_id", user?.id);
    setProfile(profileData as UserProfileWithVault);
    setVaultItems(vaultData as VaultItem[] || []);
    if (profileData) {
      setEditableHeader({
        fullName: profileData.full_name || "",
        email: profileData.email?.toLowerCase() || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        linkedin: profileData.linkedin_url || "",
        portfolio: profileData.website_url || "",
        github: profileData.github_url || ""
      });
    }
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
1. TONE: Use a ${tone} tone. ${tone === 'Aggressive' ? 'Focus on high-growth metrics and leadership impact.' : tone === 'Professional' ? 'Focus on executive authority and structured domain expertise.' : 'Focus on lean efficiency and modern tactical precision.'}
2. QUANTIFICATION: Every single bullet point MUST contain a quantified metric (%, $, #, or integers). If a specific number is missing from the profile, estimate a realistic impact metric based on professional context.
3. STRUCTURE: Use standard resume headers (Professional Summary, Experience, Projects, Education).
4. PROFESSIONAL SUMMARY: Strictly exactly ${summaryLines} high-impact lines.
5. PROJECTS: Include exactly 2-3 significant projects. Each project description must be exactly ${projectLines} lines, quantified and strictly aligned with JD skills.
6. LAYOUT: Strictly white background, black text, and minimal vertical spacing to fit 1 page.
7. NO VAGUE CLAIMS: Replace phrases like 'improved performance' with 'increased throughput by 25%'.

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

      let resultText = "";

      const apiResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
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
      setEditableResume(structData as GeneratedResume);
      setIsOpen(true);
      toast.success("Silicon Valley Modern resume generated!");
    } catch (err) {
      console.error(err);
      toast.error("Tailoring engine failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddExperience = () => {
    if (!editableResume) return;
    const newItems = [...editableResume.experience, { heading: "New Experience", content: "", bullets: ["• New bullet point"] }];
    setEditableResume({ ...editableResume, experience: newItems });
  };

  const handleRemoveExperience = (index: number) => {
    if (!editableResume) return;
    const newItems = editableResume.experience.filter((_, i) => i !== index);
    setEditableResume({ ...editableResume, experience: newItems });
  };

  const handleAddProject = () => {
    if (!editableResume) return;
    const newItems = [...editableResume.projects, { heading: "New Project", content: "", bullets: ["• Strategic achievement bullet"] }];
    setEditableResume({ ...editableResume, projects: newItems });
  };

  const handleRemoveProject = (index: number) => {
    if (!editableResume) return;
    const newItems = editableResume.projects.filter((_, i) => i !== index);
    setEditableResume({ ...editableResume, projects: newItems });
  };

  const handleAddFromVault = (item: VaultItem) => {
    if (!editableResume) return;
    const isProject = item.type === 'project';
    if (isProject) {
      setEditableResume({
        ...editableResume,
        projects: [...editableResume.projects, { heading: `${item.title} @ ${item.organization}`, content: item.description, bullets: ["• Synthesizing metrics from tactical vault..."] }]
      });
    } else {
      setEditableResume({
        ...editableResume,
        experience: [...editableResume.experience, { heading: `${item.title} @ ${item.organization}`, content: item.description, bullets: ["• Synthesizing metrics from tactical vault..."] }]
      });
    }
    toast.success(`Imported ${item.title} from vault!`);
  };
  
  const handleSaveDraft = async () => {
    if (!user || !editableResume) {
      toast.error("Please generate a resume first.");
      return;
    }
    
    try {
      const { error } = await supabase.from("generated_resumes").upsert({
        user_id: user.id,
        job_title: jdTitle,
        content: editableResume,
        header_data: editableHeader,
        status: 'draft',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, job_title' });

      if (error) throw error;
      toast.success("Resume draft saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save draft to vault.");
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
        const fontMap = {
          "Inter": "helvetica",
          "Roboto": "helvetica",
          "Merriweather": "times",
          "Arial": "helvetica"
        };
        pdf.setFont(fontMap[fontFamily] || "helvetica", isBold ? "bold" : "normal");
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
      addText(editableHeader.fullName.toUpperCase(), 18, true, [0, 0, 0], "center");
      y += 2;
      const contactLines = [
        editableHeader.location,
        editableHeader.phone,
        editableHeader.email.toLowerCase()
      ].filter(Boolean).join("  •  ");
      addText(contactLines, 8.5, false, [80, 80, 80], "center");
      
      const linkItems = [
        { label: "LINKEDIN", url: editableHeader.linkedin },
        { label: "GITHUB", url: editableHeader.github },
        { label: "PORTFOLIO", url: editableHeader.portfolio }
      ].filter(item => item.url);

      if (linkItems.length > 0) {
        y += 1;
        const totalWidth = linkItems.reduce((acc, item) => acc + pdf.getTextWidth(item.label) + 10, 0) - 10;
        let currentX = (pageWidth - totalWidth) / 2;
        
        linkItems.forEach((item, idx) => {
          pdf.setFontSize(8.5);
          pdf.setTextColor(0, 102, 204);
          pdf.text(item.label, currentX, y);
          // Add invisible link
          pdf.link(currentX, y - 3, pdf.getTextWidth(item.label), 5, { url: item.url });
          currentX += pdf.getTextWidth(item.label) + 10;
        });
        y += 4;
      }
      y += 6;

      // Summary
      addText("PROFESSIONAL SUMMARY", 10, true, [0, 0, 0]);
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 4;
      if (editableResume) {
        addText(editableResume.professional_summary, 9.5, false, [40, 40, 40]);
        y += 4;

        // Skills
        addText("CORE COMPETENCIES", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 4;
        addText(editableResume.skills_section.join("  •  "), 9, false, [40, 40, 40]);
        y += 5;

        // Experience
        addText("EXPERIENCE", 10, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 3;
        editableResume.experience.forEach(exp => {
          const [title, company] = exp.heading.split('@');
          addText(title?.trim() || "", 9.5, true, [0, 0, 0]);
          y -= 3.5;
          addText(company?.trim() || "Organization", 9, true, [80, 80, 80]);
          if (exp.content) {
            addText(exp.content, 8, false, [100, 100, 100]);
          }
          y += 0.5;
          exp.bullets?.forEach(bullet => {
            addText(`•  ${bullet}`, 8.5, false, [0, 0, 0]);
          });
          y += 1.5;
        });

        // Projects
        if (editableResume.projects && editableResume.projects.length > 0) {
          addText("KEY PROJECTS", 10, true, [0, 0, 0]);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 3;
          editableResume.projects.forEach(proj => {
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
        if (editableResume.education.length > 0) {
          addText("EDUCATION", 10, true, [0, 0, 0]);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 3;
          editableResume.education.forEach(edu => addText(edu, 9, false, [40, 40, 40]));
          y += 2;
        }

        // Certifications
        if (editableResume.certifications && editableResume.certifications.length > 0) {
          addText("CERTIFICATIONS", 10, true, [0, 0, 0]);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 3;
          editableResume.certifications.forEach(cert => addText(cert, 9, false, [40, 40, 40]));
        }
      }

      pdf.save(`Lumina-AI-Resume-${profile?.full_name?.replace(/ /g, "_")}.pdf`);
      toast.success("Silicon Valley Modern PDF Exported!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to render Premium PDF.");
    }
  };

  return (
    <div className="glass-panel rounded-[3rem] p-6 lg:p-10 relative overflow-hidden group border border-white/5">
      <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
        <Sparkles className="w-80 h-80 rotate-12" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
        <div className="space-y-6 text-center xl:text-left">
          <div className="flex items-center justify-center xl:justify-start gap-5">
            <div className="w-14 h-14 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20">
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

          <div className="mt-8 p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 space-y-4 relative group">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-background text-[8px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              Strategic Calibration Hub
            </div>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                showSettings 
                  ? "bg-primary text-background shadow-lg" 
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-primary"
              }`}
            >
              <Wand2 size={14} className={showSettings ? "animate-pulse" : ""} /> 
              {showSettings ? "Close Parameters" : "Edit Synthesis Parameters (Lines, Fonts, Tone)"}
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-6 pt-4 px-2"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Summary Lines</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={summaryLines} 
                        onChange={(e) => setSummaryLines(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={2}>2 Lines (Condensed)</option>
                        <option value={3}>3 Lines (Standard)</option>
                        <option value={4}>4 Lines (Detailed)</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Project Density</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={projectLines} 
                        onChange={(e) => setProjectLines(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={2}>2 Lines (High Velocity)</option>
                        <option value={3}>3 Lines (Standard Impact)</option>
                        <option value={5}>5 Lines (Senior Executive)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Typography (PDF)</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={fontFamily} 
                        onChange={(e) => setFontFamily(e.target.value as "Inter" | "Roboto" | "Merriweather" | "Arial")}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value="Inter">Modern Sans (Inter)</option>
                        <option value="Roboto">Classic Sans (Roboto)</option>
                        <option value="Merriweather">Premium Serif (Merriweather)</option>
                        <option value="Arial">Standard (Arial)</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Strategic Tone</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={tone} 
                        onChange={(e) => setTone(e.target.value as "Professional" | "Modern" | "Aggressive")}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value="Modern">Silicon Valley Modern</option>
                        <option value="Professional">Executive Classic</option>
                        <option value="Aggressive">Growth Ninja (Impact)</option>
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
          className="relative overflow-hidden group/btn flex items-center gap-5 px-14 py-7 rounded-full text-[13px] font-black uppercase tracking-[0.3em] bg-primary text-primary-foreground hover:scale-105 transition-all duration-500 active:scale-95 disabled:opacity-50"
        >
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
            <div className="flex flex-col lg:flex-row justify-between items-center premium-card p-10 gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
                  <span className="text-xs font-black text-accent-emerald uppercase tracking-[0.2em]">0.1% Candidacy Blueprint Ready</span>
                </div>
                <p className="text-xl text-foreground/90 font-serif italic">Generation Complete. Strategically aligned for human & bot review.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/10 border border-primary/30 text-xs font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] active:scale-95"
                >
                  <ArchiveBox className="w-5 h-5" /> 
                  Save as Draft
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
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
              {/* ELITE EDITOR (Left Panel) */}
              <div className="md:col-span-4 glass-panel p-8 flex flex-col gap-8 h-fit max-h-[1100px] overflow-y-auto custom-scrollbar border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Elite Section Editor</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Header Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Primary Identity</h5>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.fullName} onChange={e => setEditableHeader({...editableHeader, fullName: e.target.value})} placeholder="Full Name" />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.email} onChange={e => setEditableHeader({...editableHeader, email: e.target.value})} placeholder="Email" />
                      <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.phone} onChange={e => setEditableHeader({...editableHeader, phone: e.target.value})} placeholder="Phone" />
                    </div>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.location} onChange={e => setEditableHeader({...editableHeader, location: e.target.value})} placeholder="Location (e.g. New York, NY)" />
                  </div>

                  {/* Social/Links Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Digital Footprint</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 ring-primary/20 focus-within:ring-2 transition-all">
                        <Linkedin size={14} className="text-[#0077B5]" />
                        <input 
                          id="edit-linkedin"
                          className="flex-1 bg-transparent border-none text-[10px] text-foreground outline-none placeholder:opacity-50" 
                          value={editableHeader.linkedin} 
                          onChange={e => setEditableHeader({...editableHeader, linkedin: e.target.value})} 
                          onBlur={e => setEditableHeader({...editableHeader, linkedin: formatUrl(e.target.value)})}
                          placeholder="linkedin.com/in/..." 
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 ring-primary/20 focus-within:ring-2 transition-all">
                        <Github size={14} className="text-foreground" />
                        <input 
                          id="edit-github"
                          className="flex-1 bg-transparent border-none text-[10px] text-foreground outline-none placeholder:opacity-50" 
                          value={editableHeader.github} 
                          onChange={e => setEditableHeader({...editableHeader, github: e.target.value})} 
                          onBlur={e => setEditableHeader({...editableHeader, github: formatUrl(e.target.value)})}
                          placeholder="github.com/..." 
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 ring-primary/20 focus-within:ring-2 transition-all">
                        <FileText size={14} className="text-secondary" />
                        <input 
                          id="edit-portfolio"
                          className="flex-1 bg-transparent border-none text-[10px] text-foreground outline-none placeholder:opacity-50" 
                          value={editableHeader.portfolio} 
                          onChange={e => setEditableHeader({...editableHeader, portfolio: e.target.value})} 
                          onBlur={e => setEditableHeader({...editableHeader, portfolio: formatUrl(e.target.value)})}
                          placeholder="yourportfolio.me" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Professional Narrative</h5>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-foreground outline-none focus:ring-1 ring-primary/40 min-h-[120px] resize-none shadow-xl hover:border-white/30 transition-all font-medium"
                      value={editableResume?.professional_summary}
                      onChange={e => setEditableResume(prev => prev ? {...prev, professional_summary: e.target.value} : null)}
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Core Competencies</h5>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-[11px] text-foreground outline-none focus:ring-1 ring-primary/40 min-h-[80px] shadow-xl hover:border-white/30 transition-all font-bold"
                      value={editableResume?.skills_section.join(", ")}
                      onChange={e => {
                        const newSkills = e.target.value.split(",").map(s => s.trim());
                        setEditableResume(prev => prev ? {...prev, skills_section: newSkills} : null);
                      }}
                      placeholder="Skill 1, Skill 2, ..."
                    />
                  </div>

                  {/* Experience Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Experience & Impact</h5>
                    <div className="space-y-6">
                      {editableResume?.experience.map((exp, i) => (
                        <div key={i} className="group relative space-y-3 p-5 rounded-xl bg-white/10 border border-white/20 shadow-xl transition-all hover:border-primary/30">
                          <div className="flex justify-between items-start">
                            <input className="w-full bg-transparent border-none text-[11px] font-bold text-foreground outline-none focus:text-primary transition-colors" value={exp.heading} onChange={e => {
                              const newExp = [...editableResume.experience];
                              newExp[i].heading = e.target.value;
                              setEditableResume({...editableResume, experience: newExp});
                            }} />
                            <button onClick={() => handleRemoveExperience(i)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-all">
                              <Minus size={14} />
                            </button>
                          </div>
                          <div className="space-y-2">
                             {exp.bullets?.map((bullet, j) => (
                               <div key={j} className="flex gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20 mt-2 shrink-0" />
                                 <textarea className="w-full bg-black/20 p-2 rounded-lg border border-white/5 text-[10px] text-muted-foreground outline-none resize-none overflow-hidden hover:border-white/20 focus:border-primary/40 transition-all" rows={2} value={bullet} onChange={e => {
                                   const newExp = [...editableResume.experience];
                                   newExp[i].bullets[j] = e.target.value;
                                   setEditableResume({...editableResume, experience: newExp});
                                 }} />
                               </div>
                             ))}
                             <button onClick={() => {
                               const newExp = [...editableResume.experience];
                               newExp[i].bullets.push("• Click to add high-impact metric bullet");
                               setEditableResume({...editableResume, experience: newExp});
                             }} className="text-[9px] text-primary/40 hover:text-primary transition-colors flex items-center gap-1 mt-1 ml-4 uppercase tracking-widest font-black">
                               <Plus size={10} /> Add Bullet
                             </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={handleAddExperience} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                        <Plus size={14} /> Add Experience
                      </button>
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Strategic Projects</h5>
                    <div className="space-y-6">
                      {editableResume?.projects.map((proj, i) => (
                        <div key={i} className="group relative space-y-3 p-5 rounded-xl bg-white/10 border border-white/20 shadow-xl transition-all hover:border-secondary/30">
                          <div className="flex justify-between items-start">
                            <input className="w-full bg-transparent border-none text-[11px] font-bold text-foreground outline-none focus:text-secondary transition-colors" value={proj.heading} onChange={e => {
                              const newProj = [...editableResume.projects];
                              newProj[i].heading = e.target.value;
                              setEditableResume({...editableResume, projects: newProj});
                            }} />
                            <button onClick={() => handleRemoveProject(i)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-all">
                              <Minus size={14} />
                            </button>
                          </div>
                          <div className="space-y-2">
                             {proj.bullets?.map((bullet, j) => (
                               <div key={j} className="flex gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-secondary/20 mt-2 shrink-0" />
                                 <textarea className="w-full bg-black/20 p-2 rounded-lg border border-white/5 text-[10px] text-muted-foreground outline-none resize-none overflow-hidden hover:border-white/20 focus:border-secondary/40 transition-all" rows={2} value={bullet} onChange={e => {
                                   const newProj = [...editableResume.projects];
                                   newProj[i].bullets[j] = e.target.value;
                                   setEditableResume({...editableResume, projects: newProj});
                                 }} />
                               </div>
                             ))}
                             <button onClick={() => {
                               const newProj = [...editableResume.projects];
                               newProj[i].bullets.push("• Click to add high-impact project bullet");
                               setEditableResume({...editableResume, projects: newProj});
                             }} className="text-[9px] text-secondary/40 hover:text-secondary transition-colors flex items-center gap-1 mt-1 ml-4 uppercase tracking-widest font-black">
                               <Plus size={10} /> Add Bullet
                             </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={handleAddProject} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-all flex items-center justify-center gap-2">
                        <Plus size={14} /> Add Project
                      </button>
                    </div>
                  </div>

                  {/* VAULT IMPORT QUICK-ADD */}
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Import from Tactical Vault</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {vaultItems.slice(0, 3).map((item, i) => (
                        <button key={i} onClick={() => handleAddFromVault(item)} className="p-3 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-all group">
                          <p className="text-[10px] font-bold text-foreground group-hover:text-primary">{item.title}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{item.organization} • {item.type}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* TACTICAL RESULT PREVIEW (The Document) */}
              <div 
                className="md:col-span-8 bg-white max-w-4xl mx-auto rounded-none p-8 border border-zinc-200 overflow-y-auto max-h-[1100px] flex flex-col gap-6 text-black print:p-0 print:shadow-none"
                style={{ fontFamily: fontFamily === 'Merriweather' ? 'serif' : 'sans-serif' }}
              >
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold uppercase tracking-tight text-black">{editableHeader.fullName}</h1>
                   <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-700 font-bold uppercase tracking-wider">
                     <span className="flex items-center gap-1.5"><MapPin size={10} className="text-zinc-400" /> {editableHeader.location}</span>
                     <span className="opacity-30">|</span>
                     <span className="flex items-center gap-1.5 lowercase font-medium tracking-normal text-zinc-600"><Mail size={10} className="text-zinc-400" /> {editableHeader.email}</span>
                     <span className="opacity-30">|</span>
                     <span>{editableHeader.phone}</span>
                   </div>
                   
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-2 text-[10px] font-black tracking-widest">
                      {editableHeader.linkedin && (
                        <div className="flex items-center gap-2 group/link">
                          <a href={editableHeader.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors uppercase border-b border-accent-blue/20 pb-0.5">
                            <Linkedin size={10} /> LINKEDIN
                          </a>
                          <button onClick={() => document.getElementById('edit-linkedin')?.focus()} className="opacity-0 group-hover/link:opacity-100 p-1 text-zinc-400 hover:text-primary transition-all">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                      )}
                      {editableHeader.github && (
                        <div className="flex items-center gap-2 group/link">
                          <a href={editableHeader.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity uppercase border-b border-black/20 pb-0.5">
                            <Github size={10} /> GITHUB
                          </a>
                          <button onClick={() => document.getElementById('edit-github')?.focus()} className="opacity-0 group-hover/link:opacity-100 p-1 text-zinc-400 hover:text-primary transition-all">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                      )}
                      {editableHeader.portfolio && (
                        <div className="flex items-center gap-2 group/link">
                          <a href={editableHeader.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-secondary hover:opacity-80 transition-opacity uppercase border-b border-secondary/20 pb-0.5">
                            <FileText size={10} /> PORTFOLIO
                          </a>
                          <button onClick={() => document.getElementById('edit-portfolio')?.focus()} className="opacity-0 group-hover/link:opacity-100 p-1 text-zinc-400 hover:text-primary transition-all">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                      )}
                    </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Professional Summary</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <p className="text-[12px] leading-relaxed text-zinc-900 font-medium">{editableResume?.professional_summary}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Professional Experience</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <div className="space-y-5">
                      {editableResume?.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                              <h5 className="font-display font-bold text-[13px] text-black">{exp.heading}</h5>
                          </div>
                          <ul className="space-y-1 list-disc pl-4">
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

                  {editableResume?.projects && editableResume.projects.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Strategic Projects</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <div className="space-y-4">
                      {editableResume.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                            <h5 className="font-display font-bold text-[13px] text-black">{proj.heading}</h5>
                          
                            <p className="text-[11px] text-zinc-900 leading-relaxed font-medium">{proj.content}</p>

                          <ul className="space-y-1 list-disc pl-4 mt-1">
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
                        <p className="text-[12px] text-zinc-800 leading-relaxed font-medium">{editableResume?.skills_section.join(", ")}</p>
                    </div>

                    {editableResume?.education && editableResume.education.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Education</h4>
                          <div className="h-[0.5px] w-full bg-zinc-300" />
                        </div>
                        <ul className="space-y-1">
                           {editableResume.education.map((edu, idx) => (
                             <li key={idx} className="text-[12px] text-zinc-800">
                                  <span className="font-medium">{edu}</span>
                             </li>
                           ))}
                        </ul>
                      </div>
                    )}
                    {editableResume?.certifications && editableResume.certifications.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap">Certifications</h4>
                          <div className="h-[0.5px] w-full bg-zinc-300" />
                        </div>
                        <ul className="space-y-1">
                           {editableResume.certifications.map((cert, idx) => (
                             <li key={idx} className="text-[12px] text-zinc-800">
                                  <span className="font-medium">{cert}</span>
                             </li>
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

