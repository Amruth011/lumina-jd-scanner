"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';
import styles from '@/styles/journey.module.css';
import { journeyNodes } from '@/data/journeyNodes';
import NodeContentPanel from './NodeContentPanel';

// Lazy load Three.js scene for performance
const JourneyScene = React.lazy(() => import('./JourneyScene'));

gsap.registerPlugin(ScrollTrigger);

export const JourneyRoadmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Lenis and GSAP ScrollTrigger
  useGSAP(() => {
    if (!containerRef.current) return;

    // Smooth Scroll
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Headline Animation
    gsap.from(headlineRef.current, {
      y: 50,
      opacity: 0,
      duration: 1.5,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      }
    });

    // Main Scroll Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=600%',
        pin: true,
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);
          
          // Determine active node based on progress
          let currentIdx = 0;
          journeyNodes.forEach((node, i) => {
            if (p >= node.t - 0.05) currentIdx = i;
          });
          
          if (currentIdx !== activeIndex) {
            setActiveIndex(currentIdx);
            
            // Special effect for last node
            if (currentIdx === 4 && activeIndex !== 4) {
              confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#FFFFFF', '#1E2A3A', '#F59E0B'],
              });
            }
          }
        },
      }
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className={styles.section}>
      <div className={styles.stickyContainer} ref={stickyRef}>
        
        {/* Progress Bar */}
        <div className={styles.progressBar} style={{ width: `${progress * 100}%` }} />

        {/* 3D Scene */}
        <div className={styles.canvasContainer}>
          {!isMobile ? (
            <Suspense fallback={null}>
              <Canvas
                shadows
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: false }}
              >
                <JourneyScene progress={progress} />
              </Canvas>
            </Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-10">
              {/* Mobile Fallback: SVG Path */}
              <svg viewBox="0 0 100 200" className="w-full h-full max-w-sm">
                 <path 
                   d="M20,20 C50,20 50,50 50,80 C50,110 80,110 80,140 C80,170 50,170 50,190" 
                   fill="none" 
                   stroke="#10B981" 
                   strokeWidth="2" 
                   strokeDasharray="4 4"
                   className="opacity-20"
                 />
                 <path 
                   d="M20,20 C50,20 50,50 50,80 C50,110 80,110 80,140 C80,170 50,170 50,190" 
                   fill="none" 
                   stroke="#10B981" 
                   strokeWidth="3" 
                   style={{ strokeDasharray: 400, strokeDashoffset: 400 - (progress * 400) }}
                 />
                 {journeyNodes.map((node, i) => (
                   <circle 
                     key={node.id}
                     cx={i === 0 ? 20 : i === 1 ? 50 : i === 2 ? 50 : i === 3 ? 80 : 50}
                     cy={i === 0 ? 20 : i === 1 ? 80 : i === 2 ? 110 : i === 3 ? 140 : 190}
                     r="4"
                     fill={progress >= node.t ? "#10B981" : "#1E2A3A"}
                   />
                 ))}
              </svg>
            </div>
          )}
        </div>

        {/* Text Overlay */}
        <div className={styles.contentOverlay}>
          <div ref={headlineRef} className={styles.headlineContainer}>
            <h2 className={styles.headline}>Your Transformation. <span className="italic text-emerald-500">Step by Step.</span></h2>
            <p className={styles.subtitle}>From invisible to unstoppable — in four moves.</p>
          </div>

          <NodeContentPanel activeIndex={activeIndex} />
        </div>
      </div>
    </section>
  );
};

export default JourneyRoadmap;
