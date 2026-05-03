import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2, FileText, CheckCircle2, AlertCircle, ArrowRight, Github, Linkedin, Mail, MapPin, Plus, Minus, Archive } from "lucide-react";
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

interface ResumeHeader {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
}

interface ArchiveRecord {
  id: string;
  job_title: string;
  updated_at: string;
  content: GeneratedResume;
  header_data: ResumeHeader;
}

export const ResumeGenerator = ({ jdTitle, jdSkills, companyName }: ResumeGeneratorProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);
  const [summaryLines, setSummaryLines] = useState(3);
  const [projectLines, setProjectLines] = useState(3);
  const [experienceBullets, setExperienceBullets] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [fontFamily, setFontFamily] = useState<"Inter" | "Roboto" | "Merriweather" | "Arial">("Inter");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableResume, setEditableResume] = useState<GeneratedResume | null>(null);
  const [editableHeader, setEditableHeader] = useState<ResumeHeader>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    github: ""
  });
  const [tone, setTone] = useState<"Professional" | "Modern" | "Aggressive">("Modern");
  const [addingSection, setAddingSection] = useState<'experience' | 'projects' | 'education' | 'certifications' | null>(null);
  const [savedResumes, setSavedResumes] = useState<ArchiveRecord[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  
  // Font Size Calibration
  const [nameFontSize, setNameFontSize] = useState(18);
  const [headlineFontSize, setHeadlineFontSize] = useState(12);
  const [subHeadlineFontSize, setSubHeadlineFontSize] = useState(11);
  const [bodyFontSize, setBodyFontSize] = useState(10);

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
      fetchSavedResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, jdTitle]);

  const loadDraft = async () => {
    if (!user || !jdTitle) return;
    try {
      const { data } = await supabase
        .from("generated_resumes")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_title", jdTitle)
        .maybeSingle();

      if (data) {
        setDraftId(data.id);
        // Draft content is no longer loaded automatically to keep the generator clean.
        // Users can explicitly load from the "Saved Blueprints" archive if needed.
      }
    } catch (err) {
      console.error("Load draft error:", err);
    }
  };

  const fetchSavedResumes = async () => {
    if (!user) return;
    setIsLoadingArchive(true);
    try {
      const { data, error } = await supabase
        .from("generated_resumes")
        .select("id, job_title, status, updated_at, content, header_data")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setSavedResumes((data as unknown as ArchiveRecord[]) || []);
    } catch (err) {
      console.error("Fetch archive error:", err);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleLoadArchive = (record: ArchiveRecord) => {
    setDraftId(record.id);
    
    // Hardening: Ensure projects and certifications exist in the loaded record
    const hydratedContent = {
      ...record.content,
      projects: record.content.projects || [],
      certifications: record.content.certifications || []
    };
    
    setResume(hydratedContent);
    setEditableResume(hydratedContent);
    setEditableHeader(record.header_data);
    setIsOpen(true);
    setShowArchive(false);
    toast.success(`Loaded blueprint for ${record.job_title}`);
  };

  const handleDeleteArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from("generated_resumes").delete().eq("id", id);
      if (error) throw error;
      setSavedResumes(prev => prev.filter(r => r.id !== id));
      if (draftId === id) {
        setDraftId(null);
      }
      toast.success("Blueprint purged from archive.");
    } catch (err) {
      toast.error("Failed to delete draft.");
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
      toast.error("Tactical Profile Empty", {
        description: "You must sync your resume or add roles in the Profile tab before we can tailor your candidacy.",
        action: {
          label: "Go to Profile",
          onClick: () => {
             // In ScannerView, this will switch the tab if activeTab is managed by onTabChange
             // But since we are inside the component, we can't easily reach ScannerView's state 
             // without passing a prop. For now, a descriptive toast is better than a silent fail.
             window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'profile' }));
          }
        }
      });
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
3. SKILL INJECTION: You MUST include EVERY SINGLE skill from the "Target Skills" list in the "skills_section" JSON field. No exceptions.
4. KEYWORD ALIGNMENT: Weave as many "Target Skills" tokens as possible naturally into the "experience" and "projects" descriptions to ensure a 100% keyword match score.
5. STRUCTURE: Use standard resume headers (Professional Summary, Experience, Projects, Education).
6. PROFESSIONAL SUMMARY: Strictly exactly ${summaryLines} high-impact lines.
7. PROJECTS: Include exactly 2-3 significant projects. Each project description must be exactly ${projectLines} lines, quantified and strictly aligned with JD skills.
8. EXPERIENCE DETAIL: Strictly exactly ${experienceBullets} high-impact quantified bullets per job entry. If the user provided items from their vault, expand and quantify them to exactly ${experienceBullets} bullets.
9. LAYOUT: Strictly white background, black text, and minimal vertical spacing to fit 1 page.
10. NO VAGUE CLAIMS: Replace phrases like 'improved performance' with 'increased throughput by 25%'.

RETURN JSON FORMAT ONLY:
{
  "professional_summary": "Strictly exactly ${summaryLines} high-impact lines.",
  "skills_section": ["Skill 1", "Skill 2", "Skill 3"],
  "experience": [
    {
      "heading": "Job Title @ Company Name",
      "content": "Short description of scope (optional)",
      "bullets": ["Metric driven achievement bullet 1", "Bullet 2", "Bullet up to ${experienceBullets}"]
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

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      let resultText = "";
      const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
      let lastError = "";

      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
          console.log(`Lumina Tailoring: Attempting with ${model}...`);
          // Update toast or state to show which model is active
          if (i > 0) toast.loading(`Switching to fallback engine: ${model}...`, { id: "gen-toast" });

          let { data: rawData, error: invokeError } = await supabase.functions.invoke("analyze", {
            body: {
              model: model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              response_format: { type: "json_object" }
            }
          });

          // ── EMERGENCY FALLBACK: Try Local API Proxy if Edge Function Fails ──
          if (invokeError && (invokeError.message?.includes("Failed to send a request") || invokeError.status === 404)) {
            console.warn(`Lumina Tailoring: Edge Function unreachable. Switching to Local API Proxy for ${model}...`);
            try {
              const apiResponse = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: model,
                  messages: [{ role: "user", content: prompt }],
                  temperature: 0.3,
                  response_format: { type: "json_object" }
                })
              });
              if (apiResponse.ok) {
                rawData = await apiResponse.json();
                invokeError = null;
              }
            } catch (apiErr) {
              console.error("Local API Proxy also failed:", apiErr);
            }
          }

          if (invokeError) {
            lastError = invokeError.message || "Function invocation failed";
            if (invokeError.status === 429) {
               console.warn(`Lumina Tailoring: Model ${model} rate limited. Waiting 1500ms...`);
               await sleep(1500);
            }
            continue;
          }

          if (!rawData) {
            lastError = "Empty response from engine";
            continue;
          }

          if (rawData.error) {
            lastError = rawData.error;
            if (rawData.error.includes("429")) {
              console.warn(`Lumina Tailoring: Engine reported 429 for ${model}. Waiting 1500ms...`);
              await sleep(1500);
            }
            continue;
          }

          const content = rawData.choices?.[0]?.message?.content;
          if (content) {
            resultText = content;
            console.log(`Lumina Tailoring: Success with ${model}`);
            if (i > 0) toast.dismiss("gen-toast");
            break;
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          console.error(`Lumina Tailoring: ${model} crash:`, lastError);
        }
      }

      if (!resultText) {
        throw new Error(`All AI engines exhausted. Last error: ${lastError}`);
      }

      let structData;
      try {
        const firstBrace = resultText.indexOf("{");
        const lastBrace = resultText.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace === -1) throw new Error("Invalid JSON structure");
        structData = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));
      } catch (parseErr) {
        console.error("Tailoring Parse Error:", resultText);
        throw new Error("AI returned malformed candidacy data. Please try again.");
      }

      const hydratedData = {
        ...structData,
        projects: structData.projects || [],
        certifications: structData.certifications || []
      } as GeneratedResume;

      setResume(hydratedData);
      setEditableResume(hydratedData);
      setIsOpen(true);
      toast.success("Silicon Valley Modern resume generated!");
    } catch (err: unknown) {
      console.error("Generation process failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error("Tailoring Engine Fault", {
        description: errorMessage || "System overloaded. Retrying in 30s...",
        duration: 8000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddExperience = () => {
    setAddingSection('experience');
  };

  const handleManualAddExperience = () => {
    if (!editableResume) return;
    const newItems = [...editableResume.experience, { heading: "New Experience", content: "", bullets: ["• New bullet point"] }];
    setEditableResume({ ...editableResume, experience: newItems });
    setAddingSection(null);
  };

  const handleRemoveExperience = (index: number) => {
    if (!editableResume) return;
    const newItems = editableResume.experience.filter((_, i) => i !== index);
    setEditableResume({ ...editableResume, experience: newItems });
  };

  const handleAddProject = () => {
    setAddingSection('projects');
  };

  const handleManualAddProject = () => {
    if (!editableResume) return;
    const newItems = [...(editableResume.projects || []), { heading: "New Project", content: "", bullets: ["• Strategic achievement bullet"] }];
    setEditableResume({ ...editableResume, projects: newItems });
    setAddingSection(null);
  };

  const handleRemoveProject = (index: number) => {
    if (!editableResume) return;
    const newItems = (editableResume.projects || []).filter((_, i) => i !== index);
    setEditableResume({ ...editableResume, projects: newItems });
  };

  const handleAddEducation = () => {
    setAddingSection('education');
  };

  const handleManualAddEducation = () => {
    if (!editableResume) return;
    const newItems = [...editableResume.education, "New Degree - University Name"];
    setEditableResume({ ...editableResume, education: newItems });
    setAddingSection(null);
  };

  const handleRemoveEducation = (index: number) => {
    if (!editableResume) return;
    const newItems = editableResume.education.filter((_, i) => i !== index);
    setEditableResume({ ...editableResume, education: newItems });
  };

  const handleAddCertification = () => {
    setAddingSection('certifications');
  };

  const handleManualAddCertification = () => {
    if (!editableResume) return;
    const certs = editableResume.certifications || [];
    const newItems = [...certs, "Certification Name (Issuer)"];
    setEditableResume({ ...editableResume, certifications: newItems });
    setAddingSection(null);
  };

  const handleRemoveCertification = (index: number) => {
    if (!editableResume) return;
    const certs = editableResume.certifications || [];
    const newItems = certs.filter((_, i) => i !== index);
    setEditableResume({ ...editableResume, certifications: newItems });
  };

  const handleAddFromVault = (item: VaultItem) => {
    if (!editableResume) return;
    
    if (item.type === 'project') {
      const projects = editableResume.projects || [];
      setEditableResume({
        ...editableResume,
        projects: [...projects, { 
          heading: item.organization ? `${item.title} @ ${item.organization}` : item.title, 
          content: item.description, 
          bullets: item.bullets && item.bullets.length > 0 ? item.bullets : ["• Synthesizing metrics from tactical vault..."] 
        }]
      });
    } else if (item.type === 'professional') {
      setEditableResume({
        ...editableResume,
        experience: [...editableResume.experience, { 
          heading: item.organization ? `${item.title} @ ${item.organization}` : item.title, 
          content: item.description, 
          bullets: item.bullets && item.bullets.length > 0 ? item.bullets : ["• Synthesizing metrics from tactical vault..."] 
        }]
      });
    } else if (item.type === 'education') {
      const eduEntry = item.organization ? `${item.title} - ${item.organization}` : item.title;
      setEditableResume({
        ...editableResume,
        education: [...editableResume.education, eduEntry]
      });
    } else if (item.type === 'certification') {
      const certifications = editableResume.certifications || [];
      const certEntry = item.organization ? `${item.title} (${item.organization})` : item.title;
      setEditableResume({
        ...editableResume,
        certifications: [...certifications, certEntry]
      });
    }
    
    setAddingSection(null);
    toast.success(`Imported ${item.title} from vault!`);
  };
  
  const handleSaveDraft = async () => {
    if (!user || !editableResume) {
      toast.error("Please generate a resume first.");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("generated_resumes").upsert({
        ...(draftId ? { id: draftId } : {}),
        user_id: user.id,
        job_title: jdTitle,
        content: editableResume,
        header_data: editableHeader,
        status: 'draft',
        updated_at: new Date().toISOString()
      } as unknown as Record<string, unknown>, { onConflict: 'user_id,job_title' }).select("id");

      if (error) {
        console.error("Database save error:", error);
        toast.error(`Save failed: ${error.message || "Database rejected the draft"}`);
        return;
      }
      
      if (data && data.length > 0) {
        setDraftId(data[0].id);
      }
      
      fetchSavedResumes(); // Refresh archive list
      toast.success("Resume draft saved successfully!");
    } catch (err: unknown) {
      console.error("Unexpected save error:", err);
      const message = (err as { message?: string })?.message || (typeof err === 'string' ? err : "Unknown process error");
      toast.error(`Save crashed: ${message}`);
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
        y += size * 0.05;
      };

      // Header: Ultra-clean center aligned
      addText(editableHeader.fullName.toUpperCase(), nameFontSize, true, [0, 0, 0], "center");
      y += 1.2;
      const contactLines = [
        editableHeader.location,
        editableHeader.phone,
        editableHeader.email.toLowerCase()
      ].filter(Boolean).join("  •  ");
      addText(contactLines, bodyFontSize * 0.85, false, [80, 80, 80], "center");
      
      const linkItems = [
        { label: "LINKEDIN", url: editableHeader.linkedin },
        { label: "GITHUB", url: editableHeader.github },
        { label: "PORTFOLIO", url: editableHeader.portfolio }
      ].filter(item => item.url);

      if (linkItems.length > 0) {
        y += 0.6;
        const totalWidth = linkItems.reduce((acc, item) => acc + pdf.getTextWidth(item.label) + 10, 0) - 10;
        let currentX = (pageWidth - totalWidth) / 2;
        
        linkItems.forEach((item, idx) => {
          pdf.setFontSize(bodyFontSize * 0.85);
          pdf.setTextColor(0, 102, 204);
          pdf.text(item.label, currentX, y);
          // Add invisible link
          pdf.link(currentX, y - 3, pdf.getTextWidth(item.label), 5, { url: item.url });
          currentX += pdf.getTextWidth(item.label) + 10;
        });
        y += 2.0;
      }
      y += 3.5;

      // Summary
      addText("PROFESSIONAL SUMMARY", headlineFontSize, true, [0, 0, 0]);
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 2.0;
      if (editableResume) {
        addText(editableResume.professional_summary, bodyFontSize, false, [40, 40, 40]);
        y += 2.0;

        // Skills
        addText("CORE COMPETENCIES", headlineFontSize, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 2.0;
        addText(editableResume.skills_section.join("  •  "), bodyFontSize * 0.9, false, [40, 40, 40]);
        y += 3.0;

        // Experience
        addText("EXPERIENCE", headlineFontSize, true, [0, 0, 0]);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 1.8;
        editableResume.experience.forEach(exp => {
          const [title, company] = exp.heading.split('@');
          addText(title?.trim() || "", subHeadlineFontSize, true, [0, 0, 0]);
          addText(company?.trim() || "Organization", subHeadlineFontSize * 0.95, true, [80, 80, 80]);
          if (exp.content) {
            addText(exp.content, bodyFontSize * 0.8, false, [100, 100, 100]);
          }
          y += 0.6; // Small gap before bullets
          exp.bullets?.forEach(bullet => {
            addText(`•  ${bullet}`, bodyFontSize, false, [0, 0, 0]);
          });
          y += 1.5; // Gap between experience entries
        });

        // Projects
        if (editableResume.projects && editableResume.projects.length > 0) {
          addText("KEY PROJECTS", headlineFontSize, true, [0, 0, 0]);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 1.8;
          editableResume.projects.forEach(proj => {
            if (!proj) return;
            addText(proj.heading || "Project", subHeadlineFontSize, true, [0, 0, 0]);
            if (proj.content) {
              addText(proj.content, bodyFontSize * 0.85, false, [40, 40, 40]);
            }
            proj.bullets?.forEach(bullet => {
              addText(`•  ${bullet}`, bodyFontSize * 0.85, false, [40, 40, 40]);
            });
            y += 1.5;
          });
        }

        // Education
        if (editableResume.education && editableResume.education.length > 0) {
          addText("EDUCATION", headlineFontSize, true, [0, 0, 0]);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 1.8;
          editableResume.education.forEach(edu => edu && addText(edu, bodyFontSize * 0.9, false, [40, 40, 40]));
          y += 1.5;
        }

        // Certifications
        if (editableResume.certifications && editableResume.certifications.length > 0) {
          addText("CERTIFICATIONS", headlineFontSize, true, [0, 0, 0]);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 1.8;
          editableResume.certifications.forEach(cert => cert && addText(cert, bodyFontSize * 0.9, false, [40, 40, 40]));
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
    <div className="glass-panel rounded-[3rem] p-6 lg:p-10 relative overflow-hidden group border-white/20">
      <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
        <img src="/favicon.png" alt="Lumina Icon" className="w-80 h-80 rotate-12 grayscale" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
        <div className="space-y-6 text-center xl:text-left">
          <div className="flex items-center justify-center xl:justify-start gap-5">
            <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20">
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
              <div key={feature} className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-50 border border-border/10 text-xs font-black text-primary tracking-widest uppercase opacity-70">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                {feature}
              </div>
            ))}
            <button 
              onClick={() => setShowArchive(!showArchive)}
              className={`flex items-center gap-2.5 px-6 py-2 rounded-full border text-xs font-black tracking-widest uppercase transition-all ${
                showArchive 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-slate-50 border-border/10 text-primary hover:bg-slate-100 shadow-xl"
              }`}
            >
              <Archive className="w-4 h-4" />
              {showArchive ? "Hide Archive" : `Saved Blueprints (${savedResumes.length})`}
            </button>
          </div>

          <AnimatePresence>
            {showArchive && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 20 }}
                className="mt-6 p-8 rounded-[2.5rem] bg-white/95 border border-zinc-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-3xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Blueprint Archive</h4>
                    <p className="text-[9px] text-zinc-500 font-medium font-serif italic">Curated historical candidacy architectural drafts</p>
                  </div>
                  {isLoadingArchive && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
                
                {savedResumes.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-white/10 mx-auto" />
                    <p className="text-xs text-muted-foreground font-serif italic">No architectural blueprints found in history.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {savedResumes.map((record) => (
                      <div 
                        key={record.id}
                        onClick={() => handleLoadArchive(record)}
                        className="group p-4 rounded-[1.5rem] bg-slate-50/50 border border-border/10 hover:border-primary/40 hover:bg-slate-50 transition-all cursor-pointer relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <h5 className="text-[11px] font-black text-slate-900 truncate max-w-[180px]">{record.job_title}</h5>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                              {new Date(record.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteArchive(record.id, e)}
                            className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${record.id === draftId ? 'bg-accent-emerald animate-pulse' : 'bg-zinc-200'}`} />
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-60 text-slate-900">
                            {record.id === draftId ? 'Active Signal' : 'Archived Blueprint'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 p-6 rounded-[2rem] bg-slate-50/50 border border-border/10 space-y-4 relative group">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-background text-[8px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              Strategic Calibration Hub
            </div>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl ${
                showSettings 
                  ? "bg-slate-900 text-white border border-white/20 scale-105" 
                  : "bg-slate-950 text-white/70 border border-white/10 hover:bg-slate-900 hover:text-white hover:scale-105"
              }`}
            >
              <Wand2 size={14} className={showSettings ? "animate-pulse text-primary" : ""} /> 
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Experience Detail</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={experienceBullets} 
                        onChange={(e) => setExperienceBullets(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={3}>3 Bullets (Core)</option>
                        <option value={4}>4 Bullets (Advanced)</option>
                        <option value={5}>5 Bullets (Strategic Depth)</option>
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Name Font Size</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={nameFontSize} 
                        onChange={(e) => setNameFontSize(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={14}>14pt</option>
                        <option value={15}>15pt</option>
                        <option value={16}>16pt</option>
                        <option value={17}>17pt</option>
                        <option value={18}>18pt</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Headlines</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={headlineFontSize} 
                        onChange={(e) => setHeadlineFontSize(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={12}>12pt</option>
                        <option value={13}>13pt</option>
                        <option value={14}>14pt</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Sub-Headlines</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={subHeadlineFontSize} 
                        onChange={(e) => setSubHeadlineFontSize(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={10}>10pt</option>
                        <option value={11}>11pt</option>
                        <option value={12}>12pt</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Body Content</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={bodyFontSize} 
                        onChange={(e) => setBodyFontSize(Number(e.target.value))}
                        className="w-full bg-white border border-border/40 rounded-xl px-3 py-2.5 text-[10px] outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={9}>9pt</option>
                        <option value={10}>10pt</option>
                        <option value={11}>11pt</option>
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
            className="mt-20 pt-20 border-t border-border/10 space-y-16"
          >
            <div className="flex flex-col lg:flex-row justify-between items-center glass-panel p-10 gap-8 shadow-2xl">
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
                  className="flex items-center gap-4 px-8 py-5 rounded-[1.5rem] bg-white/10 border border-primary/30 text-xs font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] active:scale-95"
                >
                  <Archive className="w-5 h-5" /> 
                  Save as Draft
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-4 px-10 py-5 rounded-[1.5rem] bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  <Download className="w-5 h-5" /> Export Premium PDF
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-5 rounded-[1.5rem] bg-slate-50 border border-border/10 hover:bg-slate-100 text-muted-foreground transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* ELITE EDITOR (Left Panel) */}
              <div className="md:col-span-4 glass-panel p-8 flex flex-col gap-8 h-fit max-h-[1100px] overflow-y-auto custom-scrollbar border-border/10">
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
                    <input className="w-full bg-slate-50 border border-border/10 rounded-2xl px-4 py-3 text-xs text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.fullName} onChange={e => setEditableHeader({...editableHeader, fullName: e.target.value})} placeholder="Full Name" />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="bg-slate-50 border border-border/10 rounded-2xl px-4 py-2 text-[10px] text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.email} onChange={e => setEditableHeader({...editableHeader, email: e.target.value})} placeholder="Email" />
                      <input className="bg-slate-50 border border-border/10 rounded-2xl px-4 py-2 text-[10px] text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.phone} onChange={e => setEditableHeader({...editableHeader, phone: e.target.value})} placeholder="Phone" />
                    </div>
                    <input className="w-full bg-slate-50 border border-border/10 rounded-2xl px-4 py-2 text-[10px] text-foreground outline-none focus:ring-1 ring-primary/40" value={editableHeader.location} onChange={e => setEditableHeader({...editableHeader, location: e.target.value})} placeholder="Location (e.g. New York, NY)" />
                  </div>

                  {/* Social/Links Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Digital Footprint</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-slate-50 border border-border/10 rounded-xl px-4 py-2 ring-primary/20 focus-within:ring-2 transition-all">
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
                      <div className="flex items-center gap-3 bg-slate-50 border border-border/10 rounded-xl px-4 py-2 ring-primary/20 focus-within:ring-2 transition-all">
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
                      className="w-full bg-slate-50 border border-border/10 rounded-xl px-4 py-3 text-xs text-foreground outline-none focus:ring-1 ring-primary/40 min-h-[120px] resize-none shadow-sm hover:border-border/30 transition-all font-medium"
                      value={editableResume?.professional_summary}
                      onChange={e => setEditableResume(prev => prev ? {...prev, professional_summary: e.target.value} : null)}
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Core Competencies</h5>
                    <textarea 
                      className="w-full bg-slate-50 border border-border/10 rounded-xl px-4 py-3 text-[11px] text-foreground outline-none focus:ring-1 ring-primary/40 min-h-[80px] shadow-sm hover:border-border/30 transition-all font-bold"
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
                        <div key={i} className="group relative space-y-3 p-5 rounded-xl bg-slate-50 border border-border/10 shadow-sm transition-all hover:border-primary/30">
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
                                 <textarea className="w-full bg-white p-2 rounded-lg border border-border/10 text-[10px] text-muted-foreground outline-none resize-none overflow-hidden hover:border-border/20 focus:border-primary/40 transition-all" rows={2} value={bullet} onChange={e => {
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

                      {addingSection === 'experience' && (
                        <div className="p-8 rounded-[2rem] bg-white border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                             <Sparkles className="w-24 h-24 text-primary" />
                          </div>
                          <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Candidacy Import</span>
                              <p className="text-[8px] text-zinc-500 font-medium uppercase tracking-widest">Architect tactical experience</p>
                            </div>
                            <button onClick={() => setAddingSection(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                              <X size={14} className="text-zinc-400" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                            {vaultItems.filter(v => v.type === 'professional').map((v, i) => (
                              <button key={i} onClick={() => handleAddFromVault(v)} className="w-full text-left p-3 rounded-lg bg-slate-50 border border-border/10 hover:border-primary/40 transition-all group">
                                <p className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors">{v.title}</p>
                                <p className="text-[8px] text-muted-foreground uppercase mt-0.5">{v.organization} • {v.period}</p>
                              </button>
                            ))}
                            <button onClick={handleManualAddExperience} className="w-full py-3 rounded-lg border border-dashed border-white/10 text-[9px] font-bold uppercase text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                              <Plus size={12} /> Add Manually
                            </button>
                          </div>
                        </div>
                      )}

                      {!addingSection && (
                        <button onClick={handleAddExperience} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                          <Plus size={14} /> Add Experience
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Strategic Projects</h5>
                    <div className="space-y-6">
                      {editableResume?.projects?.map((proj, i) => (
                        <div key={i} className="group relative space-y-3 p-5 rounded-xl bg-slate-50 border border-border/10 shadow-sm transition-all hover:border-secondary/30">
                          <div className="flex justify-between items-start">
                            <input className="w-full bg-transparent border-none text-[11px] font-bold text-foreground outline-none focus:text-secondary transition-colors" value={proj.heading} onChange={e => {
                              const newProj = [...(editableResume?.projects || [])];
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
                                 <textarea className="w-full bg-white p-2 rounded-lg border border-border/10 text-[10px] text-muted-foreground outline-none resize-none overflow-hidden hover:border-border/20 focus:border-secondary/40 transition-all" rows={2} value={bullet} onChange={e => {
                                   const newProj = [...(editableResume?.projects || [])];
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

                      {addingSection === 'projects' && (
                        <div className="p-8 rounded-[2rem] bg-white border border-secondary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                             <Wand2 className="w-24 h-24 text-secondary" />
                          </div>
                          <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Tactical Lab</span>
                              <p className="text-[8px] text-zinc-500 font-medium uppercase tracking-widest">Deploy strategic project</p>
                            </div>
                            <button onClick={() => setAddingSection(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                              <X size={14} className="text-zinc-400" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                            {vaultItems.filter(v => v.type === 'project').map((v, i) => (
                              <button key={i} onClick={() => handleAddFromVault(v)} className="w-full text-left p-3 rounded-lg bg-slate-50 border border-border/10 hover:border-secondary/40 transition-all group">
                                <p className="text-[10px] font-bold text-foreground group-hover:text-secondary transition-colors">{v.title}</p>
                                <p className="text-[8px] text-muted-foreground uppercase mt-0.5">{v.organization || "Independent Project"} • {v.period}</p>
                              </button>
                            ))}
                            <button onClick={handleManualAddProject} className="w-full py-3 rounded-lg border border-dashed border-white/10 text-[9px] font-bold uppercase text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-all flex items-center justify-center gap-2">
                              <Plus size={12} /> Add Manually
                            </button>
                          </div>
                        </div>
                      )}

                      {!addingSection && (
                        <button onClick={handleAddProject} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-all flex items-center justify-center gap-2">
                          <Plus size={14} /> Add Project
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Education Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Academic Foundation</h5>
                    <div className="space-y-4">
                      {editableResume?.education.map((edu, i) => (
                        <div key={i} className="group relative flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-border/10 hover:border-primary/20 transition-all">
                          <input className="flex-1 bg-transparent border-none text-[11px] font-bold text-foreground outline-none focus:text-primary transition-colors" value={edu} onChange={e => {
                            const newEdu = [...editableResume.education];
                            newEdu[i] = e.target.value;
                            setEditableResume({...editableResume, education: newEdu});
                          }} />
                          <button onClick={() => handleRemoveEducation(i)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-all">
                            <Minus size={14} />
                          </button>
                        </div>
                      ))}

                      {addingSection === 'education' && (
                        <div className="p-8 rounded-[2rem] bg-white border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                          <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Foundation Archive</span>
                              <p className="text-[8px] text-zinc-500 font-medium uppercase tracking-widest">Select qualification</p>
                            </div>
                            <button onClick={() => setAddingSection(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                              <X size={14} className="text-zinc-400" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                            {vaultItems.filter(v => v.type === 'education').map((v, i) => (
                              <button key={i} onClick={() => handleAddFromVault(v)} className="w-full text-left p-3 rounded-lg bg-slate-50 border border-border/10 hover:border-primary/40 transition-all group">
                                <p className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors">{v.title}</p>
                                <p className="text-[8px] text-muted-foreground uppercase mt-0.5">{v.organization} • {v.period}</p>
                              </button>
                            ))}
                            <button onClick={handleManualAddEducation} className="w-full py-3 rounded-lg border border-dashed border-white/10 text-[9px] font-bold uppercase text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                              <Plus size={12} /> Add Manually
                            </button>
                          </div>
                        </div>
                      )}

                      {!addingSection && (
                        <button onClick={handleAddEducation} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                          <Plus size={14} /> Add Education
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary/60 mb-2">Industry Credentials</h5>
                    <div className="space-y-4">
                      {editableResume?.certifications?.map((cert, i) => (
                        <div key={i} className="group relative flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-border/10 hover:border-secondary/20 transition-all">
                          <input className="flex-1 bg-transparent border-none text-[11px] font-bold text-foreground outline-none focus:text-secondary transition-colors" value={cert} onChange={e => {
                            const newCerts = [...(editableResume.certifications || [])];
                            newCerts[i] = e.target.value;
                            setEditableResume({...editableResume, certifications: newCerts});
                          }} />
                          <button onClick={() => handleRemoveCertification(i)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-all">
                            <Minus size={14} />
                          </button>
                        </div>
                      ))}

                      {addingSection === 'certifications' && (
                        <div className="p-8 rounded-[2rem] bg-white border border-secondary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                          <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Credentials Hub</span>
                              <p className="text-[8px] text-zinc-500 font-medium uppercase tracking-widest">Inject certification</p>
                            </div>
                            <button onClick={() => setAddingSection(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                              <X size={14} className="text-zinc-400" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                            {vaultItems.filter(v => v.type === 'certification').map((v, i) => (
                              <button key={i} onClick={() => handleAddFromVault(v)} className="w-full text-left p-3 rounded-lg bg-slate-50 border border-border/10 hover:border-secondary/40 transition-all group">
                                <p className="text-[10px] font-bold text-foreground group-hover:text-secondary transition-colors">{v.title}</p>
                                <p className="text-[8px] text-muted-foreground uppercase mt-0.5">{v.organization} • {v.period}</p>
                              </button>
                            ))}
                            <button onClick={handleManualAddCertification} className="w-full py-3 rounded-lg border border-dashed border-white/10 text-[9px] font-bold uppercase text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-all flex items-center justify-center gap-2">
                              <Plus size={12} /> Add Manually
                            </button>
                          </div>
                        </div>
                      )}

                      {!addingSection && (
                        <button onClick={handleAddCertification} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-all flex items-center justify-center gap-2">
                          <Plus size={14} /> Add Certification
                        </button>
                      )}
                    </div>
                  </div>

                  {/* VAULT IMPORT QUICK-ADD */}
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Import from Tactical Vault</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {vaultItems.slice(0, 3).map((item, i) => (
                        <button key={i} onClick={() => handleAddFromVault(item)} className="p-3 bg-slate-50 border border-border/10 rounded-lg text-left hover:bg-slate-100 transition-all group">
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
                style={{ 
                  fontFamily: fontFamily === 'Merriweather' ? "'Merriweather', serif" : 
                              fontFamily === 'Roboto' ? "'Roboto', sans-serif" : 
                              fontFamily === 'Inter' ? "'Inter', sans-serif" : 
                              fontFamily === 'Arial' ? "Arial, sans-serif" : "sans-serif"
                }}
              >
                <div className="text-center space-y-4">
                  <h1 className="font-bold uppercase tracking-tight text-black" style={{ fontSize: `${nameFontSize * 1.5}px`, fontFamily: 'inherit' }}>{editableHeader.fullName}</h1>
                   <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-zinc-700 font-bold uppercase tracking-wider" style={{ fontSize: `${bodyFontSize * 1.1}px`, fontFamily: 'inherit' }}>
                     <span className="flex items-center gap-1.5"><MapPin size={10} className="text-zinc-400" /> {editableHeader.location}</span>
                     <span className="opacity-30">|</span>
                     <span className="flex items-center gap-1.5 lowercase font-medium tracking-normal text-zinc-600"><Mail size={10} className="text-zinc-400" /> {editableHeader.email}</span>
                     <span className="opacity-30">|</span>
                     <span>{editableHeader.phone}</span>
                   </div>
                   
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-2 font-black tracking-widest" style={{ fontSize: `${bodyFontSize}px`, fontFamily: 'inherit' }}>
                      {editableHeader.linkedin && (
                        <div className="flex items-center gap-2 group/link">
                          <a href={editableHeader.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors uppercase border-b border-accent-blue/20 pb-0.5" style={{ fontFamily: 'inherit' }}>
                            <Linkedin size={10} /> LINKEDIN
                          </a>
                          <button onClick={() => document.getElementById('edit-linkedin')?.focus()} className="opacity-0 group-hover/link:opacity-100 p-1 text-zinc-400 hover:text-primary transition-all">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                      )}
                      {editableHeader.github && (
                        <div className="flex items-center gap-2 group/link">
                          <a href={editableHeader.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity uppercase border-b border-black/20 pb-0.5" style={{ fontFamily: 'inherit' }}>
                            <Github size={10} /> GITHUB
                          </a>
                          <button onClick={() => document.getElementById('edit-github')?.focus()} className="opacity-0 group-hover/link:opacity-100 p-1 text-zinc-400 hover:text-primary transition-all">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                      )}
                      {editableHeader.portfolio && (
                        <div className="flex items-center gap-2 group/link">
                          <a href={editableHeader.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-secondary hover:opacity-80 transition-opacity uppercase border-b border-secondary/20 pb-0.5" style={{ fontFamily: 'inherit' }}>
                            <FileText size={10} /> PORTFOLIO
                          </a>
                          <button onClick={() => document.getElementById('edit-portfolio')?.focus()} className="opacity-0 group-hover/link:opacity-100 p-1 text-zinc-400 hover:text-primary transition-all">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                      )}
                    </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-black uppercase tracking-widest whitespace-nowrap" style={{ fontSize: `${headlineFontSize * 1.1}px`, fontFamily: 'inherit' }}>Professional Summary</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <p className="leading-relaxed text-zinc-900 font-medium" style={{ fontSize: `${bodyFontSize * 1.2}px`, fontFamily: 'inherit' }}>{editableResume?.professional_summary}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-black uppercase tracking-widest whitespace-nowrap" style={{ fontSize: `${headlineFontSize * 1.1}px`, fontFamily: 'inherit' }}>Professional Experience</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <div className="space-y-4">
                      {editableResume?.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                              <h5 className="font-bold text-black" style={{ fontSize: `${subHeadlineFontSize * 1.2}px`, fontFamily: 'inherit' }}>{exp.heading}</h5>
                          </div>
                          <ul className="space-y-1 list-disc pl-4">
                            {exp.bullets?.map((bullet, j) => (
                              <li key={j} className="text-zinc-800 leading-snug font-medium" style={{ fontSize: `${bodyFontSize * 1.1}px`, fontFamily: 'inherit' }}>
                                   {bullet}
                               </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {editableResume?.projects && editableResume.projects.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-black uppercase tracking-widest whitespace-nowrap" style={{ fontSize: `${headlineFontSize * 1.1}px`, fontFamily: 'inherit' }}>Strategic Projects</h4>
                      <div className="h-[0.5px] w-full bg-zinc-300" />
                    </div>
                    <div className="space-y-3">
                      {editableResume.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                            <h5 className="font-bold text-black" style={{ fontSize: `${subHeadlineFontSize * 1.2}px`, fontFamily: 'inherit' }}>{proj?.heading || "Strategic Project"}</h5>
                          
                            <p className="leading-relaxed font-medium text-zinc-900" style={{ fontSize: `${bodyFontSize * 1.1}px`, fontFamily: 'inherit' }}>{proj?.content}</p>

                          <ul className="space-y-1 list-disc pl-4 mt-1">
                            {proj?.bullets?.map((bullet, j) => (
                              <li key={j} className="text-zinc-800 leading-snug" style={{ fontSize: `${bodyFontSize * 1.1}px`, fontFamily: 'inherit' }}>
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
                        <h4 className="font-black text-black uppercase tracking-widest whitespace-nowrap" style={{ fontSize: `${headlineFontSize * 1.1}px`, fontFamily: 'inherit' }}>Technical Stack</h4>
                        <div className="h-[0.5px] w-full bg-zinc-300" />
                      </div>
                        <p className="leading-relaxed font-medium text-zinc-800" style={{ fontSize: `${bodyFontSize * 1.2}px`, fontFamily: 'inherit' }}>{editableResume?.skills_section.join(", ")}</p>
                    </div>

                    {editableResume?.education && editableResume.education.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-black uppercase tracking-widest whitespace-nowrap" style={{ fontSize: `${headlineFontSize * 1.1}px`, fontFamily: 'inherit' }}>Education</h4>
                          <div className="h-[0.5px] w-full bg-zinc-300" />
                        </div>
                        <ul className="space-y-1">
                           {editableResume.education.map((edu, idx) => (
                             <li key={idx} className="text-zinc-800" style={{ fontSize: `${bodyFontSize * 1.2}px`, fontFamily: 'inherit' }}>
                                   <span className="font-medium">{edu}</span>
                             </li>
                           ))}
                        </ul>
                      </div>
                    )}
                    {editableResume?.certifications && editableResume.certifications.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-black uppercase tracking-widest whitespace-nowrap" style={{ fontSize: `${headlineFontSize * 1.1}px`, fontFamily: 'inherit' }}>Certifications</h4>
                          <div className="h-[0.5px] w-full bg-zinc-300" />
                        </div>
                        <ul className="space-y-1">
                           {editableResume.certifications.map((cert, idx) => (
                             <li key={idx} className="text-zinc-800" style={{ fontSize: `${bodyFontSize * 1.2}px`, fontFamily: 'inherit' }}>
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


