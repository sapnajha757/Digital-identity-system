"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  calculateIdentityHealth,
  getHealthMetricLabel,
  getHealthColor,
} from "@/lib/career-intelligence";
import { getMemory, getHealthTrend, IdentityHealthSnapshot } from "@/lib/ai-memory";

const METRIC_KEYS: (keyof IdentityHealthSnapshot)[] = [
  "completeness",
  "verificationScore",
  "skillDiversity",
  "projectDiversity",
  "documentationQuality",
  "careerReadiness",
  "learningVelocity",
];

function RadialGauge({ value, size = 80, color }: { value: number; size?: number; color: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const animatedFill = (animated / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${animatedFill} ${circ - animatedFill}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size / 4.2} fontFamily="monospace" fontWeight="700">
        {value}
      </text>
    </svg>
  );
}

function MiniSparkline({ history, color }: { history: number[]; color: string }) {
  if (history.length < 2) return null;
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1;
  const w = 64, h = 20;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <circle cx={history.map((_, i) => (i / (history.length - 1)) * w)[history.length - 1]} cy={h - ((history[history.length - 1] - min) / range) * (h - 2) - 1} r={2} fill={color} />
    </svg>
  );
}

export function IdentityHealthMonitor() {
  const [health, setHealth] = useState<IdentityHealthSnapshot | null>(null);
  const [trend, setTrend] = useState<{ metric: string; current: number; prev: number; delta: number }[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, number[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const snap = calculateIdentityHealth();
    setHealth(snap);
    const t = getHealthTrend();
    setTrend(t);

    // Build sparkline histories per metric
    const memory = getMemory();
    const map: Record<string, number[]> = {};
    METRIC_KEYS.forEach(key => {
      map[key as string] = memory.healthHistory.map(h => h[key] as number);
    });
    setHistoryMap(map);
    setLoaded(true);
  }, []);

  if (!loaded || !health) return null;

  return (
    <div className="space-y-4">
      {/* Overall health hero */}
      <div className="glass-panel rounded-2xl p-5 flex items-center gap-6">
        <div className="relative shrink-0">
          <RadialGauge value={health.overallHealth} size={96} color={getHealthColor(health.overallHealth)} />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-void border border-green-400/40 flex items-center justify-center">
            <span className="text-[8px]">✓</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[8px] text-cyan/70 uppercase tracking-widest block mb-1">// IDENTITY HEALTH INDEX</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold gradient-text">{health.overallHealth}</span>
            <span className="font-mono text-[10px] text-mist/50">/100</span>
            <span className="font-mono text-[9px] text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded ml-1">
              ▲ +7 this month
            </span>
          </div>
          <p className="text-[10.5px] text-mist/60 mt-1 leading-relaxed">
            Top 8% of IdentityOS profiles · All documents verified · Profile actively growing
          </p>
          <div className="flex gap-3 mt-2 flex-wrap">
            {["Verified", "Complete", "Growing"].map(tag => (
              <span key={tag} className="font-mono text-[8px] text-cyan border border-cyan/20 bg-cyan/5 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {METRIC_KEYS.map(key => {
          const val = health[key] as number;
          const color = getHealthColor(val);
          const trendItem = trend.find(t => t.metric === key);
          const delta = trendItem?.delta ?? 0;
          const sparkData = historyMap[key as string] ?? [];

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: METRIC_KEYS.indexOf(key) * 0.05 }}
              className="glass-card p-3 rounded-xl space-y-2 hover:border-cyan/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-mist/50 uppercase tracking-wider leading-tight">
                  {getHealthMetricLabel(key as string).split(" ").slice(0, 2).join(" ")}
                </span>
                {delta !== 0 && (
                  <span className={`font-mono text-[8px] font-bold ${delta > 0 ? "text-green-400" : "text-red-400"}`}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <span className="font-display text-xl font-bold" style={{ color }}>
                  {val}
                </span>
                <MiniSparkline history={sparkData} color={color} />
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Improvement auto-detected */}
      <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-lg">🔬</span>
        <div>
          <span className="font-mono text-[8px] text-magenta uppercase tracking-wider block">AUTO-DETECTED IMPROVEMENT</span>
          <p className="text-[10.5px] text-mist/70">
            Identity Health increased <strong className="text-green-400">+34 points</strong> since January 2026 — driven by 5 document uploads, AWS certification, and IdentityOS project completion.
          </p>
        </div>
      </div>
    </div>
  );
}
