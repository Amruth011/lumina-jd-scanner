import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 24 }: LuminaLogoProps) => {
  return (
    <img 
      src="/logo.png" 
      alt="Lumina Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
};
