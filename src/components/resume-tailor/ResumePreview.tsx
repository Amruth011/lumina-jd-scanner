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
  Cpu
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
  fontFamily
}: ResumePreviewProps) => {
  // ── Core Data State ──
  const [localResume, setLocalResume] = useState<GeneratedResume>(resume);
  const [localHeader, setLocalHeader] = useState<ResumeHeader>(header);
  
  // ── UI Logic State ──
  const [openSection, setOpenSection] = useState<string | null>("strategy");
  const [showVaultPicker, setShowVaultPicker] = useState<{ section: 'experience' | 'projects' | 'education' | 'certifications', index?: number } | null>(null);
  
  const [showVaultPicker, setShowVaultPicker] = useState<{ section: 'experience' | 'projects' | 'education' | 'certifications', index?: number } | null>(null);
  
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
    const newExp = [...localResume.experience];
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
      const newItems = [...localResume.experience, { 
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
      const eduEntry = item.organization ? `${item.title} - ${item.organization}` : item.title;
      setLocalResume({ ...localResume, education: [...localResume.education, eduEntry] });
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start h-full w-full">
        
        {/* ── LEFT PANEL: OPTIMIZED STRATEGY HUB ── */}
        <div className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 flex flex-col h-auto lg:sticky lg:top-8 pb-4">
          
          <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-[#1E2A3A]/5 shadow-sm mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-lumina-teal" />
              <h3 className="text-base font-serif font-bold text-[#1E2A3A]">Candidacy Hub</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onRegenerate} 
                disabled={isGenerating} 
                className="p-2 rounded-xl bg-slate-50 text-[#1E2A3A]/40 hover:text-lumina-teal transition-all"
                aria-label="Regenerate Blueprint"
              >
                <RotateCcw size={16} className={isGenerating ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={handleSave} 
                className="p-2 rounded-xl bg-lumina-teal text-white shadow-lg shadow-lumina-teal/20 transition-all hover:scale-105"
                aria-label="Save Blueprint"
              >
                <Save size={16} />
              </button>
              <button 
                onClick={onDownloadPDF} 
                className="p-2 rounded-xl bg-[#1E2A3A] text-white shadow-lg shadow-[#1E2A3A]/20 transition-all hover:scale-105 group relative"
                aria-label="Download PDF"
              >
                <Download size={16} />
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#1E2A3A] text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">PDF Export</span>
              </button>
              <button 
                onClick={onDownloadDOC} 
                className="p-2 rounded-xl bg-white border border-[#1E2A3A]/10 text-[#1E2A3A] shadow-lg shadow-slate-200 transition-all hover:scale-105 group relative"
                aria-label="Download DOC"
              >
                <FileText size={16} />
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white border border-border text-[#1E2A3A] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">Word Export</span>
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {/* ── Combined Section: Strategy & Typography ── */}
            <CollapsibleSection 
              title="Strategy & Typography" 
              icon={Layers} 
              isOpen={openSection === "strategy"} 
              onToggle={() => setOpenSection(openSection === "strategy" ? null : "strategy")}
            >
              <div className="space-y-6 p-1">
                {/* Executive Summary Editor */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#1E2A3A]/40 ml-1">Professional Narrative</label>
                  <textarea 
                    value={localResume.professional_summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    className="w-full min-h-[100px] bg-slate-50 rounded-2xl p-4 text-xs font-body leading-relaxed outline-none border border-transparent focus:border-lumina-teal/30 transition-all resize-none"
                    placeholder="Inject your high-impact professional narrative here..."
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* ── Section: Profile ── */}
            <CollapsibleSection 
              title="Profile Identity" 
              icon={User} 
              isOpen={openSection === "profile"} 
              onToggle={() => setOpenSection(openSection === "profile" ? null : "profile")}
            >
              <div className="grid grid-cols-1 gap-3">
                <input value={localHeader.fullName} onChange={(e) => updateHeader('fullName', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={localHeader.email} onChange={(e) => updateHeader('email', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Email" />
                  <input value={localHeader.phone} onChange={(e) => updateHeader('phone', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Phone" />
                </div>
                <input value={localHeader.location} onChange={(e) => updateHeader('location', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none" placeholder="Location" />
                <div className="grid grid-cols-3 gap-2">
                   <input value={localHeader.linkedin} onChange={(e) => updateHeader('linkedin', e.target.value)} className="bg-slate-50 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none" placeholder="LinkedIn" />
                   <input value={localHeader.github} onChange={(e) => updateHeader('github', e.target.value)} className="bg-slate-50 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none" placeholder="GitHub" />
                   <input value={localHeader.portfolio} onChange={(e) => updateHeader('portfolio', e.target.value)} className="bg-slate-50 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none" placeholder="Portfolio" />
                </div>
              </div>
            </CollapsibleSection>

            {/* ── Section: Experience ── */}
            <CollapsibleSection 
              title="Professional Experience" 
              icon={Briefcase} 
              isOpen={openSection === "experience"} 
              onToggle={() => setOpenSection(openSection === "experience" ? null : "experience")}
              action={<button onClick={() => setShowVaultPicker({ section: 'experience' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
            >
              <div className="space-y-4">
                {localResume.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/50 border border-border/10 space-y-3 relative group/exp">
                    <button onClick={() => setLocalResume({...localResume, experience: localResume.experience.filter((_, i) => i !== idx)})} className="absolute top-3 right-3 p-1.5 text-red-500 opacity-0 group-hover/exp:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
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

            {/* ── Section: Projects ── */}
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

            {/* ── Section: Education ── */}
            <CollapsibleSection 
              title="Education" 
              icon={GraduationCap} 
              isOpen={openSection === "education"} 
              onToggle={() => setOpenSection(openSection === "education" ? null : "education")}
              action={<button onClick={() => setShowVaultPicker({ section: 'education' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
            >
              <div className="space-y-2">
                {localResume.education.map((edu, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input value={edu} onChange={(e) => {
                      const newEdu = [...localResume.education];
                      newEdu[i] = e.target.value;
                      setLocalResume({ ...localResume, education: newEdu });
                    }} className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-[11px] font-medium outline-none" />
                    <button onClick={() => setLocalResume({...localResume, education: localResume.education.filter((_, idx) => idx !== i)})} className="p-2 text-red-400"><Minus size={12}/></button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* ── Section: Certifications ── */}
            <CollapsibleSection 
              title="Certifications" 
              icon={Award} 
              isOpen={openSection === "certifications"} 
              onToggle={() => setOpenSection(openSection === "certifications" ? null : "certifications")}
              action={<button onClick={() => setShowVaultPicker({ section: 'certifications' })} className="text-[8px] font-black uppercase text-lumina-teal flex items-center gap-1"><Plus size={10}/> Vault</button>}
            >
              <div className="space-y-2">
                {(localResume.certifications || []).map((cert, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input value={cert} onChange={(e) => {
                      const newCerts = [...(localResume.certifications || [])];
                      newCerts[i] = e.target.value;
                      setLocalResume({ ...localResume, certifications: newCerts });
                    }} className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-[11px] font-medium outline-none" />
                    <button onClick={() => setLocalResume({...localResume, certifications: (localResume.certifications || []).filter((_, idx) => idx !== i)})} className="p-2 text-red-400"><Minus size={12}/></button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* ── RIGHT PANEL: THE FULL-HEIGHT SIGNATURE PREVIEW ── */}
        <div className="lg:col-span-8 xl:col-span-9 2xl:col-span-9 lg:sticky lg:top-8 flex justify-center h-full pb-4">
          <div className="w-full flex-1 perspective-2000 h-full overflow-y-auto custom-scrollbar rounded-[2rem] shadow-inner bg-slate-100 p-4 sm:p-8">
            <motion.div 
              ref={resumeRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white border border-[#1E2A3A]/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] mx-auto overflow-hidden"
              title="Real-time A4 Resume Preview"
              style={{ 
                width: '100%', 
                maxWidth: '1000px',
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
                  <h1 
                    className="font-bold text-[#1E2A3A] tracking-tighter uppercase leading-tight"
                    style={{ fontSize: fontSizes.name }}
                  >
                    {localHeader.fullName || "Your Name"}
                  </h1>
                  
                  <div 
                    className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[#1E2A3A]/50 font-medium"
                    style={{ fontSize: fontSizes.meta }}
                  >
                    {localHeader.location && (
                      <div className="flex items-center gap-1.5"><MapPin size={10} className="text-lumina-teal/40" /> {localHeader.location}</div>
                    )}
                    {localHeader.phone && (
                      <div className="flex items-center gap-1.5"><Phone size={10} className="text-lumina-teal/40" /> {localHeader.phone}</div>
                    )}
                    {localHeader.email && (
                      <div className="flex items-center gap-1.5"><Mail size={10} className="text-lumina-teal/40" /> {localHeader.email}</div>
                    )}
                  </div>

                  <div 
                    className="flex flex-wrap justify-center items-center gap-6 font-black uppercase tracking-[0.2em] text-lumina-teal/60 pt-1"
                    style={{ fontSize: fontSizes.meta }}
                  >
                    {localHeader.linkedin && <div className="flex items-center gap-1.5"><Linkedin size={9} /> {localHeader.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</div>}
                    {localHeader.github && <div className="flex items-center gap-1.5"><Github size={9} /> {localHeader.github.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</div>}
                    {localHeader.portfolio && <div className="flex items-center gap-1.5"><Globe size={9} /> {localHeader.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')}</div>}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-10">
                  {/* Summary */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-3 text-[#1E2A3A]">
                      <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Professional Summary</h4>
                      <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                    </div>
                    <p className="text-[#1E2A3A]/80 leading-relaxed italic" style={{ fontSize: fontSizes.body }}>
                      {localResume.professional_summary}
                    </p>
                  </section>

                  {/* Skills */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-3 text-[#1E2A3A]">
                      <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Core Competencies</h4>
                      <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {localResume.skills_section.map((skill, i) => (
                        <div key={i} className="font-bold text-[#1E2A3A]/70 uppercase tracking-tighter" style={{ fontSize: `calc(${fontSizes.body} - 1px)` }}>
                          {skill}{i < localResume.skills_section.length - 1 && "  •"}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Experience */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-[#1E2A3A]">
                      <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Experience</h4>
                      <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                    </div>
                    <div className="space-y-8">
                      {localResume.experience.map((exp, expIdx) => (
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

                  {/* Projects */}
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
                    {/* Education */}
                    <section className="space-y-3">
                      <div className="flex items-center gap-3 text-[#1E2A3A]">
                        <h4 className="font-black uppercase tracking-[0.3em]" style={{ fontSize: fontSizes.meta }}>Education</h4>
                        <div className="h-px flex-1 bg-[#1E2A3A]/5" />
                      </div>
                      <div className="space-y-2">
                        {localResume.education.map((edu, i) => (
                          <p key={i} className="font-medium text-[#1E2A3A]/80" style={{ fontSize: `calc(${fontSizes.body} - 1px)` }}>{edu}</p>
                        ))}
                      </div>
                    </section>

                    {/* Certifications */}
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
      </div>

      {/* ── Vault Picker Modal ── */}
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
