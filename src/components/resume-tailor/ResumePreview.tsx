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
  Sparkles
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
  baseFontSize: number;
  lineSpacing: number;
  marginSize: number;
  fontFamily: string;
  coverLetter?: string | null;
  isGeneratingCL?: boolean;
  onGenerateCL?: () => void;
  onDownloadCL?: (format: 'pdf' | 'doc') => void;
}

export const ResumePreview = ({ 
  resume, 
  header, 
  vaultItems,
  onUpdate, 
  onRegenerate, 
  onDownloadPDF,
  onDownloadDOC,
  isGenerating,
  baseFontSize,
  lineSpacing,
  marginSize,
  fontFamily,
  coverLetter,
  isGeneratingCL,
  onGenerateCL,
  onDownloadCL
}: ResumePreviewProps) => {
  // ── Core Data State ──
  const [localResume, setLocalResume] = useState<GeneratedResume>(resume);
  const [localHeader, setLocalHeader] = useState<ResumeHeader>(header);
  
  // ── UI Logic State ──
  const [openSection, setOpenSection] = useState<string | null>("profile");
  const [showVaultPicker, setShowVaultPicker] = useState<{ section: 'experience' | 'projects' | 'education' | 'certifications', index?: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');
  
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
  }, [localResume, localHeader, lineSpacing, marginSize, baseFontSize]);

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

  const updateBullet = (section: 'experience' | 'projects', sectionIndex: number, bulletIndex: number, value: string) => {
    const newSections = [...(localResume[section] || [])];
    const newBullets = [...(newSections[sectionIndex].bullets || [])];
    newBullets[bulletIndex] = value;
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  const addBullet = (section: 'experience' | 'projects', sectionIndex: number) => {
    const newSections = [...(localResume[section] || [])];
    const newBullets = [...(newSections[sectionIndex].bullets || []), "New strategic impact metric..."];
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  const removeBullet = (section: 'experience' | 'projects', sectionIndex: number, bulletIndex: number) => {
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
    name: `${baseFontSize + 10}px`,
    header: `${baseFontSize + 4}px`,
    body: `${baseFontSize}px`,
    meta: `10px`,
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start h-full w-full"
          >
            {/* ── LEFT PANEL: EDITORS ── */}
            <div className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 space-y-6">
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
            </div>

            {/* ── RIGHT PANEL: PREVIEW ── */}
            <div className="lg:col-span-8 xl:col-span-9 2xl:col-span-9 flex justify-center h-full">
              <div className="w-full flex-1 perspective-2000 h-full overflow-y-auto custom-scrollbar rounded-[2.5rem] shadow-inner bg-slate-100/50 p-6 sm:p-10 border border-white/40">
                <motion.div 
                  ref={resumeRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative bg-white border border-[#1E2A3A]/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] mx-auto overflow-hidden"
                  style={{ 
                    width: '100%', 
                    maxWidth: '850px',
                    minHeight: '297mm',
                    padding: `${marginSize}in`,
                    lineHeight: lineSpacing,
                    fontSize: fontSizes.body,
                    fontFamily: getHtmlFont(fontFamily)
                  }}
                >
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3 border-b border-[#1E2A3A]/5 pb-8 mb-8">
                      <h1 className="font-bold text-[#1E2A3A] tracking-tighter uppercase leading-tight" style={{ fontSize: fontSizes.name }}>
                        {localHeader.fullName || "Your Name"}
                      </h1>
                      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[#1E2A3A]/50 font-medium" style={{ fontSize: fontSizes.meta }}>
                        {localHeader.location && <div className="flex items-center gap-1.5"><MapPin size={10} className="text-lumina-teal/40" /> {localHeader.location}</div>}
                        {localHeader.phone && <div className="flex items-center gap-1.5"><Phone size={10} className="text-lumina-teal/40" /> {localHeader.phone}</div>}
                        {localHeader.email && <div className="flex items-center gap-1.5"><Mail size={10} className="text-lumina-teal/40" /> {localHeader.email}</div>}
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-6 font-black uppercase tracking-[0.2em] text-lumina-teal/60 pt-1" style={{ fontSize: fontSizes.meta }}>
                        {localHeader.linkedin && <div className="flex items-center gap-1.5"><Linkedin size={9} /> {localHeader.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</div>}
                        {localHeader.github && <div className="flex items-center gap-1.5"><Github size={9} /> {localHeader.github.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</div>}
                        {localHeader.portfolio && <div className="flex items-center gap-1.5"><Globe size={9} /> {localHeader.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</div>}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-10">
                      <section className="space-y-3">
                        <div className="flex items-center gap-3 text-[#1E2A3A]">
                          <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Professional Summary</h4>
                          <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                        </div>
                        <p className="text-[#1E2A3A]/80 leading-relaxed italic" style={{ fontSize: fontSizes.body }}>{localResume.professional_summary}</p>
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center gap-3 text-[#1E2A3A]">
                          <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Core Competencies</h4>
                          <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          {(localResume.skills_section || []).map((skill, i) => (
                            <div key={i} className="font-bold text-[#1E2A3A]/70 uppercase tracking-tighter" style={{ fontSize: `calc(${fontSizes.body} - 1px)` }}>
                              {skill}{i < (localResume.skills_section || []).length - 1 && "  •"}
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <div className="flex items-center gap-3 text-[#1E2A3A]">
                          <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Experience</h4>
                          <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                        </div>
                        <div className="space-y-8">
                          {(localResume.experience || []).map((exp, expIdx) => (
                            <div key={expIdx} className="space-y-3">
                              <h5 className="font-bold text-[#1E2A3A] tracking-tight" style={{ fontSize: fontSizes.header }}>{exp.heading}</h5>
                              <div className="space-y-2 pl-3 border-l border-slate-100">
                                {exp.bullets?.map((bullet, bullIdx) => (
                                  <div key={bullIdx} className="flex gap-4 items-start">
                                    <span className="text-lumina-teal pt-1.5 font-bold">•</span>
                                    <p className="text-[#1E2A3A]/80 leading-relaxed" style={{ fontSize: fontSizes.body }}>{bullet.trim()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {(localResume.projects && localResume.projects.length > 0) && (
                        <section className="space-y-6">
                          <div className="flex items-center gap-3 text-[#1E2A3A]">
                            <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Projects</h4>
                            <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                          </div>
                          <div className="space-y-8">
                            {localResume.projects?.map((proj, projIdx) => (
                              <div key={projIdx} className="space-y-3">
                                <h5 className="font-bold text-[#1E2A3A] tracking-tight" style={{ fontSize: fontSizes.header }}>{proj.heading}</h5>
                                <div className="space-y-2 pl-3 border-l border-slate-100">
                                  {proj.bullets?.map((bullet, bullIdx) => (
                                    <div key={bullIdx} className="flex gap-4 items-start">
                                      <span className="text-lumina-teal pt-1.5 font-bold">•</span>
                                      <p className="text-[#1E2A3A]/80 leading-relaxed" style={{ fontSize: fontSizes.body }}>{bullet.trim()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <div className="grid grid-cols-2 gap-8">
                        <section className="space-y-3">
                          <div className="flex items-center gap-3 text-[#1E2A3A]">
                            <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Education</h4>
                            <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                          </div>
                          <div className="space-y-2">
                            {(localResume.education || []).map((edu, i) => (
                              <p key={i} className="font-medium text-[#1E2A3A]/80" style={{ fontSize: `calc(${fontSizes.body} - 1px)` }}>{edu}</p>
                            ))}
                          </div>
                        </section>

                        {(localResume.certifications && localResume.certifications.length > 0) && (
                          <section className="space-y-3">
                            <div className="flex items-center gap-3 text-[#1E2A3A]">
                              <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Certs</h4>
                              <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                            </div>
                            <div className="space-y-2">
                              {localResume.certifications?.map((cert, i) => (
                                <p key={i} className="font-medium text-[#1E2A3A]/80" style={{ fontSize: `calc(${fontSizes.body} - 1px)` }}>{cert}</p>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Page Breaks */}
                  {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 h-px border-t border-dashed border-[#1E2A3A]/10 flex items-center justify-center pointer-events-none" style={{ top: `${(i + 1) * 100 / pageCount}%` }}>
                      <span className="bg-white px-4 text-[8px] font-black uppercase tracking-widest text-[#1E2A3A]/20">Page {i + 1} Cut</span>
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
