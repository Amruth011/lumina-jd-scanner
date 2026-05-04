import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 120 }: LuminaLogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ width: size }}>
      <div className="relative flex-shrink-0" style={{ width: size * 0.35, height: size * 0.35 }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <path 
            d="M50 5L93.3 30V70L50 95L6.7 70V30L50 5Z" 
            stroke="#10B981" 
            strokeWidth="4" 
            className="opacity-20"
          />
          <path 
            d="M50 10L86.6 31V69L50 90L13.4 69V31L50 10Z" 
            fill="url(#logo-gradient)" 
            className="animate-pulse"
          />
          <path 
            d="M40 30V70H60V62H48V30H40Z" 
            fill="white" 
          />
          <defs>
            <linearGradient id="logo-gradient" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-lumina-teal/20 blur-xl rounded-full -z-10 animate-pulse" />
      </div>
      <span className="font-display font-bold text-lumina-navy tracking-tighter leading-none" style={{ fontSize: size * 0.22 }}>
        Lumina
      </span>
    </div>
  );
};

