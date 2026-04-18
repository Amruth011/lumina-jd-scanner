import React from "react";
import { motion } from "framer-motion";

interface LuminaGaugeProps {
  value: number; // 0-100
  label: string;
  subLabel?: string;
  size?: number;
  color?: string;
  minLabel?: string;
  maxLabel?: string;
}

export const LuminaGauge = ({ 
  value, 
  label, 
  subLabel, 
  size = 200, 
  color = "var(--accent-emerald)",
  minLabel = "Low",
  maxLabel = "High"
}: LuminaGaugeProps) => {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = radius * Math.PI; // Half-circle
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size / 1.5 }}>
        <svg width={size} height={size / 1.5} viewBox={`0 0 ${size} ${size / 1.5}`} className="overflow-visible">
          {/* Background Track */}
          <path
            d={`M ${size * 0.1} ${size * 0.6} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size * 0.6}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-white/5"
          />
          {/* Progress Fill */}
          <motion.path
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            d={`M ${size * 0.1} ${size * 0.6} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size * 0.6}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
          />
          
          {/* Text Labels inside Gauge */}
          <text 
            x={size / 2} 
            y={size * 0.55} 
            textAnchor="middle" 
            className="text-4xl font-display font-black fill-foreground tracking-tighter"
          >
            {value}
          </text>
          <text 
            x={size / 2} 
            y={size * 0.68} 
            textAnchor="middle" 
            className="text-[10px] uppercase font-black tracking-widest fill-muted-foreground opacity-50"
          >
            {subLabel || "Score"}
          </text>
        </svg>

        {/* Min/Max Labels */}
        <div className="absolute bottom-0 inset-x-0 flex justify-between px-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground opacity-30">{minLabel}</span>
            <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground opacity-30">{maxLabel}</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <h4 className="text-sm font-display font-bold text-foreground">{label}</h4>
      </div>
    </div>
  );
};
