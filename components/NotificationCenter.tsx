"use client";

import { motion, AnimatePresence } from "framer-motion";

export type Notification = {
  id: string;
  type: "discovery" | "score" | "recommendation" | "warning";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "discovery", title: "New Relationship Found", body: "TensorFlow certificate linked to ML Internship project node", time: "2m ago", read: false, icon: "🔗" },
  { id: "n2", type: "score", title: "Identity Score Increased", body: "Score improved from 87% to 92% after document processing", time: "15m ago", read: false, icon: "📈" },
  { id: "n3", type: "recommendation", title: "Gap Detected in Portfolio", body: "Docker mentioned in resume but no projects demonstrate it", time: "1h ago", read: false, icon: "⚠️" },
  { id: "n4", type: "discovery", title: "Skill Validated", body: "Python extracted from 3 independent sources — high confidence", time: "2h ago", read: true, icon: "✅" },
  { id: "n5", type: "recommendation", title: "Resume Optimization Available", body: "Add deployment keywords to match SDE-level role requirements", time: "3h ago", read: true, icon: "💡" },
  { id: "n6", type: "score", title: "Career Prediction Updated", body: "AI Engineer trajectory now at 94% confidence based on new data", time: "5h ago", read: true, icon: "🎯" },
  { id: "n7", type: "discovery", title: "Graph Growth", body: "12 new nodes added to knowledge graph from latest upload", time: "1d ago", read: true, icon: "🕸️" },
];

const TYPE_STYLE: Record<string, string> = {
  discovery: "border-l-cyan text-cyan",
  score: "border-l-[#4F8CFF] text-[#4F8CFF]",
  recommendation: "border-l-amber text-amber",
  warning: "border-l-magenta text-magenta",
};

interface Props {
  open: boolean;
  onClose: () => void;
  demoMode?: boolean;
}

export function NotificationCenter({ open, onClose, demoMode }: Props) {
  const notifications = demoMode ? DEMO_NOTIFICATIONS : [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-96 bg-[#0d1220]/95 backdrop-blur-xl border-l border-white/5 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <span className="font-mono text-[9px] text-magenta tracking-widest uppercase font-bold">{"// AI NOTIFICATION CENTER"}</span>
                <h2 className="font-display text-sm font-bold text-fog mt-0.5 uppercase tracking-wide">Intelligence Alerts</h2>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-magenta text-[9px] font-bold text-void flex items-center justify-center badge-pulse">
                    {unread}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-mist hover:text-fog transition-all font-mono text-xs"
                  aria-label="Close notifications"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-0 border-b border-white/5">
              {["All", "Unread", "Discoveries", "Score"].map((tab, i) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors border-b-2 ${
                    i === 0 ? "border-b-cyan text-cyan" : "border-b-transparent text-mist/50 hover:text-mist"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto py-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="w-16 h-16 rounded-full border border-white/5 bg-white/3 flex items-center justify-center text-2xl">
                    🔔
                  </div>
                  <div>
                    <p className="font-display text-sm text-fog uppercase tracking-wide">No alerts yet</p>
                    <p className="font-mono text-xs text-mist/50 mt-1">Upload documents to start receiving intelligence alerts</p>
                  </div>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`mx-3 my-1.5 p-3 rounded-lg border-l-2 ${TYPE_STYLE[notif.type]} ${
                      notif.read ? "bg-white/2 opacity-60" : "bg-white/4"
                    } border border-r border-t border-b border-white/5 cursor-pointer hover:bg-white/6 transition-all`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0 mt-0.5">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-mono text-[10px] font-bold truncate ${notif.read ? "text-fog/60" : "text-fog"}`}>
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-magenta shrink-0" />
                          )}
                        </div>
                        <p className="font-mono text-[9px] text-mist/60 leading-relaxed mt-0.5">{notif.body}</p>
                        <span className="font-mono text-[8px] text-mist/40 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
              <span className="font-mono text-[8px] text-mist/40 uppercase tracking-widest">
                {unread} unread · {notifications.length} total
              </span>
              <button className="font-mono text-[8px] text-cyan hover:text-cyan/80 uppercase tracking-widest transition-colors">
                Mark all read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
