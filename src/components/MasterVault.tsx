import { useState, useEffect, useRef } from "react";
// Important: Use static import with ?url so Vite bundler properly packages the worker file for Vercel
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Code, GraduationCap, Award, Trash2, Edit3, Save, X, Loader2, Sparkles, User, Globe, Linkedin, Mail, Phone, MapPin, Github, Import, Zap, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { VaultItem, VaultItemType, UserProfileWithVault } from "@/types/jd";

const getFieldLabels = (type?: VaultItemType) => {
  switch (type) {
    case 'education': return {
      titleStr: "Degree / Major", titleEx: "e.g. Master of Computer Science",
      orgStr: "University / College", orgEx: "e.g. Stanford University",
      periodStr: "Graduation Timeline", periodEx: "e.g. Aug 2020 - May 2024",
      descStr: "Coursework & Academic Highlights", descEx: "List key coursework, thesis details, and academic achievements..."
    };
    case 'project': return {
      titleStr: "Project Name", titleEx: "e.g. Decentralized File System",
      orgStr: "Tech Stack / Context", orgEx: "e.g. React, Node.js, Web3",
      periodStr: "Development Timeline", periodEx: "e.g. Jan 2023 - Mar 2023",
      descStr: "Technical Details & Architecture", descEx: "Describe the systems built, technologies used, and functional impact..."
    };
    case 'certification': return {
      titleStr: "Certificate Name", titleEx: "e.g. AWS Solutions Architect Professional",
      orgStr: "Issuing Entity", orgEx: "e.g. Amazon Web Services",
      periodStr: "Date Issued / Expiration", periodEx: "e.g. Issued Oct 2023 - Valid till 2026",
      descStr: "Credential Details & Skills", descEx: "Enter Credential ID, skills validated, or link..."
    };
    case 'professional': default: return {
      titleStr: "Title / Designation", titleEx: "e.g. Lead Product Designer",
      orgStr: "Organization / Brand", orgEx: "e.g. OpenAI",
      periodStr: "Time Horizon", periodEx: "e.g. Oct 2022 - Current",
      descStr: "Raw Achievement Data (Full Context)", descEx: "Input all raw achievements here. Include internal project names, budgets, and team sizes. The AI will curate this into polished bullets later."
    };
  }
};

const calculateCompletion = (profile: UserProfileWithVault | null, items: VaultItem[]) => {
  if (!profile) return 0;
  
  let score = 0;
  // Basic Info (30%)
  if (profile.full_name?.trim()) score += 5;
  if (profile.email?.trim()) score += 5;
  if (profile.phone?.trim()) score += 5;
  if (profile.location?.trim()) score += 5;
  if (profile.linkedin_url?.trim()) score += 5;
  if (profile.website_url?.trim()) score += 5;

  // Master Summary (10%)
  if (profile.summary_master && profile.summary_master.length > 50) score += 10;

  // Experience (30%)
  const safeItems = Array.isArray(items) ? items : [];
  const expCount = safeItems.filter(i => i && i.type === 'professional').length;
  score += Math.min(expCount * 15, 30);

  // Education & Others (30%)
  const eduCount = safeItems.filter(i => i && i.type === 'education').length;
  const certCount = safeItems.filter(i => i && i.type === 'certification').length;
  const projCount = safeItems.filter(i => i && i.type === 'project').length;
  
  score += Math.min(eduCount * 10 + certCount * 10 + projCount * 10, 30);

  return Math.min(score, 100);
};

export const MasterVault = () => {
  // Version: 1.0.1 - Force build to resolve production ReferenceError
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<VaultItemType | 'profile'>('profile');
  const [items, setItems] = useState<VaultItem[]>([]);
  const [profile, setProfile] = useState<UserProfileWithVault | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<VaultItem> | null>(null);
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchData();
        // Restore drafted summary on load
        const draftedSummary = localStorage.getItem(`draft_summary_${user.id}`);
        if (draftedSummary && !profile?.summary_master) {
          setProfile(prev => prev ? { ...prev, summary_master: draftedSummary } : null);
        }

        // Nudge to complete profile
        const hasNudged = sessionStorage.getItem(`nudge_${user.id}`);
        if (!hasNudged) {
          setTimeout(() => {
            toast("Intelligence Nudge: Complete your profile to 100% for elite AI tailoring.", {
              description: "High-density profiles land 10x more clinical interviews.",
              icon: <Sparkles className="text-primary w-4 h-4" />,
            });
            sessionStorage.setItem(`nudge_${user.id}`, "true");
          }, 2000);
        }
      } else {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Persistence for Profile Summary
  useEffect(() => {
    if (user && profile?.summary_master) {
      localStorage.setItem(`draft_summary_${user.id}`, profile.summary_master);
    }
  }, [profile?.summary_master, user]);

  // Persistence for Editing Item Draft
  useEffect(() => {
    if (user && editingItem) {
      localStorage.setItem(`draft_vault_item_${user.id}`, JSON.stringify(editingItem));
    }
  }, [editingItem, user]);

  // Restore drafting item on focus/mount
  useEffect(() => {
    if (user && !editingItem) {
      const saved = localStorage.getItem(`draft_vault_item_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed.type) { 
            const safeItem = {
              ...parsed,
              skills: Array.isArray(parsed.skills) ? parsed.skills : [],
              bullets: Array.isArray(parsed.bullets) ? parsed.bullets : []
            };
            setEditingItem(safeItem);
          }
        } catch (e) {
          console.error("Failed to parse drafted item", e);
          localStorage.removeItem(`draft_vault_item_${user.id}`);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log("── VAULT DATA FETCH INITIATED ──");
      const { data: profileData, error: pError } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      const { data: vaultData, error: vError } = await supabase.from("master_vault").select("*").eq("user_id", user?.id).order('created_at', { ascending: false });

      if (pError && pError.code !== 'PGRST116') {
        console.error("Profile Fetch Error:", pError);
      }
      if (vError) {
        console.error("Vault Fetch Error:", vError);
      }

      setProfile(profileData as UserProfileWithVault);
      setItems(vaultData as VaultItem[] || []);
    } catch (err) {
      console.error("MasterVault Fetch Fatal Error:", err);
      toast.error("Initialization Failed", { description: "The tactical library could not be synchronized." });
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: { str?: string }) => item.str || "").join(" ");
      fullText += pageText + "\n";
    }
    return fullText.trim();
  };

  const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSyncing(true);
    const toastId = toast.loading("Smart Sync: Parsing your resume locally...");
    let resultText = "";

    try {
      let rawText = "";
      if (file.type === "application/pdf") {
        rawText = await extractTextFromPDF(file);
      } else {
        rawText = await file.text();
      }

      if (!rawText || rawText.trim().length < 50) {
        throw new Error("Could not extract sufficient text from this file.");
      }

      // v2.7 Resilience: Cap resume text to prevent TPM (Tokens Per Minute) spikes
      const cappedText = rawText.substring(0, 10000);

      toast.loading("[Lumina AI v2.7] Analysing & Structuring...", { id: toastId });

      const syncPrompt = `You are an expert resume parser. Extract ALL professional experience AND the candidate's personal details from this resume text.

Resume Text:
${cappedText}

RETURN JSON FORMAT ONLY:
{
  "personal_details": { "full_name": "", "phone": "", "location": "", "linkedin": "", "summary": "" },
  "experience": [{ "company": "", "role": "", "period": "", "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "period": "", "details": [] }],
  "projects": [{ "name": "", "tech_stack": "", "period": "", "details": [] }],
  "certifications": [{ "name": "", "issuer": "", "period": "", "details": [] }]
}`;

      const techModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "gemma2-9b-it"
      ];

      // Helper for exponential backoff
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      let lastError = "";
      for (let i = 0; i < techModels.length; i++) {
        const model = techModels[i];
        try {
          if (i > 0) {
            toast.loading(`Resilience: Engine busy, waiting 2s for slot... (${model.split('-')[2] || 'Alt'})`, { id: toastId });
            await sleep(2000); // 2 second pause to let TPM reset
          }

          console.log(`Smart Sync v2.7: Requesting ${model}...`);
          let { data: rawData, error: invokeError } = await supabase.functions.invoke("analyze", {
            body: {
              model: model,
              messages: [{ role: "user", content: syncPrompt + "\n\nIMPORTANT: Return ONLY valid JSON." }],
              response_format: { type: "json_object" }
            },
          });

          // ── EMERGENCY FALLBACK: Try Local API Proxy if Edge Function Fails ──
          if (invokeError && (invokeError.message?.includes("Failed to send a request") || invokeError.status === 404)) {
            console.warn(`Smart Sync: Edge Function unreachable. Switching to Local API Proxy for ${model}...`);
            try {
              const apiResponse = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: model,
                  messages: [{ role: "user", content: syncPrompt + "\n\nIMPORTANT: Return ONLY valid JSON." }],
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
            // Resilience: Continue on Rate Limit (429) OR Discovery Error (400/404)
            console.warn(`Smart Sync: Model ${model} failed (${invokeError.message}).`);
            lastError = `Model ${model} failed (${invokeError.message})`;
            continue;
          }

          if (!rawData) {
            lastError = `Model ${model} returned null data`;
            continue;
          }

          if (rawData.error) {
            lastError = rawData.error;
            console.warn(`Smart Sync: Model ${model} reported error: ${rawData.error}`);
            continue;
          }

          resultText = rawData.choices?.[0]?.message?.content;
          if (resultText) {
            console.log(`Smart Sync: Success with ${model}`);
            break;
          }
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : String(err);
          if (lastError.includes("429") || lastError.includes("Rate Limit")) continue;
          throw err;
        }
      }

      if (!resultText) {
        throw new Error(`[SYNC_FAULT_v2.7] ${lastError || "All engines currently reaching capacity."}`);
      }


      const firstBrace = resultText.indexOf("{");
      const lastBrace = resultText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) throw new Error("AI returned no valid JSON.");

      const structData = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));

      let combinedItems: Omit<VaultItem, 'id' | 'created_at'>[] = [];

      if (structData?.experience) {
        combinedItems = combinedItems.concat(structData.experience.map((exp: { company: string; role: string; period?: string; bullets: string[] }) => ({
          user_id: user.id, type: 'professional' as VaultItemType,
          title: exp.role || exp.company || "Imported Role", organization: exp.company || "Imported Org",
          period: exp.period || "Not Specified", description: (exp.bullets || []).join("\n"), bullets: exp.bullets || [], skills: [], is_quantified: (exp.bullets || []).some((b: string) => /[\d%]/.test(b))
        })));
      }

      if (structData?.education) {
        combinedItems = combinedItems.concat(structData.education.map((edu: { institution: string; degree: string; period?: string; details: string[] }) => ({
          user_id: user.id, type: 'education' as VaultItemType,
          title: edu.degree || "Degree", organization: edu.institution || "Institution",
          period: edu.period || "Not Specified", description: (edu.details || []).join("\n"), bullets: edu.details || [], skills: [], is_quantified: false
        })));
      }

      if (structData?.projects) {
        combinedItems = combinedItems.concat(structData.projects.map((proj: { name: string; tech_stack: string; period?: string; details: string[] }) => ({
          user_id: user.id, type: 'project' as VaultItemType,
          title: proj.name || "Project", organization: proj.tech_stack || "Tech Context",
          period: proj.period || "Not Specified", description: (proj.details || []).join("\n"), bullets: proj.details || [], skills: [], is_quantified: false
        })));
      }

      if (structData?.certifications) {
        combinedItems = combinedItems.concat(structData.certifications.map((cert: { name: string; issuer: string; period?: string; details: string[] }) => ({
          user_id: user.id, type: 'certification' as VaultItemType,
          title: cert.name || "Certificate", organization: cert.issuer || "Issuer",
          period: cert.period || "Not Specified", description: (cert.details || []).join("\n"), bullets: cert.details || [], skills: [], is_quantified: false
        })));
      }

      if (combinedItems.length > 0) {
        const { error: insertError } = await supabase.from("master_vault").insert(combinedItems);
        if (insertError) throw insertError;
      }

      if (structData?.personal_details) {
        const pd = structData.personal_details;
        const updateParams: { full_name?: string; phone?: string; location?: string; linkedin_url?: string; summary_master?: string } = {};
        if (pd.full_name && pd.full_name !== "Full Name") updateParams.full_name = pd.full_name;
        if (pd.phone && pd.phone !== "Phone Number") updateParams.phone = pd.phone;
        if (pd.location && pd.location !== "City, State") updateParams.location = pd.location;
        if (pd.linkedin && pd.linkedin !== "extracted linkedin url") updateParams.linkedin_url = pd.linkedin;
        if (pd.summary && pd.summary !== "Create a strong executive summary matching their profile (max 3 sentences).") {
          updateParams.summary_master = pd.summary;
        }

        if (Object.keys(updateParams).length > 0) {
          const { error: profileError } = await supabase.from("profiles").update(updateParams).eq("id", user.id);
          if (profileError) console.error("Auto profile update failed:", profileError);
        }
      }

      toast.success("Smart Sync complete: Experience structured into vault!", { id: toastId });
      fetchData();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (typeof err === "object" ? JSON.stringify(err) : String(err));
      toast.error(`Smart Sync failed: ${msg}`, { id: toastId, duration: 8000 });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      // Field Sanitization: Only send fields that belong in the profiles table
      const { id, email, created_at, ...updateData } = profile;

      console.log("MasterVault: Updating profile with data:", updateData);

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user?.id);
      if (error) {
        console.error("MasterVault Profile Update Error:", error);
        throw error;
      }

      localStorage.removeItem(`draft_summary_${user.id}`);
      toast.success("Profile updated in Master Vault.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestMetrics = () => {
    if (!editingItem?.description) return;
    toast.info("Quantifier Assistant: Look for areas where you improved efficiency, saved cost, or reduced time.");
    const suggested = editingItem.description + "\n\n[?] Tip: Add a metric here (e.g. 'Improved efficiency by 25%').";
    setEditingItem({ ...editingItem, description: suggested });
  };

  const handleSaveItem = async () => {
    if (!editingItem || !user) return;
    try {
      // Field Sanitization: Remove system fields & detect quantification
      const hasNumbers = /[\d%]/.test(editingItem.description || "") || (editingItem.bullets || []).some(b => /[\d%]/.test(b));

      const itemToSave = {
        ...editingItem,
        is_quantified: hasNumbers
      };

      console.log("MasterVault: Archiving item:", itemToSave);

      if (editingItem.id) {
        const { error } = await supabase.from("master_vault").update(itemToSave).eq("id", editingItem.id);
        if (error) {
          console.error("MasterVault Update Error:", error);
          throw error;
        }
      } else {
        const { error } = await supabase.from("master_vault").insert({
          ...itemToSave,
          user_id: user.id,
          type: editingItem.type || 'professional' // Ensure required type is present
        } as unknown as Record<string, unknown>); // Cast to bypass strict Postgrest type checking
        if (error) {
          console.error("MasterVault Insert Error:", error);
          throw error;
        }
      }

      toast.success("Profile entry saved.");
      localStorage.removeItem(`draft_vault_item_${user.id}`);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save item. Check if you have special characters or if a field is too long.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this item from your profile?")) return;
    try {
      const { error } = await supabase.from("master_vault").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center space-y-8 min-h-[60vh] animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
          <img 
            src="/favicon.png" 
            alt="Lumina" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 animate-pulse" 
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif italic text-foreground">Initializing Tactical Library...</h3>
          <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Securing Career Intelligence Signal</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-24 text-center space-y-8 min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
          <User className="w-10 h-10 text-primary/40" />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-display font-bold tracking-tight text-foreground">Tactical Profile Restricted</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">Your persistent career library is securely encrypted. Sign in to access smart-sync and AI tailoring features.</p>
        </div>
        <Link to="/auth" className="group relative px-10 py-4 bg-lumina-teal text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-95 shadow-2xl overflow-hidden">
          <span className="relative z-10">Proceed to Secure Login</span>
          <div className="absolute inset-0 bg-accent-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-emerald">Signal Active</span>
          </div>
          <h2 className="text-5xl font-display font-bold tracking-tighter text-foreground flex items-center gap-4">
            Tactical Profile
          </h2>
          <p className="text-muted-foreground font-medium max-w-lg">Your master career dataset. Every achievement stored here powers the AI generation engine.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh Vault
        </button>
      </div>

      {/* ── READINESS PROGRESS BAR (RELOCATED) ── */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 w-full max-w-lg bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateCompletion(profile, items)}%` }}
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">{calculateCompletion(profile, items)}% Integrity</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Readiness Signal</span>
          </div>
        </div>
      </div>

      {/* ── SMART SYNC HERO CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group overflow-hidden rounded-[3rem] p-[1px] bg-gradient-to-br from-primary/40 via-white/5 to-secondary/40 shadow-2xl transition-all"
      >
        <div className="relative bg-slate-950/90 rounded-[3rem] p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row items-center gap-10">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Zap className="w-64 h-64 text-primary" />
          </div>

          <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <img src="/favicon.png" alt="" className="w-3 h-3 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Zero-Effort Architecture</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl lg:text-4xl font-serif italic text-white leading-tight">
                Extract Details From <br className="hidden md:block" /> Your Professional Resume
              </h3>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Our AI extraction engine instantly structures your historical candidacy data.
                Upload your resume to automatically populate your tactical profile with 0.1% accuracy.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportResume}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSyncing}
                className="group relative flex items-center gap-4 px-10 py-5 rounded-2xl bg-black text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all overflow-hidden border border-white/10"
              >
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Import className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />}
                Attach Resume File
              </button>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest px-4 border-l border-white/10 h-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                Smart Sync Ready
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 flex items-center justify-center relative">
            <div className="w-32 lg:w-48 h-32 lg:h-48 rounded-full bg-primary/20 blur-[60px] absolute" />
            <div className="relative p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md transform -rotate-3 hover:rotate-0 transition-transform pointer-events-none">
              <div className="w-full space-y-3">
                <div className="h-2 w-24 bg-white/20 rounded-full" />
                <div className="h-2 w-32 bg-white/10 rounded-full" />
                <div className="h-2 w-16 bg-white/5 rounded-full" />
              </div>
              <div className="absolute -bottom-4 -right-4 p-4 rounded-xl bg-primary shadow-xl">
                <img 
                  src="/favicon.png" 
                  alt="" 
                  className="w-6 h-6 object-contain brightness-0 invert" 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── MANUAL ENTRY BRIDGING SECTION ── */}
      <div className="relative py-12 flex flex-col items-center">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="relative px-8 bg-background flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-primary/30" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/60">OR</span>
            <div className="w-8 h-px bg-primary/30" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
            Refine Your Tactical Profile Manually
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-12 pt-8">

        {/* ── SECTION: IDENTITY ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 pl-4">
            <User size={18} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/70">Personal Identity</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="premium-card p-8 lg:p-10 space-y-8 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, full_name: e.target.value }) : null)}
                    placeholder="Full Legal Name"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Base Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.location || ""}
                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    placeholder="e.g. Bangalore, KA"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Secure Contact</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.phone || ""}
                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">LinkedIn HQ</label>
                <div className="relative group">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.linkedin_url || ""}
                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, linkedin_url: e.target.value }) : null)}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">GitHub / Code</label>
                <div className="relative group">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.github_url || ""}
                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, github_url: e.target.value }) : null)}
                    placeholder="github.com/username"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Portfolio / Website</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.website_url || ""}
                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, website_url: e.target.value }) : null)}
                    placeholder="portfolio.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Master Professional Summary</label>
              <textarea
                className="w-full bg-background/40 border border-border/40 rounded-3xl p-6 text-sm focus:ring-2 ring-primary/20 transition-all h-40 resize-none outline-none"
                value={profile?.summary_master || ""}
                onChange={(e) => setProfile(prev => prev ? ({ ...prev, summary_master: e.target.value }) : null)}
                placeholder="Paste every achievement, skill, and mission statement here. The AI will distill the 0.1% strongest parts for every application."
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  if (confirm("EMERGENCY RESET: This will clear all local drafts and unsaved changes. Your saved vault items remain safe in the cloud. Proceed?")) {
                    localStorage.removeItem(`draft_summary_${user.id}`);
                    localStorage.removeItem(`draft_vault_item_${user.id}`);
                    fetchData();
                    toast.success("Local state re-synchronized.");
                  }
                }}
                className="text-[9px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
              >
                Emergency Reset
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-bold bg-lumina-teal text-white hover:scale-[1.05] transition-all shadow-xl shadow-teal-500/10 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Identity Signal
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION: EXPERIENCE ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pl-4">
            <div className="flex items-center gap-4">
              <Briefcase size={18} className="text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/70">Strategic Experience</h3>
              <div className="h-px w-32 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <button
              onClick={() => setEditingItem({ type: 'professional', bullets: [], skills: [], title: '', organization: '', period: '', description: '' })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Plus size={14} /> Add Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {items.filter(item => item.type === 'professional').map((item) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="premium-card p-8 flex flex-col justify-between gap-6 group hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-xl leading-none">{item.title}</h4>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest">{item.organization}</p>
                      </div>
                      {item.is_quantified && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-500 uppercase tracking-tighter">
                          <Zap className="w-3 h-3 fill-current" />
                          Quantified
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium bg-muted/30 w-fit px-3 py-1 rounded-full border border-white/5">
                      <Clock className="w-3 h-3" />
                      {item.period}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/70 line-clamp-3 italic">"{item.description}"</p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button onClick={() => setEditingItem(item)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/40 hover:bg-muted text-[10px] font-bold uppercase tracking-widest transition-all"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 rounded-xl bg-muted/40 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {items.filter(item => item.type === 'professional').length === 0 && (
              <div className="col-span-full py-12 border-2 border-dashed border-white/5 rounded-[3rem] text-center text-muted-foreground text-sm font-medium italic opacity-40">
                No tactical experience mapped. Use "Smart Sync" or "Add Role" to begin.
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION: EDUCATION ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pl-4">
            <div className="flex items-center gap-4">
              <GraduationCap size={18} className="text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/70">Academic Pedigree</h3>
              <div className="h-px w-32 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <button
              onClick={() => setEditingItem({ type: 'education', bullets: [], skills: [], title: '', organization: '', period: '', description: '' })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Plus size={14} /> Add Degree
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {items.filter(item => item.type === 'education').map((item) => (
                <motion.div
                  key={item.id}
                  className="premium-card p-8 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-lg">{item.title}</h4>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest">{item.organization}</p>
                    <p className="text-xs text-muted-foreground">{item.period}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingItem(item)} className="p-2.5 rounded-xl bg-muted/40 hover:bg-muted font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 rounded-xl bg-muted/40 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── SECTION: PROJECTS & CERTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between pl-4">
              <div className="flex items-center gap-4">
                <Code size={18} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/70">Projects</h3>
              </div>
              <button onClick={() => setEditingItem({ type: 'project', bullets: [], skills: [], title: '', organization: '', period: '', description: '' })} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"><Plus size={20} /></button>
            </div>
            <div className="space-y-4">
              {items.filter(item => item.type === 'project').map(item => (
                <div key={item.id} className="premium-card p-6 flex justify-between items-center group">
                  <div>
                    <h5 className="font-display font-bold text-base">{item.title}</h5>
                    <p className="text-[10px] text-muted-foreground uppercase">{item.organization}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingItem(item)} className="text-muted-foreground hover:text-primary"><Edit3 size={14} /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between pl-4">
              <div className="flex items-center gap-4">
                <Award size={18} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/70">Credentials</h3>
              </div>
              <button onClick={() => setEditingItem({ type: 'certification', bullets: [], skills: [], title: '', organization: '', period: '', description: '' })} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"><Plus size={20} /></button>
            </div>
            <div className="space-y-4">
              {items.filter(item => item.type === 'certification').map(item => (
                <div key={item.id} className="premium-card p-6 flex justify-between items-center group">
                  <div>
                    <h5 className="font-display font-bold text-base">{item.title}</h5>
                    <p className="text-[10px] text-muted-foreground uppercase">{item.organization}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingItem(item)} className="text-muted-foreground hover:text-primary"><Edit3 size={14} /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal - Upgraded for Quantifier Assistant */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
            // Removed backdrop-click close to prevent accidental data loss
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="premium-card w-full max-w-3xl p-10 relative z-10 overflow-hidden border border-white/10 shadow-3xl shadow-black/50"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold">Refine Tactical Detail</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Type: {editingItem.type}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Close without saving? Unsaved changes will be held in draft.")) {
                      setEditingItem(null);
                    }
                  }}
                  className="p-3 rounded-2xl hover:bg-muted transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">{getFieldLabels(editingItem.type).titleStr}</label>
                    <input
                      className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                      value={editingItem.title || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder={getFieldLabels(editingItem.type).titleEx}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">{getFieldLabels(editingItem.type).orgStr}</label>
                    <input
                      className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                      value={editingItem.organization || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                      placeholder={getFieldLabels(editingItem.type).orgEx}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">{getFieldLabels(editingItem.type).periodStr}</label>
                  <input
                    className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={editingItem.period || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                    placeholder={getFieldLabels(editingItem.type).periodEx}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">{getFieldLabels(editingItem.type).descStr}</label>
                    <button
                      onClick={handleSuggestMetrics}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                      <Zap className="w-3 h-3" /> Suggest Metrics
                    </button>
                  </div>
                  <textarea
                    className="w-full bg-muted/20 border border-border/40 rounded-3xl p-6 text-sm h-48 resize-none focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder={getFieldLabels(editingItem.type).descEx}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Keyword Tags (Comma separated)</label>
                  <input
                    className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={Array.isArray(editingItem.skills) ? editingItem.skills.join(", ") : ""}
                    onChange={(e) => setEditingItem({ ...editingItem, skills: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                    placeholder="Vector DBs, LLM Fine-tuning, PyTorch..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-10 mt-6 border-t border-white/5">
                <button
                  onClick={() => {
                    if (confirm("Discard draft permanently? All typed content in this form will be erased.")) {
                      localStorage.removeItem(`draft_vault_item_${user?.id}`);
                      setEditingItem(null);
                    }
                  }}
                  className="px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/30 transition-all"
                >
                  Discard Draft
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-12 py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] bg-foreground text-background hover:scale-105 transition-all shadow-2xl shadow-foreground/20 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
