import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const staggerFadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export const wordFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export const magneticEffect = (element: HTMLElement) => {
  if (!element) return;
  
  const moveElement = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(element, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: 'power2.out',
    });
  };
  
  const resetElement = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    });
  };
  
  element.addEventListener('mousemove', moveElement);
  element.addEventListener('mouseleave', resetElement);
  
  return () => {
    element.removeEventListener('mousemove', moveElement);
    element.removeEventListener('mouseleave', resetElement);
  };
};

export const scrollReveal = (element: HTMLElement, options = {}) => {
  return gsap.from(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
      ...options,
    },
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power3.out',
  });
};
