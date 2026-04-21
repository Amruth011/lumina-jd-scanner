import { motion } from "framer-motion";
import { FileText, Upload, Trophy } from "lucide-react";

const steps = [
  {
    icon: FileText,
    accentClass: "text-accent-emerald",
    number: "01",
    title: "Paste Your JD",
    body: "Drop in any job description. Llama-3.3 Intelligence instantly decodes every requirement, categorizing skills by importance."
  },
  {
    icon: Upload,
    accentClass: "text-accent-emerald",
    number: "02",
    title: "Upload Your Resume",
    body: "We compare your profile against the JD and generate an Overall Match Score with a precise gap analysis."
  },
  {
    icon: Trophy,
    accentClass: "text-accent-violet",
    number: "03",
    title: "Get Your Playbook",
    body: "Receive tailored projects, ATS-bypass keywords, and an enterprise strategy to become the obvious hire."
  }
];

export const HowItWorksSection = () => {
  return (
    <div className="bg-transparent py-4 px-2">
      <div className="max-w-6xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-accent-emerald/40 text-[10px] font-bold tracking-[0.4em] uppercase block mb-6"
        >
          The Process
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tighter font-serif mb-20 leading-[1.05]"
        >
          From applicant to <em className="italic text-accent-emerald drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] not-italic font-serif">top candidate.</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 * (index + 1) }}
              className="premium-card rounded-3xl p-10 relative hover-glow bg-card/10 border-border/40"
            >
              <div className={`p-4 rounded-2xl w-fit mb-8 bg-card/20 border border-white/5 ${step.accentClass}`}>
                <step.icon size={28} className="drop-shadow-[0_0_10px_currentColor]" />
              </div>
              
              <span className="text-foreground/5 text-8xl font-display font-bold absolute top-0 right-4 select-none opacity-10 pointer-events-none">
                {step.number}
              </span>
              
              <h3 className="text-foreground font-display text-xl md:text-2xl font-bold mb-4 tracking-tight leading-none">{step.title}</h3>
              <p className="text-muted-foreground/80 text-sm md:text-base leading-relaxed font-medium tracking-tight">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
