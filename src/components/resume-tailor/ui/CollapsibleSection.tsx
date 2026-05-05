import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}

/**
 * A premium accordion component for the Lumina editor.
 * Features smooth Framer Motion transitions and high-fidelity styling.
 */
/**
 * CollapsibleSection: Elite Accordion Component
 * ============================================
 * Provides a highly animated, accessible container for dashboard control panels.
 * Features:
 * - Independent open/close state.
 * - Interactive action slots (e.g., '+ Vault' button).
 * - Smooth [0.16, 1, 0.3, 1] cubic-bezier animations.
 * - ARIA-compliant role and state attributes.
 */
export const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  isOpen, 
  onToggle, 
  action 
}: CollapsibleSectionProps) => (
  <div className={`p-5 rounded-[1.5rem] border transition-all duration-300 ${isOpen ? 'bg-white border-lumina-teal/10 shadow-lg' : 'bg-white/50 border-[#1E2A3A]/5 hover:border-lumina-teal/20'}`}>
    {/* Header Trigger */}
    <div 
      className="flex items-center justify-between cursor-pointer" 
      onClick={onToggle}
      role="button"
      aria-expanded={isOpen}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-lumina-teal text-white' : 'bg-lumina-teal/10 text-lumina-teal'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1E2A3A]">{title}</h4>
          <p className="text-[8px] font-bold text-[#1E2A3A]/30 uppercase tracking-tighter">{isOpen ? 'Active Calibration' : 'Tap to Expand'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={16} className="text-[#1E2A3A]/30" />
        </motion.div>
      </div>
    </div>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-6 space-y-5">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
