import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Heart } from "lucide-react";
import { toast } from "sonner";

export const FeedbackBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    // Mock submission
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Intelligence Received", {
      description: "Your feedback has been logged in our tactical improvement loop."
    });
    setFeedback("");
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/10 rounded-3xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-display font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <MessageSquare size={14} /> Tactical Feedback
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How can we improve the intelligence engine?"
              className="w-full h-32 bg-slate-50 border border-border/5 rounded-2xl p-4 text-xs font-medium focus:ring-2 ring-primary/20 outline-none resize-none mb-4"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className="w-full py-3 rounded-xl bg-[#1E2A3A] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2a3a4a] transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Syncing..." : <><Send size={12} /> Submit Intelligence</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-white shadow-xl border border-border/10 flex items-center justify-center text-primary hover:text-accent-emerald transition-colors relative group"
      >
        <MessageSquare size={24} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-emerald rounded-full border-2 border-white flex items-center justify-center">
            <Heart size={8} className="text-white fill-current" />
        </div>
      </motion.button>
    </div>
  );
};
