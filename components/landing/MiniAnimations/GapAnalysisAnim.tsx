"use client";

import React, { useEffect, useState } from 'react';

const rows = [
  { label: 'System Design', match: true },
  { label: 'LLM Expertise', match: false },
  { label: 'Cloud Architecture', match: true },
  { label: 'Team Mentoring', match: true },
];

export const GapAnalysisAnim = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
  }, []);

  return (
    <div className="h-full flex flex-col justify-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">
        <span>You</span>
        <span>Target</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="relative flex items-center justify-between">
          <div className="w-1/3 h-1.5 bg-emerald-500/20 rounded-full" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line 
              x1="33%" y1="50%" x2="66%" y2="50%" 
              stroke={row.match ? "#10B981" : "#EF4444"} 
              strokeWidth="1" 
              strokeDasharray={row.match ? "0" : "2,2"}
              className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}
              style={{ strokeDashoffset: active ? 0 : 100 }}
            />
          </svg>
          <div className="w-1/3 h-1.5 bg-white/10 rounded-full flex justify-end items-center">
            <span className={`text-[8px] mr-1 ${row.match ? 'text-emerald-500' : 'text-red-500'}`}>
              {row.match ? '✓' : '✗'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GapAnalysisAnim;
