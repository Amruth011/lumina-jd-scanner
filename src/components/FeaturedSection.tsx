import { motion } from "framer-motion";

export const FeaturedSection = () => {
  return (
    <section className="bg-transparent pt-10 pb-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="rounded-3xl overflow-hidden liquid-glass border border-slate-200/60 aspect-video container relative bg-white/40"
        >
          {/* Mock UI Visualization */}
          <div className="absolute inset-0 p-8 flex gap-8">
            {/* Left panel: Skill Radar */}
            <div className="flex-1 flex flex-col justify-center items-center">
              <span className="text-slate-400 text-xs tracking-widest uppercase mb-4">Skill Radar</span>
              <div className="w-full max-w-[240px] aspect-square relative">
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="251.2" strokeDashoffset="50" opacity="0.8" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="188.4" strokeDashoffset="40" opacity="0.8" />
                  <circle cx="50" cy="50" r="20" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="125.6" strokeDashoffset="30" opacity="0.8" />
                  <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" />
                </svg>
              </div>
            </div>

            {/* Center: Overall Match Score */}
            <div className="flex-none flex flex-col justify-center items-center px-8 border-x border-slate-100">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                    <circle cx="64" cy="64" r="58" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="47.3" strokeLinecap="round" />
                  </svg>
                  <span className="text-4xl font-bold text-slate-800">87%</span>
               </div>
               <span className="text-slate-400 text-xs tracking-widest uppercase mt-4">Overall Match Score</span>
            </div>

            {/* Right panel: Skill Bars */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {[
                { label: "Python", value: 100, color: "#3B82F6" },
                { label: "MLOps", value: 80, color: "#10B981" },
                { label: "Kubernetes", value: 60, color: "#8B5CF6" }
              ].map((skill, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">{skill.label}</span>
                    <span className="text-slate-500">{skill.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end bg-gradient-to-t from-white/80 to-transparent">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-xl bg-white/60">
              <span className="text-slate-400 text-xs tracking-widest uppercase mb-3 block">Executive Insight View</span>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Every skill is ranked by real importance — not just mentioned. <span className="text-blue-500 font-semibold text-xs">Electric Blue</span> means critical (&gt;85%). <span className="text-emerald-500 font-semibold text-xs">Emerald</span> means core. <span className="text-purple-500 font-semibold text-xs">Purple</span> means supporting. Study smarter, not harder.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white rounded-full px-8 py-3 text-sm font-medium shadow-lg shadow-blue-500/20 mb-2"
            >
              Try It Live
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
