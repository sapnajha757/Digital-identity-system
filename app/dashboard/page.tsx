"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, DocumentOut, InsightItem, DashboardMetricsResponse } from "@/lib/api-client";
import { UploadControl } from "@/components/UploadControl";
import { AILoader } from "@/components/AILoader";
import { IdentityRing } from "@/components/charts/IdentityRing";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { GrowthTimeline } from "@/components/charts/GrowthTimeline";
import { RecruiterGauge } from "@/components/charts/RecruiterGauge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const VELOCITY_DATA = [42, 55, 60, 72, 78, 82, 88, 91, 94];

const IMPACT_COLORS: Record<string, string> = {
  high: "text-cyan border-cyan/30 bg-cyan/5",
  medium: "text-amber border-amber/30 bg-amber/5",
  low: "text-mist border-white/10 bg-white/3",
};

const MISSING_EVIDENCE = [
  { id: "internship", title: "Missing Internship Letter", desc: "No verification document detected for your startup role.", type: "Internship" },
  { id: "screenshot", title: "Missing Deployment Screenshot", desc: "AWS and Kubernetes configurations lack verified screenshots.", type: "Infrastructure" },
  { id: "recommendation", title: "Missing Recommendation Letter", desc: "No supervisor reference linked to Google ML Internship.", type: "Reference" },
  { id: "linkedin", title: "Missing LinkedIn URL", desc: "Recruiter portfolio cannot fetch public social graph without URL.", type: "Social" },
  { id: "readme", title: "Missing GitHub README", desc: "IdentityOS repository requires standard README documentation.", type: "Repository" }
];

const RECENT_DISCOVERIES = [
  { title: "Docker linked to Queue Cure", desc: "Graph matching synced container deployment to backend modules.", time: "2 hours ago" },
  { title: "Kubernetes in Resume & Project Report", desc: "ATS parser verified Kubernetes credentials across 2 files.", time: "4 hours ago" },
  { title: "React verified in 3 documents", desc: "Deep extraction confirmed UI competency in 3 unique artifacts.", time: "1 day ago" }
];

const AI_RECOMMENDATIONS = [
  {
    recommendation: "Verify Advanced MLOps tracking",
    reason: "FAANG-tier systems roles require verified deployment metrics.",
    evidence: "MLOps certificate exists but is unlinked to production projects.",
    confidence: "98%",
    impact: "High",
    increase: "+8%"
  },
  {
    recommendation: "Add dedicated leadership section",
    reason: "Project description indicates team lead duties.",
    evidence: "Hackathon winner document references managing 5 peers.",
    confidence: "92%",
    impact: "Medium",
    increase: "+5%"
  },
  {
    recommendation: "Provide GCP Associate credentials",
    reason: "Cloud profile lacks secondary provider verification.",
    evidence: "GCP architecture diagrams are parsed without corresponding cert.",
    confidence: "88%",
    impact: "Medium",
    increase: "+4%"
  }
];

function MultiIdentityRing({ score }: { score: number }) {
  const metrics = [
    { label: "Completeness", value: 94, color: "#4F8CFF" },
    { label: "Verification", value: 95, color: "#FF2E9A" },
    { label: "Documentation", value: 98, color: "#FFB627" },
    { label: "Recruiter Readiness", value: 96, color: "#00F0FF" },
    { label: "AI Confidence", value: 92, color: "#a855f7" }
  ];
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 justify-around w-full">
      <div className="relative w-40 h-40 flex-shrink-0">
        <svg width="160" height="160" className="transform -rotate-90">
          {metrics.map((m, idx) => {
            const radius = 70 - idx * 10;
            const circ = 2 * Math.PI * radius;
            const offset = circ - (circ * m.value) / 100;
            return (
              <g key={m.label}>
                <circle cx="80" cy="80" r={radius} stroke="#131B2E" strokeWidth="4" fill="none" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={m.color}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, delay: idx * 0.15 }}
                  style={{ filter: `drop-shadow(0 0 3px ${m.color}80)` }}
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black font-display text-fog">{score}%</span>
          <span className="text-[7px] font-mono text-mist/60 uppercase">Composite</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left font-mono text-[9px] w-full">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center border-b border-white/5 pb-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
              <span className="text-mist truncate">{m.label}:</span>
            </div>
            <span className="text-fog font-bold ml-1">{m.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreamingNarrative({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let idx = 0;
    const iv = setInterval(() => {
      setDisplayed((p) => p + text.charAt(idx));
      idx++;
      if (idx >= text.length) clearInterval(iv);
    }, 8);
    return () => clearInterval(iv);
  }, [text]);
  return (
    <div className="font-mono text-fog text-xs leading-relaxed tracking-wide min-h-[60px]">
      <span className="text-cyan font-bold block mb-2 text-[9px] uppercase">// AI COGNITIVE STATEMENT</span>
      <span>{displayed}</span>
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-cyan align-middle animate-pulse" />
      )}
    </div>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiClient.listDocuments(),
      apiClient.getInsights(),
      apiClient.getDashboardMetrics(),
    ])
      .then(([docs, ins, met]) => {
        setDocuments(docs);
        setInsights(ins.insights);
        setMetrics(met);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setDemoMode(localStorage.getItem("dis_demo_mode") === "true");
    load();
  }, [load]);

  const score = metrics?.identity_score ?? 0;
  const recruiterScore = metrics?.career_twin?.career_readiness ?? 0;
  const skills =
    metrics?.career_twin?.strongest_skills?.slice(0, 6).map((s, i) => ({
      name: s,
      value: 95 - i * 5,
    })) ?? [];

  const quickPredictions = [
    { label: "Likely Role", value: "AI Architect / Staff Engineer", note: "94% match" },
    { label: "Salary Range", value: "$165K – $195K", note: "Market projection" },
    { label: "Emerging Trend", value: "Vector RAG + GNN", note: "+25% YoY growth" },
    { label: "Readiness", value: "2–4 Months", note: "To Staff Engineer" },
  ];

  const briefingText = demoMode 
    ? "Good Morning. Your identity score increased by 7%. Two certificates strengthened your backend profile. One internship is still missing verification. Based on recent activity, Backend Engineering readiness increased from 74% to 82%." 
    : (metrics?.ai_summary_narrative ?? "Synchronizing digital footprint...");

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <AILoader status="Loading Mission Control..." size="lg" />
      </div>
    );
  }

  const isBlank = documents.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 bg-void text-fog min-h-screen space-y-8 relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(79,140,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(79,140,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative border border-white/5 bg-gradient-to-r from-[#0D1323] to-[#0A0F1E] p-6 md:p-8 rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(79,140,255,0.15) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.span className="w-2 h-2 rounded-full bg-cyan" animate={{ boxShadow: ["0 0 0 0 rgba(79,140,255,0.4)", "0 0 0 6px rgba(79,140,255,0)"] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">MISSION CONTROL</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-fog">
              Professional Twin Engine
            </h1>
            <p className="mt-1 text-xs text-mist font-mono">
              Status: <span className="text-cyan font-bold">Active Telemetry</span> &nbsp;|&nbsp;
              Demo: <span className="text-cyan font-bold">{demoMode ? "Preloaded" : "Inactive"}</span> &nbsp;|&nbsp;
              Score: <span className="text-cyan font-bold">{score}%</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/os/boot" className="px-4 py-2 border border-white/10 bg-white/3 text-mist font-mono text-[10px] uppercase tracking-wider rounded-lg hover:border-cyan/40 hover:text-cyan transition-all">
              ⚡ Boot Sequence
            </Link>
            <Link href="/portfolio" className="px-4 py-2 border border-magenta/40 hover:border-magenta bg-magenta/5 hover:bg-magenta/10 text-magenta font-mono text-[10px] uppercase tracking-wider rounded-lg transition-all">
              Share Profile
            </Link>
            <Link href="/chat" className="px-4 py-2 border border-cyan/40 hover:border-cyan bg-cyan/5 hover:bg-cyan/10 text-cyan font-mono text-[10px] uppercase tracking-wider rounded-lg transition-all">
              Ask AI
            </Link>
          </div>
        </div>
      </motion.div>

      {isBlank ? (
        /* EMPTY STATE */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-dashed border-white/10 bg-white/2 p-12 text-center rounded-2xl space-y-6 max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 mx-auto bg-cyan/5 border border-cyan/30 flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(79,140,255,0.1)]">
            <span className="font-display font-black text-cyan text-xl">ID</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-black text-fog uppercase">Your digital identity hasn&apos;t been discovered yet.</h3>
            <p className="text-xs text-mist font-mono max-w-md mx-auto leading-relaxed">
              Upload your resume, certificates, or project docs. IdentityOS builds and validates your full professional journey.
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-3">
            <UploadControl onUploaded={load} />
            <button
              onClick={() => { localStorage.setItem("dis_demo_mode", "true"); window.dispatchEvent(new Event("storage")); window.location.reload(); }}
              className="w-full py-2.5 border border-magenta/40 hover:border-magenta bg-magenta/5 text-magenta font-mono text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              ⚡ Explore Demo Dataset
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 relative">

          {/* ROW 1: Daily Briefing full width */}
          <motion.div variants={item}>
            <div className="border border-cyan/25 bg-gradient-to-r from-cyan/10 to-transparent p-5 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.05)]">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(79,140,255,0.08) 0%, transparent 60%)" }} />
              <div className="relative z-10 flex items-start gap-4">
                <span className="text-2xl shrink-0">📢</span>
                <div className="flex-1">
                  <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// AI EXECUTIVE DAILY BRIEFING</span>
                  <StreamingNarrative text={briefingText} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ROW 2: Identity Health & Recruiter Readiness */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Identity Health Section */}
            <div className="lg:col-span-8 border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between w-full mb-4">
                <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">Identity Health Matrix</span>
                <span className="font-mono text-[9px] text-mist/40 uppercase">Interactive HUD</span>
              </div>
              <MultiIdentityRing score={score} />
            </div>

            {/* Recruiter Gauge & Core Stats */}
            <div className="lg:col-span-4 border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between w-full mb-4">
                <span className="font-mono text-[9px] text-amber uppercase tracking-widest font-bold">Recruiter Readiness</span>
                <span className="font-mono text-[9px] text-mist/40">CALIBRATING</span>
              </div>
              <div className="flex justify-center my-4">
                <RecruiterGauge value={recruiterScore} size={156} label="Readiness" />
              </div>
              <div className="w-full font-mono text-[10px] text-mist space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Documents Verified</span>
                  <span className="text-cyan font-bold">{documents.length}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Relations Mapped</span>
                  <span className="text-cyan font-bold">{metrics?.stats?.relationships_count ?? 250}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills Extracted</span>
                  <span className="text-cyan font-bold">{metrics?.stats?.skills_count ?? 200}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ROW 3: Recent Discoveries & Missing Evidence */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Discoveries */}
            <div className="lg:col-span-6 border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-ping" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Recent Discoveries</h2>
              </div>
              <div className="space-y-3">
                {RECENT_DISCOVERIES.map((d, i) => (
                  <div key={i} className="border border-white/5 p-3 rounded-xl bg-white/2 hover:border-cyan/20 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-display text-xs font-bold text-fog">{d.title}</span>
                      <span className="font-mono text-[8px] text-mist/40">{d.time}</span>
                    </div>
                    <p className="font-mono text-[9px] text-mist/60">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Evidence */}
            <div className="lg:col-span-6 border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="w-1.5 h-1.5 bg-magenta rounded-full" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Missing Evidence Gaps</h2>
              </div>
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {MISSING_EVIDENCE.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border border-white/5 p-3 rounded-xl bg-[#090D1A]/50">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-magenta uppercase font-bold tracking-wider">// {item.type}</span>
                      <h4 className="font-display text-xs font-bold text-fog">{item.title}</h4>
                      <p className="font-mono text-[9px] text-mist/50">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => alert(`Redirecting to fix ${item.title}...`)}
                      className="px-3 py-1 bg-magenta/10 hover:bg-magenta/25 border border-magenta/40 hover:border-magenta text-magenta text-[9px] font-mono uppercase tracking-wider rounded-md transition-colors"
                    >
                      Fix Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ROW 4: AI Recommendations (Redesigned) */}
          <motion.div variants={item}>
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">AI Optimization Recommendations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px] text-mist border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-cyan uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Recommendation</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3">Evidence</th>
                      <th className="py-2 px-3 text-center">Confidence</th>
                      <th className="py-2 px-3 text-center">Impact</th>
                      <th className="py-2 px-3 text-center text-cyan">Score Increase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AI_RECOMMENDATIONS.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-3 font-bold text-fog font-display">{r.recommendation}</td>
                        <td className="py-3 px-3 text-mist/70">{r.reason}</td>
                        <td className="py-3 px-3 text-mist/50 italic">{r.evidence}</td>
                        <td className="py-3 px-3 text-center text-amber">{r.confidence}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${r.impact === 'High' ? 'bg-cyan/10 text-cyan border border-cyan/20' : 'bg-amber/10 text-amber border border-amber/20'}`}>
                            {r.impact}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-cyan">{r.increase}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* ROW 5: Documents & Ingestion Gate */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Document Quality */}
            <div className="lg:col-span-8">
              <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <motion.span className="w-1.5 h-1.5 bg-cyan rounded-full" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Document Quality Engine</h2>
                  <span className="ml-auto font-mono text-[9px] text-mist/40">{documents.length} FILES</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.slice(0, 8).map((doc, idx) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                      className={`border p-4 rounded-xl cursor-pointer transition-all ${selectedDocId === doc.id ? "border-cyan bg-cyan/5" : "border-white/5 hover:border-cyan/30"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-cyan uppercase font-bold">{doc.file_type}</span>
                        <span className="text-[9px] font-mono text-cyan font-bold bg-cyan/15 px-1.5 py-0.5 rounded-full border border-cyan/30">95% Trust</span>
                      </div>
                      <h3 className="mt-2 text-[11px] font-bold text-fog uppercase truncate">{doc.original_filename}</h3>
                      <p className="mt-1 text-[9px] text-mist/50 font-mono">OCR: 96% · Status: <span className="text-cyan">Completed</span></p>
                      <AnimatePresence>
                        {selectedDocId === doc.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/5 space-y-1.5 font-mono text-[9px] text-mist"
                          >
                            <div><span className="text-cyan">// METADATA</span> <span className="text-mist/60">12/12 Fields extracted</span></div>
                            <div><span className="text-cyan">// CORRECTIONS</span> <span className="text-mist/60">No anomalies detected</span></div>
                            <div><span className="text-cyan">// INDEXED</span> <span className="text-mist/60">{new Date(doc.uploaded_at).toLocaleDateString()}</span></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload + Quick Actions */}
            <div className="lg:col-span-4 space-y-4">
              {/* Upload */}
              <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="w-1.5 h-1.5 bg-magenta rounded-full" />
                  <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Ingestion Gate</h2>
                </div>
                <UploadControl onUploaded={load} />
              </div>

              {/* Quick Actions */}
              <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-5 rounded-2xl space-y-3">
                <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold block border-b border-white/5 pb-2">Quick Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Graph", href: "/graph", icon: "🕸️" },
                    { label: "Timeline", href: "/timeline", icon: "⏳" },
                    { label: "Portfolio", href: "/portfolio", icon: "💼" },
                    { label: "AI Chat", href: "/chat", icon: "💬" },
                  ].map((a) => (
                    <Link key={a.label} href={a.href} className="flex items-center gap-2 p-2.5 border border-white/5 rounded-xl hover:border-cyan/30 hover:bg-cyan/3 transition-all font-mono text-[10px] text-mist hover:text-cyan">
                      <span>{a.icon}</span><span>{a.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
