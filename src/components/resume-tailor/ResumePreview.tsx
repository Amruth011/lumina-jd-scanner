import React, { useState } from "react";
import { motion } from "framer-motion";
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
  ChevronUp
} from "lucide-react";
import { GeneratedResume, ResumeSection } from "@/types/jd";
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
  onUpdate: (updatedResume: GeneratedResume, updatedHeader: ResumeHeader) => void;
  onRegenerate: () => void;
  onDownload: () => void;
  isGenerating: boolean;
}

export const ResumePreview = ({ 
  resume, 
  header, 
  onUpdate, 
  onRegenerate, 
  onDownload,
  isGenerating 
}: ResumePreviewProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [localResume, setLocalResume] = useState<GeneratedResume>(resume);
  const [localHeader, setLocalHeader] = useState<ResumeHeader>(header);

  const handleSave = () => {
    onUpdate(localResume, localHeader);
    setIsEditMode(false);
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
    const newBullets = [...(newSections[sectionIndex].bullets || []), "• New strategic impact metric..."];
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  const removeBullet = (section: 'experience' | 'projects', sectionIndex: number, bulletIndex: number) => {
    const newSections = [...(localResume[section] || [])];
    const newBullets = (newSections[sectionIndex].bullets || []).filter((_, i) => i !== bulletIndex);
    newSections[sectionIndex] = { ...newSections[sectionIndex], bullets: newBullets };
    setLocalResume(prev => ({ ...prev, [section]: newSections }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── Action Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white border border-[#1E2A3A]/5 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#1E2A3A]">Candidacy Blueprint</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1E2A3A]/40">
              ATS-Optimized Preview • {isEditMode ? 'Editing Active' : 'Read Only'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <button 
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 border border-border/10 text-xs font-black uppercase tracking-widest text-[#1E2A3A] hover:bg-slate-100 transition-all"
            >
              <Edit3 className="w-4 h-4" /> Edit Blueprint
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E2A3A] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#1E2A3A]/20 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          )}
          
          <button 
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-xs font-black uppercase tracking-widest transition-all hover:bg-[#10B981]/20 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
          </button>

          <button 
            onClick={onDownload}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#10B981] text-[#1E2A3A] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#10B981]/20 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Resume Body ── */}
      <div className={`relative bg-white border border-[#1E2A3A]/5 rounded-[3rem] p-12 lg:p-20 shadow-2xl transition-all duration-500 ${isEditMode ? 'ring-2 ring-[#10B981]/20 border-[#10B981]/20' : ''}`}>
        
        {/* Header Section */}
        <div className="text-center space-y-4 border-b border-[#1E2A3A]/5 pb-10 mb-10">
          {isEditMode ? (
            <input 
              value={localHeader.fullName}
              onChange={(e) => updateHeader('fullName', e.target.value)}
              className="text-4xl lg:text-5xl font-serif font-bold text-center w-full bg-slate-50 border-none focus:ring-0 outline-none p-2 rounded-xl"
              placeholder="Full Name"
            />
          ) : (
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#1E2A3A] tracking-tight">{localHeader.fullName}</h1>
          )}
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[13px] text-[#1E2A3A]/60 font-body font-medium">
            {isEditMode ? (
              <>
                <input value={localHeader.location} onChange={(e) => updateHeader('location', e.target.value)} className="bg-slate-50 rounded-lg px-2 py-1 outline-none w-32 text-center" placeholder="Location" />
                <input value={localHeader.phone} onChange={(e) => updateHeader('phone', e.target.value)} className="bg-slate-50 rounded-lg px-2 py-1 outline-none w-32 text-center" placeholder="Phone" />
                <input value={localHeader.email} onChange={(e) => updateHeader('email', e.target.value)} className="bg-slate-50 rounded-lg px-2 py-1 outline-none w-48 text-center" placeholder="Email" />
              </>
            ) : (
              <>
                <span>{localHeader.location}</span>
                <span>{localHeader.phone}</span>
                <span>{localHeader.email}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-[11px] font-black uppercase tracking-widest text-[#10B981]">
             {isEditMode ? (
               <>
                <input value={localHeader.linkedin} onChange={(e) => updateHeader('linkedin', e.target.value)} className="bg-[#10B981]/5 rounded-lg px-2 py-1 outline-none w-40 text-center" placeholder="LinkedIn URL" />
                <input value={localHeader.github} onChange={(e) => updateHeader('github', e.target.value)} className="bg-[#10B981]/5 rounded-lg px-2 py-1 outline-none w-40 text-center" placeholder="GitHub URL" />
                <input value={localHeader.portfolio} onChange={(e) => updateHeader('portfolio', e.target.value)} className="bg-[#10B981]/5 rounded-lg px-2 py-1 outline-none w-40 text-center" placeholder="Portfolio URL" />
               </>
             ) : (
               <>
                {localHeader.linkedin && <span>LinkedIn</span>}
                {localHeader.github && <span>GitHub</span>}
                {localHeader.portfolio && <span>Portfolio</span>}
               </>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Summary */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#1E2A3A]">
              <h4 className="text-sm font-black uppercase tracking-[0.3em]">Professional Summary</h4>
              <div className="h-px flex-1 bg-[#1E2A3A]/5" />
            </div>
            {isEditMode ? (
              <textarea 
                value={localResume.professional_summary}
                onChange={(e) => updateSummary(e.target.value)}
                className="w-full min-h-[100px] bg-slate-50 border-none rounded-2xl p-6 text-lg font-body leading-relaxed outline-none focus:ring-1 ring-[#10B981]/20"
              />
            ) : (
              <p className="text-lg text-[#1E2A3A]/80 font-body leading-relaxed">{localResume.professional_summary}</p>
            )}
          </section>

          {/* Skills */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#1E2A3A]">
              <h4 className="text-sm font-black uppercase tracking-[0.3em]">Core Competencies</h4>
              <div className="h-px flex-1 bg-[#1E2A3A]/5" />
            </div>
            <div className="flex flex-wrap gap-3">
              {localResume.skills_section.map((skill, i) => (
                <div key={i} className="px-5 py-2 rounded-xl bg-slate-50 border border-[#1E2A3A]/5 text-sm font-body font-bold text-[#1E2A3A]/70">
                  {skill}
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-[#1E2A3A]">
              <h4 className="text-sm font-black uppercase tracking-[0.3em]">Professional Experience</h4>
              <div className="h-px flex-1 bg-[#1E2A3A]/5" />
            </div>
            <div className="space-y-10">
              {localResume.experience.map((exp, expIdx) => (
                <div key={expIdx} className="space-y-4 group/item">
                  <div className="flex justify-between items-start">
                    {isEditMode ? (
                      <input 
                        value={exp.heading}
                        onChange={(e) => updateExperience(expIdx, 'heading', e.target.value)}
                        className="text-2xl font-serif font-bold text-[#1E2A3A] w-full bg-slate-50 rounded-xl px-4 py-2 outline-none"
                      />
                    ) : (
                      <h5 className="text-2xl font-serif font-bold text-[#1E2A3A]">{exp.heading}</h5>
                    )}
                  </div>
                  <div className="space-y-3 pl-2">
                    {exp.bullets?.map((bullet, bullIdx) => (
                      <div key={bullIdx} className="flex gap-4 group/bullet">
                        <span className="text-[#10B981] pt-1.5">•</span>
                        {isEditMode ? (
                          <div className="flex-1 flex gap-2">
                            <textarea 
                              value={bullet}
                              onChange={(e) => updateBullet('experience', expIdx, bullIdx, e.target.value)}
                              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-[17px] font-body outline-none focus:ring-1 ring-[#10B981]/20 min-h-[60px]"
                            />
                            <button 
                              onClick={() => removeBullet('experience', expIdx, bullIdx)}
                              className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 opacity-0 group-hover/bullet:opacity-100 transition-opacity"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-[17px] text-[#1E2A3A]/80 font-body leading-relaxed">{bullet}</p>
                        )}
                      </div>
                    ))}
                    {isEditMode && (
                      <button 
                        onClick={() => addBullet('experience', expIdx)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981]/5 text-[#10B981] text-[13px] font-bold"
                      >
                        <Plus size={14} /> Add Bullet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          {((localResume.projects && localResume.projects.length > 0) || isEditMode) && (
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-[#1E2A3A]">
                <h4 className="text-sm font-black uppercase tracking-[0.3em]">Technical Projects</h4>
                <div className="h-px flex-1 bg-[#1E2A3A]/5" />
              </div>
              <div className="space-y-10">
                {localResume.projects?.map((proj, projIdx) => (
                  <div key={projIdx} className="space-y-4 group/item">
                    <div className="flex justify-between items-start">
                      {isEditMode ? (
                        <input 
                          value={proj.heading}
                          onChange={(e) => {
                            const newProjects = [...(localResume.projects || [])];
                            newProjects[projIdx] = { ...newProjects[projIdx], heading: e.target.value };
                            setLocalResume({ ...localResume, projects: newProjects });
                          }}
                          className="text-2xl font-serif font-bold text-[#1E2A3A] w-full bg-slate-50 rounded-xl px-4 py-2 outline-none"
                        />
                      ) : (
                        <h5 className="text-2xl font-serif font-bold text-[#1E2A3A]">{proj.heading}</h5>
                      )}
                    </div>
                    <div className="space-y-3 pl-2">
                      {proj.bullets?.map((bullet, bullIdx) => (
                        <div key={bullIdx} className="flex gap-4 group/bullet">
                          <span className="text-[#10B981] pt-1.5">•</span>
                          {isEditMode ? (
                            <div className="flex-1 flex gap-2">
                              <textarea 
                                value={bullet}
                                onChange={(e) => updateBullet('projects', projIdx, bullIdx, e.target.value)}
                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-[17px] font-body outline-none focus:ring-1 ring-[#10B981]/20 min-h-[60px]"
                              />
                              <button 
                                onClick={() => removeBullet('projects', projIdx, bullIdx)}
                                className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 opacity-0 group-hover/bullet:opacity-100 transition-opacity"
                              >
                                <Minus size={16} />
                              </button>
                            </div>
                          ) : (
                            <p className="text-[17px] text-[#1E2A3A]/80 font-body leading-relaxed">{bullet}</p>
                          )}
                        </div>
                      ))}
                      {isEditMode && (
                        <button 
                          onClick={() => addBullet('projects', projIdx)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981]/5 text-[#10B981] text-[13px] font-bold"
                        >
                          <Plus size={14} /> Add Bullet
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#1E2A3A]">
              <h4 className="text-sm font-black uppercase tracking-[0.3em]">Education</h4>
              <div className="h-px flex-1 bg-[#1E2A3A]/5" />
            </div>
            <div className="space-y-4">
              {localResume.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-center group/edu">
                  {isEditMode ? (
                    <input 
                      value={edu}
                      onChange={(e) => {
                        const newEdu = [...localResume.education];
                        newEdu[i] = e.target.value;
                        setLocalResume({ ...localResume, education: newEdu });
                      }}
                      className="text-lg text-[#1E2A3A]/80 font-body w-full bg-slate-50 rounded-lg px-4 py-2 outline-none"
                    />
                  ) : (
                    <p className="text-lg text-[#1E2A3A]/80 font-body">{edu}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          {((localResume.certifications && localResume.certifications.length > 0) || isEditMode) && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#1E2A3A]">
                <h4 className="text-sm font-black uppercase tracking-[0.3em]">Certifications</h4>
                <div className="h-px flex-1 bg-[#1E2A3A]/5" />
              </div>
              <div className="space-y-2">
                {localResume.certifications?.map((cert, i) => (
                  <div key={i} className="flex justify-between items-center group/cert">
                    {isEditMode ? (
                      <input 
                        value={cert}
                        onChange={(e) => {
                          const newCerts = [...(localResume.certifications || [])];
                          newCerts[i] = e.target.value;
                          setLocalResume({ ...localResume, certifications: newCerts });
                        }}
                        className="text-lg text-[#1E2A3A]/80 font-body w-full bg-slate-50 rounded-lg px-4 py-2 outline-none"
                      />
                    ) : (
                      <p className="text-lg text-[#1E2A3A]/80 font-body">{cert}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
