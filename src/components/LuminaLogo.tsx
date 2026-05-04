import React from 'react';

interface LuminaLogoProps {
  className?: string;
  size?: number;
}

export const LuminaLogo = ({ className = "", size = 120 }: LuminaLogoProps) => {
  return (
    <div className={`flex items-center ${className}`} style={{ width: size, height: '100%' }}>
      <img 
        src="/logo.png" 
        alt="Lumina Logo" 
        className="object-contain"
        style={{ 
          maxHeight: '40px', 
          maxWidth: `${size}px`,
          width: 'auto',
          height: 'auto'
        }}
      />
    </div>
  );
};

