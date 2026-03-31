import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalBanner() {
  const [showBanner, setShowBanner] = useState(true);
  const isEnabled = import.meta.env.VITE_BANNER_ENABLED === "true";
  const message = import.meta.env.VITE_BANNER_MESSAGE;

  if (!isEnabled) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative z-[100] bg-[#0a1420] border-b border-primary/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm font-medium text-white/90 leading-tight">
                <span className="font-bold text-primary mr-2">Announcement:</span>
                {message || "Welcome to AzureCertify AI Pro!"}
              </p>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
