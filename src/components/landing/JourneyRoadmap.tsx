import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import styles from '../../styles/journey.module.css';
import { JourneyScene } from './JourneyScene';
import { NodeContentPanel } from './NodeContentPanel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { journeyNodes } from '../../data/journeyNodes';

gsap.registerPlugin(ScrollTrigger);

const JourneyRoadmap: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  useGSAP(() => {
    // Pin section and track progress
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=600%",
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        
        // Update progress bar DOM directly for performance
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${p * 100}%`;
        }

        // Only trigger React re-render when the active node changes
        let newIndex = 0;
        for (let i = 0; i < journeyNodes.length; i++) {
          if (p >= journeyNodes[i].t) {
            newIndex = i;
          }
        }
        
        if (newIndex !== activeNodeIndex) {
          setActiveNodeIndex(newIndex);
        }
      }
    });

    // Header animations
    gsap.fromTo(headlineRef.current, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      }
    );

    gsap.fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.journeySection}>
      <div className={styles.stickyContainer}>
        {/* Progress Bar */}
        <div className={styles.progressBarContainer}>
          <div 
            ref={progressBarRef}
            className={styles.progressBar} 
            style={{ width: "0%" }} 
          />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 ref={headlineRef} className={styles.headline}>
            Your Transformation. Step by Step.
          </h2>
          <p ref={subtitleRef} className={styles.subtitle}>
            From invisible to unstoppable — in four moves.
          </p>
        </div>

        {/* 3D Scene */}
        <div className={styles.canvasWrapper}>
          <Suspense fallback={<div className="w-full h-full bg-[#060D14]" />}>
            <Canvas
              shadows
              gl={{ 
                antialias: true, 
                pixelRatio: Math.min(window.devicePixelRatio, 1.5) 
              }}
              camera={{ position: [0, 8, 18], fov: 50 }}
            >
              <JourneyScene progressRef={progressRef} />
            </Canvas>
          </Suspense>
        </div>

        {/* Side Panel */}
        <NodeContentPanel activeIndex={activeNodeIndex} />
      </div>

      {/* Mobile Fallback - Static SVG */}
      <div className={styles.mobileRoadmap}>
        <h2 className="text-3xl font-serif text-white text-center mb-8">Your Journey</h2>
        <div className="space-y-12 relative">
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-[#10B981]/20" />
          {journeyNodes.map((node, i) => (
            <div key={node.id} className="flex gap-6 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center font-mono text-black font-bold text-xs">
                0{i + 1}
              </div>
              <div>
                <h4 className="text-[#10B981] font-mono text-xs mb-1">{node.step}</h4>
                <h3 className="text-xl text-white font-serif">{node.title}</h3>
                <p className="text-white/60 text-sm mt-1">{node.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneyRoadmap;
