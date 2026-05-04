import React, { useMemo } from 'react';
import styles from '../../styles/journey.module.css';
import { journeyNodes } from '../../data/journeyNodes';
import { JDDecoderAnim } from './MiniAnimations/JDDecoderAnim';
import { GapAnalysisAnim } from './MiniAnimations/GapAnalysisAnim';
import { ResumeTailorAnim } from './MiniAnimations/ResumeTailorAnim';
import { GoalAnim } from './MiniAnimations/GoalAnim';
import { User } from 'lucide-react';

interface NodeContentPanelProps {
  progress: number;
}

export const NodeContentPanel: React.FC<NodeContentPanelProps> = ({ progress }) => {
  // Determine which node is currently "active" based on progress
  const activeNodeIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < journeyNodes.length; i++) {
      if (progress >= journeyNodes[i].t) {
        index = i;
      }
    }
    return index;
  }, [progress]);

  const activeNode = journeyNodes[activeNodeIndex];

  const renderAnimation = () => {
    switch (activeNodeIndex) {
      case 0:
        return (
          <div className={styles.avatarPulse}>
            <User className="text-[#10B981]" size={32} />
          </div>
        );
      case 1:
        return <JDDecoderAnim />;
      case 2:
        return <GapAnalysisAnim />;
      case 3:
        return <ResumeTailorAnim />;
      case 4:
        return <GoalAnim />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.panel} key={activeNode.id}>
      <span className={styles.stepLabel}>{activeNode.step}</span>
      <h3 className={styles.panelTitle}>{activeNode.title}</h3>
      
      <div className={styles.divider} />
      
      <div className={styles.animArea}>
        {renderAnimation()}
      </div>
      
      <div className={styles.divider} />
      
      <p className={styles.description}>{activeNode.description}</p>
      
      <div className={styles.dots}>
        {journeyNodes.map((_, i) => (
          <div 
            key={i} 
            className={`${styles.dot} ${i === activeNodeIndex ? styles.dotActive : ''}`} 
          />
        ))}
      </div>
    </div>
  );
};
