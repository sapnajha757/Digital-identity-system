"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, DocumentOut, InsightItem, DashboardMetricsResponse } from "@/lib/api-client";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadControl } from "@/components/UploadControl";
import { HudFrame } from "@/components/HudFrame";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    }, 10);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="relative font-mono text-fog text-xs md:text-sm leading-relaxed tracking-wide min-h-[60px]">
      <span className="text-cyan font-bold block mb-2">// COGNITIVE STATEMENT:</span>
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
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Completion sequence states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Counter animation state for Gauge
  const [animatedScore, setAnimatedScore] = useState(0);

  const loadDocs = useCallback(() => {
    setLoading(true);
    apiClient
      .listDocuments()
      .then(setDocuments)
      .catch((err) => console.error(err))
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
      .then((res) => {
        setMetrics(res);
        let count = 0;
        const target = res.identity_score ?? 10;
        const interval = setInterval(() => {
          if (count >= target) {
            setAnimatedScore(target);
            clearInterval(interval);
          } else {
            count += 1;
            setAnimatedScore(count);
          }
        }, 12);
      })
      .catch((err) => console.error("Could not load metrics:", err));
  }, []);

  useEffect(() => {
    setDemoMode(localStorage.getItem("dis_demo_mode") === "true");
    loadDocs();
    loadInsights();
    loadMetrics();
  }, [loadDocs, loadInsights, loadMetrics]);

  const triggerCompletionSequence = () => {
    setIsProcessing(true);
    setProcessingStep(0);
    const steps = [
      "Analyzing Relationships...",
      "Knowledge Graph Synchronized",
      "Career Twin Updated",
      "Timeline Refreshed",
      "Confidence Score Improved",
      "Verification Complete"
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          loadDocs();
          loadInsights();
          loadMetrics();
        }, 800);
      } else {
        setProcessingStep(current);
      }
    }, 600);
  };

  const handleUploadComplete = () => {
    triggerCompletionSequence();
  };

  const score = metrics?.identity_score ?? 10;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const isBlank = !loading && documents.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 bg-void text-fog min-h-screen space-y-8 relative overflow-hidden">
      
      {/* PROCESSING COMPLETION MODAL OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-md"
          >
            <HudFrame accent="cyan" className="bg-panel/85 p-8 max-w-md w-full border border-cyan/45 shadow-glow-cyan/20">
              <div className="text-center mb-6">
                <span className="font-mono text-[9px] text-magenta tracking-widest uppercase font-bold select-none">// COMPILING COGNITIVE PROFILE</span>
                <h3 className="text-lg font-display font-black text-fog uppercase mt-1">Identity Construction</h3>
              </div>
              <div className="space-y-3 font-mono text-xs text-mist">
                {[
                  "Analyzing Relationships...",
                  "Knowledge Graph Synchronized",
                  "Career Twin Updated",
                  "Timeline Refreshed",
                  "Confidence Score Improved",
                  "Verification Complete"
                ].map((step, idx) => {
                  const done = processingStep > idx;
                  const active = processingStep === idx;
                  return (
                    <div key={idx} className="flex items-center justify-between border-b border-panel-raised/40 pb-2">
                      <span className={active ? "text-cyan font-bold" : done ? "text-fog" : "text-mist/40"}>
                        {active ? "> " : ""}{step}
                      </span>
                      <span>
                        {done ? (
                          <span className="text-cyan font-bold">✓</span>
                        ) : active ? (
                          <span className="inline-block w-2.5 h-2.5 bg-magenta animate-ping rounded-full shrink-0" />
                        ) : (
                          <span className="text-mist/20">[WAITING]</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </HudFrame>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative border border-panel-raised bg-panel/35 p-6 md:p-8 rounded-lg shadow-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="font-mono text-[9px] text-magenta tracking-widest uppercase font-bold select-none">// IDENTITY ENGINE READY STATE</span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-fog">
              Professional Twin Engine
            </h1>
            <p className="mt-1.5 text-xs text-mist font-mono">
              Engine status: <span className="text-cyan font-bold">Active Telemetry</span> | Demo Portfolio: <span className="text-cyan font-bold">{demoMode ? "Preloaded" : "Inactive"}</span> | Sync Index: <span className="text-cyan font-bold">{score}%</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/portfolio"
              className="px-4 py-2 border border-magenta/40 hover:border-magenta bg-magenta/5 hover:bg-magenta/15 text-magenta font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200"
            >
              [SHARE PROFILE]
            </Link>
            <Link 
              href="/chat"
              className="px-4 py-2 border border-cyan/40 hover:border-cyan bg-cyan/5 hover:bg-cyan/15 text-cyan font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200"
            >
              [ASK AI COGNITION]
            </Link>
          </div>
        </div>
      </motion.div>

      {isBlank ? (
        /* STUNNING ONBOARDING EMPTY STATE */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-dashed border-panel-raised/80 bg-panel/10 p-12 text-center rounded-lg space-y-6 max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 mx-auto bg-cyan/5 border border-cyan/35 flex items-center justify-center rounded-full shadow-glow-cyan/10">
            <span className="font-mono text-cyan text-xl">ID</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-lg font-black text-fog uppercase">Your digital identity hasn&apos;t been discovered yet.</h3>
            <p className="text-xs text-mist font-mono max-w-md mx-auto leading-relaxed">
              Upload your resume, certificates, internship letters, or project docs. Let IdentityOS build and validate your professional journey.
            </p>
          </div>
          <div className="max-w-xs mx-auto pt-2">
            <UploadControl onUploaded={handleUploadComplete} />
          </div>
          <div className="text-[10px] font-mono text-mist/60 space-y-1">
            <div>💡 Pro Tip: Toggle &quot;DEMO PRESENTATION&quot; in the sidebar to preview with rich mock data.</div>
          </div>
        </motion.div>
      ) : (
        /* FULL DYNAMIC DASHBOARD STORYBOARD */
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          
          {/* Identity Score & AI Narrative Block */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: AI Narrative */}
            <div className="lg:col-span-8 flex">
              <HudFrame accent="cyan" className="bg-panel/40 w-full flex flex-col justify-between p-6 rounded-lg border border-panel-raised">
                <div>
                  <div className="flex justify-between items-center border-b border-panel-raised/50 pb-3">
                    <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// COGNITIVE SYNOPSIS NARRATIVE</span>
                    <span className="font-mono text-[9px] text-mist/60 uppercase">EVALUATOR ON</span>
                  </div>
                  <div className="mt-6">
                    {metrics?.ai_summary_narrative ? (
                      <StreamingNarrative text={metrics.ai_summary_narrative} />
                    ) : (
                      <p className="font-mono text-xs text-mist/50">// Graph analyzing footprint...</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 text-[9px] font-mono text-mist/65 flex justify-between items-center border-t border-panel-raised/50 pt-3">
                  <span>Dynamic validation matches: {documents.length} sources</span>
                  <span>Evaluated in real-time</span>
                </div>
              </HudFrame>
            </div>

            {/* Right: Radial Completeness Gauge */}
            <div className="lg:col-span-4 flex">
              <HudFrame accent="magenta" className="bg-panel/40 w-full flex flex-col justify-between items-center p-6 text-center rounded-lg border border-panel-raised">
                <div className="w-full text-left border-b border-panel-raised/50 pb-3">
                  <span className="font-mono text-[9px] text-magenta uppercase tracking-widest font-bold">// CAPABILITY INDEX</span>
                </div>

                <div className="my-6 relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="50" stroke="#191F2A" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="64" cy="64" r="50" 
                      stroke="#4F8CFF" strokeWidth="8" fill="transparent"
                      strokeDasharray="314.15"
                      strokeDashoffset={314.15 - (314.15 * animatedScore) / 100}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-display text-3xl font-black text-fog tracking-tight">{animatedScore}%</span>
                    <span className="font-mono text-[8px] text-mist/60 uppercase font-semibold">Completeness</span>
                  </div>
                </div>

                <div className="w-full text-left space-y-1.5 font-mono text-[9px] text-mist">
                  {metrics?.score_breakdown ? (
                    Object.entries(metrics.score_breakdown).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-panel-raised/30 pb-1 last:border-0 last:pb-0">
                        <span>{key}:</span>
                        <span className="text-cyan font-bold">+{val} pts</span>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-mist/40 text-[9px] text-center">// Awaiting scoring parameters</p>
                  )}
                </div>
              </HudFrame>
            </div>
          </motion.div>

          {/* Identity Health and Career Twin Prediction */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Identity Health Widget */}
            <div className="lg:col-span-6 flex">
              <HudFrame accent="cyan" className="bg-panel/40 w-full p-6 rounded-lg border border-panel-raised space-y-4">
                <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2">
                  <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// IDENTITY HEALTH ANALYSIS</span>
                  <span className="font-mono text-[9px] text-cyan bg-cyan/10 px-1.5 py-0.5 rounded font-bold border border-cyan/35">
                    {score >= 90 ? "EXCELLENT" : score >= 70 ? "STRONG" : "NEEDS ALIGNMENT"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="space-y-2 border-r border-panel-raised/40 pr-2">
                    <span className="text-cyan text-[9px] uppercase tracking-wider font-bold block">// STRONG AREAS</span>
                    <div className="space-y-1 text-fog text-[11px]">
                      <div>✓ Projects Extracted</div>
                      <div>✓ Skills Calibrated</div>
                      <div>✓ Document Validity</div>
                    </div>
                  </div>
                  <div className="space-y-2 pl-2">
                    <span className="text-magenta text-[9px] uppercase tracking-wider font-bold block">// IMPROVEMENT GAPS</span>
                    <div className="space-y-1 text-mist text-[11px]">
                      <div>• AWS Advanced Cert</div>
                      <div>• Multi-source Validation</div>
                      <div>• GNN Deployment Index</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono bg-void/50 border border-panel-raised p-2.5 rounded text-cyan">
                  💡 Recommendation: Document container architecture or helm charts for your Graph Search Indexer.
                </div>
              </HudFrame>
            </div>

            {/* Right: Career Twin Metrics */}
            <div className="lg:col-span-6 flex">
              <HudFrame accent="magenta" className="bg-panel/40 w-full p-6 rounded-lg border border-panel-raised space-y-4">
                <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2">
                  <span className="font-mono text-[9px] text-magenta uppercase tracking-widest font-bold select-none">// CAREER TWIN PREDICTIONS</span>
                </div>
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-mist block text-[8px] uppercase tracking-wider font-bold">// role prediction</span>
                    <span className="block text-[11px] font-semibold text-fog mt-1">
                      {metrics?.career_twin?.current_role_trend ?? "Undetermined"}
                    </span>
                  </div>
                  <div>
                    <span className="text-mist block text-[8px] uppercase tracking-wider font-bold">// career direction</span>
                    <span className="block text-[11px] text-fog mt-1">
                      {metrics?.career_twin?.career_direction ?? "Analyzing footprint"}
                    </span>
                  </div>
                </div>
                <div className="border-t border-panel-raised/50 pt-2.5">
                  <span className="text-magenta block text-[8px] uppercase tracking-wider font-bold mb-1.5">// strongest skills</span>
                  <div className="flex flex-wrap gap-1">
                    {metrics?.career_twin?.strongest_skills?.map((skill, idx) => (
                      <span key={idx} className="bg-cyan/5 border border-cyan/30 text-cyan text-[8.5px] px-1.5 py-0.5 rounded font-bold">
                        {skill}
                      </span>
                    )) ?? <span className="italic text-[8px]">Awaiting documents...</span>}
                  </div>
                </div>
              </HudFrame>
            </div>
          </motion.div>

          {/* Intelligence Insights & Ingestion Queue */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Insights */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border-b border-panel-raised pb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan rounded-full shadow-glow-cyan" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Actionable Insights</h2>
              </div>
              {insightsLoading ? (
                <div className="space-y-4">
                  <div className="h-24 bg-panel/30 border border-panel-raised rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="border border-panel-raised bg-panel/40 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-cyan/25 bg-cyan/5 text-cyan">
                          {insight.type}
                        </span>
                        <span className="text-[9px] font-mono text-mist/60 uppercase">{insight.impact} impact</span>
                      </div>
                      <h3 className="mt-1 text-xs font-semibold font-display text-fog uppercase">{insight.title}</h3>
                      <p className="mt-1 text-[10.5px] text-mist font-sans leading-relaxed">{insight.description}</p>
                      <div className="mt-2 text-[9px] font-mono text-cyan bg-void/50 p-2 rounded border border-panel-raised/40">
                        → {insight.actionable_step}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Ingestion Gate */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border-b border-panel-raised pb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-magenta rounded-full" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-fog">Ingestion gate</h2>
              </div>
              <div className="bg-panel/40 border border-panel-raised p-4 rounded-lg space-y-4">
                <UploadControl onUploaded={handleUploadComplete} />
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {documents.slice(0, 2).map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cinematic Timeline Preview & Knowledge Graph Preview */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Timeline Preview */}
            <div className="lg:col-span-6 flex">
              <HudFrame accent="cyan" className="bg-panel/40 w-full p-6 rounded-lg border border-panel-raised flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2 mb-4">
                    <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// TIMELINE TELEMETRY PREVIEW</span>
                    <Link href="/timeline" className="text-[9px] font-mono text-cyan hover:underline">[VIEW FULL]</Link>
                  </div>
                  <div className="relative border-l border-cyan/20 pl-4 space-y-4 py-1">
                    {demoMode ? (
                      <>
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan border border-void" />
                          <span className="font-mono text-[8px] text-cyan font-bold block">2026-06-15</span>
                          <span className="font-display text-xs text-fog font-bold block uppercase">Google Software Engineering Intern</span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan/50 border border-void" />
                          <span className="font-mono text-[8px] text-mist/60 block">2026-03-10</span>
                          <span className="font-display text-xs text-mist font-semibold block uppercase">AWS Certified Cloud Practitioner</span>
                        </div>
                      </>
                    ) : (
                      <p className="font-mono text-xs text-mist/40 italic">// Complete timeline visualization generated downstream</p>
                    )}
                  </div>
                </div>
              </HudFrame>
            </div>

            {/* Knowledge Graph Preview */}
            <div className="lg:col-span-6 flex">
              <HudFrame accent="magenta" className="bg-panel/40 w-full p-6 rounded-lg border border-panel-raised flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2 mb-4">
                    <span className="font-mono text-[9px] text-magenta uppercase tracking-widest font-bold">// NETWORK TELEMETRY PREVIEW</span>
                    <Link href="/graph" className="text-[9px] font-mono text-magenta hover:underline">[VIEW FULL]</Link>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
                    <div className="border border-panel-raised p-2 rounded bg-void/50 text-cyan">
                      <span>● User</span>
                      <span className="block text-[8px] text-mist mt-1">Sapna Jha</span>
                    </div>
                    <div className="border border-panel-raised p-2 rounded bg-void/50 text-magenta">
                      <span>▲ Node</span>
                      <span className="block text-[8px] text-mist mt-1">GNN paper</span>
                    </div>
                    <div className="border border-panel-raised p-2 rounded bg-void/50 text-amber">
                      <span>■ Skill</span>
                      <span className="block text-[8px] text-mist mt-1">PyTorch</span>
                    </div>
                  </div>
                </div>
              </HudFrame>
            </div>
          </motion.div>

          {/* Suggested Next Steps */}
          <motion.div variants={itemVariants} className="border border-panel-raised p-6 bg-panel/30 rounded-lg space-y-4">
            <h4 className="font-display text-xs font-bold text-fog uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              Suggested Next Steps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
              <div className="border border-panel-raised/60 p-3 bg-void/40 rounded-sm">
                <span className="text-cyan font-bold block mb-1">01. EXPAND EXPERTISE</span>
                <span className="text-mist">Acquire and verify a Kubernetes certification.</span>
              </div>
              <div className="border border-panel-raised/60 p-3 bg-void/40 rounded-sm">
                <span className="text-cyan font-bold block mb-1">02. SYNC LINKEDIN</span>
                <span className="text-mist">Add custom profile credentials link to validator.</span>
              </div>
              <div className="border border-panel-raised/60 p-3 bg-void/40 rounded-sm">
                <span className="text-cyan font-bold block mb-1">03. MAP RAG GRAPH</span>
                <span className="text-mist">Engage in Identity AI chat using index queries.</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
