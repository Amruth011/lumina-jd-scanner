import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    tag: "AI Analysis",
    tagColor: "text-blue-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Skill Radar & Gap Score",
    description: "Upload your JD and resume together. Get an instant match score, a visual skill radar, and a ranked breakdown of exactly what you're missing — color-coded by priority.",
    gradient: "from-blue-50 to-blue-100/50",
    type: "radar"
  },
  {
    tag: "Strategy",
    tagColor: "text-purple-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Playbook + Application Tracker",
    description: "Get tailored project ideas, ATS keyword secrets, and enterprise tips. Then track every application in your built-in dashboard — with live score updates as you improve your resume.",
    gradient: "from-emerald-50 to-purple-50/50",
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
            className="text-3xl md:text-5xl text-slate-900 tracking-tight font-serif"
          >
            How Lumina works
          </motion.h2>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-slate-400 text-sm hidden md:block"
          >
            Core features
          </motion.span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 * (index + 1) }}
              className="liquid-glass rounded-3xl overflow-hidden group border border-slate-200/60 bg-white"
            >
              {/* Visual Area */}
              <div className={`aspect-video bg-gradient-to-br ${service.gradient} p-8 flex items-center justify-center`}>
                {service.type === "radar" ? (
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                       <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
                       <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
                       <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
                       <path d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="2" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-slate-800">89%</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-white/60 p-4 rounded-xl shadow-sm border border-white/80 space-y-3">
                    <div className="flex gap-2">
                      <div className="w-full h-3 bg-slate-100 rounded" />
                      <div className="w-12 h-3 bg-blue-100 rounded" />
                    </div>
                    {[1, 2].map((r) => (
                      <div key={r} className="flex gap-2">
                        <div className="w-full h-3 bg-slate-50 rounded" />
                        <div className="w-12 h-3 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-2">
                  <span className={`${service.tagColor} uppercase tracking-widest text-xs font-bold`}>
                    {service.tag}
                  </span>
                  <div className={`${service.iconBg} ${service.iconColor} rounded-full p-2 group-hover:rotate-45 transition-transform duration-300`}>
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                <h3 className="text-slate-800 text-xl md:text-2xl mb-3 tracking-tight font-semibold">
                  {service.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
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
