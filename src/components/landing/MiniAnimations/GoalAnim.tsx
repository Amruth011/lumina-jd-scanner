import React from 'react';
import styles from '../../../styles/journey.module.css';

export const GoalAnim = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={styles.trophy}>🏆</div>
      <div className="flex flex-col items-center">
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full">
          <span className="text-[#10B981] font-mono text-[11px] font-bold">TOP 0.1%</span>
        </div>
        <div className="font-serif text-white text-[24px] mt-2">Interview Cracked</div>
      </div>
    </div>
  );
};
