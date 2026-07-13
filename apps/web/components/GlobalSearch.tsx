"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_CATEGORIES = [
  { key: "pages", label: "Pages", icon: "⬡", color: "text-cyan" },
  { key: "skills", label: "Skills", icon: "◈", color: "text-amber" },
  { key: "projects", label: "Projects", icon: "◆", color: "text-magenta" },
  { key: "certs", label: "Certificates", icon: "★", color: "text-cyan" },
  { key: "commands", label: "Commands", icon: "⌘", color: "text-mist" },
];

const STATIC_RESULTS = [
  { category: "pages", label: "Dashboard", desc: "Your intelligence workspace", href: "/dashboard", icon: "🖥️" },
  { category: "pages", label: "Timeline", desc: "Cinematic career journey", href: "/timeline", icon: "⏳" },
  { category: "pages", label: "Knowledge Graph", desc: "Network of your credentials", href: "/graph", icon: "🕸️" },
  { category: "pages", label: "AI Chat", desc: "Ask your digital twin anything", href: "/chat", icon: "💬" },
  { category: "pages", label: "Portfolio", desc: "Your verified dossier", href: "/portfolio", icon: "💼" },
  { category: "pages", label: "Evolution", desc: "Career time-travel playback", href: "/evolution", icon: "📈" },
  { category: "pages", label: "AI Brain", desc: "Knowledge intelligence explorer", href: "/brain", icon: "🧠" },
  { category: "pages", label: "Career Universe", desc: "Explore career paths", href: "/universe", icon: "🌌" },
  { category: "pages", label: "Recruiter Mode", desc: "Enterprise intelligence view", href: "/recruiter", icon: "🎯" },
  { category: "pages", label: "Settings", desc: "Workspace preferences", href: "/settings", icon: "⚙️" },
  { category: "skills", label: "Python", desc: "Extracted from 3 documents · 5 connections", href: "/graph", icon: "🐍" },
  { category: "skills", label: "Machine Learning", desc: "Linked to 2 certificates · 4 projects", href: "/graph", icon: "🤖" },
  { category: "skills", label: "React / Next.js", desc: "Extracted from Resume.pdf", href: "/graph", icon: "⚛️" },
  { category: "skills", label: "Docker", desc: "Mentioned in resume · 0 project links", href: "/brain", icon: "🐳" },
  { category: "skills", label: "Neo4j / Graph DB", desc: "Core project dependency", href: "/graph", icon: "🕸️" },
  { category: "projects", label: "IdentityOS Platform", desc: "AI Career Operating System · 2026", href: "/portfolio", icon: "🔷" },
  { category: "projects", label: "Semantic Search Engine", desc: "Qdrant + FastAPI vector search", href: "/portfolio", icon: "🔷" },
  { category: "certs", label: "AWS Cloud Practitioner", desc: "Verified · Jan 2024", href: "/timeline", icon: "📜" },
  { category: "certs", label: "TensorFlow Developer", desc: "Verified · Mar 2023", href: "/timeline", icon: "📜" },
  { category: "commands", label: "Enable Demo Mode", desc: "Load sample data for presentation", href: null, icon: "⚡", action: "demo" },
  { category: "commands", label: "Open AI Chat", desc: "Start a conversation with Identity AI", href: "/chat", icon: "💬" },
  { category: "commands", label: "Export Portfolio PDF", desc: "Download your verified dossier", href: "/portfolio", icon: "📥" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = STATIC_RESULTS.filter((r) => {
    const matchesCat = activeCategory === "all" || r.category === activeCategory;
    const matchesQuery = !query || r.label.toLowerCase().includes(query.toLowerCase()) || r.desc.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => setSelectedIndex(0), [query, activeCategory]);

  const handleSelect = useCallback((item: typeof STATIC_RESULTS[0]) => {
    if (item.action === "demo") {
      localStorage.setItem("dis_demo_mode", "true");
      window.dispatchEvent(new Event("demo-mode-changed"));
      window.location.reload();
    } else if (item.href) {
      router.push(item.href);
    }
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelectedIndex((p) => Math.min(p + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setSelectedIndex((p) => Math.max(p - 1, 0));
      if (e.key === "Enter" && filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIndex, handleSelect, onClose]);

  const catColor: Record<string, string> = {
    pages: "text-cyan", skills: "text-amber", projects: "text-magenta", certs: "text-cyan", commands: "text-mist",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-void/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl bg-[#0d1220] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5">
              <span className="text-cyan font-mono text-sm shrink-0">⌕</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, skills, projects, certificates..."
                className="flex-1 bg-transparent text-fog font-mono text-sm outline-none placeholder:text-mist/40"
                aria-label="Global search"
              />
              <kbd className="font-mono text-[9px] text-mist/50 border border-white/10 px-1.5 py-0.5 rounded bg-white/5">ESC</kbd>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/5 overflow-x-auto">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all shrink-0 ${
                  activeCategory === "all" ? "border-cyan/40 bg-cyan/5 text-cyan" : "border-white/5 text-mist hover:border-white/10"
                }`}
              >
                All
              </button>
              {SEARCH_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all shrink-0 ${
                    activeCategory === cat.key ? "border-cyan/40 bg-cyan/5 text-cyan" : "border-white/5 text-mist hover:border-white/10"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <p className="font-mono text-xs text-mist/50">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}
              {filtered.map((item, idx) => (
                <button
                  key={idx}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                    idx === selectedIndex ? "bg-cyan/5 border-l-2 border-l-cyan" : "border-l-2 border-l-transparent hover:bg-white/3"
                  }`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-sm shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-semibold ${idx === selectedIndex ? "text-fog" : "text-fog/80"}`}>
                        {item.label}
                      </span>
                      <span className={`font-mono text-[8px] uppercase tracking-widest ${catColor[item.category] || "text-mist"} opacity-60`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-mist/50 truncate">{item.desc}</p>
                  </div>
                  {idx === selectedIndex && (
                    <kbd className="font-mono text-[9px] text-cyan/60 border border-cyan/20 px-1.5 py-0.5 rounded bg-cyan/5 shrink-0">↵</kbd>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-4 py-2 flex items-center justify-between">
              <span className="font-mono text-[8px] text-mist/40 uppercase tracking-widest">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} · IdentityOS Intelligence Search
              </span>
              <div className="flex items-center gap-3 font-mono text-[8px] text-mist/40">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>esc close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
