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
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl text-foreground tracking-tighter font-display font-black leading-none"
          >
            How Lumina works
          </motion.h2>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-muted-foreground/30 text-[10px] uppercase font-black tracking-[0.4em] hidden md:block"
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
              transition={{ duration: 0.8, delay: 0.15 * (index + 1), ease: [0.16, 1, 0.3, 1] }}
              className="premium-card rounded-[40px] overflow-hidden group border-white/5 bg-card/20 hover:scale-[1.02] transition-all duration-700"
            >
              {/* Visual Area */}
              <div className="aspect-video bg-secondary/5 p-8 flex items-center justify-center relative overflow-hidden">
                
                {service.type === "radar" ? (
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                       <circle cx="50" cy="50" r="45" fill="none" className="stroke-accent-blue/5" strokeWidth="0.5" />
                       <circle cx="50" cy="50" r="35" fill="none" className="stroke-accent-blue/5" strokeWidth="0.5" />
                       <circle cx="50" cy="50" r="25" fill="none" className="stroke-accent-blue/5" strokeWidth="0.5" />
                       <path d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z" className="fill-accent-blue/10 stroke-accent-blue" strokeWidth="2" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-display font-bold text-foreground font-mono">89%</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[280px] bg-white border border-border/10 p-6 rounded-2xl space-y-4">
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
                  <span className={`${service.tagClass} uppercase tracking-[0.4em] text-[10px] font-black`}>
                    {service.tag}
                  </span>
                  <div className={`${service.iconBg} ${service.iconClass} rounded-2xl p-3 group-hover:rotate-45 transition-all duration-700 border border-current/10`}>
                    <ArrowUpRight size={22} />
                  </div>
                </div>
                <h3 className="text-foreground text-3xl md:text-4xl mb-6 tracking-tighter font-display font-black leading-none group-hover:text-primary transition-colors duration-500">
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
