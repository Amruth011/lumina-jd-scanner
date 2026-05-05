import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Edit3, 
  Download, 
  RotateCcw, 
  Plus, 
  Minus, 
  User, 
  Briefcase, 
  Award, 
  GraduationCap, 
  Settings2,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Database,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Trash2
} from "lucide-react";
import { GeneratedResume, VaultItem } from "@/types/jd";
import { toast } from "sonner";

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
  onDownload: () => void;
  isGenerating: boolean;
}

export const ResumePreview = ({ 
  resume, 
  header, 
  vaultItems,
  onUpdate, 
  onRegenerate, 
  onDownload,
  isGenerating 
}: ResumePreviewProps) => {
  const [localResume, setLocalResume] = useState<GeneratedResume>(resume);
  const [localHeader, setLocalHeader] = useState<ResumeHeader>(header);
  const [showVaultPicker, setShowVaultPicker] = useState<{ section: 'experience' | 'projects' | 'education' | 'certifications', index?: number } | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  // Sync local state when props change (e.g. after regeneration)
  useEffect(() => {
    setLocalResume(resume);
    setLocalHeader(header);
  }, [resume, header]);

  // Monitor height for A4 page breaks
  useEffect(() => {
    if (resumeRef.current) {
      const height = resumeRef.current.scrollHeight;
      const a4HeightPx = (resumeRef.current.offsetWidth * 297) / 210;
      setPageCount(Math.ceil(height / a4HeightPx));
    }
  }, [localResume, localHeader]);

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

  return (
    <div className="max-w-[1400px] mx-auto pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* ── LEFT PANEL: THE CONTROL CENTER ── */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 max-h-[90vh] overflow-y-auto pr-4 custom-scrollbar pb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-lumina-teal/10 flex items-center justify-center text-lumina-teal">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1E2A3A]">Candidacy Editor</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1E2A3A]/40">Blueprint Calibration Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onRegenerate}
                disabled={isGenerating}
                className="p-3 rounded-xl bg-slate-50 border border-border/10 text-[#1E2A3A]/60 hover:text-lumina-teal transition-all"
                title="Regenerate"
              >
                <RotateCcw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleSave}
                className="p-3 rounded-xl bg-lumina-teal text-white shadow-lg shadow-lumina-teal/20 transition-all hover:scale-105"
                title="Save Changes"
              >
                <Save className="w-5 h-5" />
              </button>
              <button 
                onClick={onDownload}
                className="p-3 rounded-xl bg-[#1E2A3A] text-white shadow-lg shadow-[#1E2A3A]/20 transition-all hover:scale-105"
                title="Export PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Section: Profile / Header ── */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-lumina-teal">
              <User className="w-5 h-5" />
              <h4 className="text-xs font-black uppercase tracking-widest">Profile Identity</h4>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#1E2A3A]/40 ml-1">Full Name</label>
                <input 
                  value={localHeader.fullName}
                  onChange={(e) => updateHeader('fullName', e.target.value)}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-lumina-teal/30 focus:ring-4 ring-lumina-teal/5 transition-all"
                  placeholder="Full Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#1E2A3A]/40 ml-1">Email</label>
                  <input value={localHeader.email} onChange={(e) => updateHeader('email', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-lumina-teal/30 focus:ring-4 ring-lumina-teal/5 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#1E2A3A]/40 ml-1">Phone</label>
                  <input value={localHeader.phone} onChange={(e) => updateHeader('phone', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-lumina-teal/30 focus:ring-4 ring-lumina-teal/5 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#1E2A3A]/40 ml-1">Location</label>
                <input value={localHeader.location} onChange={(e) => updateHeader('location', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-lumina-teal/30 focus:ring-4 ring-lumina-teal/5 transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                 <input value={localHeader.linkedin} onChange={(e) => updateHeader('linkedin', e.target.value)} className="bg-slate-50 rounded-xl px-4 py-3 text-[10px] font-bold outline-none border border-transparent focus:border-lumina-teal/30" placeholder="LinkedIn" />
                 <input value={localHeader.github} onChange={(e) => updateHeader('github', e.target.value)} className="bg-slate-50 rounded-xl px-4 py-3 text-[10px] font-bold outline-none border border-transparent focus:border-lumina-teal/30" placeholder="GitHub" />
                 <input value={localHeader.portfolio} onChange={(e) => updateHeader('portfolio', e.target.value)} className="bg-slate-50 rounded-xl px-4 py-3 text-[10px] font-bold outline-none border border-transparent focus:border-lumina-teal/30" placeholder="Portfolio" />
              </div>
            </div>
          </div>

          {/* ── Section: Professional Summary ── */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-lumina-teal">
              <FileText className="w-5 h-5" />
              <h4 className="text-xs font-black uppercase tracking-widest">Executive Summary</h4>
            </div>
            <textarea 
              value={localResume.professional_summary}
              onChange={(e) => updateSummary(e.target.value)}
              className="w-full min-h-[120px] bg-slate-50 rounded-[1.5rem] p-6 text-sm font-body leading-relaxed outline-none border border-transparent focus:border-lumina-teal/30 focus:ring-4 ring-lumina-teal/5 transition-all resize-none"
              placeholder="Inject your high-impact professional narrative here..."
            />
          </div>

          {/* ── Section: Experience Manager ── */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-lumina-teal">
                <Briefcase className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-widest">Experience</h4>
              </div>
              <button 
                onClick={() => setShowVaultPicker({ section: 'experience' })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lumina-teal/10 text-lumina-teal text-[10px] font-black uppercase tracking-widest hover:bg-lumina-teal hover:text-white transition-all"
              >
                <Plus size={12} /> From Vault
              </button>
            </div>
            <div className="space-y-6">
              {localResume.experience.map((exp, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50/50 border border-border/10 space-y-4 relative group/exp">
                  <button 
                    onClick={() => {
                      const newExp = localResume.experience.filter((_, i) => i !== idx);
                      setLocalResume({ ...localResume, experience: newExp });
                    }}
                    className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover/exp:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <input 
                    value={exp.heading}
                    onChange={(e) => updateExperience(idx, 'heading', e.target.value)}
                    className="w-full bg-transparent font-serif font-bold text-lg outline-none border-b border-transparent focus:border-lumina-teal/20"
                  />
                  <div className="space-y-3">
                    {exp.bullets?.map((bullet, bullIdx) => (
                      <div key={bullIdx} className="flex gap-3 items-start group/bull">
                        <textarea 
                          value={bullet}
                          onChange={(e) => updateBullet('experience', idx, bullIdx, e.target.value)}
                          className="flex-1 bg-white/50 rounded-xl px-4 py-2 text-xs font-body outline-none border border-transparent focus:border-lumina-teal/30 min-h-[50px]"
                        />
                        <button 
                          onClick={() => removeBullet('experience', idx, bullIdx)}
                          className="p-2 text-red-500 opacity-0 group-hover/bull:opacity-100"
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addBullet('experience', idx)}
                      className="text-[10px] font-bold text-lumina-teal/60 hover:text-lumina-teal flex items-center gap-1.5 px-1"
                    >
                      <Plus size={12} /> Add Metric Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section: Projects Manager ── */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-lumina-teal">
                <Database className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-widest">Projects</h4>
              </div>
              <button 
                onClick={() => setShowVaultPicker({ section: 'projects' })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lumina-teal/10 text-lumina-teal text-[10px] font-black uppercase tracking-widest hover:bg-lumina-teal hover:text-white transition-all"
              >
                <Plus size={12} /> From Vault
              </button>
            </div>
            <div className="space-y-6">
              {(localResume.projects || []).map((proj, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50/50 border border-border/10 space-y-4 relative group/proj">
                  <button 
                    onClick={() => {
                      const newProj = localResume.projects?.filter((_, i) => i !== idx);
                      setLocalResume({ ...localResume, projects: newProj });
                    }}
                    className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover/proj:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <input 
                    value={proj.heading}
                    onChange={(e) => {
                      const newProjects = [...(localResume.projects || [])];
                      newProjects[idx] = { ...newProjects[idx], heading: e.target.value };
                      setLocalResume({ ...localResume, projects: newProjects });
                    }}
                    className="w-full bg-transparent font-serif font-bold text-lg outline-none border-b border-transparent focus:border-lumina-teal/20"
                  />
                  <div className="space-y-3">
                    {proj.bullets?.map((bullet, bullIdx) => (
                      <div key={bullIdx} className="flex gap-3 items-start group/bull">
                        <textarea 
                          value={bullet}
                          onChange={(e) => updateBullet('projects', idx, bullIdx, e.target.value)}
                          className="flex-1 bg-white/50 rounded-xl px-4 py-2 text-xs font-body outline-none border border-transparent focus:border-lumina-teal/30 min-h-[50px]"
                        />
                        <button 
                          onClick={() => removeBullet('projects', idx, bullIdx)}
                          className="p-2 text-red-500 opacity-0 group-hover/bull:opacity-100"
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addBullet('projects', idx)}
                      className="text-[10px] font-bold text-lumina-teal/60 hover:text-lumina-teal flex items-center gap-1.5 px-1"
                    >
                      <Plus size={12} /> Add Metric Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section: Education & Certs ── */}
          <div className="grid grid-cols-1 gap-6">
            {/* Education */}
            <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-lumina-teal">
                  <GraduationCap className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Education</h4>
                </div>
                <button onClick={() => setShowVaultPicker({ section: 'education' })} className="p-1.5 text-lumina-teal hover:bg-lumina-teal/10 rounded-lg"><Plus size={14}/></button>
              </div>
              <div className="space-y-2">
                {localResume.education.map((edu, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input 
                      value={edu}
                      onChange={(e) => {
                        const newEdu = [...localResume.education];
                        newEdu[i] = e.target.value;
                        setLocalResume({ ...localResume, education: newEdu });
                      }}
                      className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-[13px] font-medium outline-none border border-transparent focus:border-lumina-teal/30"
                    />
                    <button onClick={() => setLocalResume({...localResume, education: localResume.education.filter((_, idx) => idx !== i)})} className="p-2 text-red-400 hover:text-red-500"><Minus size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certs */}
            <div className="p-8 rounded-[2.5rem] bg-white border border-[#1E2A3A]/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-lumina-teal">
                  <Award className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Certifications</h4>
                </div>
                <button onClick={() => setShowVaultPicker({ section: 'certifications' })} className="p-1.5 text-lumina-teal hover:bg-lumina-teal/10 rounded-lg"><Plus size={14}/></button>
              </div>
              <div className="space-y-2">
                {(localResume.certifications || []).map((cert, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input 
                      value={cert}
                      onChange={(e) => {
                        const newCerts = [...(localResume.certifications || [])];
                        newCerts[i] = e.target.value;
                        setLocalResume({ ...localResume, certifications: newCerts });
                      }}
                      className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-[13px] font-medium outline-none border border-transparent focus:border-lumina-teal/30"
                    />
                    <button onClick={() => setLocalResume({...localResume, certifications: (localResume.certifications || []).filter((_, idx) => idx !== i)})} className="p-2 text-red-400 hover:text-red-500"><Minus size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: THE SIGNATURE PREVIEW ── */}
        <div className="lg:col-span-7 lg:sticky lg:top-8 flex justify-center">
          <div className="w-full max-w-[800px] perspective-2000">
            <motion.div 
              ref={resumeRef}
              initial={{ rotateY: 5, rotateX: 2, scale: 0.95, opacity: 0 }}
              animate={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-[#1E2A3A]/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
              style={{ 
                width: '100%', 
                minHeight: '297mm', // A4 Height
                borderRadius: '0px'
              }}
            >
              {/* Page Indicator Overlay */}
              <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-20">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1E2A3A]">
                  <Database className="w-4 h-4 text-lumina-teal" /> A4 High-Density Format
                </div>
              </div>

              <div className="p-16 lg:p-24 space-y-12">
                {/* Header */}
                <div className="text-center space-y-5 border-b border-[#1E2A3A]/5 pb-12 mb-12">
                  <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#1E2A3A] tracking-tighter uppercase leading-none">
                    {localHeader.fullName || "Your Name"}
                  </h1>
                  
                  <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[13px] text-[#1E2A3A]/50 font-body font-medium">
                    {localHeader.location && (
                      <div className="flex items-center gap-1.5"><MapPin size={12} className="text-lumina-teal/40" /> {localHeader.location}</div>
                    )}
                    {localHeader.phone && (
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-lumina-teal/40" /> {localHeader.phone}</div>
                    )}
                    {localHeader.email && (
                      <div className="flex items-center gap-1.5"><Mail size={12} className="text-lumina-teal/40" /> {localHeader.email}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center items-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-lumina-teal/60 pt-2">
                    {localHeader.linkedin && <div className="flex items-center gap-2"><Linkedin size={10} /> LinkedIn</div>}
                    {localHeader.github && <div className="flex items-center gap-2"><Github size={10} /> GitHub</div>}
                    {localHeader.portfolio && <div className="flex items-center gap-2"><Globe size={10} /> Portfolio</div>}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-14">
                  {/* Summary */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-4 text-[#1E2A3A]">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Professional Summary</h4>
                      <div className="h-px flex-1 bg-[#1E2A3A]/10" />
                    </div>
                    <p className="text-[17px] text-[#1E2A3A]/80 font-body leading-[1.7] italic">
                      {localResume.professional_summary}
                    </p>
                  </section>

                  {/* Skills */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-4 text-[#1E2A3A]">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Core Competencies</h4>
                      <div className="h-px flex-1 bg-[#1E2A3A]/10" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                      {localResume.skills_section.map((skill, i) => (
                        <div key={i} className="text-[14px] font-body font-bold text-[#1E2A3A]/70 uppercase tracking-tighter">
                          {skill}{i < localResume.skills_section.length - 1 && "  •"}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Experience */}
                  <section className="space-y-10">
                    <div className="flex items-center gap-4 text-[#1E2A3A]">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Professional Experience</h4>
                      <div className="h-px flex-1 bg-[#1E2A3A]/10" />
                    </div>
                    <div className="space-y-12">
                      {localResume.experience.map((exp, expIdx) => (
                        <div key={expIdx} className="space-y-5">
                          <h5 className="text-[22px] font-serif font-bold text-[#1E2A3A] tracking-tight">{exp.heading}</h5>
                          <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                            {exp.bullets?.map((bullet, bullIdx) => (
                              <div key={bullIdx} className="flex gap-5 items-start">
                                <span className="text-lumina-teal pt-1.5 font-bold">•</span>
                                <p className="text-[17px] text-[#1E2A3A]/80 font-body leading-[1.6]">{bullet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Projects */}
                  {(localResume.projects && localResume.projects.length > 0) && (
                    <section className="space-y-10">
                      <div className="flex items-center gap-4 text-[#1E2A3A]">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Key Projects</h4>
                        <div className="h-px flex-1 bg-[#1E2A3A]/10" />
                      </div>
                      <div className="space-y-12">
                        {localResume.projects?.map((proj, projIdx) => (
                          <div key={projIdx} className="space-y-5">
                            <h5 className="text-[20px] font-serif font-bold text-[#1E2A3A] tracking-tight">{proj.heading}</h5>
                            <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                              {proj.bullets?.map((bullet, bullIdx) => (
                                <div key={bullIdx} className="flex gap-5 items-start">
                                  <span className="text-lumina-teal pt-1.5 font-bold">•</span>
                                  <p className="text-[17px] text-[#1E2A3A]/80 font-body leading-[1.6]">{bullet}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Education */}
                    <section className="space-y-5">
                      <div className="flex items-center gap-4 text-[#1E2A3A]">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Education</h4>
                        <div className="h-px flex-1 bg-[#1E2A3A]/10" />
                      </div>
                      <div className="space-y-4">
                        {localResume.education.map((edu, i) => (
                          <p key={i} className="text-[15px] text-[#1E2A3A]/80 font-body font-medium">{edu}</p>
                        ))}
                      </div>
                    </section>

                    {/* Certifications */}
                    {(localResume.certifications && localResume.certifications.length > 0) && (
                      <section className="space-y-5">
                        <div className="flex items-center gap-4 text-[#1E2A3A]">
                          <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Certifications</h4>
                          <div className="h-px flex-1 bg-[#1E2A3A]/10" />
                        </div>
                        <div className="space-y-4">
                          {localResume.certifications?.map((cert, i) => (
                            <p key={i} className="text-[15px] text-[#1E2A3A]/80 font-body font-medium">{cert}</p>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Page Breaks (Visual Only) */}
              {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute left-0 right-0 h-px border-t border-dashed border-[#1E2A3A]/20 flex items-center justify-center pointer-events-none"
                  style={{ top: `${(i + 1) * 100 / pageCount}%` }}
                >
                  <span className="bg-white px-6 text-[9px] font-black uppercase tracking-[0.5em] text-[#1E2A3A]/20">A4 Page Cut {i + 1}</span>
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-[#1E2A3A]/5 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-lumina-teal flex items-center justify-center text-white shadow-lg shadow-lumina-teal/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif font-bold text-[#1E2A3A]">Tactical Vault</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1E2A3A]/40">Inject {showVaultPicker.section} entry into blueprint</p>
                  </div>
                </div>
                <button onClick={() => setShowVaultPicker(null)} className="p-3 hover:bg-slate-200 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {vaultItems
                  .filter(item => {
                    if (showVaultPicker.section === 'experience') return item.type === 'professional';
                    if (showVaultPicker.section === 'projects') return item.type === 'project';
                    if (showVaultPicker.section === 'education') return item.type === 'education';
                    if (showVaultPicker.section === 'certifications') return item.type === 'certification';
                    return true;
                  })
                  .map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => addFromVault(item)}
                      className="p-8 rounded-[2rem] border border-[#1E2A3A]/5 hover:border-lumina-teal hover:bg-lumina-teal/5 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-xl font-serif font-bold text-[#1E2A3A] group-hover:text-lumina-teal transition-colors">{item.title}</h5>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#1E2A3A]/30">{item.period}</span>
                      </div>
                      <p className="text-sm text-[#1E2A3A]/60 line-clamp-2 mb-4 italic leading-relaxed">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.skills?.slice(0, 4).map(skill => (
                          <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-[#1E2A3A]/40">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {vaultItems.filter(item => {
                    if (showVaultPicker.section === 'experience') return item.type === 'professional';
                    if (showVaultPicker.section === 'projects') return item.type === 'project';
                    if (showVaultPicker.section === 'education') return item.type === 'education';
                    if (showVaultPicker.section === 'certifications') return item.type === 'certification';
                    return true;
                }).length === 0 && (
                  <div className="py-24 text-center space-y-6">
                    <Database className="w-16 h-16 text-[#1E2A3A]/5 mx-auto" />
                    <p className="text-lg text-[#1E2A3A]/30 font-serif italic">No tactical signatures found in this sector of your vault.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
