import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

export const GapAnalysisAnim = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
  }, []);

  const skills = [
    { name: 'Cloud Arch', matched: true },
    { name: 'Go/Rust', matched: false },
    { name: 'System Design', matched: true },
    { name: 'Team Lead', matched: true },
  ];

  return (
    <div className="w-full flex flex-col gap-3 px-4">
      <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest font-mono">
        <span>You</span>
        <span>Target</span>
      </div>
      {skills.map((skill, i) => (
        <div key={skill.name} className="flex items-center justify-between relative">
          <span className="text-[11px] text-white/80 font-medium">{skill.name}</span>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            <line 
              x1="30%" y1="50%" x2="70%" y2="50%" 
              stroke={skill.matched ? "#10B981" : "#EF4444"} 
              strokeWidth="1" 
              strokeDasharray={skill.matched ? "0" : "4 2"}
              style={{ 
                strokeDashoffset: active ? 0 : 100, 
                transition: `stroke-dashoffset 1s ease-out ${i * 0.2}s` 
              }}
            />
          </svg>

          {skill.matched ? (
            <Check size={14} className="text-[#10B981]" />
          ) : (
            <X size={14} className="text-[#EF4444]" />
          )}
        </div>
      ))}
    </div>
  );
};
