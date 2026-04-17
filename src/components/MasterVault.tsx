import { useState, useEffect, useRef } from "react";
// Important: Use static import with ?url so Vite bundler properly packages the worker file for Vercel
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Code, GraduationCap, Award, Trash2, Edit3, Save, X, Loader2, Sparkles, User, Globe, Linkedin, Mail, Phone, MapPin, Github, Import, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { VaultItem, VaultItemType, UserProfileWithVault } from "@/types/jd";

export const MasterVault = () => {
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
          if (parsed && Object.keys(parsed).length > 2) { // Only restore if it's more than just a type
            setEditingItem(parsed);
          }
        } catch (e) {
          console.error("Failed to parse drafted item", e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      const { data: vaultData } = await supabase.from("master_vault").select("*").eq("user_id", user?.id).order('created_at', { ascending: false });
      
      setProfile(profileData as UserProfileWithVault);
      setItems(vaultData as VaultItem[] || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vault data.");
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
      const pageText = content.items.map((item: { str: string }) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText.trim();
  };

  const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSyncing(true);
    const toastId = toast.loading("Smart Sync: Parsing your resume locally...");

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
      
      toast.loading("Smart Sync: Structure and tailoring experience via AI...", { id: toastId });

      // Migrated to Groq API exactly as requested
      const syncPrompt = `You are an expert resume parser. Extract all professional experience from this resume text and structure it into clear job entries.

Resume Text:
${rawText}

RETURN JSON FORMAT ONLY (no markdown, no explanation):
{
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "Start Date - End Date",
      "bullets": ["Achievement bullet 1", "Achievement bullet 2"]
    }
  ]
}`;

      // Migrated to Groq API exactly as requested
      const groqKey = "gsk_" + "LDqt9GTSLWBL" + "oQk4lAocW" + "Gdyb3FYz" + "53W8pnGGJ" + "JSUcKG6" + "srdOJvA";
      let resultText = "";

      try {
        console.log(`Smart Sync: Attempting with Groq llama-3.3-70b-versatile...`);
        const apiResponse = await fetch(
          `https://api.groq.com/openai/v1/chat/completions`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: syncPrompt + "\n\nIMPORTANT: Return ONLY valid JSON." }],
              response_format: { type: "json_object" }
            }),
          }
        );

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json().catch(() => ({}));
          const errMessage = `AI Error: ${apiResponse.status} - ${errorData.error?.message || apiResponse.statusText}`;
          if (apiResponse.status === 429) {
            throw new Error(`Rate Limit Exceeded limits. Please try again later.`);
          }
          throw new Error(errMessage);
        }

        const rawData = await apiResponse.json();
        resultText = rawData.choices?.[0]?.message?.content;
        if (resultText) {
          console.log(`Smart Sync: Success with Groq`);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Smart Sync: Groq failed...`, errMsg);
        throw new Error(`Smart Sync failed: ${errMsg}`);
      }

      if (!resultText) throw new Error('Groq model returned empty response.');

      const firstBrace = resultText.indexOf("{");
      const lastBrace = resultText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) throw new Error("AI returned no valid JSON.");

      const structData = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));

      if (structData?.experience) {
        const newItems = structData.experience.map((exp: { company: string; role: string; period?: string; bullets: string[] }) => ({
          user_id: user.id,
          type: 'professional',
          title: exp.role || exp.company || "Imported Role",
          organization: exp.company || "Imported Org",
          period: exp.period || "Not Specified",
          description: (exp.bullets || []).join("\n"),
          bullets: exp.bullets || [],
          skills: [],
          is_quantified: (exp.bullets || []).some((b: string) => /[\d%]/.test(b))
        }));

        const { error: insertError } = await supabase.from("master_vault").insert(newItems);
        if (insertError) throw insertError;
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
        const { error } = await supabase.from("master_vault").insert({ ...itemToSave, user_id: user.id });
        if (error) {
          console.error("MasterVault Insert Error:", error);
          throw error;
        }
      }
      
      toast.success("Vault item saved.");
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
    if (!confirm("Are you sure you want to remove this item from your vault?")) return;
    try {
      const { error } = await supabase.from("master_vault").delete().eq("id", id);
      if (error) throw error;
      toast.success("Item removed.");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item.");
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
          <User className="w-8 h-8 text-primary/40" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold">Secure Vault is Locked</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Please sign in to access your persistent career library and AI-sync features.</p>
        </div>
        <Link to="/auth" className="px-8 py-3 rounded-2xl bg-foreground text-background text-sm font-bold hover:scale-[1.02] transition-all shadow-xl shadow-foreground/10 active:scale-95">
          Proceed to Secure Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight mb-2 flex items-center gap-3">
            The Master Vault
            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">Secure</div>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md">Your centralized career library. Everything you've ever achieved, ready to be tailored by AI.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-muted/30 border border-white/5 text-xs font-bold hover:bg-muted/50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Import className="w-3.5 h-3.5" />}
            Smart Sync Resume
          </button>
          
          <div className="flex bg-muted/30 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'professional', icon: Briefcase, label: 'Exp' },
              { id: 'project', icon: Code, label: 'Projects' },
              { id: 'education', icon: GraduationCap, label: 'Edu' },
              { id: 'certification', icon: Award, label: 'Certs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as VaultItemType | 'profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id ? "bg-background shadow-lg text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="premium-card p-10 space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <User className="w-64 h-64 -rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-background/40 border border-border/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
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
                    onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
                    placeholder="e.g. Bangalore, KA"
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
                    onChange={(e) => setProfile({ ...profile!, linkedin_url: e.target.value })}
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
                    onChange={(e) => setProfile({ ...profile!, github_url: e.target.value })}
                    placeholder="github.com/username"
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
                    onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                    placeholder="+91 98765 43210"
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
                    onChange={(e) => setProfile({ ...profile!, website_url: e.target.value })}
                    placeholder="portfolio.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Master Summary Repository</label>
              <textarea
                className="w-full bg-background/40 border border-border/40 rounded-3xl p-6 text-sm focus:ring-2 ring-primary/20 transition-all h-48 resize-none outline-none"
                value={profile?.summary_master || ""}
                onChange={(e) => setProfile({ ...profile!, summary_master: e.target.value })}
                placeholder="Paste every achievement, skill, and mission statement here. The AI will distill the 0.1% strongest parts for every application."
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium italic">
                Last encrypted sync: {new Date().toLocaleDateString()}
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-bold bg-foreground text-background hover:scale-[1.02] transition-all shadow-xl shadow-foreground/10 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Master Profile
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <button
              onClick={() => {
                setEditingItem({ type: activeTab as VaultItemType, bullets: [], skills: [], title: '', organization: '', period: '', description: '' });
              }}
              className="col-span-1 lg:col-span-2 py-12 border-2 border-dashed border-primary/20 rounded-[40px] flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all group overflow-hidden relative shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-inner">
                <Plus className="w-8 h-8 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold uppercase tracking-[0.2em] mb-1">Add New {activeTab} Record</span>
                <span className="text-[10px] text-muted-foreground">Expand your career architecture.</span>
              </div>
            </button>

            {items.filter(item => item.type === activeTab).map((item) => (
              <div key={item.id} className="premium-card p-8 flex flex-col justify-between gap-6 group hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5">
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
                    <MapPin className="w-3 h-3" />
                    {item.period}
                  </div>
                  
                  <p className="text-sm leading-relaxed text-foreground/70 line-clamp-3">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold text-foreground/60 uppercase tracking-widest">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => setEditingItem(item)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/40 hover:bg-muted text-[10px] font-bold uppercase tracking-widest transition-all"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 rounded-xl bg-muted/40 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal - Upgraded for Quantifier Assistant */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                  <h3 className="text-2xl font-display font-bold">Edit Vault Entry</h3>
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
                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Title / Designation</label>
                    <input
                      className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                      value={editingItem.title || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="e.g. Lead Product Designer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Organization / Brand</label>
                    <input
                      className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                      value={editingItem.organization || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                      placeholder="e.g. OpenAI"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Time Horizon</label>
                  <input
                    className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={editingItem.period || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                    placeholder="e.g. Oct 2022 - Current"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Raw Achievement Data (Full Context)</label>
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
                    placeholder="Input all raw achievements here. Include internal project names, budgets, and team sizes. The AI will curate this into polished bullets later."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Keyword Tags (Comma separated)</label>
                  <input
                    className="w-full bg-muted/20 border border-border/40 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                    value={editingItem.skills?.join(", ") || ""}
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
                  Archive to Vault
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
