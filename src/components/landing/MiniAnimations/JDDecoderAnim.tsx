import React, { useState, useEffect } from 'react';
import styles from '../../../styles/journey.module.css';

const words = ["React", "TypeScript", "ATS-optimized", "Leadership", "Node.js"];

export const JDDecoderAnim = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.jdLines}>
      {words.map((word, i) => (
        <div key={word} className={styles.jdLine}>
          <div 
            className={styles.jdLineHighlight} 
            style={{ 
              width: activeIndex === i ? '100%' : '0%',
              transitionDelay: activeIndex === i ? '0s' : '0.1s'
            }} 
          />
          <span style={{ 
            position: 'relative', 
            zIndex: 1, 
            fontSize: '10px', 
            paddingLeft: '8px',
            color: activeIndex === i ? 'black' : 'white',
            fontFamily: 'JetBrains Mono'
          }}>
            {word}
          </span>
        </div>
      ))}
    </div>
  );
};
