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
    <section className="bg-white pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-blue-500 text-sm tracking-widest uppercase block mb-4"
        >
          The Process
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl text-slate-900 leading-[1.1] tracking-tight font-serif mb-16"
        >
          From applicant to <em className="italic" style={{ color: "#3B82F6" }}>top candidate.</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 * (index + 1) }}
              className="liquid-glass rounded-3xl p-8 relative"
            >
              <step.icon size={32} style={{ color: step.color }} className="mb-6" />
              <span className="text-blue-100 text-6xl font-bold absolute top-4 right-4 select-none -z-10">
                {step.number}
              </span>
              <h3 className="text-slate-800 text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
