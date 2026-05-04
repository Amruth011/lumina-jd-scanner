import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Zap, BookOpen, MessageSquare } from "lucide-react";

interface Recommendation {
  title: string;
  description: string;
  type: "addition" | "phrasing" | "strategy";
}

interface GapRecommendationsProps {
  recommendations: Recommendation[];
}

export const GapRecommendations = ({ recommendations }: GapRecommendationsProps) => {
  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "addition": return <Zap className="w-5 h-5 text-[#10B981]" />;
      case "phrasing": return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "strategy": return <BookOpen className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-6 h-6 text-[#10B981]" />
        <h3 className="text-2xl font-serif font-bold text-[#1E2A3A]">Tactical Recommendations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-sm space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] flex items-center justify-center group-hover:scale-110 transition-transform">
              {getIcon(rec.type)}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-serif font-bold text-[#1E2A3A]">{rec.title}</h4>
              <p className="text-sm text-[#1E2A3A]/60 font-body leading-relaxed">
                {rec.description}
              </p>
            </div>

            <button className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-[#10B981] group-hover:translate-x-1 transition-transform">
              Apply Suggestion <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
