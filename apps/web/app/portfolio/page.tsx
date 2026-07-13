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

  const skills = metrics?.career_twin?.strongest_skills ?? [];

  const handleExportJSON = () => {
    const data = {
      profile: {
        role_trend: metrics?.career_twin?.current_role_trend,
        synopsis: metrics?.ai_summary_narrative,
        direction: metrics?.career_twin?.career_direction,
        skills: skills,
      },
      timeline: timeline.map((e) => ({
        date: e.event_date,
        title: e.title,
        type: e.event_type,
        date_inferred: e.date_inferred,
      })),
      documents: docs.map((d) => ({
        filename: d.original_filename,
        type: d.file_type,
        uploaded_at: d.uploaded_at,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `identity_dossier_${metrics?.career_twin?.current_role_trend?.replace(/\s+/g, "_").toLowerCase() || "profile"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csv = "Date,Title,Type,Date Inferred\n";
    timeline.forEach((e) => {
      const date = new Date(e.event_date).toLocaleDateString();
      const title = `"${e.title.replace(/"/g, '""')}"`;
      const type = `"${e.event_type.replace(/"/g, '""')}"`;
      const inferred = e.date_inferred ? "Yes" : "No";
      csv += `${date},${title},${type},${inferred}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `milestones_${metrics?.career_twin?.current_role_trend?.replace(/\s+/g, "_").toLowerCase() || "profile"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 bg-void text-fog min-h-screen space-y-12 print:bg-white print:text-black">
      {/* HUD Header */}
      <div className="border border-panel-raised bg-panel/40 p-6 md:p-8 rounded-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:border-none print:bg-transparent print:p-0">
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-10 print:hidden" />
        <div className="relative z-10">
          <span className="font-mono text-[9px] text-magenta tracking-widest uppercase font-bold print:text-black">// RECRUITER VERIFIED DOSSIER PROFILE</span>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-fog print:text-black">
            Professional Profile
          </h1>
          <p className="mt-1 font-mono text-xs text-mist print:text-gray-600">
            Role Trend Focus: <span className="text-cyan font-bold print:text-black">{metrics?.career_twin?.current_role_trend ?? "Ingesting credentials..."}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Link 
            href="/"
            className="px-3 py-1.5 border border-panel-raised bg-panel-raised/50 text-fog font-mono text-[10px] uppercase tracking-wider rounded transition-all hover:bg-panel-raised"
          >
            ← [DASHBOARD]
          </Link>
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-cyan/40 hover:border-cyan bg-cyan/5 text-cyan font-mono text-[10px] uppercase tracking-wider rounded transition-all"
          >
            [PRINT / PDF]
          </button>
          <button 
            onClick={handleExportJSON}
            className="px-3 py-1.5 border border-magenta/40 hover:border-magenta bg-magenta/5 text-magenta font-mono text-[10px] uppercase tracking-wider rounded transition-all"
          >
            [EXPORT JSON]
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3 py-1.5 border border-cyan/40 hover:border-cyan bg-cyan/5 text-cyan font-mono text-[10px] uppercase tracking-wider rounded transition-all"
          >
            [EXPORT CSV]
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
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2 print:text-black print:border-gray-300">
                📖 Synopsis
              </h2>
              <p className="text-mist text-md leading-relaxed font-sans font-light print:text-black">
                {metrics?.ai_summary_narrative ?? "Awaiting digital footprint synchronization."}
              </p>
            </div>

            {/* Core Projects/Achievements */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2 print:text-black print:border-gray-300">
                🛠️ Projects & Credentials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docs.filter(d => d.status === "completed").map((doc, idx) => (
                  <div key={idx} className="border border-panel-raised p-5 bg-panel/20 rounded-lg hover:border-cyan/35 transition-all print:border-gray-300 print:bg-transparent">
                    <span className="text-[10px] font-mono text-magenta uppercase font-bold print:text-black">
                      {doc.file_type} index
                    </span>
                    <h3 className="mt-2 text-sm font-semibold font-display text-fog uppercase print:text-black">{doc.original_filename}</h3>
                    <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-mist print:text-gray-500">
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
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2 print:text-black print:border-gray-300">
                ⚡ Competency Map
              </h2>
              <div className="bg-panel/30 border border-panel-raised p-5 rounded-lg space-y-4 print:border-gray-300 print:bg-transparent">
                <div>
                  <h4 className="font-mono text-[10px] text-magenta uppercase font-bold print:text-black">// verified expertise</h4>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="bg-cyan/5 border border-cyan/35 text-cyan text-[10px] px-2.5 py-1 rounded font-mono font-bold print:text-black print:border-gray-400">
                        {skill}
                      </span>
                    ))}
                    {skills.length === 0 && <span className="text-xs text-mist italic print:text-black">None mapped</span>}
                  </div>
                </div>

                <div className="h-px bg-panel-raised/55 print:bg-gray-300" />

                <div>
                  <h4 className="font-mono text-[10px] text-magenta uppercase font-bold print:text-black">// direction</h4>
                  <p className="mt-1 font-display text-sm font-medium text-fog print:text-black">
                    {metrics?.career_twin?.career_direction ?? "Analyzing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Inferred Timeline checklist */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fog border-b border-panel-raised pb-2 print:text-black print:border-gray-300">
                📅 Milestones
              </h2>
              <div className="space-y-3">
                {timeline.slice(0, 5).map((event, idx) => (
                  <div key={idx} className="border-l-2 border-cyan/40 pl-3 space-y-1 print:border-black">
                    <span className="text-[10px] font-mono text-amber print:text-black">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short"
                      })}
                    </span>
                    <h4 className="text-xs font-semibold text-fog leading-snug print:text-black">{event.title}</h4>
                    <p className="text-[10px] text-mist print:text-gray-600">{event.event_type}</p>
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
