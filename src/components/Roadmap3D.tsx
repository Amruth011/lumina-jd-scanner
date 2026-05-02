import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { SearchCode, Crosshair, Sparkles, Trophy } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Decode Job Description",
    description: "Llama-3.3 engine extracts hidden ATS metrics.",
    icon: SearchCode,
    align: "left",
  },
  {
    id: 2,
    title: "Resume Analysis",
    description: "Brutal gap analysis identifies what you are missing.",
    icon: Crosshair,
    align: "right",
  },
  {
    id: 3,
    title: "Resume Generation",
    description: "AI perfectly tailors bullets to target phrasing.",
    icon: Sparkles,
    align: "left",
  },
  {
    id: 4,
    title: "Cracked Interview",
    description: "You land in the top 0.1% and dominate the room.",
    icon: Trophy,
    align: "right",
  }
];

const StepCard = ({ 
  step, 
  index, 
  scrollYProgress 
}: { 
  step: typeof steps[0], 
  index: number, 
  scrollYProgress: MotionValue<number> 
}) => {
  // Scroll trigger points for each step
  const stepStart = index * 0.25;
  const stepEnd = (index + 1) * 0.25;
  
  // Scale and opacity driven by the traveling orb reaching this step
  const opacity = useTransform(scrollYProgress, 
    [Math.max(0, stepStart - 0.1), stepStart, stepEnd], 
    [0.3, 1, 1]
  );
  const scale = useTransform(scrollYProgress, 
    [Math.max(0, stepStart - 0.1), stepStart], 
    [0.8, 1]
  );
  const rotateY = useTransform(scrollYProgress,
    [Math.max(0, stepStart - 0.1), stepStart],
    [step.align === 'left' ? 45 : -45, 0]
  );

  const markerBorderColor = useTransform(scrollYProgress, [stepStart - 0.05, stepStart], ["rgba(255,255,255,0.2)", "#10B981"]);
  const markerBgColor = useTransform(scrollYProgress, [stepStart - 0.05, stepStart], ["var(--foreground)", "#10B981"]);

  return (
    <div className="relative w-full flex items-center">
      {/* Step Node Marker */}
      <motion.div 
        className="absolute left-1/2 w-6 h-6 -translate-x-1/2 bg-foreground border-4 border-white/20 rounded-full z-10"
        style={{ 
          borderColor: markerBorderColor,
          backgroundColor: markerBgColor
        }}
      />

      {/* Step Card Container */}
      <div className={`w-1/2 ${step.align === 'left' ? 'pr-12 text-right' : 'pl-12 ml-auto text-left'}`}>
        <motion.div 
          style={{ opacity, scale, rotateY }}
          className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors duration-300 transform-gpu"
        >
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className={`flex flex-col ${step.align === 'left' ? 'items-end' : 'items-start'} relative z-10`}>
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-accent-emerald flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-accent-emerald/20">
              <step.icon size={28} />
            </div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-accent-emerald mb-2">
              Phase 0{step.id}
            </div>
            <h3 className="text-3xl font-serif text-white mb-3">{step.title}</h3>
            <p className="text-white/60 font-medium text-lg leading-relaxed">
              {step.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const Roadmap3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We use scroll position to drive the "animated video" feel
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Calculate the line drawing progress
  const lineProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const glowPosition = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative py-40 bg-foreground overflow-hidden perspective-1000">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-emerald rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-emerald rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-6">
              The Path to the <span className="italic text-accent-emerald">0.1%</span>
            </h2>
            <p className="text-white/60 font-medium text-xl max-w-2xl mx-auto">
              Watch how Lumina systematically deconstructs the hiring process to guarantee your success.
            </p>
          </motion.div>
        </div>

        {/* 3D Roadmap Container */}
        <div className="relative max-w-2xl mx-auto">
          
          {/* The Central Animated Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-accent-emerald shadow-[0_0_20px_#10B981]"
              style={{ height: lineProgress }}
            />
          </div>

          {/* The Traveling Glowing Orb */}
          <motion.div 
            className="absolute left-1/2 w-8 h-8 -translate-x-1/2 -ml-0.5 rounded-full bg-white shadow-[0_0_30px_10px_#10B981] z-20 flex items-center justify-center"
            style={{ top: glowPosition }}
          >
            <div className="w-4 h-4 bg-accent-emerald rounded-full" />
          </motion.div>

          {/* Roadmap Steps */}
          <div className="space-y-32 relative z-10 pb-24">
            {steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
