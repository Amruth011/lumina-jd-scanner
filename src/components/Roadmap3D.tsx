import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { SearchCode, Crosshair, Sparkles, Trophy, ShieldCheck } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "1. The Decoding Phase",
    description: "You feed the target job description. The engine extracts hidden ATS metrics and recruiter priorities with 100% objectivity.",
    icon: SearchCode,
    align: "left",
  },
  {
    id: 2,
    title: "2. The Brutal Analysis",
    description: "We don't sugarcoat. The system exposes your exact skill gaps and fatal resume flaws before a human ever sees them.",
    icon: Crosshair,
    align: "right",
  },
  {
    id: 3,
    title: "3. The Perfect Tailor",
    description: "AI dynamically rebuilds your impact bullets, injecting the exact phrasing required to bypass the ATS firewall.",
    icon: Sparkles,
    align: "left",
  },
  {
    id: 4,
    title: "4. The Interview Cracker",
    description: "You walk into the room armed with insider knowledge. You aren't just a candidate—you are the Top 0.1% obvious choice.",
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
  const markerScale = useTransform(scrollYProgress, [stepStart - 0.05, stepStart], [1, 1.5]);

  return (
    <div className="relative w-full flex items-center">
      {/* Step Node Marker */}
      <motion.div 
        className="absolute left-1/2 w-6 h-6 -translate-x-1/2 rounded-full z-10 flex items-center justify-center transition-shadow duration-500"
        style={{ 
          border: '4px solid',
          borderColor: markerBorderColor,
          backgroundColor: markerBgColor,
          scale: markerScale,
          boxShadow: useTransform(scrollYProgress, [stepStart - 0.05, stepStart], ["none", "0 0 30px rgba(16,185,129,0.8)"])
        }}
      >
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [stepStart - 0.05, stepStart], [0, 1]) }}
        >
          <ShieldCheck size={10} className="text-foreground" />
        </motion.div>
      </motion.div>

      {/* Step Card Container */}
      <div className={`w-1/2 ${step.align === 'left' ? 'pr-12 text-right' : 'pl-12 ml-auto text-left'}`}>
        <motion.div 
          style={{ opacity, scale, rotateY }}
          className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors duration-500 transform-gpu shadow-2xl"
        >
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className={`flex flex-col ${step.align === 'left' ? 'items-end' : 'items-start'} relative z-10`}>
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-accent-emerald flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-accent-emerald/30 group-hover:scale-110 transition-transform duration-500">
              <step.icon size={32} />
            </div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-accent-emerald mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></span>
              Secure Checkpoint
            </div>
            <h3 className="text-3xl font-serif text-white mb-3 tracking-tight">{step.title}</h3>
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
  
  // Dynamic emoji rotation to make the person feel like they are looking around/moving
  const emojiRotate = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [-10, 10, -10, 10, 0]);

  return (
    <div ref={containerRef} className="relative py-40 bg-foreground overflow-hidden perspective-1000">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent-emerald rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-emerald rounded-full blur-[200px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <ShieldCheck size={16} className="text-accent-emerald mr-2" />
              100% Transparent Process
            </div>
            <h2 className="text-6xl md:text-[80px] font-serif text-white tracking-tight mb-8 leading-[0.9]">
              The Trusted Path to <br/><span className="italic text-accent-emerald relative">
                Top 0.1%
                <span className="absolute -inset-4 bg-accent-emerald/20 blur-3xl rounded-full -z-10" />
              </span>
            </h2>
            <p className="text-white/60 font-medium text-2xl max-w-3xl mx-auto">
              Follow the exact roadmap thousands of career strategists trust to completely hack the modern hiring system.
            </p>
          </motion.div>
        </div>

        {/* 3D Roadmap Container */}
        <div className="relative max-w-3xl mx-auto">
          
          {/* The Central Animated Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-white/5 -translate-x-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-accent-emerald shadow-[0_0_30px_#10B981]"
              style={{ height: lineProgress }}
            />
          </div>

          {/* The Traveling Person Emoji ($10B Tier) */}
          <motion.div 
            className="absolute left-1/2 w-20 h-20 -translate-x-1/2 -ml-1 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-[0_0_50px_20px_rgba(16,185,129,0.3)] z-30 flex items-center justify-center overflow-visible"
            style={{ 
              top: glowPosition,
              rotate: emojiRotate
            }}
          >
            <span className="text-4xl drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10 filter brightness-125">
              🧑‍🚀
            </span>
            <div className="absolute inset-0 rounded-full bg-accent-emerald opacity-20 animate-ping" />
          </motion.div>

          {/* Roadmap Steps */}
          <div className="space-y-48 relative z-10 pb-32 pt-16">
            {steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
