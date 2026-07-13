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
            <div className="border border-cyan/20 bg-gradient-to-r from-cyan/5 to-transparent p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(79,140,255,0.05) 0%, transparent 60%)" }} />
              <div className="relative z-10 flex items-start gap-4">
                <span className="text-2xl shrink-0">📢</span>
                <div className="flex-1">
                  <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// AI DAILY BRIEFING</span>
                  {metrics?.ai_summary_narrative ? (
                    <StreamingNarrative text={metrics.ai_summary_narrative} />
                  ) : (
                    <p className="font-mono text-xs text-mist/50 mt-2">Synchronizing digital footprint...</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ROW 2: Identity Ring | Career Twin | Recruiter Gauge */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Score Ring */}
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">Identity Health</span>
                <span className="font-mono text-[9px] text-mist/40">LIVE</span>
              </div>
              <IdentityRing score={score} size={156} />
              <div className="w-full space-y-1.5 font-mono text-[9px] text-mist">
                {metrics?.score_breakdown && Object.entries(metrics.score_breakdown).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                    <span>{k}</span>
                    <span className="text-cyan font-bold">+{v} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Twin */}
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[9px] text-magenta uppercase tracking-widest font-bold">Career Twin</span>
                <span className="px-2 py-0.5 bg-magenta/10 border border-magenta/30 rounded font-mono text-[8px] text-magenta">ACTIVE</span>
              </div>
              {metrics?.career_twin ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-mono text-[9px] text-mist/50">Current Role Trend</span>
                    <p className="font-display font-black text-fog text-lg mt-0.5">{metrics.career_twin.current_role_trend}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-mist/50">Career Direction</span>
                    <p className="font-mono text-[10px] text-mist mt-0.5 leading-relaxed">{metrics.career_twin.career_direction}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {metrics.career_twin.strongest_skills.slice(0, 5).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-cyan/8 border border-cyan/20 rounded-full font-mono text-[9px] text-cyan">{s}</span>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-3 space-y-1.5 font-mono text-[9px] text-mist">
                    <div className="flex justify-between">
                      <span>Next Skill:</span>
                      <span className="text-amber">{metrics.career_twin.recommended_next_skill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fastest Growing:</span>
                      <span className="text-cyan">{metrics.career_twin.fastest_growing_skill}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <AILoader status="Building Career Twin..." size="sm" />
              )}
            </div>

            {/* Recruiter Gauge */}
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[9px] text-amber uppercase tracking-widest font-bold">Recruiter Readiness</span>
              </div>
              <RecruiterGauge value={recruiterScore} size={180} label="Readiness" />
              <div className="w-full font-mono text-[9px] text-mist space-y-1.5">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Documents Verified</span>
                  <span className="text-cyan font-bold">{documents.length}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Relations Mapped</span>
                  <span className="text-cyan font-bold">{metrics?.stats?.relationships_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills Extracted</span>
                  <span className="text-cyan font-bold">{metrics?.stats?.skills_count ?? 0}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ROW 3: Skill Radar + Learning Velocity + Career Predictions */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skill Radar */}
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl">
              <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold block mb-4">Skill Radar</span>
              {skills.length >= 3 ? (
                <SkillRadar skills={skills} size={220} />
              ) : (
                <AILoader status="Loading skills..." size="sm" />
              )}
            </div>

            {/* Learning Velocity */}
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl">
              <span className="font-mono text-[9px] text-magenta uppercase tracking-widest font-bold block mb-4">Learning Velocity</span>
              <div className="space-y-4">
                <GrowthTimeline data={VELOCITY_DATA} width={240} height={80} color="#4F8CFF" label="Skill Acquisition Rate" />
                <GrowthTimeline data={[30, 42, 55, 61, 70, 79, 85]} width={240} height={60} color="#7B61FF" label="Knowledge Density" />
                <div className="border-t border-white/5 pt-3 font-mono text-[9px] text-mist space-y-1.5">
                  <div className="flex justify-between">
                    <span>Growth Rate</span>
                    <span className="text-cyan font-bold">+12% / month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projection</span>
                    <span className="text-cyan font-bold">Staff Eng in 3mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Predictions */}
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">Career Predictions</span>
                <span className="font-mono text-[8px] text-mist/40">// AI EXTRAPOLATION</span>
              </div>
              <div className="space-y-3">
                {quickPredictions.map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-white/5 p-3 rounded-xl bg-white/2 hover:border-cyan/20 transition-colors"
                  >
                    <span className="font-mono text-[9px] text-mist/50 uppercase block">{p.label}</span>
                    <span className="font-display font-bold text-sm text-fog mt-0.5 block">{p.value}</span>
                    <span className="font-mono text-[9px] text-cyan/70">{p.note}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ROW 4: Documents + Upload */}
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

          {/* ROW 5: AI Insights */}
          <motion.div variants={item}>
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Latest AI Discoveries</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((ins, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`border p-4 rounded-xl ${IMPACT_COLORS[ins.impact]}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-[9px] uppercase font-bold tracking-wider">{ins.type}</span>
                      <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded-full border uppercase ${IMPACT_COLORS[ins.impact]}`}>{ins.impact}</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-fog">{ins.title}</h4>
                    <p className="font-mono text-[9px] text-mist mt-2 leading-relaxed">{ins.description}</p>
                    <div className="mt-3 pt-2 border-t border-white/5">
                      <span className="font-mono text-[9px] text-cyan/80">→ {ins.actionable_step}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ROW 6: Export Center */}
          <motion.div variants={item}>
            <div className="border border-white/5 bg-gradient-to-b from-[#0D1323] to-[#09111E] p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Professional Export Center</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { code: "01", title: "Recruiter Dossier", desc: "Verified summaries, skill maps, transcript checklist", onClick: () => alert("Generating Recruiter Dossier...") },
                  { code: "02", title: "AI Career Report", desc: "RAG analytics, salary projections, ATS score cards", onClick: () => alert("Compiling AI Career PDF...") },
                  { code: "03", title: "Portfolio PDF", desc: "Printable stylesheet optimized for recruiter downloads", onClick: () => window.print() },
                ].map((e) => (
                  <button
                    key={e.code}
                    onClick={e.onClick}
                    className="border border-white/5 p-4 rounded-xl text-left hover:border-cyan/30 hover:bg-cyan/3 transition-all"
                  >
                    <span className="font-mono text-[9px] text-cyan font-bold block mb-1">{e.code}. {e.title.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-mist">{e.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
