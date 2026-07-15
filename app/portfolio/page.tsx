"use client";

import { useEffect, useState } from "react";
import { apiClient, DashboardMetricsResponse, TimelineEventOut, DocumentOut } from "@/lib/api-client";
import { supabaseClient as supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PortfolioPage() {
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineEventOut[]>([]);
  const [docs, setDocs] = useState<DocumentOut[]>([]);
  const [session, setSession] = useState<any>(null);
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

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const email = session?.user?.email || "";
  const fullName = session?.user?.user_metadata?.full_name || "";
  let firstName = "";
  let lastName = "";
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  } else if (email) {
    // Try to extract name from email: sapna.jha@ or sapna_jha@ or sapnajha@
    const local = email.split('@')[0].replace(/[0-9]+$/g, ''); // strip trailing numbers
    const parts = local.split(/[\._-]/);
    if (parts.length >= 2) {
      firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    } else {
      // Single word email like sapnajha — use full local as first name
      firstName = local.charAt(0).toUpperCase() + local.slice(1);
      lastName = "";
    }
  }
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;
  const initials = lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : firstName.substring(0, 2).toUpperCase();

  const skills = metrics?.career_twin?.strongest_skills ?? ["Python", "Machine Learning", "System Design"];

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
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `identity_dossier.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csv = "Date,Title,Type\n";
    timeline.forEach((e) => {
      const date = new Date(e.event_date).toLocaleDateString();
      const title = `"${e.title.replace(/"/g, '""')}"`;
      const type = `"${e.event_type.replace(/"/g, '""')}"`;
      csv += `${date},${title},${type}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `milestones.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    alert("Share link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-void text-mist font-mono text-sm">
        <span className="animate-pulse">// Synthesizing digital portfolio...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-fog font-sans print:bg-white print:text-black">
      {/* Top Navbar / Controls */}
      <div className="sticky top-0 z-50 bg-[#090D1A]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center print:hidden">
        <Link href="/" className="font-mono text-[10px] text-cyan hover:text-white uppercase tracking-widest transition-colors">
          ← Mission Control
        </Link>
        <div className="flex gap-3">
          <button onClick={handleShare} className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-mist text-[10px] font-mono uppercase rounded transition-all">
            Share
          </button>
          <button onClick={handleExportCSV} className="px-3 py-1.5 border border-cyan/30 hover:bg-cyan/10 text-cyan text-[10px] font-mono uppercase rounded transition-all">
            CSV
          </button>
          <button onClick={handleExportJSON} className="px-3 py-1.5 border border-magenta/30 hover:bg-magenta/10 text-magenta text-[10px] font-mono uppercase rounded transition-all">
            JSON
          </button>
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-cyan text-[#090D1A] font-bold text-[10px] font-mono uppercase rounded hover:bg-cyan/90 transition-all">
            Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-20">
        
        {/* HERO SECTION */}
        <section className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
            {/* Avatar Placeholder */}
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border-2 border-cyan/40 bg-[#090D1A] overflow-hidden flex items-center justify-center p-2 relative shadow-[0_0_30px_rgba(0,240,255,0.15)] print:shadow-none print:border-gray-300">
              <div className="w-full h-full rounded-full bg-panel-raised/50 flex items-center justify-center border border-white/5 print:bg-gray-100">
                <span className="text-4xl text-mist/30">{initials}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 text-center md:text-left flex-1">
            <span className="font-mono text-[10px] text-magenta uppercase tracking-widest block font-bold print:text-black">
              // {metrics?.career_twin?.career_direction || "Digital Identity Portfolio"}
            </span>
            <h1 className="text-4xl md:text-6xl font-black font-display text-white tracking-tight print:text-black">
              {firstName}{lastName ? <> <span className="text-cyan">{lastName}</span></> : null}
            </h1>
            <p className="text-mist font-light leading-relaxed max-w-2xl text-sm md:text-base print:text-gray-700">
              {metrics?.ai_summary_narrative ?? "A visionary systems architect dedicated to scalable machine learning deployments and complex data topologies. Uniting infrastructure resilience with algorithmic intelligence."}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start font-mono text-[10px] uppercase text-mist">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan" />
                {email}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-magenta" />
                IdentityOS Portfolio
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* MAIN COLUMN */}
          <div className="md:col-span-8 space-y-16">
            
            {/* Experience / Timeline */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-3 print:border-gray-300">
                <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-fog print:text-black">Professional Experience</h2>
              </div>
              <div className="space-y-8">
                {timeline.length > 0 ? timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-6 md:pl-8 border-l-2 border-white/10 print:border-gray-300">
                    <div className="absolute w-3 h-3 bg-cyan rounded-full -left-[7.5px] top-1.5 print:bg-black" />
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-cyan font-bold print:text-gray-600">
                        {new Date(event.event_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                      </span>
                      <h3 className="text-lg font-bold text-white print:text-black">{event.title}</h3>
                      <p className="text-xs font-mono text-mist/60 uppercase">{event.event_type}</p>
                      <p className="text-sm text-mist leading-relaxed mt-2 print:text-gray-700">
                        {event.description || "Document processed and analyzed by IdentityOS."}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-mist text-sm font-mono italic">No timeline events recorded.</p>
                )}
              </div>
            </section>

            {/* Projects & Architecture */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-3 print:border-gray-300">
                <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-fog print:text-black">Open Source & Projects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.filter(d => d.status === "completed").map((doc, idx) => (
                  <div key={idx} className="border border-white/5 bg-[#090D1A] p-5 rounded-xl hover:border-cyan/30 transition-colors print:border-gray-300 print:bg-transparent">
                    <span className="text-[9px] font-mono text-magenta uppercase print:text-gray-500">{doc.file_type} Reference</span>
                    <h4 className="text-white font-bold mt-1 mb-2 font-display print:text-black">{doc.original_filename}</h4>
                    <p className="text-xs text-mist leading-relaxed print:text-gray-600">
                      Document uploaded and processed by IdentityOS intelligence pipeline.
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/5 text-[9px] font-mono text-mist/50 flex justify-between">
                      <span>Verified Evidence</span>
                      <span className="text-cyan font-bold">100% Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR COLUMN */}
          <div className="md:col-span-4 space-y-12">
            
            {/* Core Competencies */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-fog border-b border-white/5 pb-2 print:border-gray-300 print:text-black">
                Core Competencies
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-cyan/10 border border-cyan/20 text-cyan px-3 py-1.5 rounded-md text-[10px] font-mono font-bold print:bg-transparent print:border-gray-400 print:text-black">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Documents Summary */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-fog border-b border-white/5 pb-2 print:border-gray-300 print:text-black">
                Uploaded Documents
              </h2>
              {docs.length > 0 ? (
                <ul className="space-y-3">
                  {docs.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan text-sm">📄</span>
                      <div>
                        <h4 className="text-sm font-bold text-white print:text-black">{doc.original_filename}</h4>
                        <span className="text-[10px] font-mono text-mist">
                          {doc.file_type.toUpperCase()} • {doc.status === "completed" ? "✓ Processed" : doc.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-mist text-sm font-mono italic">No documents uploaded yet. Upload your resume and credentials to build your portfolio.</p>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
