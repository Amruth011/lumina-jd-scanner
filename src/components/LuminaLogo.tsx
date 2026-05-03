import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 32 }: LuminaLogoProps) => {
  return (
    <img 
      src="/logo.png" 
      alt="Lumina"
      style={{ height: size }}
      className={`object-contain w-auto ${className}`}
    />
  );
};
