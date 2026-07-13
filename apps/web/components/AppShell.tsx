"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CopilotPanel } from "@/components/CopilotPanel";

const PATHS = ["/dashboard", "/timeline", "/graph", "/chat", "/portfolio", "/profile"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideSidebar = pathname === "/" || pathname === "/login";
  const [showSearch, setShowSearch] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Sync presentation mode on load
    setPresentationMode(localStorage.getItem("dis_presentation_mode") === "true");

    const handlePresentationChange = () => {
      setPresentationMode(localStorage.getItem("dis_presentation_mode") === "true");
    };
    window.addEventListener("presentation-mode-changed", handlePresentationChange);
    return () => window.removeEventListener("presentation-mode-changed", handlePresentationChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      // Toggle Copilot Panel
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        setShowCopilot((prev) => !prev);
      }
      // Close overlay on Escape
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowCopilot(false);
      }
      // Tab navigation
      if (!hideSidebar && !showSearch && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        if (e.key === "1") router.push(PATHS[0]);
        if (e.key === "2") router.push(PATHS[1]);
        if (e.key === "3") router.push(PATHS[2]);
        if (e.key === "4") router.push(PATHS[3]);
        if (e.key === "5") router.push(PATHS[4]);
        if (e.key === "6") router.push(PATHS[5]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, hideSidebar, showSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(query)}`);
    setShowSearch(false);
    setQuery("");
  };

  return (
    <div className={`relative z-10 flex min-h-screen ${presentationMode ? "presentation-layout" : ""}`}>
      {!hideSidebar && !presentationMode && <Sidebar />}
      
      {/* Floating Copilot quick-trigger button */}
      {!hideSidebar && !presentationMode && (
        <button
          onClick={() => setShowCopilot(true)}
          className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full border border-cyan/45 bg-panel hover:bg-cyan/10 hover:border-cyan text-cyan flex items-center justify-center font-bold font-mono text-sm shadow-glow-cyan transition-all hover:scale-105"
          title="Open AI Copilot (Ctrl+I)"
          aria-label="Open AI Copilot"
        >
          AI
        </button>
      )}

      <main className={hideSidebar || presentationMode ? "flex-1" : "flex-1 md:pl-64"}>{children}</main>

      <CopilotPanel isOpen={showCopilot} onClose={() => setShowCopilot(false)} />

      {/* Spotlight Command Palette Overlay */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-50 bg-[#07090F]/70 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          <div className="w-full max-w-xl glass-panel rounded-xl shadow-2xl p-6 relative border border-white/10">
            <div className="flex justify-between items-center border-b border-panel-raised/30 pb-3 mb-4">
              <span className="font-mono text-[9px] text-cyan font-bold uppercase tracking-wider">// UNIVERSAL COMMAND PALETTE</span>
              <button
                onClick={() => setShowSearch(false)}
                className="text-mist hover:text-magenta font-mono text-[10px] transition-colors"
                aria-label="Close command palette"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across documents, projects, skills, timeline nodes, or settings..."
                className="w-full bg-void/60 border border-white/5 focus:border-cyan text-xs px-4 py-3 rounded-lg text-fog placeholder-mist/40 outline-none font-mono transition-all focus:ring-1 focus:ring-cyan/20"
                aria-label="Search query input"
              />
              <div className="flex justify-between items-center text-[9px] font-mono text-mist/60">
                <span>Press Enter to query or filter workspace records</span>
                <span>Ctrl+K to toggle</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
