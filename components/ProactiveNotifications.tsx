"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateProactiveNotifications, ProactiveNotification } from "@/lib/career-intelligence";
import { dismissNotification } from "@/lib/ai-memory";
import Link from "next/link";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/5",
  high: "border-amber-500/40 bg-amber-500/5",
  medium: "border-cyan/30 bg-cyan/5",
  low: "border-green-500/30 bg-green-500/5",
};
const PRIORITY_BADGE: Record<string, string> = {
  critical: "text-red-400 border-red-500/40 bg-red-500/10",
  high: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  medium: "text-cyan border-cyan/30 bg-cyan/10",
  low: "text-green-400 border-green-500/30 bg-green-500/10",
};

export function ProactiveNotifications() {
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const notes = generateProactiveNotifications();
    setNotifications(notes.slice(0, 5)); // Show max 5
    setLoaded(true);
  }, []);

  const handleDismiss = (id: string) => {
    dismissNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!loaded || notifications.length === 0) return null;

  return (
    <div className="relative">
      {/* Header toggle */}
      <button
        onClick={() => setVisible(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-void/60 border border-white/5 rounded-xl hover:border-cyan/20 transition-all group"
        aria-label="Toggle AI notifications"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan" />
          </span>
          <span className="font-mono text-[9px] text-cyan font-bold uppercase tracking-widest">
            AI CHIEF OF STAFF
          </span>
          <span className="font-mono text-[9px] text-mist/50">
            {notifications.length} active insight{notifications.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="font-mono text-[9px] text-mist/40 group-hover:text-cyan transition-colors">
          {visible ? "[ COLLAPSE ]" : "[ EXPAND ]"}
        </span>
      </button>

      {/* Notification list */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              <AnimatePresence mode="popLayout">
                {notifications.map((note, i) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`border rounded-xl overflow-hidden ${PRIORITY_COLORS[note.priority]}`}
                  >
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{note.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-mono text-[8px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded ${PRIORITY_BADGE[note.priority]}`}>
                                {note.priority}
                              </span>
                              <span className="font-mono text-[8px] text-mist/50 uppercase tracking-wider">
                                {note.type}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-fog mt-0.5 leading-snug truncate">
                              {note.title}
                            </h4>
                          </div>
                        </div>
                        {note.dismissible && (
                          <button
                            onClick={() => handleDismiss(note.id)}
                            className="text-mist/30 hover:text-mist/70 font-mono text-[10px] shrink-0 transition-colors"
                            aria-label="Dismiss notification"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <p className="text-[10.5px] text-mist/70 leading-relaxed mb-2">
                        {note.message}
                      </p>

                      {/* Expandable context */}
                      <button
                        onClick={() => setExpanded(expanded === note.id ? null : note.id)}
                        className="font-mono text-[8.5px] text-cyan/70 hover:text-cyan transition-colors"
                      >
                        {expanded === note.id ? "▲ Less detail" : "▼ Why this matters"}
                      </button>

                      <AnimatePresence>
                        {expanded === note.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 bg-void/60 border border-white/5 rounded-lg p-2.5 space-y-2">
                              <p className="text-[10px] text-mist/60 italic leading-relaxed">
                                &ldquo;{note.context}&rdquo;
                              </p>
                              {note.evidence.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-wider block">Evidence:</span>
                                  {note.evidence.map((e, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5">
                                      <span className="text-cyan/50 mt-0.5 text-[8px]">→</span>
                                      <span className="text-[9.5px] text-mist/50">{e}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {note.actionLabel && note.actionHref && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <Link
                            href={note.actionHref}
                            className="font-mono text-[9px] text-cyan border border-cyan/30 bg-cyan/5 hover:bg-cyan/10 hover:border-cyan px-2.5 py-1 rounded transition-all"
                          >
                            {note.actionLabel} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
