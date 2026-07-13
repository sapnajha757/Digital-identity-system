"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { discoveryStore, DiscoveryToast } from "@/lib/discovery-store";

const ACCENT_MAP = {
  cyan: { border: "border-cyan/40", bg: "bg-cyan/5", glow: "shadow-[0_0_20px_rgba(79,140,255,0.15)]", text: "text-cyan" },
  magenta: { border: "border-magenta/40", bg: "bg-magenta/5", glow: "shadow-[0_0_20px_rgba(123,97,255,0.15)]", text: "text-magenta" },
  amber: { border: "border-amber/40", bg: "bg-amber/5", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]", text: "text-amber" },
};

function ToastItem({ toast, onDismiss }: { toast: DiscoveryToast; onDismiss: (id: string) => void }) {
  const accent = ACCENT_MAP[toast.accentColor ?? "cyan"];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 5000);
    return () => { clearTimeout(t); };
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.88 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${accent.border} ${accent.bg} ${accent.glow} min-w-[240px] max-w-[300px] cursor-pointer select-none`}
      onClick={() => onDismiss(toast.id)}
    >
      <span className="text-lg shrink-0 mt-0.5">{toast.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-mono text-[11px] font-bold uppercase tracking-wider ${accent.text}`}>{toast.title}</p>
        <p className="font-mono text-[10px] text-mist leading-relaxed mt-0.5 truncate">{toast.subtitle}</p>
      </div>
      {/* Dismiss indicator */}
      <div className="relative w-1 h-full shrink-0">
        <motion.div
          className={`absolute bottom-0 left-0 w-full rounded ${accent.text} bg-current`}
          initial={{ height: "100%" }}
          animate={{ height: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

export function AIDiscoveryToastProvider() {
  const [toasts, setToasts] = useState<DiscoveryToast[]>([]);

  useEffect(() => {
    const unsub = discoveryStore.subscribe((toast) => {
      setToasts((prev) => [...prev.slice(-4), toast]);
    });
    return () => { unsub(); };
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
