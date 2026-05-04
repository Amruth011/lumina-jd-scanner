import React, { useState, useEffect } from 'react';
import styles from '../../../styles/journey.module.css';

export const ResumeTailorAnim = () => {
  const [count, setCount] = useState(42);

  useEffect(() => {
    const start = 42;
    const end = 94;
    const duration = 2000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(start + (end - start) * easedProgress);
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className={styles.resumeScore}>{count}</div>
      <div className="text-white/40 text-[13px] font-medium uppercase tracking-tighter mt-[-10px]">
        ATS SCORE
      </div>
    </div>
  );
};
