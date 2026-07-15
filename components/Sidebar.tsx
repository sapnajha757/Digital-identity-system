"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { href: "/os/boot", label: "BOOT EXPERIENCE", code: "00", icon: "⚡" },
  { href: "/dashboard", label: "WORKSPACE", code: "01", icon: "🖥️" },
  { href: "/timeline", label: "TIMELINE", code: "02", icon: "⏳" },
  { href: "/graph", label: "KNOWLEDGE GRAPH", code: "03", icon: "🕸️" },
  { href: "/chat", label: "IDENTITY AI", code: "04", icon: "💬" },
  { href: "/portfolio", label: "PORTFOLIO", code: "05", icon: "💼" },
  { href: "/auditors", label: "AI AUDITORS", code: "06", icon: "🔍" },
  { href: "/evolution", label: "EVOLUTION", code: "07", icon: "📈" },
  { href: "/explainability", label: "EXPLAINABILITY", code: "08", icon: "🧠" },
  { href: "/settings", label: "SETTINGS", code: "09", icon: "⚙️" },
  { href: "/profile", label: "USER PROFILE", code: "10", icon: "👤" },
];

const SCANNER_LOGS = [
  "ANALYZING RELATIONSHIPS...",
  "KNOWLEDGE GRAPH SYNCED",
  "CAREER TWIN RECALCULATED",
  "TIMELINE TELEMETRY NOMINAL",
  "VECTOR METRICS OPTIMIZED",
  "IDENTITY SCORES UPDATE READY",
  "AI COPILOT READY",
  "RAG ENGINE ACTIVE",
];

interface SidebarProps {
  onStartStoryMode?: () => void;
}

export function Sidebar({ onStartStoryMode }: SidebarProps) {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setDemoMode(localStorage.getItem("dis_demo_mode") === "true");
    setPresentationMode(localStorage.getItem("dis_presentation_mode") === "true");
    apiClient
      .getDashboardMetrics()
      .then((res) => {
        setScore(res.identity_score);
        let c = 0;
        const target = res.identity_score;
        const iv = setInterval(() => {
          c = Math.min(c + 2, target);
          setAnimatedScore(c);
          if (c >= target) clearInterval(iv);
        }, 16);
      })
      .catch(() => {});
  }, [demoMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % SCANNER_LOGS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem("dis_demo_mode", next ? "true" : "false");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("demo-mode-changed"));
    window.location.reload();
  };

  const togglePresentationMode = () => {
    const next = !presentationMode;
    setPresentationMode(next);
    localStorage.setItem("dis_presentation_mode", next ? "true" : "false");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("presentation-mode-changed"));
    window.location.reload();
  };

  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (circ * (animatedScore ?? 0)) / 100;

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-white/5 bg-[#0A0E1A]/60 backdrop-blur-xl md:flex transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="border-b border-white/5 px-5 py-4 flex justify-between items-center shrink-0">
        {!collapsed && (
          <div>
            <span className="font-mono text-[8px] text-magenta tracking-widest uppercase font-bold">
              // IDENTITY.OS
            </span>
            <p className="font-display text-base font-black tracking-widest gradient-text">IDENTITY<span className="text-cyan">OS</span></p>
          </div>
        )}
        {collapsed && (
          <span className="font-display text-base font-black tracking-widest gradient-text mx-auto">ID</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-mist hover:text-cyan font-mono text-[10px] uppercase transition-colors shrink-0"
          title="Toggle Sidebar"
          aria-label="Toggle navigation sidebar"
          aria-expanded={!collapsed}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
        {(presentationMode ? SECTIONS.filter(s => ["/dashboard", "/portfolio", "/auditors"].includes(s.href)) : SECTIONS).map((section) => {
          const active = pathname === section.href;
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-label={section.label}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-[11px] tracking-wide transition-all duration-200 border",
                active
                  ? "border-cyan/20 bg-cyan/5 text-cyan font-semibold shadow-[0_0_12px_rgba(79,140,255,0.1)]"
                  : "border-transparent text-mist hover:border-white/5 hover:bg-white/4 hover:text-fog"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r bg-cyan" />
              )}
              {!collapsed && (
                <span className="text-sm shrink-0 opacity-70">{section.icon}</span>
              )}
              <span className={clsx("transition-colors text-[9px]", active ? "text-magenta font-semibold" : "text-mist/50")}>
                {section.code}
              </span>
              {!collapsed && (
                <span className="flex-1 truncate text-[10px]">{section.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Ticker */}
      {!collapsed && (
        <div className="mx-3 my-1 border border-white/5 bg-void/40 px-3 py-2 rounded-lg flex items-center gap-2 overflow-hidden select-none">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={logIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[8px] text-cyan/70 tracking-wider truncate uppercase"
            >
              {SCANNER_LOGS[logIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-4 space-y-3 shrink-0">
        {/* Start Presentation button */}
        {!collapsed && onStartStoryMode && (
          <button
            onClick={onStartStoryMode}
            className="w-full py-2 px-3 rounded-lg border border-cyan/30 bg-cyan/5 text-cyan font-mono text-[9px] uppercase tracking-wider hover:bg-cyan/10 hover:border-cyan transition-all font-bold flex items-center justify-center gap-2"
          >
            <span>▶</span> Start Presentation
          </button>
        )}

        {/* Demo / Presentation toggles */}
        {!collapsed && (
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-lg space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[8px] text-magenta font-bold tracking-wider">DEMO PRESET</span>
              <button
                onClick={toggleDemoMode}
                className={clsx(
                  "w-8 h-4 rounded-full relative p-0.5 transition-colors border duration-200",
                  demoMode ? "bg-cyan/20 border-cyan" : "bg-white/10 border-white/10"
                )}
              >
                <div
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_6px_rgba(79,140,255,0.6)] transition-transform duration-200",
                    demoMode ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-2">
              <span className="font-mono text-[8px] text-cyan font-bold tracking-wider">RECRUITER VIEW</span>
              <button
                onClick={togglePresentationMode}
                className={clsx(
                  "w-8 h-4 rounded-full relative p-0.5 transition-colors border duration-200",
                  presentationMode ? "bg-cyan/20 border-cyan" : "bg-white/10 border-white/10"
                )}
              >
                <div
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_6px_rgba(79,140,255,0.6)] transition-transform duration-200",
                    presentationMode ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Animated identity score ring */}
        {!collapsed && score !== null && (
          <div className="flex items-center gap-3 bg-white/3 border border-white/5 px-3 py-2 rounded-lg">
            <svg width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={24} cy={24} r={r} stroke="#191F2A" strokeWidth={3.5} fill="none" />
              <circle
                cx={24}
                cy={24}
                r={r}
                stroke="#4F8CFF"
                strokeWidth={3.5}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ - dash}
                style={{ transition: "stroke-dashoffset 0.6s ease", filter: "drop-shadow(0 0 4px rgba(79,140,255,0.5))" }}
              />
            </svg>
            <div>
              <span className="font-display font-black text-base text-fog block leading-none">{animatedScore}%</span>
              <span className="font-mono text-[8px] text-mist/60 uppercase">Core ID Index</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-cyan shrink-0"
            animate={{ boxShadow: ["0 0 0 0 rgba(79,140,255,0.4)", "0 0 0 4px rgba(79,140,255,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {!collapsed && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyan font-semibold">System active</span>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-1 font-mono text-[9px] text-mist/50">
            <div className="flex justify-between">
              <span>Search:</span>
              <kbd className="px-1 bg-white/5 rounded border border-white/5 text-[8px]">Ctrl+K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Copilot:</span>
              <kbd className="px-1 bg-white/5 rounded border border-white/5 text-[8px]">Ctrl+I</kbd>
            </div>
          </div>
        )}

        {!collapsed && session?.user?.email && (
          <p className="truncate font-mono text-[9px] text-mist/60" title={session.user.email}>
            {session.user.email}
          </p>
        )}

        <button
          type="button"
          onClick={signOut}
          className="font-mono text-[10px] uppercase tracking-widest text-mist transition-colors hover:text-magenta block w-full text-left"
        >
          {collapsed ? "[OUT]" : "[ Log out ]"}
        </button>
      </div>
    </aside>
  );
}
