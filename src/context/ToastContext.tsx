import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info", description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description }].slice(-3)); // Max 3
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`relative flex min-w-[320px] max-w-[420px] items-start gap-4 overflow-hidden rounded-xl bg-[#060D14] p-4 text-white shadow-2xl border-l-4 ${
                t.type === "success" ? "border-[#10B981]" :
                t.type === "error" ? "border-red-500" :
                t.type === "warning" ? "border-amber-500" : "border-blue-500"
              }`}
            >
              <div className="mt-1">
                {t.type === "success" && <CheckCircle className="h-5 w-5 text-[#10B981]" />}
                {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {t.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {t.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-display text-sm font-bold leading-tight">{t.message}</p>
                {t.description && <p className="text-xs text-white/60 leading-relaxed font-body">{t.description}</p>}
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="mt-1 text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Progress bar line */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-[2px] ${
                  t.type === "success" ? "bg-[#10B981]" :
                  t.type === "error" ? "bg-red-500" :
                  t.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useLuminaToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useLuminaToast must be used within a ToastProvider");
  }
  return context;
};
