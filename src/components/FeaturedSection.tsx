import { motion } from "framer-motion";

export const FeaturedSection = () => {
  return (
    <div className="bg-transparent py-4 px-2">
      <div className="max-w-6xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 60 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="rounded-[40px] overflow-hidden premium-card aspect-video container relative border-white/5 shadow-2xl shadow-black/10 transition-all duration-700"
        >
          {/* ... content ... */}
          {/* Mock UI Visualization */}
          <div className="absolute inset-0 p-8 flex gap-8">
            {/* Left panel: Skill Radar */}
            <div className="flex-1 flex flex-col justify-center items-center">
              <span className="text-muted-foreground/40 text-[10px] font-black tracking-[0.4em] uppercase mb-6 block">Intelligence Radar</span>
              <div className="w-full max-w-[240px] aspect-square relative">
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                  <circle cx="50" cy="50" r="40" fill="none" className="stroke-accent-blue" strokeWidth="2" strokeDasharray="251.2" strokeDashoffset="50" opacity="0.8" />
                  <circle cx="50" cy="50" r="30" fill="none" className="stroke-accent-emerald" strokeWidth="2" strokeDasharray="188.4" strokeDashoffset="40" opacity="0.8" />
                  <circle cx="50" cy="50" r="20" fill="none" className="stroke-accent-violet" strokeWidth="2" strokeDasharray="125.6" strokeDashoffset="30" opacity="0.8" />
                  <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" className="fill-accent-blue/10 stroke-accent-blue/30" />
                </svg>
              </div>
            </div>

            {/* Center: Overall Match Score */}
            <div className="flex-none flex flex-col justify-center items-center px-8 border-x border-border/10">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="none" className="stroke-muted/40" strokeWidth="8" />
                    <circle cx="64" cy="64" r="58" fill="none" className="stroke-accent-blue" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="47.3" strokeLinecap="round" />
                  </svg>
                  <span className="text-5xl font-display font-black text-foreground tracking-tighter">87%</span>
               </div>
               <span className="text-muted-foreground/30 text-[10px] font-black tracking-[0.4em] uppercase mt-6 whitespace-nowrap">Proprietary DNA Match</span>
            </div>

            {/* Right panel: Skill Bars */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {[
                { label: "Python", value: 100, accent: "bg-accent-blue" },
                { label: "MLOps", value: 80, accent: "bg-accent-emerald" },
                { label: "Kubernetes", value: 60, accent: "bg-accent-violet" }
              ].map((skill, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold tracking-tight uppercase">
                    <span className="text-foreground/60 tracking-[0.1em]">{skill.label}</span>
                    <span className="text-muted-foreground/40 font-mono">{skill.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={`h-full rounded-full ${skill.accent} shadow-sm`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end bg-gradient-to-t from-background to-transparent">
            <div className="glass rounded-2xl p-6 md:p-8 max-w-xl border-border/20 shadow-2xl">
              <span className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Strategic Insight Engine</span>
              <p className="text-foreground/80 text-sm md:text-base leading-relaxed font-body-refined font-medium max-w-lg">
                Precision skill detection for 0.1% candidates. <span className="text-accent-blue font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent-blue/5 border border-accent-blue/10">Critical</span> assets. <span className="text-accent-emerald font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent-emerald/5 border border-accent-emerald/10">Core</span> competencies. <span className="text-accent-violet font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent-violet/5 border border-accent-violet/10">Edge</span> capabilities.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden bg-foreground text-background rounded-2xl px-12 py-5 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-foreground/20 transition-all"
            >
              <div className="liquid-water-layer opacity-10" />
              <div className="shimmer-sweep" />
              Analyze Your JD
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
