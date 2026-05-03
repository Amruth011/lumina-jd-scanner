import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 32 }: LuminaLogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/favicon.png" 
        alt="Lumina Logo"
        width={size}
        height={size}
        className="object-contain"
      />
      <span className="font-serif italic text-xl tracking-tighter text-foreground">
        Lumina
      </span>
    </div>
  );
};
