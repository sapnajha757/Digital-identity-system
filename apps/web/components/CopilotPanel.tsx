"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getSmartRecommendations, SmartRecommendation, generateProactiveNotifications } from "@/lib/career-intelligence";
import { getMemorySummary, getMemory } from "@/lib/ai-memory";

const CATEGORY_ICONS: Record<string, string> = {
  skill: "⚡",
  project: "🛠️",
  course: "📚",
  certification: "🏅",
  hackathon: "🔥",
  internship: "🏢",
  resume: "📋",
  portfolio: "💼",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#f87171",
  high: "#fbbf24",
  medium: "#4F8CFF",
  low: "#4ade80",
};

type Tab = "briefing" | "recommendations" | "memory" | "actions";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export function CopilotPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("briefing");
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [memorySummary, setMemorySummary] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecommendations(getSmartRecommendations());
    setMemorySummary(getMemorySummary());
    setNotificationCount(generateProactiveNotifications().length);
    setMessages([
      {
        role: "assistant",
        content: "Good evening! I've analyzed your identity profile. You're at **92% health** — excellent progress since January. I have 6 active recommendations and 5 proactive alerts waiting for you. What would you like to focus on today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const QUICK_RESPONSES = [
    "What's my biggest career gap?",
    "Should I learn Kubernetes now?",
    "How can I improve my ATS score?",
    "What's my 90-day plan?",
    "Which projects should I showcase?",
  ];

  const AI_RESPONSES: Record<string, string> = {
    "What's my biggest career gap?": "Based on your 5 documents, your **biggest gap is quantified impact metrics** — your resume describes what you built but not the results. Add numbers: latency improvements, dataset sizes, user counts. This alone can increase your ATS score from 68 to 86+. Second gap: **Kubernetes** — you have Docker + AWS but no K8s evidence, blocking you from 40% of senior roles.",
    "Should I learn Kubernetes now?": "**Yes, immediately.** Your Docker expertise + AWS certification creates the perfect foundation. Kubernetes appears in 92% of AI Infrastructure and Senior Cloud roles you'd qualify for. The CKA certification takes ~8 weeks. At your skill level, you could realistically complete it in 6 weeks. I've already added this to your 90-day roadmap.",
    "How can I improve my ATS score?": "Your current ATS score is **68/100 (Grade B)**. To reach 90+: 1) Quantify all achievements with metrics, 2) Add CI/CD, Kubernetes, MLOps, System Design keywords, 3) Group your skills section by category, 4) Add a 'Leadership & Collaboration' bullet to each role. These changes take ~3 hours but can double your interview response rate.",
    "What's my 90-day plan?": "Here's your **personalized 90-day roadmap**: Week 1-2: Resume + portfolio overhaul with screenshots and live URLs. Week 3-4: Kubernetes fundamentals. Week 4-5: MLflow + MLOps pipeline. Week 5-7: Build LLM Agent project (crown jewel). Week 7-9: Open source contribution. Week 9-11: Mock interview preparation. Week 11-12: Apply to 25 curated roles. Success probability: 84%.",
    "Which projects should I showcase?": "Ranked by recruiter impact: **1) IdentityOS** (shows AI systems thinking, full-stack, multi-DB — exceptional). **2) ML Pipeline with PyTorch** (shows production ML). **3) React Analytics Dashboard** (shows frontend depth). Action items: Deploy all three live, add READMEs with architecture diagrams, record a 2-minute demo video for each. These three alone are stronger than most candidates' entire portfolios.",
  };

  const handleSend = async (msg?: string) => {
    const query = msg ?? input.trim();
    if (!query) return;
    setInput("");
    const userMsg: Message = { role: "user", content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    setTyping(false);
    const answer = AI_RESPONSES[query] ?? `Analyzing your profile for: "${query}". Based on your 5 uploaded documents and career trajectory, I recommend focusing on the Kubernetes gap first — it's the highest-leverage move given your current Docker + AWS foundation. Would you like a specific action plan?`;
    setMessages(prev => [...prev, { role: "assistant", content: answer, timestamp: new Date().toISOString() }]);
  };

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "briefing", label: "BRIEFING" },
    { id: "recommendations", label: "INSIGHTS", badge: recommendations.filter(r => !acceptedIds.has(r.id) && !dismissedIds.has(r.id)).length },
    { id: "memory", label: "MEMORY" },
    { id: "actions", label: "CHAT" },
  ];

  const memory = getMemory();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-void/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 right-0 z-50 w-[22rem] md:w-[26rem] border-l border-panel-raised bg-[#0B1220]/97 backdrop-blur-2xl flex flex-col h-full"
            aria-label="AI Workspace Copilot"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="border-b border-white/5 px-5 py-4 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan" />
                    </span>
                    <span className="font-mono text-[8px] text-cyan font-bold uppercase tracking-widest">// AI CHIEF OF STAFF ACTIVE</span>
                  </div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-fog">Workspace Copilot V2</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-[10px] font-mono text-mist hover:text-magenta border border-panel-raised px-2.5 py-1 rounded bg-void/60 transition-colors"
                  aria-label="Close copilot"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 font-mono text-[8px] uppercase tracking-wider px-2 py-1.5 rounded-lg transition-all border ${
                      activeTab === tab.id
                        ? "bg-cyan/10 border-cyan/30 text-cyan"
                        : "border-transparent text-mist/50 hover:text-mist hover:border-white/5"
                    }`}
                  >
                    {tab.label}
                    {tab.badge ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan text-void font-bold text-[8px] flex items-center justify-center">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              {/* BRIEFING TAB */}
              {activeTab === "briefing" && (
                <div className="p-4 space-y-4">
                  <div className="bg-void/40 border border-cyan/10 rounded-xl p-4">
                    <span className="font-mono text-[8px] text-magenta uppercase tracking-widest block mb-2">// TODAY&apos;S AI BRIEFING</span>
                    <p className="text-[11px] text-mist/80 leading-relaxed">
                      Your identity profile is at <strong className="text-cyan">92% health</strong> — up from 85% last month. You have <strong className="text-amber-400">{recommendations.filter(r => r.priority === "critical").length} critical recommendations</strong> and <strong className="text-cyan">{notificationCount} active insights</strong>.
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Documents", value: memory.documents.length, color: "#4F8CFF" },
                      { label: "Skills", value: memory.extractedSkills.length, color: "#7B61FF" },
                      { label: "Insights", value: notificationCount, color: "#f59e0b" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-void/40 border border-white/5 rounded-lg p-3 text-center">
                        <div className="font-display text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="font-mono text-[8px] text-mist/50 uppercase mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top recommendations preview */}
                  <div>
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-2">TOP PRIORITY ACTIONS</span>
                    <div className="space-y-2">
                      {recommendations.filter(r => r.priority === "critical").slice(0, 3).map(rec => (
                        <div key={rec.id} className="flex items-start gap-2.5 bg-void/40 border border-red-500/20 rounded-lg p-2.5">
                          <span className="text-sm shrink-0 mt-0.5">{CATEGORY_ICONS[rec.type]}</span>
                          <div className="min-w-0">
                            <div className="text-[10.5px] font-semibold text-fog truncate">{rec.title}</div>
                            <div className="font-mono text-[8.5px] text-mist/50 mt-0.5">{rec.timeToComplete}</div>
                          </div>
                          <span className="font-mono text-[8px] text-red-400 shrink-0 font-bold">CRITICAL</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nav shortcuts */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[8px] text-mist/40 uppercase tracking-wider block">QUICK NAVIGATE</span>
                    {[
                      { label: "AI Intelligence Hub", href: "/intelligence", icon: "🧠" },
                      { label: "Career Planner", href: "/planner", icon: "🗺️" },
                      { label: "Career Simulator", href: "/simulator", icon: "🔭" },
                      { label: "Explainability", href: "/explainability", icon: "🔍" },
                    ].map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 font-mono text-[9.5px] text-mist/70 hover:text-cyan border border-transparent hover:border-cyan/20 hover:bg-cyan/5 px-3 py-2 rounded-lg transition-all"
                      >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                        <span className="ml-auto text-mist/30">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDATIONS TAB */}
              {activeTab === "recommendations" && (
                <div className="p-4 space-y-3">
                  <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block">
                    {recommendations.filter(r => !acceptedIds.has(r.id) && !dismissedIds.has(r.id)).length} ACTIVE · RANKED BY IMPACT
                  </span>
                  {recommendations
                    .filter(r => !dismissedIds.has(r.id))
                    .map(rec => {
                      const isAccepted = acceptedIds.has(rec.id);
                      return (
                        <motion.div
                          key={rec.id}
                          layout
                          className={`border rounded-xl p-3.5 transition-all ${
                            isAccepted ? "border-green-500/30 bg-green-500/5" : "border-panel-raised bg-void/40 hover:border-cyan/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{CATEGORY_ICONS[rec.type]}</span>
                              <div>
                                <span className="font-mono text-[8px] uppercase tracking-wider font-bold"
                                  style={{ color: PRIORITY_COLORS[rec.priority] }}>
                                  {rec.priority}
                                </span>
                                <h4 className="text-[11px] font-semibold text-fog leading-tight">{rec.title}</h4>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                              <span className="font-mono text-[8px] text-cyan border border-cyan/20 bg-cyan/5 px-1.5 py-0.5 rounded">
                                {Math.round(rec.confidence * 100)}%
                              </span>
                            </div>
                          </div>

                          <p className="text-[10px] text-mist/60 leading-relaxed mb-2">{rec.why}</p>

                          <div className="bg-void/60 border border-white/5 rounded-lg p-2 mb-2.5">
                            <span className="font-mono text-[8px] text-cyan/60 block mb-1">EVIDENCE</span>
                            {rec.evidence.slice(0, 2).map((e, i) => (
                              <div key={i} className="flex items-start gap-1 text-[9px] text-mist/50">
                                <span className="text-cyan/40 shrink-0">→</span>
                                <span>{e}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[8px] text-mist/40">{rec.timeToComplete}</span>
                            {!isAccepted ? (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setDismissedIds(prev => new Set([...prev, rec.id]))}
                                  className="font-mono text-[8px] text-mist/40 hover:text-mist/70 px-2 py-1 rounded border border-white/5 transition-colors"
                                >
                                  Dismiss
                                </button>
                                <button
                                  onClick={() => setAcceptedIds(prev => new Set([...prev, rec.id]))}
                                  className="font-mono text-[8px] text-cyan border border-cyan/30 bg-cyan/5 hover:bg-cyan/15 px-2 py-1 rounded transition-all"
                                >
                                  Accept →
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono text-[8px] text-green-400">✓ Accepted</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}

              {/* MEMORY TAB */}
              {activeTab === "memory" && (
                <div className="p-4 space-y-4">
                  <div className="bg-void/40 border border-white/5 rounded-xl p-3">
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-2">MEMORY INDEX</span>
                    <p className="text-[10px] text-mist/60">{memorySummary}</p>
                  </div>

                  <div>
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-2">INDEXED DOCUMENTS</span>
                    <div className="space-y-1.5">
                      {memory.documents.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2.5 bg-void/30 border border-white/5 rounded-lg px-3 py-2">
                          <span className="text-xs">📄</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-medium text-fog truncate">{doc.filename}</div>
                            <div className="font-mono text-[8px] text-mist/40 capitalize">{doc.category}</div>
                          </div>
                          <span className="font-mono text-[8px] text-green-400 shrink-0">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-2">RECENT CONVERSATIONS</span>
                    <div className="space-y-2">
                      {memory.conversations.slice(0, 3).map(conv => (
                        <div key={conv.id} className="bg-void/30 border border-white/5 rounded-lg p-2.5">
                          <div className="font-mono text-[8px] text-mist/40 mb-1">{new Date(conv.timestamp).toLocaleDateString()}</div>
                          <div className="text-[10px] text-cyan/70 font-medium mb-1">{conv.query}</div>
                          <div className="text-[9.5px] text-mist/50 leading-relaxed line-clamp-2">{conv.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-2">ADVISED TOPICS (WON&apos;T REPEAT)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {memory.advisedTopics.map(topic => (
                        <span key={topic} className="font-mono text-[8px] text-mist/40 border border-white/5 px-2 py-0.5 rounded bg-void/30">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CHAT TAB */}
              {activeTab === "actions" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2.5 ${
                          msg.role === "user"
                            ? "bg-cyan/15 border border-cyan/20 text-fog"
                            : "bg-void/60 border border-white/5 text-mist/80"
                        }`}>
                          {msg.role === "assistant" && (
                            <span className="font-mono text-[8px] text-cyan/60 block mb-1">AI COPILOT</span>
                          )}
                          <p className="text-[10.5px] leading-relaxed whitespace-pre-wrap">
                            {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                          <div className="font-mono text-[7.5px] text-mist/30 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex justify-start">
                        <div className="bg-void/60 border border-white/5 rounded-xl px-3 py-2.5">
                          <span className="font-mono text-[8px] text-cyan/60 block mb-1">AI COPILOT</span>
                          <div className="flex gap-1 items-center h-4">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 border-t border-white/5 space-y-2 shrink-0">
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_RESPONSES.slice(0, 3).map(q => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          className="font-mono text-[8px] text-mist/50 hover:text-cyan border border-white/5 hover:border-cyan/20 px-2 py-1 rounded-lg transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <form
                      onSubmit={e => { e.preventDefault(); handleSend(); }}
                      className="flex gap-2"
                    >
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your career..."
                        className="flex-1 bg-void/60 border border-white/5 focus:border-cyan text-[10.5px] px-3 py-2 rounded-lg text-fog placeholder-mist/30 outline-none font-mono transition-all"
                        aria-label="Chat input"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-cyan/10 border border-cyan/30 hover:bg-cyan/20 rounded-lg font-mono text-[9px] text-cyan transition-all"
                        aria-label="Send message"
                      >
                        →
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
