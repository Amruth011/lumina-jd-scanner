import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    tag: "AI Analysis",
    tagClass: "text-accent-blue",
    iconBg: "bg-accent-blue/5",
    iconClass: "text-accent-blue",
    title: "Skill Radar & Gap Score",
    description: "Upload your JD and resume together. Get an instant match score, a visual skill radar, and a ranked breakdown of exactly what you're missing — color-coded by priority.",
    gradient: "from-accent-blue/5 to-accent-blue/10",
    type: "radar"
  },
  {
    tag: "Strategy",
    tagClass: "text-accent-violet",
    iconBg: "bg-accent-violet/5",
    iconClass: "text-accent-violet",
    title: "Playbook + Application Tracker",
    description: "Get tailored project ideas, ATS keyword secrets, and enterprise tips. Then track every application in your built-in dashboard — with live score updates as you improve your resume.",
    gradient: "from-accent-emerald/5 to-accent-violet/5",
    type: "tracker"
  }
];

export const ServicesSection = () => {
  return (
    <section className="bg-transparent py-28 md:py-40 px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.02)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-5xl text-foreground tracking-tighter font-serif"
          >
            How Lumina works
          </motion.h2>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-[0.2em] hidden md:block"
          >
            Core features
          </motion.span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 * (index + 1) }}
              className="premium-card rounded-3xl overflow-hidden group border-border/40 bg-card/20"
            >
              {/* Visual Area */}
              <div className={`aspect-video bg-gradient-to-br ${service.gradient} p-8 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
                
                {service.type === "radar" ? (
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.2)]">
                       <circle cx="50" cy="50" r="45" fill="none" className="stroke-accent-blue/5" strokeWidth="0.5" />
                       <circle cx="50" cy="50" r="35" fill="none" className="stroke-accent-blue/5" strokeWidth="0.5" />
                       <circle cx="50" cy="50" r="25" fill="none" className="stroke-accent-blue/5" strokeWidth="0.5" />
                       <path d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z" className="fill-accent-blue/10 stroke-accent-blue" strokeWidth="2" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-display font-bold text-foreground">89%</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[280px] bg-card/40 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/5 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-full h-3 bg-muted/20 rounded-full" />
                      <div className="w-16 h-3 bg-accent-blue/20 rounded-full" />
                    </div>
                    {[1, 2].map((r) => (
                      <div key={r} className="flex gap-3">
                        <div className="w-full h-3 bg-muted/10 rounded-full" />
                        <div className="w-16 h-3 bg-muted/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6">
                  <span className={`${service.tagClass} uppercase tracking-[0.3em] text-[10px] font-bold`}>
                    {service.tag}
                  </span>
                  <div className={`${service.iconBg} ${service.iconClass} rounded-2xl p-2.5 group-hover:rotate-45 transition-transform duration-500 border border-current/10 shadow-sm`}>
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                <h3 className="text-foreground text-2xl md:text-3xl mb-4 tracking-tight font-display font-bold leading-none">
                  {service.title}
                </h3>
                <p className="text-muted-foreground/80 text-[15px] leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
