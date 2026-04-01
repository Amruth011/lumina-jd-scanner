import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth springs for trailing effect
  const springX = useSpring(-100, { stiffness: 150, damping: 20 });
  const springY = useSpring(-100, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 150); // Center the 300px glow
      springY.set(e.clientY - 150);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [springX, springY]);

  return (
    <>
      {/* Soft large background glow */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 h-[300px] w-[300px] rounded-full opacity-30 mix-blend-screen"
        style={{
          x: springX,
          y: springY,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.5 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
      {/* Sharp exact dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-50 h-3 w-3 rounded-full bg-primary mix-blend-screen"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isHovering ? 2 : 1,
          opacity: isHovering ? 0 : 0.8,
        }}
        transition={{
          type: "tween",
          duration: 0,
        }}
      />
    </>
  );
};
