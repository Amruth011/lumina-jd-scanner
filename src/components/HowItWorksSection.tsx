import { motion } from "framer-motion";
import { FileText, Upload, Trophy } from "lucide-react";

const steps = [
  {
    icon: FileText,
    color: "#3B82F6",
    number: "01",
    title: "Paste Your JD",
    body: "Drop in any job description. Gemini AI instantly decodes every requirement, categorizing skills by importance."
  },
  {
    icon: Upload,
    color: "#10B981",
    number: "02",
    title: "Upload Your Resume",
    body: "We compare your profile against the JD and generate an Overall Match Score with a precise gap analysis."
  },
  {
    icon: Trophy,
    color: "#8B5CF6",
    number: "03",
    title: "Get Your Playbook",
    body: "Receive tailored projects, ATS-bypass keywords, and an enterprise strategy to become the obvious hire."
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-transparent pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block"
        >
          The Process
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl text-slate-900 tracking-tight font-serif mb-16 leading-tight"
        >
          From applicant to <em className="italic" style={{ color: "#1E293B" }}>top candidate.</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="liquid-glass rounded-[2rem] p-8 flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                  <step.icon size={28} className="text-slate-900" />
                </div>
                <span className="text-5xl font-bold text-slate-100/10 font-sans tracking-tight leading-none">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-slate-800 text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
