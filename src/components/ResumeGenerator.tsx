import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2, FileText, CheckCircle2, AlertCircle, ArrowRight, Github, Linkedin, Mail, MapPin, Plus, Minus, Archive } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Skill, VaultItem, UserProfileWithVault, GeneratedResume } from "@/types/jd";
import jsPDF from "jspdf";
import { ResumePreview } from "./resume-tailor/ResumePreview";

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
  console.log("ResumeGenerator: Rendering with props", { jdTitle, jdSkills: jdSkills?.length, companyName });
  
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);
  
  useEffect(() => {
    console.log("ResumeGenerator: Mounted");
  }, []);
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

  // Layout & Blueprint Typography Settings
  const [lineSpacing, setLineSpacing] = useState<1.0 | 1.15 | 1.4>(1.15);
  const [marginSize, setMarginSize] = useState<0.5 | 1.0>(1.0);
  const [baseFontSize, setBaseFontSize] = useState(11);

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
    
    const handleExportTrigger = () => {
      if (resume) {
        handleDownloadPDF();
      } else {
        toast.info("Generate a resume first to export.");
      }
    };

    window.addEventListener('trigger-resume-export', handleExportTrigger);
    return () => window.removeEventListener('trigger-resume-export', handleExportTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, jdTitle, resume]);

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
      // Email: prefer profiles table, fall back to auth user email (it lives in supabase.auth.users not profiles)
      const authEmail = user?.email || "";
      const resolvedEmail = (profileData.email || "").trim() || authEmail;
      setEditableHeader({
        fullName: profileData.full_name || "",
        email: resolvedEmail.toLowerCase(),
        phone: profileData.phone || "",
        location: profileData.location || "",
        linkedin: profileData.linkedin_url || "",
        portfolio: profileData.website_url || "",
        github: profileData.github_url || ""
      });
    } else if (user?.email) {
      // Profile row doesn't exist yet — at minimum pre-fill the email
      setEditableHeader(prev => ({ ...prev, email: user.email!.toLowerCase() }));
    }
  };

  /**
   * Main Resume Generation Lifecycle
   * ===============================
   * 1. Orchestrates multi-engine AI requests.
   * 2. Implements progressive fallback if primary models fail.
   * 3. Parses complex JSON output into the local application state.
   * 4. Updates JD scan history for future analytics.
   */
  const executeTacticalSynthesis = async () => {
    if (vaultItems.length === 0) {
      toast.error("Tactical Profile Empty", {
        description: "Please synchronize your Master Vault or add roles in the Profile tab to enable automated tailoring.",
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
Your goal is to create a resume that is 100% ATS-friendly and passes machine parsers with a 100/100 compatibility score. 

Job Target: ${jdTitle} at ${companyName || "this company"}
Target Skills (CRITICAL): ${jdSkills.map(s => s.skill).join(", ")}

Candidate Profile:
${JSON.stringify(vaultItems.map(v => ({ title: v.title, org: v.organization, desc: v.description, bullets: v.bullets })), null, 2)}

STRATEGY FOR 100% SCORE:
1. TONE: Use a ${tone} tone. ${tone === 'Aggressive' ? 'Focus on high-growth metrics and leadership impact. Prioritize keyword density.' : tone === 'Professional' ? 'Focus on executive authority and structured domain expertise.' : 'Focus on lean efficiency and modern tactical precision.'}
2. QUANTIFICATION: Every single bullet point MUST contain a hard quantified metric (%, $, x, or integer). Estimate realistic numbers if not available.
3. ABSOLUTE SKILL INJECTION: You MUST include EVERY SINGLE skill from "Target Skills" in the "skills_section" array. Use the EXACT wording from the JD.
4. "DATA MANAGEMENT" & "MODELING": If the JD mentions "Data Management" or "Data Modeling," you MUST include these exact phrases in your experience bullets and skills section.
5. KEYWORD ALIGNMENT: Weave every one of the Target Skills into the experience and project bullets. Use the exact phrase "Data Management" and "Data Modeling" to describe relevant work.
6. STRUCTURE: Standard ATS-only headers: Professional Summary, Core Competencies, Experience, Projects, Education, Certifications.
7. PROFESSIONAL SUMMARY: Write EXACTLY ${summaryLines} complete sentences. Start with a powerful headline that includes the job title "${jdTitle}".
8. EXPERIENCE BULLETS: Each job entry MUST have EXACTLY ${experienceBullets} items. 
9. PROJECT BULLETS: Each project entry MUST have EXACTLY ${projectLines} items.
10. ATS COMPLIANCE: No tables, no graphics, no columns. Plain text.
11. NO VAGUE CLAIMS: Replace generic verbs with specific achievements + metrics.

SELF-CHECK BEFORE RETURNING JSON:
✓ Does the resume mention every single Target Skill at least twice?
✓ Is "Data Management" included if present in JD?
✓ Is "Data Modeling" included if present in JD?
✓ Is the sentence count for summary EXACTLY ${summaryLines}?

RETURN ONLY VALID JSON:
{
  "professional_summary": "Elite ${jdTitle} with deep expertise in ${jdSkills.slice(0,3).map(s => s.skill).join(", ")}. [Sentence 2 with high-impact metric]. [Sentence 3 focusing on tactical ROI].",
  "skills_section": [${jdSkills.map(s => `"${s.skill}"`).join(", ")}],
  "experience": [
    {
      "heading": "Job Title @ Company Name",
      "content": "Tech stack used.",
      "bullets": ["Led Data Management for...", "Implemented Data Modeling using...", "...(EXACTLY ${experienceBullets} bullets total, each starting with an action verb and containing a metric)"]
    }
  ],
  "projects": [
    {
      "heading": "Project Name",
      "content": "Tech stack used.",
      "bullets": ["(EXACTLY ${projectLines} bullets per project, each with a hard metric)"]
    }
  ],
  "education": ["Degree - University"],
  "certifications": ["Cert Name"]
}`;

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      let resultText = "";
      const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "gemma2-9b-it", "llama-3.1-8b-instant"];
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
            toast.success(`Silicon Valley Modern resume generated via ${model}!`, { id: "gen-toast" });
            break;
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          console.error(`Lumina Tailoring: ${model} crash:`, lastError);
          // If this is the last model, we'll throw the error outside the loop
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
      } as any, { onConflict: 'user_id,job_title' }).select("id"); // eslint-disable-line @typescript-eslint/no-explicit-any

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
        { label: editableHeader.linkedin ? editableHeader.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toUpperCase() : "LINKEDIN", url: formatUrl(editableHeader.linkedin) },
        { label: editableHeader.github ? editableHeader.github.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toUpperCase() : "GITHUB", url: formatUrl(editableHeader.github) },
        { label: editableHeader.portfolio ? editableHeader.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toUpperCase() : "PORTFOLIO", url: formatUrl(editableHeader.portfolio) }
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Project Bullets</label>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <select 
                        value={projectLines} 
                        onChange={(e) => setProjectLines(Number(e.target.value))}
                        className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-bold"
                      >
                        <option value={2}>2 Bullets (High Velocity)</option>
                        <option value={3}>3 Bullets (Standard Impact)</option>
                        <option value={5}>5 Bullets (Senior Executive)</option>
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
                  
                  <div className="grid grid-cols-1 gap-6 pt-2 border-t border-white/5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Blueprint Font Scale</label>
                        <span className="text-[10px] font-black text-lumina-teal">{baseFontSize}px</span>
                      </div>
                      <input 
                        type="range" min="10" max="12" step="0.5" 
                        value={baseFontSize} 
                        onChange={(e) => setBaseFontSize(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100/10 rounded-lg appearance-none cursor-pointer accent-lumina-teal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Line Density</label>
                        <div className="flex gap-1.5">
                          {[1.0, 1.15, 1.4].map((s) => (
                            <button 
                              key={s} 
                              onClick={() => setLineSpacing(s as 1.0 | 1.15 | 1.4)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all ${lineSpacing === s ? 'bg-lumina-teal border-lumina-teal text-white' : 'bg-slate-50 border-transparent text-[#1E2A3A]/40 hover:bg-slate-100'}`}
                            >
                              {s.toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Blueprint Margins</label>
                        <div className="flex gap-1.5">
                          {[0.5, 1.0].map((m) => (
                            <button 
                              key={m} 
                              onClick={() => setMarginSize(m as 0.5 | 1.0)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all ${marginSize === m ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-transparent text-[#1E2A3A]/40 hover:bg-slate-100'}`}
                            >
                              {m.toFixed(1)}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={executeTacticalSynthesis}
          disabled={isGenerating}
          className="relative overflow-hidden group/btn flex items-center gap-5 px-14 py-7 rounded-full text-[13px] font-black uppercase tracking-[0.3em] bg-lumina-teal text-white hover:scale-110 transition-all duration-500 active:scale-95 disabled:opacity-70"
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
            className="mt-20 pt-20 border-t border-[#1E2A3A]/10 space-y-24"
          >
            {/* ── Unified Preview & Edit Experience ── */}
            <ResumePreview 
              resume={resume}
              header={editableHeader}
              vaultItems={vaultItems}
              isGenerating={isGenerating}
              baseFontSize={baseFontSize}
              lineSpacing={lineSpacing}
              marginSize={marginSize}
              fontFamily={fontFamily}
              onUpdate={(updatedResume, updatedHeader) => {
                setResume(updatedResume);
                setEditableResume(updatedResume);
                setEditableHeader(updatedHeader);
              }}
              onRegenerate={executeTacticalSynthesis}
              onDownload={handleDownloadPDF}
            />

            <div className="flex justify-center pb-20">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs font-display font-bold uppercase tracking-[0.5em] text-[#1E2A3A]/40 hover:text-[#1E2A3A] transition-all"
              >
                Close Blueprint Preview
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


