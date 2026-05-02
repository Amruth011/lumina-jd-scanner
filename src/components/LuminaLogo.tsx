import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "text-accent-emerald", size = 24 }: LuminaLogoProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stylized "L" Icon from the brand update */}
      <path 
        d="M25 6L39 5.5L29 94.5L20 95L25 6Z" 
        fill="currentColor" 
      />
      <path 
        d="M5 67L95 60L95 75L5 74L5 67Z" 
        fill="currentColor" 
      />
    </svg>
  );
};
