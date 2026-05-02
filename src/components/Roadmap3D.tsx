import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BrainCircuit, FileText, Briefcase, Network, Rocket } from "lucide-react";

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const phases = [
  { icon: <BrainCircuit size={28} />, title: "ATS Decoding Engine", status: "Live", desc: "Surgical extraction of hidden metrics, keywords, and implicit requirements using Llama-3.3." },
  { icon: <FileText size={28} />, title: "Resume Tailoring Engine", status: "Live", desc: "Autonomous rewriting of impact bullets to flawlessly match the structural expectations of the JD." },
  { icon: <Briefcase size={28} />, title: "Cover Letter Generator", status: "Upcoming", desc: "Hyper-personalized, authoritative letters constructed precisely from the extracted JD rubric." },
  { icon: <Network size={28} />, title: "Autonomous Applications", status: "Upcoming", desc: "Direct integration with major career platforms to auto-fill and submit matched roles instantly." },
  { icon: <Rocket size={28} />, title: "AI Interview Coach", status: "Future", desc: "Real-time voice agent to run extreme mock interviews calibrated specifically to the JD's exact profile." },
];

export const Roadmap3D = () => {
  return (
    <section className="relative w-full py-40 overflow-hidden bg-background">
      {/* Background glowing line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-emerald to-transparent opacity-20 -translate-x-1/2" />
      
      <div className="text-center mb-32 z-10 relative">
        <span className="badge-pill bg-white border border-border text-foreground shadow-sm mb-6 inline-block">The Master Plan</span>
        <h2 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight mb-4">The Lumina Horizon</h2>
        <p className="text-foreground/60 font-medium text-xl max-w-2xl mx-auto">The definitive 3D roadmap for the ultimate career strategist. Watch our engine evolve.</p>
      </div>

      <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-24 perspective-1000 px-6">
        {phases.map((phase, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, rotateX: 30, y: 150, scale: 0.8, z: -300 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1, z: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex items-center md:gap-16 ${isLeft ? 'flex-col md:flex-row' : 'flex-col md:flex-row-reverse'}`}
            >
              <div className={`w-full md:w-1/2 flex ${isLeft ? 'md:justify-end' : 'md:justify-start'} justify-center z-10`}>
                <TiltCard className="w-full max-w-md">
                  <div className={`bento-card p-10 group relative ${phase.status === 'Live' ? 'glow-border-teal' : ''}`}>
                    {/* 3D Floating elements inside the card */}
                    <div style={{ transform: "translateZ(40px)" }} className="flex justify-between items-start mb-8 transition-transform duration-300">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${phase.status === 'Live' ? 'bg-accent-emerald text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-foreground text-white'}`}>
                        {phase.icon}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${phase.status === 'Live' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {phase.status}
                      </span>
                    </div>
                    <h3 style={{ transform: "translateZ(30px)" }} className="text-3xl font-serif text-foreground mb-4 transition-transform duration-300">{phase.title}</h3>
                    <p style={{ transform: "translateZ(20px)" }} className="text-foreground/60 text-lg font-medium leading-relaxed transition-transform duration-300">{phase.desc}</p>
                    
                    {/* Inner highlight for 3D depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2.5rem]" />
                  </div>
                </TiltCard>
              </div>
              
              {/* Center Node */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-[6px] border-accent-emerald z-20 shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
              
              {/* Empty space for the other half */}
              <div className="hidden md:block w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
