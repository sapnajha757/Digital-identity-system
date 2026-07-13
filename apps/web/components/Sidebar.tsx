"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const SECTIONS = [
  { href: "/dashboard", label: "WORKSPACE", code: "01" },
  { href: "/timeline", label: "TIMELINE", code: "02" },
  { href: "/graph", label: "KNOWLEDGE GRAPH", code: "03" },
  { href: "/chat", label: "IDENTITY AI", code: "04" },
  { href: "/portfolio", label: "PORTFOLIO", code: "05" },
  { href: "/auditors", label: "AI AUDITORS", code: "06" },
  { href: "/evolution", label: "EVOLUTION", code: "07" },
  { href: "/explainability", label: "EXPLAINABILITY", code: "08" },
  { href: "/settings", label: "SETTINGS", code: "09" },
  { href: "/profile", label: "USER PROFILE", code: "10" },
];

const SCANNER_LOGS = [
  "ANALYZING RELATIONSHIPS...",
  "KNOWLEDGE GRAPH SYNCED",
  "CAREER TWIN RECALCULATED",
  "TIMELINE TELEMETRY NOMINAL",
  "VECTOR METRICS OPTIMIZED",
  "IDENTITY SCORES UPDATE READY"
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    setDemoMode(localStorage.getItem("dis_demo_mode") === "true");
    setPresentationMode(localStorage.getItem("dis_presentation_mode") === "true");
    apiClient.getDashboardMetrics()
      .then(res => setScore(res.identity_score))
      .catch(() => {});
  }, [demoMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % SCANNER_LOGS.length);
    }, 4000);
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

  return (
    <aside className={clsx(
      "fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-white/5 bg-[#0F172A]/50 backdrop-blur-xl md:flex transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Brand Header */}
      <div className="border-b border-white/5 px-6 py-4 flex justify-between items-center">
        {!collapsed && (
          <div>
            <span className="font-mono text-[8px] text-magenta tracking-widest uppercase font-bold">// IDENTITY.OS</span>
            <p className="font-display text-md font-bold tracking-widest gradient-text">
              IDENT.SYS
            </p>
          </div>
        )}
        {collapsed && (
          <span className="font-display text-md font-bold tracking-widest gradient-text mx-auto">ID</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-mist hover:text-cyan font-mono text-[10px] uppercase transition-colors"
          title="Toggle Sidebar Layout"
          aria-label="Toggle navigation sidebar"
          aria-expanded={!collapsed}
        >
          {collapsed ? "[→]" : "[←]"}
        </button>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
        {SECTIONS.map((section) => {
          const active = pathname === section.href;
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-label={section.label}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-xs tracking-wide transition-all duration-200 border",
                active
                  ? "border-cyan/20 bg-cyan/5 text-cyan font-semibold shadow-glow-cyan"
                  : "border-transparent text-mist hover:border-white/5 hover:bg-white/5 hover:text-fog"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-cyan" />
              )}
              <span className={clsx("transition-colors", active ? "text-magenta font-semibold" : "text-mist/60")}>
                {section.code}
              </span>
              {!collapsed && (
                <span className="flex-1 truncate">{section.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Ticker scanner */}
      {!collapsed && (
        <div className="mx-5 my-1 border border-white/5 bg-void/40 p-2 rounded-lg flex items-center gap-2 overflow-hidden select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping shrink-0" />
          <span className="font-mono text-[8px] text-cyan/70 tracking-wider truncate uppercase">
            {SCANNER_LOGS[logIndex]}
          </span>
        </div>
      )}

      {/* Footer Info / shortcuts */}
      <div className="border-t border-white/5 px-5 py-4 space-y-3">
        {/* Presentation Mode control */}
        {!collapsed && (
          <div className="bg-white/5 border border-white/5 p-2 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[8.5px] text-magenta font-bold tracking-wider">DEMO PRESET</span>
              <button 
                onClick={toggleDemoMode}
                className={clsx(
                  "w-8 h-4 rounded-full relative p-0.5 transition-colors border duration-200",
                  demoMode ? "bg-cyan/20 border-cyan" : "bg-white/10 border-white/10"
                )}
              >
                <div className={clsx(
                  "w-2.5 h-2.5 rounded-full bg-cyan shadow-glow-cyan transition-transform duration-200",
                  demoMode ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>
            
            <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
              <span className="font-mono text-[8.5px] text-cyan font-bold tracking-wider">JUDGES PRESENTATION</span>
              <button 
                onClick={togglePresentationMode}
                className={clsx(
                  "w-8 h-4 rounded-full relative p-0.5 transition-colors border duration-200",
                  presentationMode ? "bg-cyan/20 border-cyan" : "bg-white/10 border-white/10"
                )}
              >
                <div className={clsx(
                  "w-2.5 h-2.5 rounded-full bg-cyan shadow-glow-cyan transition-transform duration-200",
                  presentationMode ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        )}

        {/* Identity Score Status badge */}
        {!collapsed && score !== null && (
          <div className="flex items-center justify-between bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
            <span className="font-mono text-[9px] text-mist uppercase font-semibold">CORE ID INDEX</span>
            <span className="font-mono text-[10px] text-cyan font-bold bg-cyan/10 border border-cyan/30 px-1.5 py-0.5 rounded">
              {score}%
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" />
          {!collapsed && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyan font-semibold">System active</span>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-1.5 font-mono text-[9px] text-mist/60">
            <div>Shortcuts:</div>
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
          <p className="truncate font-mono text-[9px] text-mist/70" title={session.user.email}>
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
