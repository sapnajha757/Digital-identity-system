"use client";

import { useEffect, useState } from "react";
import { apiClient, DashboardMetricsResponse, TimelineEventOut, DocumentOut } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";
import Link from "next/link";

export default function PortfolioPage() {
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineEventOut[]>([]);
  const [docs, setDocs] = useState<DocumentOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.getDashboardMetrics(),
      apiClient.getTimeline(),
      apiClient.listDocuments()
    ])
      .then(([metricsData, timelineData, docsData]) => {
        setMetrics(metricsData);
        setTimeline(timelineData);
        setDocs(docsData);
      })
      .catch((err) => console.error("Error loading portfolio data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter out skill names
  const skills = metrics?.career_twin?.strongest_skills ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 bg-void text-fog min-h-screen space-y-12">
      {/* HUD Header */}
      <div className="border border-cyan/20 bg-panel/40 p-6 md:p-8 rounded-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-10" />
        <div className="relative z-10">
          <span className="font-mono text-[9px] text-magenta tracking-widest uppercase">// RECRUITER VERIFIED PORTFOLIO</span>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-wider text-fog">
            Professional Profile.
          </h1>
          <p className="mt-1 font-mono text-xs text-mist">
            Role Trend focus: <span className="text-cyan">{metrics?.career_twin?.current_role_trend ?? "Ingesting credentials..."}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/"
            className="px-4 py-2 border border-panel-raised bg-panel-raised/50 text-fog font-mono text-xs uppercase tracking-wider rounded transition-all"
          >
            ← [DASHBOARD]
          </Link>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 border border-cyan/40 hover:border-cyan bg-cyan/5 text-cyan font-mono text-xs uppercase tracking-wider rounded transition-all"
          >
            [PRINT / PDF]
          </button>
        </div>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-mist">// compiling dossier portfolio…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Summary & Skills */}
          <div className="md:col-span-8 space-y-8">
            {/* Bio Summary Narrative */}
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2">
                📖 Synopsis
              </h2>
              <p className="text-mist text-md leading-relaxed font-sans font-light">
                {metrics?.ai_summary_narrative ?? "Awaiting digital footprint synchronization."}
              </p>
            </div>

            {/* Core Projects/Achievements */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2">
                🛠️ Projects & Credentials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docs.filter(d => d.status === "completed").map((doc, idx) => (
                  <div key={idx} className="border border-panel-raised p-4 bg-panel/20 rounded hover:border-cyan/35 transition-all">
                    <span className="text-[10px] font-mono text-magenta uppercase font-semibold">
                      {doc.file_type} index
                    </span>
                    <h3 className="mt-2 text-sm font-semibold font-display text-fog uppercase">{doc.original_filename}</h3>
                    <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-mist">
                      <span>Indexed</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Skills & Timeline check */}
          <div className="md:col-span-4 space-y-8">
            {/* Skills Card */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2">
                ⚡ Competency Map
              </h2>
              <div className="bg-panel/30 border border-panel-raised p-5 rounded space-y-4">
                <div>
                  <h4 className="font-mono text-[10px] text-magenta uppercase font-semibold">// verified expertise</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="bg-cyan/5 border border-cyan/35 text-cyan text-[10px] px-2.5 py-1 rounded font-mono font-bold">
                        {skill}
                      </span>
                    ))}
                    {skills.length === 0 && <span className="text-xs text-mist italic">None mapped</span>}
                  </div>
                </div>

                <div className="h-px bg-panel-raised/40" />

                <div>
                  <h4 className="font-mono text-[10px] text-magenta uppercase font-semibold">// direction</h4>
                  <p className="mt-1 font-display text-sm font-medium text-fog">
                    {metrics?.career_twin?.career_direction ?? "Analyzing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Inferred Timeline checklist */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2">
                📅 Milestones
              </h2>
              <div className="space-y-3">
                {timeline.slice(0, 5).map((event, idx) => (
                  <div key={idx} className="border-l-2 border-cyan/40 pl-3 space-y-1">
                    <span className="text-[10px] font-mono text-amber">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short"
                      })}
                    </span>
                    <h4 className="text-xs font-semibold text-fog leading-snug">{event.title}</h4>
                    <p className="text-[10px] text-mist">{event.event_type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
