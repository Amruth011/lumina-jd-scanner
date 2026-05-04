import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 120 }: LuminaLogoProps) => {
  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      style={{ width: size }}
    >
      <svg 
        viewBox="0 0 400 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Stylized Icon (The Star/Cross) */}
        <path 
          d="M35 15L30 75M10 65L80 55" 
          stroke="#10B981" 
          strokeWidth="12" 
          strokeLinecap="round"
        />
        
        {/* Text LUMINA */}
        <text 
          x="100" 
          y="70" 
          fill="#10B981" 
          fontFamily="Inter, sans-serif" 
          fontSize="72" 
          fontWeight="bold" 
          letterSpacing="-0.02em"
        >
          LUMINA
        </text>
      </svg>
    </div>
  );
};
