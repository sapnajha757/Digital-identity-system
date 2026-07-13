"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const SECTIONS = [
  { href: "/", label: "WORKSPACE", code: "01" },
  { href: "/timeline", label: "TIMELINE", code: "02" },
  { href: "/graph", label: "KNOWLEDGE GRAPH", code: "03" },
  { href: "/chat", label: "IDENTITY AI", code: "04" },
  { href: "/portfolio", label: "PORTFOLIO", code: "05" },
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
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    setDemoMode(localStorage.getItem("dis_demo_mode") === "true");
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

  return (
    <aside className={clsx(
      "fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-panel-raised bg-panel/85 backdrop-blur-md md:flex transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Brand Header */}
      <div className="border-b border-panel-raised px-6 py-6 flex justify-between items-center">
        {!collapsed && (
          <div>
            <span className="font-mono text-[9px] text-magenta tracking-widest uppercase font-bold">IDENTITY.OS</span>
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
        >
          {collapsed ? "[→]" : "[←]"}
        </button>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {SECTIONS.map((section) => {
          const active = pathname === section.href;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-xs tracking-wide transition-all duration-200 border",
                active
                  ? "border-cyan/35 bg-cyan/5 text-cyan font-semibold shadow-glow-cyan"
                  : "border-transparent text-mist hover:border-panel-raised hover:bg-panel-raised/55 hover:text-fog"
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
        <div className="mx-5 my-2 border border-panel-raised/40 bg-void/40 p-2 rounded flex items-center gap-2 overflow-hidden select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping shrink-0" />
          <span className="font-mono text-[8px] text-cyan/70 tracking-wider truncate uppercase">
            {SCANNER_LOGS[logIndex]}
          </span>
        </div>
      )}

      {/* Footer Info / shortcuts */}
      <div className="border-t border-panel-raised px-5 py-5 space-y-4">
        {/* Presentation Mode control */}
        {!collapsed && (
          <div className="bg-panel-raised/35 border border-panel-raised/60 p-2.5 rounded-sm flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] text-magenta font-bold tracking-wider">DEMO PRESENTATION</span>
              <button 
                onClick={toggleDemoMode}
                className={clsx(
                  "w-8 h-4 rounded-full relative p-0.5 transition-colors border duration-200",
                  demoMode ? "bg-cyan/20 border-cyan" : "bg-panel-raised border-panel-raised"
                )}
              >
                <div className={clsx(
                  "w-2.5 h-2.5 rounded-full bg-cyan shadow-glow-cyan transition-transform duration-200",
                  demoMode ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>
            <span className="text-[7.5px] font-mono text-mist/60">// Preloads Sapna Jha&apos;s digital identity portfolio</span>
          </div>
        )}

        {/* Identity Score Status badge */}
        {!collapsed && score !== null && (
          <div className="flex items-center justify-between bg-panel-raised/60 border border-panel-raised px-3 py-2 rounded">
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
              <kbd className="px-1 bg-panel-raised rounded border border-panel-raised text-[8px]">Ctrl+K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Tabs:</span>
              <kbd className="px-1 bg-panel-raised rounded border border-panel-raised text-[8px]">1-5</kbd>
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
