import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  RotateCcw, 
  Plus, 
  Minus, 
  User, 
  Briefcase, 
  Award, 
  GraduationCap, 
  Save,
  X,
  Database,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Trash2,
  Type,
  Layers,
  Cpu,
  Sparkles,
  Rocket
} from "lucide-react";
import { GeneratedResume, VaultItem } from "@/types/jd";
import { toast } from "sonner";
import { CollapsibleSection } from "./ui/CollapsibleSection";

interface ResumeHeader {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
}

interface ResumePreviewProps {
  resume: GeneratedResume;
  header: ResumeHeader;
  vaultItems: VaultItem[];
  onUpdate: (updatedResume: GeneratedResume, updatedHeader: ResumeHeader) => void;
  onRegenerate: () => void;
  onDownloadPDF: () => void;
  onDownloadDOC: () => void;
  isGenerating: boolean;
  initialTab?: 'resume' | 'cover-letter';
  nameFontSize: number;
  headlineFontSize: number;
  subHeadlineFontSize: number;
  bodyFontSize: number;
  fontFamily: string;
  coverLetter: string | null;
  isGeneratingCL: boolean;
  onGenerateCL: () => void;
  onDownloadCL: (format: 'pdf' | 'doc') => void;
  summaryLines?: number;
  experienceBullets?: number;
  projectLines?: number;
  productLines?: number;
  marginSize?: number;
  lineSpacing?: number;
}

const limitSummarySentences = (summaryText: string, maxSentences: number): string => {
  if (!summaryText) return "";
  const sentences = summaryText.split(/\.\s+/).filter(Boolean);
  return sentences
    .slice(0, maxSentences)
    .map(s => s.trim() + (s.trim().endsWith(".") ? "" : "."))
    .join(" ");
};

const limitBullets = (bullets: string[], maxBullets: number): string[] => {
  if (!bullets) return [];
  return bullets.slice(0, maxBullets);
};

export const ResumePreview = ({ 
  resume, 
  header, 
  vaultItems,
  onUpdate, 
  onRegenerate, 
  onDownloadPDF,
  onDownloadDOC,
  isGenerating,
  fontFamily,
  coverLetter,
  isGeneratingCL,
  onGenerateCL,
  onDownloadCL,
  initialTab,
  nameFontSize,
  headlineFontSize,
  subHeadlineFontSize,
  bodyFontSize,
  summaryLines = 3,
  experienceBullets = 3,
  projectLines = 3,
  productLines = 3,
  marginSize = 1.0,
  lineSpacing = 1.15
}: ResumePreviewProps) => {
  // ── Core Data State ──
  const [localResume, setLocalResume] = useState<GeneratedResume>(resume);
  const [localHeader, setLocalHeader] = useState<ResumeHeader>(header);
  
  // ── UI Logic State ──
  const [openSection, setOpenSection] = useState<string | null>("profile");
  const [showVaultPicker, setShowVaultPicker] = useState<{ section: 'experience' | 'projects' | 'products' | 'education' | 'certifications', index?: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>(initialTab || 'resume');
  
  const resumeRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    setLocalResume(resume);
    setLocalHeader(header);
  }, [resume, header]);

  useEffect(() => {
    if (resumeRef.current) {
      const height = resumeRef.current.scrollHeight;
      const a4HeightPx = (resumeRef.current.offsetWidth * 297) / 210;
      setPageCount(Math.ceil(height / a4HeightPx));
    }
  }, [localResume, localHeader, bodyFontSize, nameFontSize]);

  const handleSave = () => {
    onUpdate(localResume, localHeader);
    toast.success("Blueprint locked in!");
  };

  const updateHeader = (field: keyof ResumeHeader, value: string) => {
    setLocalHeader(prev => ({ ...prev, [field]: value }));
  };

  const updateSummary = (value: string) => {
    setLocalResume(prev => ({ ...prev, professional_summary: value }));
  };

  const updateExperience = (index: number, field: 'heading' | 'content', value: string) => {
    const newExp = [...(localResume.experience || [])];
    newExp[index] = { ...newExp[index], [field]: value };
    setLocalResume(prev => ({ ...prev, experience: newExp }));
  };

  const updateBullet = (section: 'experience' | 'projects' | 'products', sectionIndex: number, bulletIndex: number, value: string) => {
    const newSections = [...(localResume[section] || [])];
    const newBullets = [...(newSections[sectionIndex].bullets || [])];
    newBullets[bulletIndex] = value;
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  const addBullet = (section: 'experience' | 'projects' | 'products', sectionIndex: number) => {
    const newSections = [...(localResume[section] || [])];
    const newBullets = [...(newSections[sectionIndex].bullets || []), "New strategic impact metric..."];
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  const removeBullet = (section: 'experience' | 'projects' | 'products', sectionIndex: number, bulletIndex: number) => {
    const newSections = [...(localResume[section] || [])];
    const newBullets = (newSections[sectionIndex].bullets || []).filter((_, i) => i !== bulletIndex);
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  const addFromVault = (item: VaultItem) => {
    if (showVaultPicker?.section === 'experience') {
      const newItems = [...(localResume.experience || []), { 
        heading: item.organization ? `${item.title} @ ${item.organization}` : item.title, 
        content: item.description, 
        bullets: item.bullets && item.bullets.length > 0 ? item.bullets : ["• Quantifying tactical impact..."] 
      }];
      setLocalResume({ ...localResume, experience: newItems });
    } else if (showVaultPicker?.section === 'projects') {
      const projects = localResume.projects || [];
      const newItems = [...projects, { 
        heading: item.organization ? `${item.title} @ ${item.organization}` : item.title, 
        content: item.description, 
        bullets: item.bullets && item.bullets.length > 0 ? item.bullets : ["• Quantifying project outcomes..."] 
      }];
      setLocalResume({ ...localResume, projects: newItems });
    } else if (showVaultPicker?.section === 'products') {
      const products = localResume.products || [];
      const newItems = [...products, { 
        heading: item.organization ? `${item.title} @ ${item.organization}` : item.title, 
        content: item.description, 
        bullets: item.bullets && item.bullets.length > 0 ? item.bullets : ["• Quantifying startup growth..."] 
      }];
      setLocalResume({ ...localResume, products: newItems });
    } else if (showVaultPicker?.section === 'education') {
      const education = localResume.education || [];
      const eduEntry = item.organization ? `${item.title} - ${item.organization}` : item.title;
      setLocalResume({ ...localResume, education: [...education, eduEntry] });
    } else if (showVaultPicker?.section === 'certifications') {
      const certifications = localResume.certifications || [];
      const certEntry = item.organization ? `${item.title} (${item.organization})` : item.title;
      setLocalResume({ ...localResume, certifications: [...certifications, certEntry] });
    }
    setShowVaultPicker(null);
    toast.success(`Imported ${item.title} from vault!`);
  };

  // ── Dynamic Style Mappings ──
  const fontSizes = {
    name: `${nameFontSize}px`,
    header: `${headlineFontSize}px`,
    subHeader: `${subHeadlineFontSize}px`,
    body: `${bodyFontSize}px`,
    meta: `${bodyFontSize}px`,
  };



  const getHtmlFont = (font: string) => {
    switch(font) {
      case "Inter": return "Inter, sans-serif";
      case "Roboto": return "Roboto, sans-serif";
      case "Merriweather": return "Merriweather, serif";
      case "Arial": return "Arial, sans-serif";
      default: return "Inter, sans-serif";
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 2xl:px-12 mx-auto min-h-[calc(100vh-140px)]">
      {/* ── SHARED CANDIDACY HUB ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] mb-10 gap-6">
        <div className="flex bg-slate-100/50 p-1.5 rounded-[1.8rem] border border-slate-200/50 shadow-inner">
          <button 
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'resume' ? 'bg-[#1E2A3A] text-white shadow-xl scale-105' : 'text-[#1E2A3A]/40 hover:text-[#1E2A3A]'}`}
          >
            <Layers size={14} />
            Resume Blueprint
          </button>
          <button 
            onClick={() => setActiveTab('cover-letter')}
            className={`flex items-center gap-2 px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'cover-letter' ? 'bg-[#1E2A3A] text-white shadow-xl scale-105' : 'text-[#1E2A3A]/40 hover:text-[#1E2A3A]'}`}
          >
            <Mail size={14} />
            Cover Letter
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'resume' ? (
            <div className="flex items-center gap-3">
              <button onClick={onRegenerate} disabled={isGenerating} className="p-3 rounded-2xl bg-white border border-slate-200 text-[#1E2A3A]/40 hover:text-lumina-teal hover:border-lumina-teal/20 transition-all shadow-sm group">
                <RotateCcw size={18} className={isGenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
              </button>
              <button onClick={handleSave} className="p-3 rounded-2xl bg-lumina-teal text-white shadow-lg shadow-lumina-teal/20 transition-all hover:scale-105">
                <Save size={18} />
              </button>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <button onClick={onDownloadPDF} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#1E2A3A] text-white shadow-lg shadow-[#1E2A3A]/20 transition-all hover:scale-105 group">
                <Download size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Export PDF</span>
              </button>
              <button onClick={onDownloadDOC} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-[#1E2A3A]/10 text-[#1E2A3A] shadow-lg shadow-slate-100 transition-all hover:scale-105 group">
                <FileText size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Export Word</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {!coverLetter ? (
                <button 
                  onClick={onGenerateCL} 
                  disabled={isGeneratingCL}
                  className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-lumina-teal text-white shadow-lg shadow-lumina-teal/20 transition-all hover:scale-105 font-black text-[10px] uppercase tracking-widest"
                >
                  {isGeneratingCL ? <RotateCcw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Synthesize Cover Letter
                </button>
              ) : (
                <>
                  <button onClick={onGenerateCL} disabled={isGeneratingCL} className="p-3 rounded-2xl bg-white border border-slate-200 text-[#1E2A3A]/40 hover:text-lumina-teal transition-all shadow-sm">
                    <RotateCcw size={18} className={isGeneratingCL ? 'animate-spin' : ''} />
                  </button>
                  <div className="h-8 w-px bg-slate-200 mx-2" />
                  <button onClick={() => onDownloadCL?.('pdf')} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#1E2A3A] text-white shadow-lg shadow-[#1E2A3A]/20 transition-all hover:scale-105">
                    <Download size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">CL PDF</span>
                  </button>
                  <button onClick={() => onDownloadCL?.('doc')} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-[#1E2A3A]/10 text-[#1E2A3A] shadow-lg shadow-slate-100 transition-all hover:scale-105">
                    <FileText size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">CL Word</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'resume' ? (
          <motion.div 
            key="resume-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start h-[calc(100vh-280px)]"
          >
            {/* ── LEFT PANEL: EDITORS (MAX WIDE) ── */}
            <div className="lg:col-span-6 xl:col-span-5 2xl:col-span-4 space-y-8 h-full overflow-y-auto custom-scrollbar pr-4">
              <CollapsibleSection 
                title="Profile Identity" 
                icon={User} 
                isOpen={openSection === "profile"} 
                onToggle={() => setOpenSection(openSection === "profile" ? null : "profile")}
              >
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <input value={localHeader.fullName} onChange={(e) => updateHeader('fullName', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Full Name" />
                  <input value={localHeader.email} onChange={(e) => updateHeader('email', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Email" />
                  <input value={localHeader.phone} onChange={(e) => updateHeader('phone', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Phone" />
                  <input value={localHeader.location} onChange={(e) => updateHeader('location', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Location" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={localHeader.linkedin} onChange={(e) => updateHeader('linkedin', e.target.value)} className="bg-slate-50 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none" placeholder="LinkedIn" />
                    <input value={localHeader.github} onChange={(e) => updateHeader('github', e.target.value)} className="bg-slate-50 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none" placeholder="GitHub" />
                    <input value={localHeader.portfolio} onChange={(e) => updateHeader('portfolio', e.target.value)} className="bg-slate-50 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none" placeholder="Portfolio" />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Professional Summary" 
                icon={FileText} 
                isOpen={openSection === "summary"} 
                onToggle={() => setOpenSection(openSection === "summary" ? null : "summary")}
              >
                <textarea 
                  value={localResume.professional_summary} 
                  onChange={(e) => setLocalResume({...localResume, professional_summary: e.target.value})}
                  className="w-full min-h-[120px] bg-slate-50/50 border-none rounded-2xl p-4 text-[11px] font-body leading-relaxed outline-none focus:ring-1 ring-lumina-teal/20"
                />
              </CollapsibleSection>

              <CollapsibleSection 
                title="Experience" 
                icon={Briefcase} 
                isOpen={openSection === "experience"} 
                onToggle={() => setOpenSection(openSection === "experience" ? null : "experience")}
                action={<button onClick={() => setShowVaultPicker({ section: 'experience' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
              >
                <div className="space-y-4">
                  {(localResume.experience || []).map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/50 border border-border/10 space-y-3 relative group/exp">
                      <button onClick={() => setLocalResume({...localResume, experience: (localResume.experience || []).filter((_, i) => i !== idx)})} className="absolute top-3 right-3 p-1.5 text-red-500 opacity-0 group-hover/exp:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                      <input value={exp.heading} onChange={(e) => updateExperience(idx, 'heading', e.target.value)} className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-lumina-teal/20" />
                      <div className="space-y-2">
                        {exp.bullets?.map((bullet, bullIdx) => (
                          <div key={bullIdx} className="flex gap-2 items-start group/bull">
                            <textarea value={bullet} onChange={(e) => updateBullet('experience', idx, bullIdx, e.target.value)} className="flex-1 bg-white/50 rounded-xl px-3 py-1.5 text-[11px] font-body outline-none min-h-[36px] border border-transparent focus:border-lumina-teal/20" />
                            <button onClick={() => removeBullet('experience', idx, bullIdx)} className="p-1.5 text-red-500 opacity-0 group-hover/bull:opacity-100"><Minus size={10} /></button>
                          </div>
                        ))}
                        <button onClick={() => addBullet('experience', idx)} className="text-[8px] font-bold text-lumina-teal flex items-center gap-1 uppercase tracking-widest"><Plus size={10} /> Add Bullet</button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Products / Startups" 
                icon={Rocket} 
                isOpen={openSection === "products"} 
                onToggle={() => setOpenSection(openSection === "products" ? null : "products")}
                action={<button onClick={() => setShowVaultPicker({ section: 'products' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
              >
                <div className="space-y-4">
                  {(localResume.products || []).map((prod, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/50 border border-border/10 space-y-3 relative group/prod">
                      <button onClick={() => setLocalResume({...localResume, products: (localResume.products || []).filter((_, i) => i !== idx)})} className="absolute top-3 right-3 p-1.5 text-red-500 opacity-0 group-hover/prod:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                      <input value={prod.heading} onChange={(e) => {
                        const newProducts = [...(localResume.products || [])];
                        newProducts[idx] = { ...newProducts[idx], heading: e.target.value };
                        setLocalResume({ ...localResume, products: newProducts });
                      }} className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-lumina-teal/20" />
                      <input 
                        value={prod.content || ""} 
                        onChange={(e) => {
                          const newProducts = [...(localResume.products || [])];
                          newProducts[idx] = { ...newProducts[idx], content: e.target.value };
                          setLocalResume({ ...localResume, products: newProducts });
                        }} 
                        className="w-full bg-slate-100/50 rounded-lg px-3 py-1.5 text-[11px] font-body outline-none border border-slate-200/30 focus:border-lumina-teal/20" 
                        placeholder="Dates or Link (e.g., Jan 2023 - Present)" 
                      />
                      <div className="space-y-2">
                        {prod.bullets?.map((bullet, bullIdx) => (
                          <div key={bullIdx} className="flex gap-2 items-start group/bull">
                            <textarea value={bullet} onChange={(e) => updateBullet('products', idx, bullIdx, e.target.value)} className="flex-1 bg-white/50 rounded-xl px-3 py-1.5 text-[11px] font-body outline-none min-h-[36px] border border-transparent focus:border-lumina-teal/20" />
                            <button onClick={() => removeBullet('products', idx, bullIdx)} className="p-1.5 text-red-500 opacity-0 group-hover/bull:opacity-100"><Minus size={10} /></button>
                          </div>
                        ))}
                        <button onClick={() => addBullet('products', idx)} className="text-[8px] font-bold text-lumina-teal flex items-center gap-1 uppercase tracking-widest"><Plus size={10} /> Add Bullet</button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Technical Projects" 
                icon={Database} 
                isOpen={openSection === "projects"} 
                onToggle={() => setOpenSection(openSection === "projects" ? null : "projects")}
                action={<button onClick={() => setShowVaultPicker({ section: 'projects' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
              >
                <div className="space-y-4">
                  {(localResume.projects || []).map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/50 border border-border/10 space-y-3 relative group/proj">
                      <button onClick={() => setLocalResume({...localResume, projects: (localResume.projects || []).filter((_, i) => i !== idx)})} className="absolute top-3 right-3 p-1.5 text-red-500 opacity-0 group-hover/proj:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                      <input value={proj.heading} onChange={(e) => {
                        const newProjects = [...(localResume.projects || [])];
                        newProjects[idx] = { ...newProjects[idx], heading: e.target.value };
                        setLocalResume({ ...localResume, projects: newProjects });
                      }} className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-lumina-teal/20" />
                       <div className="flex gap-2">
                        <select 
                          value={
                            proj.content?.includes("github.com") 
                              ? "github" 
                              : (proj.content?.startsWith("http") || proj.content?.includes(".com") || proj.content?.includes(".io") || proj.content?.includes(".live") || proj.content?.includes(".dev") || proj.content?.includes(".me"))
                                ? "live" 
                                : "dates"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const newProjects = [...(localResume.projects || [])];
                            if (val === "dates") {
                              newProjects[idx] = { ...newProjects[idx], content: "Feb 2023 - May 2023" };
                            } else if (val === "github") {
                              newProjects[idx] = { ...newProjects[idx], content: "github.com/username/project" };
                            } else {
                              newProjects[idx] = { ...newProjects[idx], content: "project.live" };
                            }
                            setLocalResume({ ...localResume, projects: newProjects });
                          }}
                          className="bg-slate-100 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none border border-slate-200/30 focus:ring-1 ring-lumina-teal/20"
                        >
                          <option value="dates">Dates</option>
                          <option value="github">GitHub</option>
                          <option value="live">Live Link</option>
                        </select>
                        <input 
                          value={proj.content || ""} 
                          onChange={(e) => {
                            const newProjects = [...(localResume.projects || [])];
                            newProjects[idx] = { ...newProjects[idx], content: e.target.value };
                            setLocalResume({ ...localResume, projects: newProjects });
                          }} 
                          className="flex-1 bg-slate-100/50 rounded-lg px-3 py-1.5 text-[11px] font-body outline-none border border-slate-200/30 focus:border-lumina-teal/20" 
                          placeholder={
                            proj.content?.includes("github.com") 
                              ? "github.com/username/repo" 
                              : (proj.content?.startsWith("http") || proj.content?.includes(".com") || proj.content?.includes(".io"))
                                ? "project.live"
                                : "e.g., Feb 2023 - May 2023"
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        {proj.bullets?.map((bullet, bullIdx) => (
                          <div key={bullIdx} className="flex gap-2 items-start group/bull">
                            <textarea value={bullet} onChange={(e) => updateBullet('projects', idx, bullIdx, e.target.value)} className="flex-1 bg-white/50 rounded-xl px-3 py-1.5 text-[11px] font-body outline-none min-h-[36px] border border-transparent focus:border-lumina-teal/20" />
                            <button onClick={() => removeBullet('projects', idx, bullIdx)} className="p-1.5 text-red-500 opacity-0 group-hover/bull:opacity-100"><Minus size={10} /></button>
                          </div>
                        ))}
                        <button onClick={() => addBullet('projects', idx)} className="text-[8px] font-bold text-lumina-teal flex items-center gap-1 uppercase tracking-widest"><Plus size={10} /> Add Bullet</button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Leadership" 
                icon={User} 
                isOpen={openSection === "leadership"} 
                onToggle={() => setOpenSection(openSection === "leadership" ? null : "leadership")}
              >
                <div className="space-y-4">
                  {(localResume.leadership || []).map((lead, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/50 border border-border/10 space-y-3 relative group/lead">
                      <button onClick={() => setLocalResume({...localResume, leadership: (localResume.leadership || []).filter((_, i) => i !== idx)})} className="absolute top-3 right-3 p-1.5 text-red-500 opacity-0 group-hover/lead:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                      <input value={lead.heading} onChange={(e) => {
                        const newLead = [...(localResume.leadership || [])];
                        newLead[idx] = { ...newLead[idx], heading: e.target.value };
                        setLocalResume({ ...localResume, leadership: newLead });
                      }} className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-lumina-teal/20" />
                      <div className="space-y-2">
                        {lead.bullets?.map((bullet, bullIdx) => (
                          <div key={bullIdx} className="flex gap-2 items-start group/bull">
                            <textarea value={bullet} onChange={(e) => {
                              const newLead = [...(localResume.leadership || [])];
                              const newBullets = [...(newLead[idx].bullets || [])];
                              newBullets[bullIdx] = e.target.value;
                              newLead[idx] = { ...newLead[idx], bullets: newBullets };
                              setLocalResume({ ...localResume, leadership: newLead });
                            }} className="flex-1 bg-white/50 rounded-xl px-3 py-1.5 text-[11px] font-body outline-none min-h-[36px] border border-transparent focus:border-lumina-teal/20" />
                            <button onClick={() => {
                              const newLead = [...(localResume.leadership || [])];
                              const newBullets = (newLead[idx].bullets || []).filter((_, i) => i !== bullIdx);
                              newLead[idx] = { ...newLead[idx], bullets: newBullets };
                              setLocalResume({ ...localResume, leadership: newLead });
                            }} className="p-1.5 text-red-500 opacity-0 group-hover/bull:opacity-100"><Minus size={10} /></button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newLead = [...(localResume.leadership || [])];
                          const newBullets = [...(newLead[idx].bullets || []), "New leadership achievement..."];
                          newLead[idx] = { ...newLead[idx], bullets: newBullets };
                          setLocalResume({ ...localResume, leadership: newLead });
                        }} className="text-[8px] font-bold text-lumina-teal flex items-center gap-1 uppercase tracking-widest"><Plus size={10} /> Add Bullet</button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Education" 
                icon={GraduationCap} 
                isOpen={openSection === "education"} 
                onToggle={() => setOpenSection(openSection === "education" ? null : "education")}
                action={<button onClick={() => setShowVaultPicker({ section: 'education' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
              >
                <div className="space-y-2">
                  {(localResume.education || []).map((edu, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input value={edu} onChange={(e) => {
                        const newEdu = [...(localResume.education || [])];
                        newEdu[i] = e.target.value;
                        setLocalResume({ ...localResume, education: newEdu });
                      }} className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-[11px] font-medium outline-none" />
                      <button onClick={() => setLocalResume({...localResume, education: (localResume.education || []).filter((_, idx) => idx !== i)})} className="p-2 text-red-400"><Minus size={12}/></button>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Awards" 
                icon={Award} 
                isOpen={openSection === "awards"} 
                onToggle={() => setOpenSection(openSection === "awards" ? null : "awards")}
              >
                <div className="space-y-2">
                  {(localResume.awards || []).map((award, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input value={award} onChange={(e) => {
                        const newAwards = [...(localResume.awards || [])];
                        newAwards[i] = e.target.value;
                        setLocalResume({ ...localResume, awards: newAwards });
                      }} className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-[11px] font-medium outline-none" />
                      <button onClick={() => setLocalResume({...localResume, awards: (localResume.awards || []).filter((_, idx) => idx !== i)})} className="p-2 text-red-400"><Minus size={12}/></button>
                    </div>
                  ))}
                  <button onClick={() => setLocalResume({...localResume, awards: [...(localResume.awards || []), "New Award Name"]})} className="text-[8px] font-bold text-lumina-teal flex items-center gap-1 uppercase tracking-widest pt-2"><Plus size={10} /> Add Award</button>
                </div>
              </CollapsibleSection>
            </div>

            {/* ── RIGHT PANEL: PREVIEW (MOVED RIGHT) ── */}
            <div className="lg:col-span-6 xl:col-span-7 2xl:col-span-8 flex justify-center h-full pl-8 sm:pl-16">
              <div className="w-full flex-1 perspective-2000 h-full overflow-y-auto custom-scrollbar rounded-[2.5rem] shadow-inner bg-slate-100/50 p-6 sm:p-10 border border-white/40">
                <motion.div 
                  ref={resumeRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative bg-white border border-[#1E2A3A]/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] mx-auto"
                  style={{ 
                    width: '100%', 
                    maxWidth: '850px',
                    minHeight: '297mm',
                    height: 'auto',
                    padding: `${marginSize}in`,
                    lineHeight: lineSpacing,
                    fontSize: fontSizes.body,
                    fontFamily: getHtmlFont(fontFamily)
                  }}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center space-y-2 mb-3">
                      <h1 className="font-bold tracking-tight uppercase !font-inherit" style={{ fontSize: `${nameFontSize}px`, color: '#1E2A3A', fontFamily: 'inherit' }}>
                        {localHeader.fullName || "Your Name"}
                      </h1>
                      <div className="flex flex-wrap justify-center items-center gap-x-2 text-[#1E2A3A] font-medium !font-inherit" style={{ fontSize: fontSizes.meta }}>
                        {localHeader.location && (
                          <div className="flex items-center gap-2">
                            <span>{localHeader.location}</span>
                            <span className="opacity-20">|</span>
                          </div>
                        )}
                        {localHeader.email && (
                          <div className="flex items-center gap-2">
                            <span>{localHeader.email.toLowerCase()}</span>
                            <span className="opacity-20">|</span>
                          </div>
                        )}
                        {localHeader.linkedin && (
                          <div className="flex items-center gap-2">
                            <span>{localHeader.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</span>
                            <span className="opacity-20">|</span>
                          </div>
                        )}
                        {localHeader.phone && (
                          <div className="flex items-center gap-2">
                            <span>{localHeader.phone}</span>
                            <span className="opacity-20">|</span>
                          </div>
                        )}
                        {localHeader.github && (
                          <div className="flex items-center gap-2">
                            <span>{localHeader.github.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</span>
                            {localHeader.portfolio && <span className="opacity-20">|</span>}
                          </div>
                        )}
                        {localHeader.portfolio && (
                          <div className="flex items-center gap-2">
                            <span>{localHeader.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col" style={{ gap: '0.5px' }}>
                      {/* Summary Section */}
                      {localResume.professional_summary && (
                        <section className="space-y-1">
                          <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                            <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Professional Summary</h4>
                          </div>
                          <p className="text-[#1E2A3A]/90 leading-relaxed !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                            {limitSummarySentences(localResume.professional_summary, summaryLines)}
                          </p>
                        </section>
                      )}

                      {/* Education First */}
                      <section className="space-y-1">
                        <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                          <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Education</h4>
                        </div>
                        <div className="flex flex-col" style={{ gap: '0.5px' }}>
                          {(localResume.education || []).map((edu, i) => {
                            const parts = edu.split('|');
                            const mainInfo = parts[0].split('@');
                            const school = mainInfo[1]?.trim() || "University";
                            const degree = mainInfo[0]?.trim() || "Degree";
                            const metadata = parts.slice(1).join(' | ');
                            
                            // Try to extract date and location from metadata or edu string
                            // Template: University Name [Right: Date]
                            // B.S. Degree | GPA [Right: Location]
                            return (
                              <div key={i} className="space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                <div className="flex justify-between items-start font-bold !font-inherit" style={{ fontSize: fontSizes.body, fontFamily: 'inherit' }}>
                                  <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{school}</span>
                                  <span className="flex-shrink-0 text-right ml-4 text-[11px] !font-inherit" style={{ fontFamily: 'inherit' }}>May 2027</span>
                                </div>
                                <div className="flex justify-between items-start italic !font-inherit" style={{ fontSize: `calc(${fontSizes.body} - 1px)`, fontFamily: 'inherit' }}>
                                  <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{degree} {metadata && `| ${metadata}`}</span>
                                  <span className="flex-shrink-0 text-right ml-4 text-[11px] not-italic !font-inherit" style={{ fontFamily: 'inherit' }}>{localHeader.location || ""}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* Experience */}
                      <section className="space-y-1">
                        <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                          <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Experience</h4>
                        </div>
                        <div className="flex flex-col" style={{ gap: '1px' }}>
                          {(localResume.experience || []).map((exp, expIdx) => {
                            const parts = exp.heading.split('@');
                            const role = parts[0]?.trim() || "Role";
                            const org = parts[1]?.split('-')[0]?.trim() || "Organization";
                            const location = parts[1]?.split('-')[1]?.trim() || localHeader.location;
                            
                            return (
                              <div key={expIdx} className="space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                <div className="flex justify-between items-start font-bold !font-inherit" style={{ fontSize: fontSizes.subHeader, fontFamily: 'inherit' }}>
                                  <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{role}</span>
                                  <span className="flex-shrink-0 text-right ml-4 text-[11px] !font-inherit" style={{ fontFamily: 'inherit' }}>{exp.content || "Date – Present"}</span>
                                </div>
                                <div className="flex justify-between items-start italic text-[#1E2A3A]/80 !font-inherit" style={{ fontSize: `calc(${fontSizes.body} - 1px)`, fontFamily: 'inherit' }}>
                                  <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{org}</span>
                                  <span className="flex-shrink-0 text-right ml-4 text-[11px] not-italic !font-inherit" style={{ fontFamily: 'inherit' }}>{location}</span>
                                </div>
                                <ul className="list-disc ml-5 space-y-0.5 pt-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                  {limitBullets(exp.bullets, experienceBullets).map((bullet, bullIdx) => (
                                    <li key={bullIdx} className="text-[#1E2A3A]/90 leading-tight !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                                      {bullet.replace(/^[•\s*-]+/, '').trim()}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* Products / Startups */}
                      {(localResume.products && localResume.products.length > 0) && (
                        <section className="space-y-1">
                          <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                            <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Products & Ventures</h4>
                          </div>
                          <div className="flex flex-col" style={{ gap: '1px' }}>
                            {localResume.products?.map((prod, prodIdx) => {
                              const headingParts = prod.heading.split(/\s*[-–—]\s*/);
                              const title = headingParts[0];
                              const status = headingParts.slice(1).join(" | ");
                              return (
                                <div key={prodIdx} className="space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                  <div className="flex justify-between items-start font-bold !font-inherit" style={{ fontSize: fontSizes.subHeader, fontFamily: 'inherit' }}>
                                    <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{title?.trim()} <span className="font-normal opacity-60 !font-inherit" style={{ fontFamily: 'inherit' }}>| {status?.trim()}</span></span>
                                    <span className="flex-shrink-0 text-right ml-4 text-[11px] font-normal !font-inherit" style={{ fontFamily: 'inherit' }}>{prod.content || "Operational"}</span>
                                  </div>
                                  <ul className="list-disc ml-5 space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                    {limitBullets(prod.bullets, productLines).map((bullet, bullIdx) => (
                                      <li key={bullIdx} className="text-[#1E2A3A]/90 leading-tight !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                                        {bullet.replace(/^[•\s*-]+/, '').trim()}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      {/* Projects */}
                      {(localResume.projects && localResume.projects.length > 0) && (
                        <section className="space-y-1">
                          <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                            <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Projects</h4>
                          </div>
                          <div className="flex flex-col" style={{ gap: '1px' }}>
                            {localResume.projects?.map((proj, projIdx) => {
                              const headingParts = proj.heading.split(/\s*[-–—]\s*/);
                              const title = headingParts[0];
                              const stack = headingParts.slice(1).join(" | ");
                              return (
                                <div key={projIdx} className="space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                  <div className="flex justify-between items-start font-bold !font-inherit" style={{ fontSize: fontSizes.subHeader, fontFamily: 'inherit' }}>
                                    <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{title?.trim()} <span className="font-normal opacity-60 !font-inherit" style={{ fontFamily: 'inherit' }}>| {stack?.trim()}</span></span>
                                    {proj.content ? (
                                      (proj.content.includes("github.com") || proj.content.includes(".com") || proj.content.includes(".io") || proj.content.includes(".live") || proj.content.includes(".dev") || proj.content.startsWith("http")) ? (
                                        <a 
                                          href={proj.content.startsWith("http") ? proj.content : `https://${proj.content}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-shrink-0 text-right ml-4 text-[11px] font-normal !font-inherit text-lumina-teal hover:underline transition-all"
                                          style={{ fontFamily: 'inherit' }}
                                        >
                                          {proj.content}
                                        </a>
                                      ) : (
                                        <span className="flex-shrink-0 text-right ml-4 text-[11px] font-normal !font-inherit" style={{ fontFamily: 'inherit' }}>{proj.content}</span>
                                      )
                                    ) : (
                                      <span className="flex-shrink-0 text-right ml-4 text-[11px] font-normal !font-inherit" style={{ fontFamily: 'inherit' }}>Ongoing</span>
                                    )}
                                  </div>
                                  <ul className="list-disc ml-5 space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                    {limitBullets(proj.bullets, projectLines).map((bullet, bullIdx) => (
                                      <li key={bullIdx} className="text-[#1E2A3A]/90 leading-tight !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                                        {bullet.replace(/^[•\s*-]+/, '').trim()}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      {/* Leadership */}
                      {(localResume.leadership && localResume.leadership.length > 0) && (
                        <section className="space-y-1">
                          <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                            <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Leadership</h4>
                          </div>
                          <div className="flex flex-col" style={{ gap: '1px' }}>
                            {localResume.leadership?.map((lead, idx) => (
                              <div key={idx} className="space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                <div className="flex justify-between items-start font-bold !font-inherit" style={{ fontSize: fontSizes.subHeader, fontFamily: 'inherit' }}>
                                  <span className="flex-1 min-w-0 !font-inherit" style={{ fontFamily: 'inherit' }}>{lead.heading}</span>
                                  <span className="flex-shrink-0 text-right ml-4 text-[11px] font-normal !font-inherit" style={{ fontFamily: 'inherit' }}>{lead.content || "Date – Present"}</span>
                                </div>
                                <ul className="list-disc ml-5 space-y-0.5 !font-inherit" style={{ fontFamily: 'inherit', margin: 0, padding: 0 }}>
                                  {limitBullets(lead.bullets, experienceBullets).map((bullet, bullIdx) => (
                                    <li key={bullIdx} className="text-[#1E2A3A]/90 leading-tight !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                                      {bullet.replace(/^[•\s*-]+/, '').trim()}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Skills */}
                      <section className="space-y-1">
                        <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                          <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Skills</h4>
                        </div>
                        <div className="flex flex-col !font-inherit" style={{ fontFamily: 'inherit', gap: '0.5px' }}>
                          {(localResume.skills_section || []).map((skillLine, i) => {
                            const [category, skills] = skillLine.split(':');
                            return (
                              <p key={i} className="text-[#1E2A3A]/90 leading-tight !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                                <span className="font-bold !font-inherit" style={{ fontFamily: 'inherit' }}>{category?.trim()}:</span> {skills?.trim()}
                              </p>
                            );
                          })}
                        </div>
                      </section>

                      {/* Certifications */}
                      {(localResume.certifications && localResume.certifications.length > 0) && (
                        <section className="space-y-1">
                          <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                            <h4 className="font-bold uppercase tracking-widest !font-inherit" style={{ fontSize: `${headlineFontSize}px`, fontFamily: 'inherit' }}>Certifications</h4>
                          </div>
                          <div className="flex flex-col !font-inherit" style={{ fontFamily: 'inherit', gap: '0.5px' }}>
                            {localResume.certifications?.map((cert, i) => (
                              <p key={i} className="text-[#1E2A3A]/90 leading-tight !font-inherit text-left" style={{ fontSize: fontSizes.body, fontFamily: 'inherit', textAlign: 'left', margin: 0, padding: 0 }}>
                                • {cert}
                              </p>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Awards */}
                      {(localResume.awards && localResume.awards.length > 0) && (
                        <section className="space-y-1">
                          <div className="flex items-center gap-3 text-[#1E2A3A] border-b border-[#1E2A3A] pb-0.5">
                            <h4 className="font-bold uppercase tracking-widest" style={{ fontSize: fontSizes.header }}>Awards</h4>
                          </div>
                          <div className="flex flex-col" style={{ gap: '0.5px' }}>
                            {localResume.awards?.map((award, i) => (
                              <p key={i} className="text-[#1E2A3A]/90 leading-tight text-left" style={{ fontSize: fontSizes.body, textAlign: 'left', margin: 0, padding: 0 }}>
                                • {award}
                              </p>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Page Breaks */}
                  {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 h-px border-t border-dashed border-[#1E2A3A]/10 flex items-center justify-center pointer-events-none animate-pulse" style={{ top: `${(i + 1) * 297}mm` }}>
                      <span className="bg-white px-4 text-[8px] font-black uppercase tracking-widest text-red-500/80">Crossed Page {i + 1} — Continued On Next Page</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cl-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4 space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-lumina-teal/10 flex items-center justify-center text-lumina-teal">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#1E2A3A]">Candidacy Letter</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1E2A3A]/40">Strategic Alignment</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#1E2A3A]/60 leading-relaxed font-medium">
                    This cover letter is synthesized using your **Tailored Resume Blueprint** and the target **Job Description** to ensure 100% thematic consistency.
                  </p>
                  {!coverLetter && (
                    <button 
                      onClick={onGenerateCL}
                      disabled={isGeneratingCL}
                      className="w-full py-4 rounded-2xl bg-[#1E2A3A] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                    >
                      Generate Now
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="p-10 sm:p-16 rounded-[3rem] bg-white border border-[#1E2A3A]/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] min-h-[700px] flex flex-col relative overflow-hidden">
                  {isGeneratingCL ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                      <RotateCcw size={48} className="animate-spin text-lumina-teal" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#1E2A3A]/40">Synthesizing Narrative...</p>
                    </div>
                  ) : coverLetter ? (
                    <div className="space-y-8 relative z-10">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#1E2A3A]">{localHeader.fullName}</h2>
                        <p className="text-sm text-[#1E2A3A]/50 font-medium">{localHeader.location} | {localHeader.phone} | {localHeader.email}</p>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="text-sm text-[#1E2A3A]/80 font-serif italic leading-[1.8] whitespace-pre-wrap">
                        {coverLetter}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center px-12">
                      <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <Mail size={40} />
                      </div>
                      <div className="space-y-3">
                        <h5 className="text-lg font-serif font-bold text-[#1E2A3A]">Letter Vault Empty</h5>
                        <p className="text-sm text-[#1E2A3A]/40 max-w-sm leading-relaxed">
                          Your resume is ready! Now, let's craft the perfect narrative to open the door.
                        </p>
                      </div>
                      <button 
                        onClick={onGenerateCL}
                        className="px-10 py-4 rounded-2xl bg-lumina-teal text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-lumina-teal/20 hover:scale-105 transition-all"
                      >
                        Synthesize Narrative
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVaultPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1E2A3A]/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b border-[#1E2A3A]/5 flex items-center justify-between">
                <h4 className="text-xl font-serif font-bold text-[#1E2A3A]">Tactical Vault</h4>
                <button onClick={() => setShowVaultPicker(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {vaultItems.filter(item => {
                    if (showVaultPicker.section === 'experience') return item.type === 'professional';
                    if (showVaultPicker.section === 'projects') return item.type === 'project';
                    if (showVaultPicker.section === 'education') return item.type === 'education';
                    if (showVaultPicker.section === 'certifications') return item.type === 'certification';
                    return true;
                  }).map((item) => (
                    <div key={item.id} onClick={() => addFromVault(item)} className="p-6 rounded-2xl border border-[#1E2A3A]/5 hover:border-lumina-teal hover:bg-lumina-teal/5 transition-all cursor-pointer">
                      <h5 className="text-lg font-serif font-bold text-[#1E2A3A]">{item.title}</h5>
                      <p className="text-xs text-[#1E2A3A]/40 italic">{item.period}</p>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
