import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 120 }: LuminaLogoProps) => {
  return (
    <div className={`flex items-center ${className}`} style={{ width: size }}>
      <img 
        src="/logo.png" 
        alt="Lumina Logo" 
        className="object-contain"
        style={{ 
          width: `${size}px`,
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
};

