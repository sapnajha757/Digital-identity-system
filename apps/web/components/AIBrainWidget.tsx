"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Insight = {
  id: string;
  type: "gap" | "opportunity" | "warning" | "discovery";
  title: string;
  why: string;
  evidence: string;
  impact: string;
  action: string;
  actionHref?: string;
  confidence: number;
  affectedScore: number;
  icon: string;
};

const DEMO_INSIGHTS: Insight[] = [
  {
    id: "i1", type: "gap",
    title: "Resume mentions Docker · Zero projects demonstrate it",
    why: "Your resume lists Docker as a core skill, but the Knowledge Graph found no projects linked to Docker usage. Recruiters may question this claim.",
    evidence: "Source: Resume.pdf (line 14) · Graph: 0 project nodes contain Docker · Confidence: high",
    impact: "Could reduce technical credibility score by 8 points in recruiter evaluation",
    action: "Link a project to Docker in your portfolio",
    confidence: 94, affectedScore: -8, icon: "🐳"
  },
  {
    id: "i2", type: "opportunity",
    title: "3 AI Certificates · Only 1 AI project — imbalance detected",
    why: "You have strong theoretical AI credentials but limited demonstrated AI projects. Employers value practical application equally.",
    evidence: "Sources: TensorFlow Cert, AWS ML Cert, DeepLearning.AI · Graph: 1 project node tagged AI",
    impact: "Adding 1-2 AI projects could increase Identity Score by +12 points",
    action: "Add an AI project to your portfolio",
    confidence: 91, affectedScore: 12, icon: "🤖"
  },
  {
    id: "i3", type: "discovery",
    title: "Internship experience validates your React skills",
    why: "Your ML Internship documentation mentions React dashboard work, which cross-validates your resume skill claim with real-world evidence.",
    evidence: "Source: Internship_Letter.pdf · Resume.pdf · Graph: internship→skill edge created",
    impact: "React skill confidence upgraded from Claimed → Verified",
    action: "View the connection in Knowledge Graph",
    actionHref: "/graph",
    confidence: 88, affectedScore: 5, icon: "⚛️"
  },
  {
    id: "i4", type: "warning",
    title: "Portfolio lacks deployment screenshots for projects",
    why: "Judges and recruiters increasingly expect visual proof of deployed work. Text descriptions alone score lower in profile evaluations.",
    evidence: "Portfolio analysis: 4 projects listed · 0 have deployment screenshots or live links",
    impact: "Portfolio completeness score is 62% — missing visual proof is the top gap",
    action: "Add screenshots to portfolio projects",
    confidence: 85, affectedScore: -15, icon: "📸"
  },
];

const TYPE_COLORS: Record<string, { border: string; bg: string; label: string; labelColor: string }> = {
  gap: { border: "border-amber/30", bg: "bg-amber/5", label: "GAP", labelColor: "text-amber" },
  opportunity: { border: "border-cyan/30", bg: "bg-cyan/5", label: "OPPORTUNITY", labelColor: "text-cyan" },
  warning: { border: "border-magenta/30", bg: "bg-magenta/5", label: "WARNING", labelColor: "text-magenta" },
  discovery: { border: "border-[#7B61FF]/30", bg: "bg-[#7B61FF]/5", label: "DISCOVERY", labelColor: "text-[#7B61FF]" },
};

interface Props {
  demoMode?: boolean;
  compact?: boolean;
}

export function AIBrainWidget({ demoMode, compact }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const insights = demoMode ? DEMO_INSIGHTS.filter((i) => !dismissed.has(i.id)) : [];

  if (insights.length === 0 && demoMode) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
        <span className="text-2xl">🧠</span>
        <p className="font-mono text-xs text-mist/50">All insights reviewed. Upload more documents for new discoveries.</p>
      </div>
    );
  }

  if (!demoMode) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
        <span className="text-xl">🧠</span>
        <p className="font-mono text-xs text-mist/40">Upload documents to activate AI Brain analysis</p>
      </div>
    );
  }

  const displayInsights = compact ? insights.slice(0, 2) : insights;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {displayInsights.map((insight, idx) => {
          const colors = TYPE_COLORS[insight.type];
          const isExpanded = expanded === insight.id;
          return (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30, height: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              className={`border ${colors.border} ${colors.bg} rounded-lg overflow-hidden`}
            >
              <div
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-white/2 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : insight.id)}
              >
                <span className="text-lg shrink-0 mt-0.5">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-[8px] font-bold tracking-widest uppercase ${colors.labelColor}`}>
                      {colors.label}
                    </span>
                    <span className="font-mono text-[8px] text-mist/40">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-fog font-semibold mt-0.5 leading-snug">
                    {insight.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono text-[9px] font-bold ${insight.affectedScore > 0 ? "text-cyan" : "text-magenta"}`}>
                    {insight.affectedScore > 0 ? "+" : ""}{insight.affectedScore}pts
                  </span>
                  <span className="text-mist/40 font-mono text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-3 space-y-2 font-mono text-[9px]">
                      <div>
                        <span className="text-cyan font-bold block">WHY:</span>
                        <p className="text-mist/70 mt-0.5 leading-relaxed">{insight.why}</p>
                      </div>
                      <div>
                        <span className="text-cyan font-bold block">EVIDENCE:</span>
                        <p className="text-mist/70 mt-0.5 leading-relaxed">{insight.evidence}</p>
                      </div>
                      <div>
                        <span className="text-amber font-bold block">IMPACT:</span>
                        <p className="text-mist/70 mt-0.5">{insight.impact}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {insight.actionHref ? (
                          <a
                            href={insight.actionHref}
                            className={`px-3 py-1.5 rounded border ${colors.border} ${colors.labelColor} font-bold uppercase tracking-widest text-[8px] hover:bg-white/5 transition-all`}
                          >
                            → {insight.action}
                          </a>
                        ) : (
                          <span className={`px-3 py-1.5 rounded border ${colors.border} ${colors.labelColor} font-bold uppercase tracking-widest text-[8px] opacity-60`}>
                            ✓ {insight.action}
                          </span>
                        )}
                        <button
                          onClick={() => setDismissed((p) => new Set([...p, insight.id]))}
                          className="px-2 py-1.5 text-[8px] text-mist/40 hover:text-mist transition-colors uppercase tracking-widest"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
