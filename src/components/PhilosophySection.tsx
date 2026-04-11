import { motion } from "framer-motion";

export const PhilosophySection = () => {
  return (
    <section className="bg-transparent py-28 md:py-40 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl text-slate-900 tracking-tight mb-16 md:mb-24"
        >
          Precision <em className="italic" style={{ color: "#94A3B8" }}> × </em> Intelligence.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left panel */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="liquid-glass rounded-3xl p-10 aspect-[4/3] bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col justify-between"
          >
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Python", value: "100%", color: "bg-blue-600" },
                { label: "MLOps", value: "80%", color: "bg-emerald-500" },
                { label: "Docker", value: "60%", color: "bg-purple-500" }
              ].map((tag, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${tag.color}`} />
                  {tag.label}: {tag.value}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-sm">Match Score</span>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl md:text-7xl font-bold text-blue-600">91%</span>
                <span className="text-slate-400 text-sm font-medium">Top 0.1% Range</span>
              </div>
            </div>
          </motion.div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center gap-12"
          >
            <div className="space-y-4">
              <span className="text-slate-400 text-xs tracking-widest uppercase block">Decode the hidden language</span>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                Most applicants read a JD and apply. You'll dissect it. Lumina extracts what the hiring manager actually cares about — the must-haves, the ATS filters, and the culture signals buried between the lines.
              </p>
            </div>
            
            <div className="w-full h-px bg-slate-100" />

            <div className="space-y-4">
              <span className="text-slate-400 text-xs tracking-widest uppercase block">Build the winning edge</span>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                Gap analysis isn't enough. Lumina generates industry-specific project ideas, enterprise integration tips, and secret ATS keywords so your resume doesn't just match — it dominates.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
