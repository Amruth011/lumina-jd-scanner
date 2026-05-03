import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 120 }: LuminaLogoProps) => {
  return (
    <img 
      src="/logo.png" 
      alt="Lumina"
      style={{ width: size }}
      className={`object-contain h-auto ${className}`}
    />
  );
};
