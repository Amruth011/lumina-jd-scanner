import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, Clock, ChevronRight, Search } from "lucide-react";
import { useSession } from "@/context/SessionContext";

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
  jdText: string;
}

export const HistoryPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { supabase, user } = useSession();
  const { updateSession } = useSession();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        // Fallback to localStorage if not logged in
        const savedHistory = localStorage.getItem("lumina_history");
        if (savedHistory) {
          try {
            setHistory(JSON.parse(savedHistory));
          } catch (e) {
            setHistory([]);
          }
        }
        return;
      }

      // Fetch from Supabase for all devices sync
      const { data, error } = await supabase
        .from("jd_vault")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        const mappedHistory: HistoryItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          timestamp: new Date(item.created_at).getTime(),
          jdText: item.raw_text
        }));
        setHistory(mappedHistory);
      }
    };

    fetchHistory();

    const handleHistoryUpdate = () => {
      fetchHistory();
    };

    window.addEventListener("lumina_history_updated", handleHistoryUpdate);
    return () => window.removeEventListener("lumina_history_updated", handleHistoryUpdate);
  }, [user, supabase]);

  const loadHistoryItem = (item: HistoryItem) => {
    updateSession({ currentJD: item.jdText, currentJDDecoded: null });
    setIsOpen(false);
    // Force a re-decode or just load the text
    window.dispatchEvent(new CustomEvent("switch-tab", { detail: "decode" }));
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-6 bottom-6 z-40 p-4 bg-[#1E2A3A] text-white rounded-2xl shadow-2xl border border-[#10B981]/20 hover:scale-110 transition-all flex items-center gap-3 group"
      >
        <History className="w-5 h-5 group-hover:rotate-[-12deg] transition-transform" />
        <span className="text-xs font-display font-bold uppercase tracking-widest hidden md:inline">Recent Activity</span>
      </button>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#060D14]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl border-r border-[#1E2A3A]/5 flex flex-col"
            >
              <div className="p-8 border-b border-[#1E2A3A]/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-[#10B981]" />
                  <h3 className="font-serif text-2xl font-bold text-[#1E2A3A]">Activity</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-[#1E2A3A]/40 hover:text-[#1E2A3A]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                    <Clock className="w-12 h-12" />
                    <p className="font-body text-sm font-medium">Your activity history will appear here.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full p-4 rounded-2xl border border-[#1E2A3A]/5 bg-white hover:border-[#10B981]/30 hover:bg-[#10B981]/5 transition-all text-left group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#1E2A3A]/20 group-hover:text-[#10B981] group-hover:translate-x-1 transition-all" />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-[#1E2A3A] line-clamp-1">
                        {item.title}
                      </h4>
                    </button>
                  ))
                )}
              </div>

              <div className="p-6 bg-[#F4F5F7] border-t border-[#1E2A3A]/5 space-y-3">
                <button 
                  onClick={async () => {
                    const feedback = window.prompt("Send feedback to Lumina Admins:");
                    if (feedback && user) {
                      const { error } = await supabase.from("master_vault").insert({
                        user_id: user.id,
                        category: "feedback",
                        title: "User Feedback",
                        content: feedback,
                        source: "Direct Feedback"
                      });
                      if (!error) {
                        alert("Feedback sent to admin! Thank you.");
                      } else {
                        alert("Failed to send feedback. Please try again.");
                      }
                    }
                  }}
                  className="w-full py-3 bg-[#10B981]/10 text-[#10B981] rounded-xl text-xs font-display font-bold uppercase tracking-widest hover:bg-[#10B981]/20 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Send Feedback
                </button>
                <button 
                  onClick={() => { localStorage.removeItem("lumina_history"); setHistory([]); }}
                  className="w-full py-2 text-xs font-display font-bold uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
                >
                  Clear Local History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
