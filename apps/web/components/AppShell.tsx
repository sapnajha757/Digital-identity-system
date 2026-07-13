"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideSidebar = pathname === "/login";
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const paths = ["/", "/timeline", "/graph", "/chat", "/portfolio"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      // Close overlay on Escape
      if (e.key === "Escape") {
        setShowSearch(false);
      }
      // Tab navigation
      if (!hideSidebar && !showSearch && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        if (e.key === "1") router.push(paths[0]);
        if (e.key === "2") router.push(paths[1]);
        if (e.key === "3") router.push(paths[2]);
        if (e.key === "4") router.push(paths[3]);
        if (e.key === "5") router.push(paths[4]);
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
    <div className="relative z-10 flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className={hideSidebar ? "flex-1" : "flex-1 md:pl-64"}>{children}</main>

      {/* Spotlight Command Palette Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-panel border border-panel-raised rounded-lg shadow-2xl p-6 relative">
            <div className="flex justify-between items-center border-b border-panel-raised/50 pb-3 mb-4">
              <span className="font-mono text-[10px] text-cyan font-bold uppercase tracking-wider">COMMAND PALETTE</span>
              <button
                onClick={() => setShowSearch(false)}
                className="text-mist hover:text-magenta font-mono text-xs"
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
                placeholder="Type query (e.g. 'Show FastAPI skills' or 'Academic background')"
                className="w-full bg-void border border-panel-raised focus:border-cyan text-sm px-4 py-3 rounded text-fog placeholder-mist/50 outline-none font-mono"
              />
              <div className="flex justify-between items-center text-[10px] font-mono text-mist">
                <span>Press Enter to query Identity AI</span>
                <span>Ctrl+K to dismiss</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
