"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient, DocumentOut, InsightItem, DashboardMetricsResponse } from "@/lib/api-client";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadControl } from "@/components/UploadControl";
import { HudFrame } from "@/components/HudFrame";
import Link from "next/link";

function StreamingNarrative({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    if (!text) return;
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(idx));
      idx++;
      if (idx >= text.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="relative font-sans text-fog text-sm md:text-base leading-relaxed tracking-wide min-h-[60px]">
      <span>{displayedText}</span>
      {displayedText.length < text.length && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-cyan align-middle animate-pulse" />
      )}
    </div>
  );
}

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const loadDocs = useCallback(() => {
    setLoading(true);
    apiClient
      .listDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const loadInsights = useCallback(() => {
    setInsightsLoading(true);
    apiClient
      .getInsights()
      .then((res) => setInsights(res.insights))
      .catch((err) => console.error("Could not load insights:", err))
      .finally(() => setInsightsLoading(false));
  }, []);

  const loadMetrics = useCallback(() => {
    apiClient
      .getDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.error("Could not load metrics:", err));
  }, []);

  useEffect(() => {
    loadDocs();
    loadInsights();
    loadMetrics();
  }, [loadDocs, loadInsights, loadMetrics]);

  const handleUploadComplete = () => {
    loadDocs();
    setTimeout(() => {
      loadInsights();
      loadMetrics();
    }, 10000); // 10s wait for full pipeline processing to settle before refreshing
  };

  const score = metrics?.identity_score ?? 10;
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 md:px-10 bg-void text-fog min-h-screen space-y-6">
      {/* Premium Hero Banner */}
      <div className="relative border border-cyan/15 bg-panel/20 p-6 md:p-8 rounded-sm shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="font-mono text-[9px] text-magenta tracking-widest uppercase">// IDENTITY.OS CORE WORKSPACE</span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
              Professional Twin Engine.
            </h1>
            <p className="mt-1 text-[11px] text-mist font-mono">
              Ready State: <span className="text-cyan">Synchronized</span> | Score Index: <span className="text-cyan">{score}%</span> | Last Scan: <span className="text-amber">Active</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link 
              href="/portfolio"
              className="px-4 py-2 border border-magenta/30 hover:border-magenta bg-magenta/5 hover:bg-magenta/10 text-magenta font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200"
            >
              [SHARE PORTFOLIO]
            </Link>
            <Link 
              href="/chat"
              className="px-4 py-2 border border-cyan/30 hover:border-cyan bg-cyan/5 hover:bg-cyan/10 text-cyan font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200"
            >
              [ASK ASSISTANT]
            </Link>
          </div>
        </div>
      </div>

      {/* Main Core Centerpieces */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Streaming Career Synopsis Narrative */}
        <div className="lg:col-span-8 flex">
          <HudFrame accent="cyan" className="bg-panel/20 w-full flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-center border-b border-panel-raised/35 pb-2.5">
                <span className="font-mono text-[9px] text-cyan uppercase tracking-widest">// COGNITIVE SYNOPSIS NARRATIVE</span>
                <span className="font-mono text-[9px] text-mist/60 uppercase">Stream Active</span>
              </div>
              <div className="mt-4">
                {metrics?.ai_summary_narrative ? (
                  <StreamingNarrative text={metrics.ai_summary_narrative} />
                ) : (
                  <p className="font-mono text-xs text-mist/50">// Waiting for credentials to evaluate career twin narrative...</p>
                )}
              </div>
            </div>
            <div className="mt-4 text-[9px] font-mono text-mist/65 flex justify-between items-center border-t border-panel-raised/30 pt-3">
              <span>Dynamic evaluation synced</span>
              <span>Updated {new Date(metrics?.updated_at ?? Date.now()).toLocaleTimeString()}</span>
            </div>
          </HudFrame>
        </div>

        {/* Right: Radial Completeness Gauge */}
        <div className="lg:col-span-4 flex">
          <HudFrame accent="magenta" className="bg-panel/20 w-full flex flex-col justify-between items-center p-6 text-center">
            <div className="w-full text-left border-b border-panel-raised/35 pb-2.5">
              <span className="font-mono text-[9px] text-magenta uppercase tracking-widest">// CAPABILITY METRICS</span>
            </div>

            <div className="my-6 relative flex items-center justify-center">
              {/* Radial Circle Gauge */}
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="40" stroke="#150a2e" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" cy="56" r="40" 
                  stroke="#00f0ff" strokeWidth="8" fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-black text-fog tracking-tight">{score}%</span>
                <span className="font-mono text-[8px] text-mist/50 uppercase">Completeness</span>
              </div>
            </div>

            <div className="w-full text-left space-y-1.5 font-mono text-[10px] text-mist/85">
              {metrics?.score_breakdown ? (
                Object.entries(metrics.score_breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-panel-raised/20 pb-1 last:border-0 last:pb-0">
                    <span>{key.split(" ")[0]} index:</span>
                    <span className="text-cyan">+{val}</span>
                  </div>
                ))
              ) : (
                <p className="italic text-mist/40 text-[9px] text-center">// Waiting for breakdown parameters</p>
              )}
            </div>
          </HudFrame>
        </div>
      </div>

      {/* Career Twin & Actions & Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Career Twin Predictions */}
        <div className="lg:col-span-4 space-y-5">
          <div className="border-b border-panel-raised pb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-magenta rounded-full shadow-glow-magenta" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog">Career Twin Metrics</h2>
          </div>

          <div className="bg-panel/10 border border-panel-raised p-5 rounded-sm space-y-3.5 font-mono text-[11px] text-mist">
            <div>
              <span className="text-magenta block text-[9px] uppercase tracking-wider font-bold">// role prediction</span>
              <span className="block text-xs font-semibold text-fog mt-0.5">
                {metrics?.career_twin?.current_role_trend ?? "Undetermined"}
              </span>
            </div>

            <div className="h-px bg-panel-raised/30" />

            <div>
              <span className="text-magenta block text-[9px] uppercase tracking-wider font-bold">// strongest skills</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {metrics?.career_twin?.strongest_skills?.map((skill, idx) => (
                  <span key={idx} className="bg-cyan/5 border border-cyan/20 text-cyan text-[9px] px-2 py-0.5 rounded">
                    {skill}
                  </span>
                )) ?? <span className="italic text-[9px]">Awaiting documents...</span>}
              </div>
            </div>

            <div className="h-px bg-panel-raised/30" />

            <div>
              <span className="text-magenta block text-[9px] uppercase tracking-wider font-bold">// career direction</span>
              <span className="block text-xs text-fog mt-0.5">
                {metrics?.career_twin?.career_direction ?? "Analyzing footprint"}
              </span>
            </div>

            <div className="h-px bg-panel-raised/30" />

            <div>
              <span className="text-magenta block text-[9px] uppercase tracking-wider font-bold">// next recommended skill</span>
              <span className="block text-xs text-cyan mt-0.5 font-bold">
                {metrics?.career_twin?.recommended_next_skill ?? "Upload first certificate"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Col: AI Insights Recommendations */}
        <div className="lg:col-span-4 space-y-5">
          <div className="border-b border-panel-raised pb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan rounded-full shadow-glow-cyan" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog">Intelligence Insights</h2>
          </div>

          {insightsLoading ? (
            <div className="space-y-3">
              <div className="h-28 bg-panel/30 border border-panel-raised rounded animate-pulse" />
              <div className="h-28 bg-panel/30 border border-panel-raised rounded animate-pulse" />
            </div>
          ) : insights.length === 0 ? (
            <div className="border border-panel-raised p-6 rounded text-center text-mist/40 text-xs font-mono">
              // waiting for insights calculation...
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {insights.slice(0, 3).map((insight, idx) => {
                const isGaps = insight.type === "gaps";
                const isHigh = insight.impact === "high";
                const tagColor = isGaps ? "text-magenta border-magenta/25 bg-magenta/5" : isHigh ? "text-cyan border-cyan/25 bg-cyan/5" : "text-amber border-amber/25 bg-amber/5";

                return (
                  <div key={idx} className="border border-panel-raised bg-panel/10 hover:bg-panel/20 p-4 rounded transition-all">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border ${tagColor}`}>
                        {insight.type}
                      </span>
                      <span className="text-[9px] font-mono text-mist/60 uppercase">
                        {insight.impact} priority
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-semibold font-display text-fog">{insight.title}</h3>
                    <p className="mt-1 text-[11px] text-mist leading-relaxed font-sans">{insight.description}</p>
                    <div className="mt-3 text-[10px] font-mono text-cyan bg-void/60 p-2 rounded border border-panel-raised/20">
                      → {insight.actionable_step}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Ingestion Gate & File queue */}
        <div className="lg:col-span-4 space-y-5">
          <div className="border-b border-panel-raised pb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber rounded-full" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog">Ingestion Queue</h2>
          </div>

          <div className="bg-panel/10 border border-panel-raised p-4 rounded-sm">
            <UploadControl onUploaded={handleUploadComplete} />
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {documents.slice(0, 3).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Ask snippet */}
      <div className="border border-panel-raised p-5 bg-panel/10 rounded flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-left">
          <h4 className="font-display text-sm font-bold text-fog uppercase">Ask IdentityOS AI Anything</h4>
          <p className="text-xs text-mist mt-0.5 leading-relaxed">Ask questions directly about your credentials and get verified answers with citations.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/chat"
            className="px-4 py-2 border border-cyan/40 hover:border-cyan text-cyan bg-cyan/5 font-mono text-[10px] uppercase tracking-wider rounded transition-all"
          >
            [Ask: &quot;Show my Python skills&quot;]
          </Link>
          <Link 
            href="/chat"
            className="px-4 py-2 border border-cyan/40 hover:border-cyan text-cyan bg-cyan/5 font-mono text-[10px] uppercase tracking-wider rounded transition-all"
          >
            [Ask: &quot;Explain my internships&quot;]
          </Link>
        </div>
      </div>
    </div>
  );
}
