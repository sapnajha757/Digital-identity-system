"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IdentityHealthMonitor } from "@/components/IdentityHealthMonitor";
import { ProactiveNotifications } from "@/components/ProactiveNotifications";
import {
  getSmartRecommendations,
  SmartRecommendation,
  getATSAnalysis,
  getPortfolioEvaluation,
} from "@/lib/career-intelligence";
import { getMemory, getMemorySummary, daysSinceResumeUpdate } from "@/lib/ai-memory";

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

const CONFIDENCE_BAR = (confidence: number, color: string) => (
  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
    <motion.div
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      animate={{ width: `${confidence * 100}%` }}
      transition={{ duration: 1.0, ease: "easeOut" }}
    />
  </div>
);

type Section = "health" | "notifications" | "recommendations" | "memory" | "ats" | "portfolio";

export default function IntelligencePage() {
  const [activeSection, setActiveSection] = useState<Section>("health");
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [memorySummary, setMemorySummary] = useState("");
  const [daysSince, setDaysSince] = useState<number | null>(null);
  const [ats, setAts] = useState(getATSAnalysis());
  const [portfolio, setPortfolio] = useState(getPortfolioEvaluation());
  const memory = getMemory();

  useEffect(() => {
    setRecommendations(getSmartRecommendations());
    setMemorySummary(getMemorySummary());
    setDaysSince(daysSinceResumeUpdate());
  }, []);

  const filteredRecs = filterType === "all"
    ? recommendations
    : recommendations.filter(r => r.type === filterType);

  const recTypes = ["all", ...Array.from(new Set(recommendations.map(r => r.type)))];

  const SECTIONS: { id: Section; label: string; icon: string }[] = [
    { id: "health", label: "Identity Health", icon: "❤️" },
    { id: "notifications", label: "AI Alerts", icon: "🔔" },
    { id: "recommendations", label: "Recommendations", icon: "⚡" },
    { id: "memory", label: "AI Memory", icon: "🧠" },
    { id: "ats", label: "Resume Optimizer", icon: "📋" },
    { id: "portfolio", label: "Portfolio Intel", icon: "💼" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <span className="font-mono text-[9px] text-cyan/60 uppercase tracking-widest block mb-1">// PHASE 8 · AUTONOMOUS INTELLIGENCE</span>
        <h1 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-2">
          AI Intelligence Hub
        </h1>
        <p className="text-sm text-mist/60 max-w-xl">
          Your personal AI Chief of Staff monitors, analyzes, and predicts — without waiting to be asked.
        </p>
        <div className="mt-3 font-mono text-[9px] text-mist/40 bg-void/40 border border-white/5 rounded-lg px-3 py-2 inline-block">
          {memorySummary}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
              activeSection === s.id
                ? "bg-cyan/10 border-cyan/30 text-cyan"
                : "border-white/5 text-mist/50 hover:border-white/10 hover:text-mist/70"
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden md:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* HEALTH */}
          {activeSection === "health" && (
            <div>
              <IdentityHealthMonitor />
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-1">AI PROACTIVE ALERTS</span>
                <p className="text-[10.5px] text-mist/60">The AI monitors your profile continuously and surfaces insights before you ask.</p>
              </div>
              <ProactiveNotifications />
            </div>
          )}

          {/* RECOMMENDATIONS */}
          {activeSection === "recommendations" && (
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block">SMART RECOMMENDATIONS</span>
                  <p className="text-[10.5px] text-mist/60 mt-0.5">Ranked by impact · Grounded in your documents · Confidence scored</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {recTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`font-mono text-[8px] uppercase px-2.5 py-1 rounded border transition-all ${
                        filterType === t ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/5 text-mist/40 hover:text-mist/60"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {filteredRecs.map((rec, i) => {
                  const priorityColor = rec.priority === "critical" ? "#f87171" : rec.priority === "high" ? "#fbbf24" : rec.priority === "medium" ? "#4F8CFF" : "#4ade80";
                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-card p-4 rounded-xl space-y-3 border border-white/5 hover:border-cyan/20"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{CATEGORY_ICONS[rec.type]}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[8px] font-bold uppercase" style={{ color: priorityColor }}>
                                {rec.priority}
                              </span>
                              <span className="font-mono text-[8px] text-mist/40 capitalize">{rec.type}</span>
                            </div>
                            <h3 className="text-[11px] font-bold text-fog leading-snug">{rec.title}</h3>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-[10px] font-bold" style={{ color: priorityColor }}>
                            {Math.round(rec.confidence * 100)}%
                          </div>
                          <div className="font-mono text-[7.5px] text-mist/40">confidence</div>
                        </div>
                      </div>

                      {/* Why */}
                      <div className="bg-void/50 border border-white/5 rounded-lg p-2.5">
                        <span className="font-mono text-[7.5px] text-cyan/60 block mb-1">// WHY THIS MATTERS</span>
                        <p className="text-[10px] text-mist/60 leading-relaxed italic">&ldquo;{rec.why}&rdquo;</p>
                      </div>

                      {/* Evidence */}
                      <div>
                        <span className="font-mono text-[7.5px] text-cyan/50 block mb-1">EVIDENCE ({rec.evidence.length} sources)</span>
                        {rec.evidence.map((e, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 mb-0.5">
                            <span className="text-cyan/40 text-[8px] mt-0.5 shrink-0">→</span>
                            <span className="text-[9px] text-mist/50">{e}</span>
                          </div>
                        ))}
                      </div>

                      {/* Confidence bar */}
                      {CONFIDENCE_BAR(rec.confidence, priorityColor)}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="text-[9px] text-cyan font-mono font-bold">{rec.estimatedImpact}</div>
                          <div className="font-mono text-[8px] text-mist/40">{rec.timeToComplete}</div>
                        </div>
                        {rec.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="font-mono text-[7.5px] text-mist/40 border border-white/5 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEMORY CENTER */}
          {activeSection === "memory" && (
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-5">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">// AI MEMORY CENTER</span>
                <p className="text-[10.5px] text-mist/60 mb-4">
                  The AI remembers everything — conversations, recommendations, uploaded documents, previous advice. It never repeats itself and evolves its guidance over time.
                </p>
                <div className="font-mono text-[9px] text-mist/50 bg-void/40 border border-white/5 rounded-lg px-3 py-2">{memorySummary}</div>
              </div>

              {/* Documents memory */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">INDEXED DOCUMENTS</span>
                <div className="space-y-2">
                  {memory.documents.map(doc => (
                    <div key={doc.id} className="bg-void/40 border border-white/5 rounded-lg p-3 flex items-start gap-3">
                      <span className="text-lg mt-0.5">📄</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-fog">{doc.filename}</div>
                        <div className="font-mono text-[8px] text-mist/40 capitalize mb-1">{doc.category} · {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                        <div className="flex flex-wrap gap-1">
                          {doc.extractedSkills.map(skill => (
                            <span key={skill} className="font-mono text-[7.5px] text-cyan/60 border border-cyan/15 bg-cyan/5 px-1.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                        {doc.summary && <p className="text-[9px] text-mist/50 mt-1.5 italic">{doc.summary}</p>}
                      </div>
                      <span className="font-mono text-[8px] text-green-400 shrink-0">✓ Indexed</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation history */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">RECOMMENDATION HISTORY</span>
                <div className="space-y-1.5">
                  {memory.recommendations.map(rec => (
                    <div key={rec.id} className="flex items-center gap-3 bg-void/30 border border-white/5 rounded-lg px-3 py-2">
                      <span className="text-sm">{CATEGORY_ICONS[rec.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-medium text-fog truncate">{rec.title}</div>
                        <div className="font-mono text-[7.5px] text-mist/40">{new Date(rec.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`font-mono text-[8px] font-bold capitalize ${
                        rec.status === "accepted" ? "text-green-400" :
                        rec.status === "rejected" ? "text-red-400" :
                        rec.status === "dismissed" ? "text-mist/30" :
                        "text-amber-400"
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation memory */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">REMEMBERED CONVERSATIONS</span>
                <div className="space-y-2">
                  {memory.conversations.map(conv => (
                    <div key={conv.id} className="bg-void/30 border border-white/5 rounded-lg p-3">
                      <div className="font-mono text-[7.5px] text-mist/30 mb-1">{new Date(conv.timestamp).toLocaleString()}</div>
                      <div className="text-[10px] text-cyan/70 font-semibold mb-1">Q: {conv.query}</div>
                      <div className="text-[9.5px] text-mist/50 leading-relaxed">{conv.answer}</div>
                      <div className="flex gap-1.5 mt-1.5">
                        {conv.topics.map(t => (
                          <span key={t} className="font-mono text-[7px] text-mist/30 border border-white/5 px-1 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ATS / RESUME OPTIMIZER */}
          {activeSection === "ats" && (
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-1">AI RESUME OPTIMIZER</span>
                    <p className="text-[10.5px] text-mist/60">ATS analysis powered by document intelligence from your uploaded resume.</p>
                    {daysSince !== null && daysSince > 30 && (
                      <div className="mt-2 font-mono text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
                        ⚠ Resume last updated {daysSince} days ago — likely outdated
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-display text-4xl font-bold gradient-text">{ats.score}</div>
                      <div className="font-mono text-[8px] text-mist/50 uppercase">ATS SCORE</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 font-display text-xl font-bold"
                      style={{ borderColor: ats.overallGrade.startsWith("A") ? "#4ade80" : ats.overallGrade.startsWith("B") ? "#4F8CFF" : "#f87171",
                               color: ats.overallGrade.startsWith("A") ? "#4ade80" : ats.overallGrade.startsWith("B") ? "#4F8CFF" : "#f87171" }}>
                      {ats.overallGrade}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Grammar", value: ats.grammarScore, color: "#4ade80" },
                  { label: "Keywords", value: ats.keywordScore, color: "#fbbf24" },
                  { label: "Action Verbs", value: ats.actionVerbScore, color: "#4F8CFF" },
                  { label: "Technical", value: ats.technicalScore, color: "#7B61FF" },
                  { label: "Impact", value: ats.impactScore, color: "#f87171" },
                  { label: "Leadership", value: ats.leadershipScore, color: "#fb923c" },
                ].map(item => (
                  <div key={item.label} className="glass-card rounded-xl p-3">
                    <div className="font-mono text-[8px] text-mist/50 uppercase mb-1">{item.label}</div>
                    <div className="font-display text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">AI SUGGESTIONS ({ats.suggestions.length})</span>
                <div className="space-y-3">
                  {ats.suggestions.map(s => (
                    <div key={s.id} className={`border rounded-xl p-3.5 ${
                      s.priority === "high" ? "border-red-500/30 bg-red-500/5" : "border-white/5 bg-void/30"
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`font-mono text-[8px] font-bold uppercase shrink-0 ${
                          s.priority === "high" ? "text-red-400" : s.priority === "medium" ? "text-amber-400" : "text-mist/50"
                        }`}>{s.priority}</span>
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold text-fog mb-1">{s.issue}</div>
                          <div className="text-[10px] text-mist/60 mb-1.5">{s.fix}</div>
                          {s.example && (
                            <div className="bg-void/60 border border-white/5 rounded-lg p-2">
                              <span className="font-mono text-[7.5px] text-cyan/60 block mb-0.5">EXAMPLE</span>
                              <span className="text-[9px] text-mist/50 italic">{s.example}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[8px] text-mist/30 capitalize shrink-0">{s.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing keywords */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">MISSING HIGH-VALUE KEYWORDS</span>
                <div className="flex flex-wrap gap-2">
                  {ats.missingKeywords.map(kw => (
                    <span key={kw} className="font-mono text-[9px] text-red-400 border border-red-500/30 bg-red-500/5 px-2.5 py-1 rounded-lg">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strong points */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-green-400/60 uppercase tracking-widest block mb-3">STRONG POINTS ✓</span>
                <div className="space-y-1.5">
                  {ats.strongPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-400 text-[10px] shrink-0 mt-0.5">✓</span>
                      <span className="text-[10.5px] text-mist/70">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PORTFOLIO INTELLIGENCE */}
          {activeSection === "portfolio" && (
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-1">PORTFOLIO INTELLIGENCE ENGINE</span>
                    <p className="text-[10.5px] text-mist/60">AI evaluation of your GitHub, documentation, deployment quality, and project diversity.</p>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-4xl font-bold gradient-text">{portfolio.overallScore}</div>
                    <div className="font-mono text-[8px] text-mist/50 uppercase">Overall Score</div>
                  </div>
                </div>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: "GitHub", value: portfolio.githubScore, color: "#7B61FF" },
                  { label: "Documentation", value: portfolio.documentationScore, color: "#4F8CFF" },
                  { label: "Deployment", value: portfolio.deploymentScore, color: "#f87171" },
                  { label: "Complexity", value: portfolio.complexityScore, color: "#4ade80" },
                  { label: "Diversity", value: portfolio.diversityScore, color: "#fbbf24" },
                  { label: "README Quality", value: portfolio.readmeScore, color: "#fb923c" },
                ].map(item => (
                  <div key={item.label} className="glass-card rounded-xl p-3">
                    <div className="font-mono text-[8px] text-mist/50 uppercase mb-1">{item.label}</div>
                    <div className="font-display text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="glass-card rounded-xl p-4">
                <span className="font-mono text-[8px] text-cyan/60 uppercase tracking-widest block mb-3">IMPROVEMENT SUGGESTIONS</span>
                <div className="space-y-2.5">
                  {portfolio.suggestions.map(s => (
                    <div key={s.id} className={`border rounded-xl p-3.5 ${
                      s.impact === "high" ? "border-red-500/30 bg-red-500/5" :
                      s.impact === "medium" ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className={`font-mono text-[8px] font-bold uppercase shrink-0 ${
                          s.impact === "high" ? "text-red-400" : s.impact === "medium" ? "text-amber-400" : "text-mist/50"
                        }`}>{s.impact}</span>
                        <div>
                          <div className="text-[11px] font-semibold text-fog mb-0.5">{s.issue}</div>
                          <div className="text-[10px] text-mist/60">{s.fix}</div>
                          <div className="font-mono text-[7.5px] text-mist/30 mt-1 capitalize">{s.area}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4">
                  <span className="font-mono text-[8px] text-green-400/60 uppercase tracking-widest block mb-3">STRENGTHS ✓</span>
                  <div className="space-y-1.5">
                    {portfolio.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-green-400 text-[10px] shrink-0">✓</span>
                        <span className="text-[10px] text-mist/70">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <span className="font-mono text-[8px] text-red-400/60 uppercase tracking-widest block mb-3">GAPS ✗</span>
                  <div className="space-y-1.5">
                    {portfolio.gaps.map((g, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400 text-[10px] shrink-0">✗</span>
                        <span className="text-[10px] text-mist/70">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
