"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient, DocumentOut, InsightItem, DashboardMetricsResponse } from "@/lib/api-client";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadControl } from "@/components/UploadControl";
import { HudFrame } from "@/components/HudFrame";
import Link from "next/link";

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
    }, 4500);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Top Banner / Hero HUD */}
      <div className="relative border border-cyan/25 bg-panel/30 p-6 md:p-8 rounded-sm shadow-glow-cyan/5 overflow-hidden">
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-[10px] text-magenta tracking-widest uppercase">// IDENTITY.OS SYSTEM ACTIVE</span>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-fog">
              Workspace Core.
            </h1>
            <p className="mt-1 text-xs text-mist font-mono">
              Host Environment: <span className="text-cyan">Live Production Node</span> | Connected as local client
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/portfolio"
              className="px-4 py-2 border border-magenta/40 hover:border-magenta bg-magenta/5 text-magenta font-mono text-[11px] uppercase tracking-wider rounded transition-all duration-200"
            >
              [SHARE PORTFOLIO]
            </Link>
            <Link 
              href="/chat"
              className="px-4 py-2 border border-cyan/40 hover:border-cyan bg-cyan/5 text-cyan font-mono text-[11px] uppercase tracking-wider rounded transition-all duration-200"
            >
              [ASK IDENTITY AI]
            </Link>
          </div>
        </div>
      </div>

      {/* Narrative & Score Centerpiece Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: AI Summary Narrative */}
        <div className="lg:col-span-8">
          <HudFrame accent="cyan" className="bg-panel/40 h-full flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-cyan uppercase tracking-widest">// AI SYNOPSIS NARRATIVE</span>
              <p className="mt-4 font-display text-md md:text-lg leading-relaxed text-fog tracking-wide">
                &ldquo;{metrics?.ai_summary_narrative ?? "Initializing identity synthesis parameters... Please upload documents to formulate profile narrative."}&rdquo;
              </p>
            </div>
            {metrics?.updated_at && (
              <div className="mt-4 border-t border-panel-raised/30 pt-3 text-[10px] font-mono text-mist flex justify-between items-center">
                <span>Core state synchronized</span>
                <span>{new Date(metrics.updated_at).toLocaleTimeString()}</span>
              </div>
            )}
          </HudFrame>
        </div>

        {/* Right: Identity Score */}
        <div className="lg:col-span-4">
          <HudFrame accent="magenta" className="bg-panel/40 h-full flex flex-col justify-between items-center text-center p-6">
            <div className="w-full text-left">
              <span className="font-mono text-[10px] text-magenta uppercase tracking-widest">// IDENTITY INDEX</span>
            </div>
            
            <div className="my-4 relative flex items-center justify-center">
              {/* Outer dial indicator */}
              <div className="w-28 h-28 rounded-full border-4 border-panel-raised flex flex-col items-center justify-center relative">
                <span className="font-display text-3xl font-black text-cyan tracking-tighter">
                  {metrics?.identity_score ?? 10}
                </span>
                <span className="font-mono text-[9px] text-mist/60 uppercase">Score</span>
                {/* Visual glow indicator */}
                <div className="absolute inset-0 rounded-full border border-cyan/40 animate-pulse pointer-events-none" />
              </div>
            </div>

            <div className="text-left w-full space-y-2">
              <h4 className="font-mono text-[10px] text-amber uppercase font-semibold">// verification weights</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-mist/80">
                {metrics?.score_breakdown ? (
                  Object.entries(metrics.score_breakdown).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-panel-raised/30 pb-1">
                      <span>{key.split(" ")[0]}:</span>
                      <span className="text-cyan">+{val}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-panel-raised/30 pb-1">
                      <span>Projects:</span>
                      <span className="text-cyan">+0</span>
                    </div>
                    <div className="flex justify-between border-b border-panel-raised/30 pb-1">
                      <span>Certs:</span>
                      <span className="text-cyan">+0</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </HudFrame>
        </div>
      </div>

      {/* Career Twin & Ingestion grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: AI Career Twin Metrics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-panel-raised pb-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog">
              👤 Career Twin
            </h2>
          </div>

          <div className="bg-panel/30 border border-panel-raised p-5 rounded-sm space-y-4 font-mono text-xs text-mist">
            <div>
              <span className="text-fog block font-bold text-[10px] uppercase tracking-wider text-magenta">// role trend</span>
              <span className="block text-sm font-semibold text-fog mt-1">
                {metrics?.career_twin?.current_role_trend ?? "Undetermined"}
              </span>
            </div>

            <div className="h-px bg-panel-raised/40" />

            <div>
              <span className="text-fog block font-bold text-[10px] uppercase tracking-wider text-magenta">// strongest skills</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {metrics?.career_twin?.strongest_skills?.map((skill, idx) => (
                  <span key={idx} className="bg-cyan/5 border border-cyan/20 text-cyan text-[10px] px-2 py-0.5 rounded">
                    {skill}
                  </span>
                )) ?? <span className="italic text-[10px]">None mapped</span>}
              </div>
            </div>

            <div className="h-px bg-panel-raised/40" />

            <div>
              <span className="text-fog block font-bold text-[10px] uppercase tracking-wider text-magenta">// readiness progress</span>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 bg-void h-2 rounded overflow-hidden border border-panel-raised">
                  <div 
                    className="bg-cyan h-full transition-all duration-500" 
                    style={{ width: `${metrics?.career_twin?.career_readiness ?? 10}%` }} 
                  />
                </div>
                <span className="text-cyan font-bold text-xs">{metrics?.career_twin?.career_readiness ?? 10}%</span>
              </div>
            </div>

            <div className="h-px bg-panel-raised/40" />

            <div>
              <span className="text-fog block font-bold text-[10px] uppercase tracking-wider text-magenta">// next recommendation</span>
              <p className="mt-1.5 text-xs text-fog leading-relaxed">
                Learn <span className="text-cyan">{metrics?.career_twin?.recommended_next_skill ?? "new certifications"}</span> to build a <span className="text-cyan">{metrics?.career_twin?.recommended_next_project ?? "cloud project"}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Middle: AI Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-panel-raised pb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog">
              ⚡ Action Recommendations
            </h2>
          </div>

          {insightsLoading ? (
            <div className="space-y-4">
              <div className="h-32 bg-panel/40 border border-panel-raised rounded animate-pulse" />
              <div className="h-32 bg-panel/40 border border-panel-raised rounded animate-pulse" />
            </div>
          ) : insights.length === 0 ? (
            <div className="rounded border border-panel-raised p-6 text-center text-mist text-xs font-mono">
              // waiting for insights...
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {insights.slice(0, 3).map((insight, idx) => {
                const isGaps = insight.type === "gaps";
                const isHigh = insight.impact === "high";
                const tagColor = isGaps ? "text-magenta border-magenta/30 bg-magenta/5" : isHigh ? "text-cyan border-cyan/30 bg-cyan/5" : "text-amber border-amber/30 bg-amber/5";
                
                return (
                  <div key={idx} className="border border-panel-raised bg-panel/20 p-4 rounded hover:border-cyan/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${tagColor}`}>
                        {insight.type}
                      </span>
                      <span className="text-[10px] font-mono text-mist uppercase">
                        {insight.impact} impact
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-semibold font-display text-fog">{insight.title}</h3>
                    <p className="mt-1 text-[11px] text-mist leading-relaxed">{insight.description}</p>
                    <div className="mt-3 text-[10px] font-mono text-cyan bg-void/50 p-2 rounded border border-panel-raised/30">
                      → {insight.actionable_step}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Ingestion Gate */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-panel-raised pb-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog">
              📂 Ingestion Gate
            </h2>
          </div>

          <div className="bg-panel/30 border border-panel-raised p-5 rounded-sm">
            <UploadControl onUploaded={handleUploadComplete} />
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {documents.slice(0, 3).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
