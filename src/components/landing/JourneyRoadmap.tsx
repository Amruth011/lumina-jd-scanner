import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { journeyNodes } from '../../data/journeyNodes';
import styles from '../../styles/journey.module.css';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Lazy load heavy 3D scene (client‑only)
const JourneyScene = lazy(() => import('./JourneyScene'));
const MobileFallback = lazy(() => import('./MobileFallback'));

const JourneyRoadmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef<number>(0);
  const [activeNodeId, setActiveNodeId] = useState<number>(journeyNodes[0].id);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  // Detect viewport width for fallback
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Setup GSAP ScrollTrigger once container is ready
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#journey-section',
        start: 'top top',
        end: '+=600%', // 600% of viewport height for cinematic pacing
        pin: true,
        scrub: 1.5,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
          // Update thin progress bar width
          if (progressRef.current) {
            progressRef.current.style.width = `${self.progress * 100}%`;
          }
          // Determine active node based on progress
          const active = journeyNodes
            .filter((n) => self.progress >= n.t)
            .pop();
          if (active && active.id !== activeNodeId) {
            setActiveNodeId(active.id);
          }
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [activeNodeId]);

  const activeNode = journeyNodes.find((n) => n.id === activeNodeId) ?? journeyNodes[0];

  return (
    <section id="journey-section" className={styles.section} ref={containerRef}>
      {/* Thin teal progress bar at the top */}
      <div className={styles.topBar} ref={progressRef} />

      <div className={styles.layout}>
        {/* 3D canvas or mobile fallback */}
        <div className={styles.canvasContainer}>
          <Suspense fallback={null}>
            {isMobile ? <MobileFallback /> : <JourneyScene scrollProgressRef={scrollProgress} />}
          </Suspense>
        </div>
        {/* Side glass‑morphism panel */}
        <div className={styles.panelContainer}>
          <Suspense fallback={null}>
            {/* Lazy load panel to keep bundle small */}
            {React.createElement(
              // Dynamically import will be resolved by bundler
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              require('./NodeContentPanel').default,
              { activeNode }
            )}
          </Suspense>
        </div>
      </div>
    </section>
  );
};

export default JourneyRoadmap;
