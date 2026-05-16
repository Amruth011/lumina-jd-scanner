import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, Copy, X, Wand2, FileText, CheckCircle2, AlertCircle, ArrowRight, Github, Linkedin, Mail, MapPin, Plus, Minus, Archive, ArrowUp, ArrowDown } from "lucide-react";
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
  forceTab?: 'resume' | 'cover-letter';
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
  settings?: {
    fontFamily: string;
    nameFontSize: number;
    headlineFontSize: number;
    subHeadlineFontSize: number;
    bodyFontSize: number;
    tone: string;
  };
}

export const ResumeGenerator = ({ jdTitle, jdSkills, companyName, forceTab }: ResumeGeneratorProps) => {
  console.log("ResumeGenerator: Rendering with props", { jdTitle, jdSkills: jdSkills?.length, companyName });
  
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [isOpen, setIsOpen] = useState(!!forceTab);
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);
  const [resumeSettingsActive, setResumeSettingsActive] = useState(false);
  const [clSettingsActive, setClSettingsActive] = useState(false);
  
  useEffect(() => {
    console.log("ResumeGenerator: Mounted");
  }, []);
  const [summaryLines, setSummaryLines] = useState(3);
  const [projectLines, setProjectLines] = useState(3);
  const [productLines, setProductLines] = useState(3);
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
  const [clFocus, setClFocus] = useState<"Technical" | "Leadership" | "Cultural">("Technical");
  const [clLength, setClLength] = useState<"Concise" | "Detailed">("Concise");
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
  const [sectionOrder, setSectionOrder] = useState<string[]>(['SUMMARY', 'EDUCATION', 'EXPERIENCE', 'PRODUCTS', 'PROJECTS', 'LEADERSHIP', 'SKILLS', 'AWARDS', 'CERTIFICATIONS']);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    'SUMMARY': true,
    'EDUCATION': true,
    'EXPERIENCE': true,
    'PROJECTS': true,
    'PRODUCTS': true,
    'LEADERSHIP': true,
    'SKILLS': true,
    'AWARDS': true,
    'CERTIFICATIONS': true
  });

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
      leadership: record.content.leadership || [],
      certifications: record.content.certifications || [],
      awards: record.content.awards || []
    };
    
    setResume(hydratedContent);
    setEditableResume(hydratedContent);
    setEditableHeader(record.header_data);
    
    if (record.settings) {
      setFontFamily(record.settings.fontFamily as "Inter" | "Roboto" | "Merriweather" | "Arial");
      setNameFontSize(record.settings.nameFontSize);
      setHeadlineFontSize(record.settings.headlineFontSize);
      setSubHeadlineFontSize(record.settings.subHeadlineFontSize);
      setBodyFontSize(record.settings.bodyFontSize);
      setTone(record.settings.tone as "Professional" | "Modern" | "Aggressive");
    }
    
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
      const prompt = `You are an elite Silicon Valley executive resume architect.
Your goal is to synthesize a high-impact, ATS-optimized resume in the precise "Andrew Vu" executive style.

### CONTEXT:
Job Target: ${jdTitle} at ${companyName || "this company"}
Target Skills: ${jdSkills.map(s => s.skill).join(", ")}
Candidate Profile: ${JSON.stringify(vaultItems.slice(0, 15).map(v => ({ title: v.title, org: v.organization, desc: v.description, bullets: v.bullets })), null, 2)}

### CORE MANDATE:
- Quantify EVERYTHING. Use metrics (%, $, time, scale) in every bullet.
- Use strong action verbs (Spearheaded, Orchestrated, Engineered).
- DATE FORMAT: Use 3-letter month abbreviations ONLY (e.g., "Jan 2024", "May 2027", "Aug 2023 – Present").
- SECTION DENSITY MANDATE:
    - PROFESSIONAL SUMMARY: Exactly ${summaryLines} high-impact sentences.
    - EXPERIENCE BULLETS: Exactly ${experienceBullets} bullets per role.
    - PROJECT BULLETS: Exactly ${projectLines} bullets per project.
    - PRODUCT/STARTUP BULLETS: Exactly ${productLines} bullets per product.
- SECTION INTEGRITY & CLASSIFICATION (CRITICAL): 
    - EXPERIENCE: Only for formal employment, internships, and fellowships. (e.g., 'Data Science Intern').
    - PROJECTS: Technical builds, open-source contributions, or academic projects. (e.g., 'Kannada Book AI Agent').
    - PRODUCTS: Startups, SaaS products, or ventures founded by the user. (e.g., 'Lumina').
    - NO HALLUCINATIONS: Do NOT create fake professional experience from certifications or projects. If the user has only 1 job in their profile, show ONLY that 1 job in EXPERIENCE. 
    - STRICT QUANTITY: You MUST generate exactly the number of items provided in the "Candidate Profile" for each category. For example, if there is 1 experience entry provided, generate EXACTLY 1 in the JSON. If there are 3 projects, generate EXACTLY 3. 
    - DO NOT invent additional entries to "fill space". 
    - DO NOT mix these categories. If an item is a project, it MUST stay in PROJECTS. If it is a startup, it MUST stay in PRODUCTS.
    - DO NOT include certifications/awards in any other section. Keep them in AWARDS or CERTIFICATIONS. (CRITICAL: 'AI Engineer for Data Scientists Associate' or anything from 'DataCamp' is a CERTIFICATION, NOT experience).
- CUSTOM STRUCTURE MANDATE:
    - You MUST follow this exact section sequence: SUMMARY → EDUCATION → EXPERIENCE → PRODUCTS → PROJECTS → LEADERSHIP → SKILLS → AWARDS → CERTIFICATIONS.
    - ONLY include sections that are TRUE in this list: ${sectionOrder.filter(s => visibleSections[s]).join(', ')}.
    - If a section like 'LEADERSHIP' or 'AWARDS' is NOT in this list, you MUST OMIT IT from the JSON response entirely.

### SCHEMA REQUIREMENTS:
1. EDUCATION: Must include School, Degree, GPA, Date, and Location.
2. EXPERIENCE: Professional roles with quantified impact.
3. PRODUCTS: Startups or SaaS products founded by the user.
4. PROJECTS: Technical achievements with stack details.
5. LEADERSHIP: Non-work impact or community roles.
6. SKILLS: Categorized (e.g., "Languages: Python, Go").
7. AWARDS: Competitive wins or recognition.

Return ONLY a JSON object with this exact structure:
{
  "professional_summary": "High-density strategic overview",
  "skills_section": ["Languages: ...", "Frameworks: ..."],
  "experience": [
    {
      "heading": "Job Title @ Company - City, State",
      "content": "Jan 2024 – Present",
      "bullets": ["Action verb + Task + Result [Metric]"]
    }
  ],
  "products": [
    {
      "heading": "Product/Startup Name @ Venture Status - City, State",
      "content": "Jan 2023 – Present",
      "bullets": ["Traction metric + Value proposition"]
    }
  ],
  "projects": [
    {
      "heading": "Project Name - Tech Stack",
      "content": "Feb 2023 – May 2023",
      "bullets": ["Achievement with [Metric]"]
    }
  ],
  "leadership": [
    {
      "heading": "Role @ Organization",
      "content": "Sep 2022 – Dec 2023",
      "bullets": ["Leadership achievement"]
    }
  ],
  "education": ["Degree @ University - City, State | Expected May 2027 | GPA: X.X"],
  "certifications": ["Cert Name (Issuer) - 2024"],
  "awards": ["Award Name (Organization) - 2024"]
}`;

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      let resultText = "";
      const models = [
        "llama-3.1-8b-instant",       // High reliability, fast
        "llama-3.3-70b-versatile",    // High intelligence
        "llama-3.1-70b-versatile",    // Fallback intelligence
        "mixtral-8x7b-32768"          // Secondary fallback
      ];
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
          if (invokeError) {
            console.warn(`Lumina Intelligence: Primary Edge Function error for ${model}. Triggering Local API Proxy Fallback...`);
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
                console.log(`Lumina Intelligence: Success via Local API Proxy with ${model}`);
              } else {
                const proxyError = await apiResponse.json().catch(() => ({ error: apiResponse.statusText }));
                lastError = `Proxy Fault (${apiResponse.status}): ${proxyError.details || proxyError.error || "Unknown error"}`;
                console.error(`Lumina Intelligence: Local API Proxy failed for ${model}:`, lastError);
              }
            } catch (apiErr) {
              lastError = `Proxy Connection Fault: ${apiErr instanceof Error ? apiErr.message : String(apiErr)}`;
              console.error("Local API Proxy connection failed:", apiErr);
            }
          }

          if (invokeError) {
            // Check if invokeError has a response body we can parse
            let detailedMessage = invokeError.message;
            
            // Handle Supabase function error details if available
            if (invokeError.name === 'FunctionsHttpError') {
              try {
                const body = await invokeError.context.json();
                detailedMessage = body.details || body.error || detailedMessage;
              } catch (e) {
                // Not JSON or no context
              }
            }

            // Only update lastError if proxy didn't already set a more specific one
            if (!lastError.includes("Proxy")) {
              lastError = detailedMessage || "Function invocation failed";
            }
            
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
        toast.error("Deep Tailoring Fault", {
          id: "gen-toast",
          description: `All AI engines were unable to process this request. Specific Error: ${lastError.slice(0, 100)}... 
          Troubleshooting: 
          1. Ensure your Master Vault (Profile tab) is not empty.
          2. Check if your Groq API Key has reached its rate limit.
          3. Try with a shorter Job Description.`,
          duration: 6000
        });
        return;
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
        leadership: structData.leadership || [],
        certifications: structData.certifications || [],
        awards: structData.awards || []
      } as GeneratedResume;

      setResume(hydratedData);
      setEditableResume(hydratedData);
      setIsOpen(true);
      toast.success("Silicon Valley Modern resume generated!");
    } catch (err: unknown) {
      console.error("Generation process failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isMissingKey = errorMessage.includes("your_groq_api_key_here") || errorMessage.includes("Missing GROQ_API_KEY");
      
      toast.error("Tailoring Engine Fault", {
        description: isMissingKey 
          ? "Groq API Key not configured. Please add your key to the .env file or Supabase secrets."
          : errorMessage || "System overloaded. Retrying in 30s...",
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
        updated_at: new Date().toISOString(),
        settings: {
          fontFamily,
          nameFontSize,
          headlineFontSize,
          subHeadlineFontSize,
          bodyFontSize,
          tone
        }
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
        const currentFont = fontMap[fontFamily as keyof typeof fontMap] || "helvetica";
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

        // --- HEADER ---
        const navyBlue: [number, number, number] = [0, 71, 171];
        const navyBlue: [number, number, number] = [0, 71, 171];
        const fontMap = {
          "Inter": "helvetica",
          "Roboto": "helvetica",
          "Merriweather": "times",
          "Arial": "helvetica"
        };
        const currentFont = fontMap[fontFamily as keyof typeof fontMap] || "helvetica";

        const drawSectionHeader = (title: string) => {
          y += 2;
          pdf.setTextColor(...navyBlue);
          pdf.setFont(currentFont, "bold");
          pdf.setFontSize(headlineFontSize);
          pdf.text(title.toUpperCase(), margin, y);
          y += 1.5;
          pdf.setDrawColor(...navyBlue);
          pdf.setLineWidth(0.4);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 5;
        };

        if (editableResume) {
          // --- SUMMARY ---
          if (editableResume.professional_summary) {
            drawSectionHeader("SUMMARY");
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(currentFont, "normal");
            pdf.setFontSize(bodyFontSize);
            const lines = pdf.splitTextToSize(editableResume.professional_summary, pageWidth - (margin * 2));
            pdf.text(lines, margin, y);
            y += (lines.length * 4.5) + 4;
          }

          // --- EDUCATION ---
          if (editableResume.education?.length) {
            drawSectionHeader("EDUCATION");
            editableResume.education.forEach(edu => {
              const parts = edu.split('|');
              const mainInfo = parts[0].split('@');
              const school = mainInfo[1]?.trim() || "University";
              const degree = mainInfo[0]?.trim() || "Degree";
              const metadata = parts.slice(1).join(' | ');

              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "bold");
              pdf.setFontSize(subHeadlineFontSize);
              pdf.text(school, margin, y);
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text("May 2027", pageWidth - margin, y, { align: "right" });
              y += 4.5;
              pdf.setFont(currentFont, "italic");
              pdf.setFontSize(bodyFontSize);
              pdf.text(`${degree} ${metadata && `| ${metadata}`}`, margin, y);
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text(editableHeader.location || "Gainesville, FL", pageWidth - margin, y, { align: "right" });
              y += 8;
            });
          }

          // --- EXPERIENCE ---
          if (editableResume.experience?.length) {
            drawSectionHeader("EXPERIENCE");
            editableResume.experience.forEach(exp => {
              const parts = exp.heading.split('@');
              const role = parts[0]?.trim() || "Role";
              const orgParts = parts[1]?.split('-') || [];
              const org = orgParts[0]?.trim() || "Organization";
              const loc = orgParts[1]?.trim() || editableHeader.location;

              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "bold");
              pdf.setFontSize(subHeadlineFontSize);
              pdf.text(role, margin, y);
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text(exp.content || "Date – Present", pageWidth - margin, y, { align: "right" });
              y += 4.5;
              pdf.setFont(currentFont, "italic");
              pdf.setFontSize(bodyFontSize);
              pdf.text(org, margin, y);
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text(loc || "", pageWidth - margin, y, { align: "right" });
              y += 5;

              exp.bullets?.forEach(bullet => {
                pdf.setFont(currentFont, "normal");
                pdf.setFontSize(bodyFontSize);
                const cleanBullet = bullet.replace(/^[•\s*-]+/, '').trim();
                const lines = pdf.splitTextToSize(`• ${cleanBullet}`, pageWidth - (margin * 2) - 4);
                pdf.text(lines, margin + 4, y);
                y += (lines.length * 4.5);
              });
              y += 2;
            });
          }

          // --- PRODUCTS ---
          if (editableResume.products?.length) {
            drawSectionHeader("PRODUCTS & VENTURES");
            editableResume.products.forEach(prod => {
              const [title, status] = prod.heading.split('-');
              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "bold");
              pdf.setFontSize(subHeadlineFontSize);
              pdf.text(title?.trim() || "Product", margin, y);
              if (status) {
                pdf.setFont(currentFont, "normal");
                pdf.setFontSize(bodyFontSize);
                pdf.text(` | ${status.trim()}`, margin + pdf.getTextWidth(title?.trim() || "Product"), y);
              }
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text(prod.content || "Operational", pageWidth - margin, y, { align: "right" });
              y += 5;

              prod.bullets?.forEach(bullet => {
                pdf.setFont(currentFont, "normal");
                pdf.setFontSize(bodyFontSize);
                const cleanBullet = bullet.replace(/^[•\s*-]+/, '').trim();
                const lines = pdf.splitTextToSize(`• ${cleanBullet}`, pageWidth - (margin * 2) - 4);
                pdf.text(lines, margin + 4, y);
                y += (lines.length * 4.5);
              });
              y += 2;
            });
          }

          // --- PROJECTS ---
          if (editableResume.projects?.length) {
            drawSectionHeader("PROJECTS");
            editableResume.projects.forEach(proj => {
              const [title, stack] = proj.heading.split('-');
              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "bold");
              pdf.setFontSize(subHeadlineFontSize);
              pdf.text(title?.trim() || "Project", margin, y);
              if (stack) {
                pdf.setFont(currentFont, "normal");
                pdf.setFontSize(bodyFontSize);
                pdf.text(` | ${stack.trim()}`, margin + pdf.getTextWidth(title?.trim() || "Project"), y);
              }
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text(proj.content || "", pageWidth - margin, y, { align: "right" });
              y += 5;

              proj.bullets?.forEach(bullet => {
                pdf.setFont(currentFont, "normal");
                pdf.setFontSize(bodyFontSize);
                const cleanBullet = bullet.replace(/^[•\s*-]+/, '').trim();
                const lines = pdf.splitTextToSize(`• ${cleanBullet}`, pageWidth - (margin * 2) - 4);
                pdf.text(lines, margin + 4, y);
                y += (lines.length * 4.5);
              });
              y += 2;
            });
          }

          // --- LEADERSHIP ---
          if (editableResume.leadership?.length) {
            drawSectionHeader("LEADERSHIP");
            editableResume.leadership.forEach(lead => {
              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "bold");
              pdf.setFontSize(subHeadlineFontSize);
              pdf.text(lead.heading, margin, y);
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize - 1);
              pdf.text(lead.content || "", pageWidth - margin, y, { align: "right" });
              y += 5;

              lead.bullets?.forEach(bullet => {
                pdf.setFont(currentFont, "normal");
                pdf.setFontSize(bodyFontSize);
                const cleanBullet = bullet.replace(/^[•\s*-]+/, '').trim();
                const lines = pdf.splitTextToSize(`• ${cleanBullet}`, pageWidth - (margin * 2) - 4);
                pdf.text(lines, margin + 4, y);
                y += (lines.length * 4.5);
              });
              y += 2;
            });
          }

          // --- SKILLS ---
          if (editableResume.skills_section?.length) {
            drawSectionHeader("SKILLS");
            editableResume.skills_section.forEach(skillLine => {
              const [category, skills] = skillLine.split(':');
              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "bold");
              pdf.setFontSize(bodyFontSize);
              pdf.text(`${category?.trim() || "Category"}:`, margin, y);
              pdf.setFont(currentFont, "normal");
              const skillsText = skills?.trim() || "";
              const lines = pdf.splitTextToSize(skillsText, pageWidth - margin - (margin + pdf.getTextWidth(`${category?.trim()}: `)));
              pdf.text(lines, margin + pdf.getTextWidth(`${category?.trim()}: `), y);
              y += (lines.length * 4.5) + 1;
            });
          }

          // --- CERTIFICATIONS ---
          if (editableResume.certifications?.length) {
            drawSectionHeader("CERTIFICATIONS");
            editableResume.certifications.forEach(cert => {
              pdf.setTextColor(0, 0, 0);
              pdf.setFont(currentFont, "normal");
              pdf.setFontSize(bodyFontSize);
              const lines = pdf.splitTextToSize(`• ${cert}`, pageWidth - (margin * 2));
              pdf.text(lines, margin, y);
              y += (lines.length * 4.5) + 1;
            });
          }
        }

      const safeName = (editableHeader.fullName || profile?.full_name || "Resume").replace(/[^a-z0-9]/gi, '_');
      
      try {
        pdf.save(`Lumina-AI-Resume-${safeName}.pdf`);
        toast.success("Silicon Valley Modern PDF Exported!");
      } catch (saveErr) {
        // Fallback for manual trigger if pdf.save() fails
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', `Lumina-AI-Resume-${safeName}.pdf`);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 200);
        toast.success("PDF exported via fallback!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to render Premium PDF.");
    }
  };

  const handleDownloadDOC = () => {
    if (!resume || !editableResume) return;
    try {
      const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Resume - ${editableHeader.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; margin: 0.5in; }
            h1 { font-size: 24pt; text-align: center; margin-bottom: 0; text-transform: uppercase; }
            .header-meta { text-align: center; font-size: 10pt; color: #666; margin-bottom: 20px; }
            h2 { font-size: 14pt; border-bottom: 1px solid #ccc; margin-top: 20px; text-transform: uppercase; }
            h3 { font-size: 12pt; margin-bottom: 5px; }
            p { font-size: 11pt; margin-bottom: 10px; }
            ul { margin-bottom: 15px; }
            li { font-size: 11pt; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>${editableHeader.fullName}</h1>
          <div class="header-meta">
            ${editableHeader.location ? `${editableHeader.location} | ` : ""}${editableHeader.phone ? `${editableHeader.phone} | ` : ""}${editableHeader.email}
            <br/>
            ${editableHeader.linkedin ? `LinkedIn: ${editableHeader.linkedin} ` : ""}${editableHeader.github ? `| GitHub: ${editableHeader.github} ` : ""}${editableHeader.portfolio ? `| Portfolio: ${editableHeader.portfolio}` : ""}
          </div>
          
          <h2>Professional Summary</h2>
          <p>${editableResume.professional_summary}</p>
          
          <h2>Core Competencies</h2>
          <p>${editableResume.skills_section.join(" • ")}</p>
          
          <h2>Experience</h2>
          ${editableResume.experience?.map(exp => `
            <div>
              <h3>${exp.heading}</h3>
              ${exp.content ? `<p><i>${exp.content}</i></p>` : ""}
              <ul>
                ${exp.bullets?.map(bullet => `<li>${bullet}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
          
          ${editableResume.projects && editableResume.projects.length > 0 ? `
            <h2>Key Projects</h2>
            ${editableResume.projects.map(proj => `
              <div>
                <h3>${proj.heading}</h3>
                ${proj.content ? `<p><i>${proj.content}</i></p>` : ""}
                <ul>
                  ${proj.bullets?.map(bullet => `<li>${bullet}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
          ` : ""}
          
          <h2>Education</h2>
          ${editableResume.education?.map(edu => `<p>${edu}</p>`).join("")}
          
          ${editableResume.certifications && editableResume.certifications.length > 0 ? `
            <h2>Certifications</h2>
            ${editableResume.certifications.map(cert => `<p>${cert}</p>`).join("")}
          ` : ""}
        </body>
        </html>
      `;

      const safeName = (editableHeader.fullName || profile?.full_name || "Resume").replace(/[^a-z0-9]/gi, '_');
      
      // Use Data URI for maximum browser compatibility with filenames
      const encodedContent = encodeURIComponent(content);
      const dataUri = `data:application/vnd.ms-word;charset=utf-8,\ufeff${encodedContent}`;
      
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUri;
      link.setAttribute('download', `Lumina-Resume-${safeName}.doc`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);
      
      toast.success("Silicon Valley Modern Word Document Exported!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to render Word Document.");
    }
  };

  const generateCoverLetter = async () => {
    // If no resume is generated, we use the raw vault items as context
    const contextData = editableResume || {
      note: "Candidate has not generated a tailored resume yet. Use their Master Vault items as context.",
      experience: vaultItems.map(v => ({ heading: v.title + (v.organization ? ` @ ${v.organization}` : ""), content: v.description, bullets: v.bullets || [] }))
    };

    setIsGeneratingCL(true);
    toast.loading("Synthesizing Cover Letter...", { id: "cl-gen" });

    try {
      const { data, error } = await supabase.functions.invoke("cover-letter", {
        body: {
          jd: jdTitle + (jdSkills?.length ? ` with skills: ${jdSkills.map(s => s.skill).join(", ")}` : ""),
          resume: contextData,
          tone: tone,
          focus: clFocus,
          length: clLength
        }
      });

      if (error) throw error;
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI returned empty content");

      setCoverLetter(content);
      toast.success("Elite Cover Letter Synthesized!", { id: "cl-gen" });
    } catch (err) {
      console.error("Cover Letter Error:", err);
      toast.error("Failed to generate cover letter.", { id: "cl-gen" });
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const handleDownloadCL = (format: 'pdf' | 'doc') => {
    if (!coverLetter) return;
    const safeName = (editableHeader.fullName || profile?.full_name || "Resume").replace(/[^a-z0-9]/gi, '_');

    if (format === 'doc') {
      const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Cover Letter</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; margin: 1in;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin-bottom: 5px;">${editableHeader.fullName}</h2>
            <p>${editableHeader.location} | ${editableHeader.phone} | ${editableHeader.email}</p>
          </div>
          <p>${new Date().toLocaleDateString()}</p>
          <div style="white-space: pre-wrap;">${coverLetter}</div>
        </body>
        </html>
      `;
      const encodedContent = encodeURIComponent(content);
      const dataUri = `data:application/vnd.ms-word;charset=utf-8,\ufeff${encodedContent}`;
      const link = document.createElement('a');
      link.href = dataUri;
      link.setAttribute('download', `Lumina-Cover-Letter-${safeName}.doc`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 200);
    } else {
      const pdf = new jsPDF();
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      
      let y = 20;
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(editableHeader.fullName, pageWidth/2, y, { align: "center" });
      y += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${editableHeader.location} | ${editableHeader.phone} | ${editableHeader.email}`, pageWidth/2, y, { align: "center" });
      y += 15;
      
      pdf.text(new Date().toLocaleDateString(), margin, y);
      y += 10;
      
      // Body
      const lines = pdf.splitTextToSize(coverLetter, pageWidth - (margin * 2));
      pdf.text(lines, margin, y);
      
      pdf.save(`Lumina-Cover-Letter-${safeName}.pdf`);
    }
  };

  return (
    <div className="glass-panel rounded-[3rem] p-6 lg:p-10 relative overflow-hidden group border-white/20">
      <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
        <img src="/favicon.png" alt="Lumina Icon" className="w-80 h-80 rotate-12 grayscale" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20">
          <Wand2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-4xl font-serif italic text-foreground tracking-tight">Candidacy Synthesizer</h3>
          <p className="text-[18px] text-muted-foreground max-w-2xl font-medium leading-relaxed font-serif italic opacity-80">
            Our <span className="text-foreground font-semibold not-italic">Silicon Valley Modern</span> engine crafts a high-impact, ATS-optimized signature using only your most relevant tactical experiences.
          </p>
        </div>
      </div>

      {/* ── ACTION SUITE: DUAL ENGINES ── */}
      <div className="relative z-10 w-full mt-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 1. Resume Blueprint Engine */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-10 rounded-[4rem] border-foreground/5 bg-white shadow-2xl shadow-slate-200/50 flex flex-col space-y-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-lumina-teal/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-lumina-teal/10 transition-colors" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-lumina-teal/10 flex items-center justify-center text-lumina-teal">
                  <FileText size={28} />
                </div>
                {resume && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Blueprint Ready</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-slate-900">Resume Blueprint</h3>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                  Calibrate your strategic parameters before synthesizing a high-fidelity, ATS-hardened resume blueprint.
                </p>
              </div>

              {!resumeSettingsActive ? (
                <button
                  onClick={() => setResumeSettingsActive(true)}
                  className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                >
                  <Wand2 size={14} /> Open Detailed Synthesis Options
                </button>
              ) : (
                <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategy Tone</label>
                      <select 
                        value={tone} 
                        onChange={(e) => setTone(e.target.value as "Professional" | "Modern" | "Aggressive")}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-lumina-teal/20 transition-all"
                      >
                        <option value="Modern">Modern</option>
                        <option value="Professional">Professional</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Typography</label>
                      <select 
                        value={fontFamily} 
                        onChange={(e) => setFontFamily(e.target.value as "Inter" | "Roboto" | "Merriweather" | "Arial")}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-lumina-teal/20 transition-all"
                      >
                        <option value="Inter">Inter (Clean)</option>
                        <option value="Roboto">Roboto (Technical)</option>
                        <option value="Merriweather">Merriweather (Serif)</option>
                        <option value="Arial">Arial (Standard)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Granular Font Scaling (pt)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500">Name Size</label>
                        <input type="number" value={nameFontSize} onChange={e => setNameFontSize(Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500">Headlines</label>
                        <input type="number" value={headlineFontSize} onChange={e => setHeadlineFontSize(Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500">Sub-Headings</label>
                        <input type="number" value={subHeadlineFontSize} onChange={e => setSubHeadlineFontSize(Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500">Body Text</label>
                        <input type="number" value={bodyFontSize} onChange={e => setBodyFontSize(Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summary Density</label>
                      <select 
                        value={summaryLines} 
                        onChange={(e) => setSummaryLines(Number(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-lumina-teal/20 transition-all"
                      >
                        {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Lines</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience Bullets</label>
                      <select 
                        value={experienceBullets} 
                        onChange={(e) => setExperienceBullets(Number(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-lumina-teal/20 transition-all"
                      >
                        {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Bullets</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Bullets</label>
                      <select 
                        value={projectLines} 
                        onChange={(e) => setProjectLines(Number(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-lumina-teal/20 transition-all"
                      >
                        {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Bullets</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product/Startup Bullets</label>
                      <select 
                        value={productLines} 
                        onChange={(e) => setProductLines(Number(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-lumina-teal/20 transition-all"
                      >
                        {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Bullets</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Architecture & Sequence</label>
                    <div className="space-y-2 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100">
                      {sectionOrder.map((section, index) => (
                        <div key={section} className="flex items-center justify-between group/sec bg-white p-3 rounded-xl border border-slate-100 hover:border-lumina-teal/30 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
                              }}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${visibleSections[section] ? 'bg-lumina-teal text-white' : 'bg-slate-200 text-slate-400'}`}
                            >
                              <CheckCircle2 size={12} className={visibleSections[section] ? 'opacity-100' : 'opacity-0'} />
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${visibleSections[section] ? 'text-slate-700' : 'text-slate-300 line-through'}`}>{section}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/sec:opacity-100 transition-opacity">
                            <button 
                              disabled={index === 0}
                              onClick={() => {
                                const newOrder = [...sectionOrder];
                                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                setSectionOrder(newOrder);
                              }}
                              title="Move Up"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-20 transition-all hover:text-lumina-teal"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button 
                              disabled={index === sectionOrder.length - 1}
                              onClick={() => {
                                const newOrder = [...sectionOrder];
                                [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
                                setSectionOrder(newOrder);
                              }}
                              title="Move Down"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-20 transition-all hover:text-lumina-teal"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
                              }}
                              title={visibleSections[section] ? "Remove Section" : "Restore Section"}
                              className={`p-1.5 rounded-lg transition-all ${visibleSections[section] ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}
                            >
                              {visibleSections[section] ? <Minus size={12} /> : <Plus size={12} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Line Spacing</label>
                      <div className="flex gap-2">
                        {[1.0, 1.15, 1.4].map(s => (
                          <button 
                            key={s} 
                            onClick={() => setLineSpacing(s as 1.0 | 1.15 | 1.4)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lineSpacing === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                          >
                            {s === 1.0 ? 'Compact' : s === 1.15 ? 'Standard' : 'Relaxed'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Margins</label>
                      <div className="flex gap-2">
                        {[0.5, 1.0].map(m => (
                          <button 
                            key={m} 
                            onClick={() => setMarginSize(m as 0.5 | 1.0)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${marginSize === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                          >
                            {m === 0.5 ? 'Narrow' : 'Standard'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={executeTacticalSynthesis}
                    disabled={isGenerating}
                    className="relative overflow-hidden group/btn flex items-center justify-center gap-4 w-full py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] bg-lumina-teal text-white hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-70 shadow-xl shadow-teal-500/20"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : resume ? (
                      <><Wand2 className="w-5 h-5" /> Regenerate Blueprint</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Generate Blueprint</>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setResumeSettingsActive(false)}
                    className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Close Settings
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* 2. Cover Letter Synthesis */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-10 rounded-[4rem] border-foreground/5 bg-white shadow-2xl shadow-slate-200/50 flex flex-col space-y-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-slate-900/10 transition-colors" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-slate-900/5 flex items-center justify-center text-slate-900 border border-slate-100">
                  <Mail size={28} />
                </div>
                {coverLetter && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Letter Synthesized</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-slate-900">Cover Letter</h3>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                  Calibrate your narrative focus and length before synthesizing an elite cover letter.
                </p>
              </div>

              {!clSettingsActive ? (
                <button
                  onClick={() => setClSettingsActive(true)}
                  className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                >
                  <Mail size={14} /> Open Detailed Synthesis Options
                </button>
              ) : (
                <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Narrative Focus</label>
                      <select 
                        value={clFocus} 
                        onChange={(e) => setClFocus(e.target.value as "Technical" | "Leadership" | "Cultural")}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-slate-900/20 transition-all"
                      >
                        <option value="Technical">Technical Excellence</option>
                        <option value="Leadership">Leadership Impact</option>
                        <option value="Cultural">Cultural Alignment</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Length Mode</label>
                      <select 
                        value={clLength} 
                        onChange={(e) => setClLength(e.target.value as "Concise" | "Detailed")}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-slate-900/20 transition-all"
                      >
                        <option value="Concise">Concise (Fast Read)</option>
                        <option value="Detailed">Detailed (High Context)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voice Tone</label>
                    <div className="flex gap-2">
                      {["Modern", "Professional", "Aggressive"].map(t => (
                        <button 
                          key={t} 
                          onClick={() => setTone(t as "Professional" | "Modern" | "Aggressive")}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${tone === t ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      generateCoverLetter();
                      setIsOpen(true);
                    }}
                    disabled={isGeneratingCL}
                    className="relative overflow-hidden group/btn flex items-center justify-center gap-4 w-full py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] bg-slate-950 text-white hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-70 shadow-xl shadow-slate-950/20"
                  >
                    {isGeneratingCL ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Writing...</>
                    ) : coverLetter ? (
                      <><Mail className="w-5 h-5" /> Regenerate Letter</>
                    ) : (
                      <><Mail className="w-5 h-5" /> Synthesize Letter</>
                    )}
                  </button>

                  <button 
                    onClick={() => setClSettingsActive(false)}
                    className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Close Settings
                  </button>
                </div>
              )}
            </div>

            {coverLetter && (
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => handleDownloadCL('pdf')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <Download size={12} /> PDF
                </button>
                <button 
                  onClick={() => handleDownloadCL('doc')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <Download size={12} /> DOC
                </button>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-16 flex flex-col items-center space-y-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Metric-First bullets",
              "ATS-Gold Template",
              "Semantic Gap Injection"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-50 border border-border/10 text-xs font-black text-primary tracking-widest uppercase opacity-70">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                {feature}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowArchive(!showArchive)}
            className={`flex items-center gap-2.5 px-10 py-4 rounded-full border text-xs font-black tracking-[0.2em] uppercase transition-all ${
              showArchive 
                ? "bg-slate-950 text-white border-slate-950" 
                : "bg-slate-50 border-border/10 text-slate-600 hover:bg-slate-100 shadow-xl shadow-slate-200/40"
            }`}
          >
            <Archive className="w-4 h-4" />
            {showArchive ? "Hide Archive" : `View Saved Blueprints (${savedResumes.length})`}
          </button>

          <AnimatePresence>
            {showArchive && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 20 }}
                className="w-full max-w-4xl p-8 rounded-[3rem] bg-white/95 border border-zinc-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-3xl space-y-6"
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
        </div>
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
              fontFamily={fontFamily}
              onUpdate={(updatedResume, updatedHeader) => {
                setResume(updatedResume);
                setEditableResume(updatedResume);
                setEditableHeader(updatedHeader);
              }}
              onRegenerate={executeTacticalSynthesis}
              onDownloadPDF={handleDownloadPDF}
              onDownloadDOC={handleDownloadDOC}
              coverLetter={coverLetter}
              isGeneratingCL={isGeneratingCL}
              onGenerateCL={generateCoverLetter}
              onDownloadCL={handleDownloadCL}
              initialTab={forceTab}
              nameFontSize={nameFontSize}
              headlineFontSize={headlineFontSize}
              subHeadlineFontSize={subHeadlineFontSize}
              bodyFontSize={bodyFontSize}
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


