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
          className="text-5xl md:text-7xl lg:text-8xl text-foreground tracking-tighter mb-16 md:mb-24 font-serif leading-[0.95]"
        >
          Precision <em className="italic text-muted-foreground/20 not-italic font-serif"> × </em> Intelligence.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Left panel */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="premium-card rounded-3xl p-10 aspect-[4/3] bg-card/5 flex flex-col justify-between hover-glow border-border/40 shadow-2xl shadow-accent-blue/5"
          >
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Python", value: "100%", accent: "bg-accent-blue" },
                { label: "MLOps", value: "80%", accent: "bg-accent-emerald" },
                { label: "Docker", value: "60%", accent: "bg-accent-violet" }
              ].map((tag, i) => (
                <div key={i} className="flex items-center gap-3 bg-background/40 dark:bg-card/40 px-5 py-2.5 rounded-full text-[11px] font-bold text-foreground/70 shadow-sm border border-border/10 backdrop-blur-md tracking-tight">
                  <span className={`w-2.5 h-2.5 rounded-full ${tag.accent} shadow-[0_0_8px_rgba(var(--accent-blue-rgb),0.2)]`} />
                  {tag.label}: {tag.value}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.3em]">Strategic Match</span>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl md:text-8xl font-display font-bold text-accent-blue tracking-tighter drop-shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.4)]">91%</span>
                <span className="text-muted-foreground/40 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">Top 0.1% Range</span>
              </div>
            </div>
          </motion.div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center gap-16"
          >
            <div className="space-y-6">
              <span className="text-muted-foreground/60 text-[10px] font-bold tracking-[0.4em] uppercase block">Decode the hidden language</span>
              <p className="text-foreground/80 text-lg md:text-xl leading-relaxed font-medium tracking-tight">
                Most applicants read a JD and apply. You'll dissect it. Lumina extracts what the hiring manager actually cares about — the must-haves, the ATS filters, and the culture signals buried between the lines.
              </p>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />

            <div className="space-y-6">
              <span className="text-muted-foreground/60 text-[10px] font-bold tracking-[0.4em] uppercase block">Build the winning edge</span>
              <p className="text-foreground/80 text-lg md:text-xl leading-relaxed font-medium tracking-tight">
                Gap analysis isn't enough. Lumina generates industry-specific project ideas, enterprise integration tips, and secret ATS keywords so your resume doesn't just match — it dominates.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
