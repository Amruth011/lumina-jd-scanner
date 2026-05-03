"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { journeyNodes } from '@/data/journeyNodes';
import styles from '@/styles/journey.module.css';
import JDDecoderAnim from './MiniAnimations/JDDecoderAnim';
import GapAnalysisAnim from './MiniAnimations/GapAnalysisAnim';
import ResumeTailorAnim from './MiniAnimations/ResumeTailorAnim';
import GoalAnim from './MiniAnimations/GoalAnim';

const animations: Record<string, React.ReactNode> = {
  n1: (
    <div className="h-full flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-emerald-500 flex items-center justify-center text-3xl">👤</div>
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-emerald-500 animate-ping opacity-20" />
      </div>
    </div>
  ),
  n2: <JDDecoderAnim />,
  n3: <GapAnalysisAnim />,
  n4: <ResumeTailorAnim />,
  n5: <GoalAnim />,
};

interface NodeContentPanelProps {
  activeIndex: number;
}

export const NodeContentPanel = ({ activeIndex }: NodeContentPanelProps) => {
  const node = journeyNodes[activeIndex];

  return (
    <div className={styles.panelContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={styles.glassCard}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] text-emerald-500 tracking-[0.2em]">{node.step}</span>
              <h4 className="font-serif text-4xl text-white mt-1">{node.title}</h4>
            </div>
            
            <div className="h-[140px] w-full border-y border-white/10 py-4 my-2">
              {animations[node.id]}
            </div>

            <p className="font-sans text-sm text-white/50 leading-relaxed">
              "{node.description}"
            </p>

            <div className="flex gap-2 pt-2">
              {journeyNodes.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'bg-emerald-500 scale-125' : 'bg-white/20'
                  }`} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NodeContentPanel;
