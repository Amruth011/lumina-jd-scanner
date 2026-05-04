import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/journey.module.css';
import { journeyNodes } from '../../data/journeyNodes';
import { JDDecoderAnim } from './MiniAnimations/JDDecoderAnim';
import { GapAnalysisAnim } from './MiniAnimations/GapAnalysisAnim';
import { ResumeTailorAnim } from './MiniAnimations/ResumeTailorAnim';
import { GoalAnim } from './MiniAnimations/GoalAnim';
import { User } from 'lucide-react';

interface NodeContentPanelProps {
  activeIndex: number;
}

export const NodeContentPanel: React.FC<NodeContentPanelProps> = ({ activeIndex }) => {
  const activeNode = journeyNodes[activeIndex];

  const renderAnimation = () => {
    switch (activeIndex) {
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
      
      <div className="mt-8">
        <Link to="/dashboard">
          <button className="w-full py-4 bg-lumina-teal text-lumina-navy font-bold rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-lumina-teal/20">
            Activate This Step →
          </button>
        </Link>
      </div>

      <div className={styles.dots}>
        {journeyNodes.map((_, i) => (
          <div 
            key={i} 
            className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`} 
          />
        ))}
      </div>
    </div>
  );
};
