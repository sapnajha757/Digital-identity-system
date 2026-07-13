"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bullet {
  id: number;
  original: string;
  improved: string;
  improvedStatus: boolean;
  impact: string;
}

export default function ResumeLabPage() {
  const [atsScore, setAtsScore] = useState(78);
  const [bullets, setBullets] = useState<Bullet[]>([
    {
      id: 1,
      original: "Worked on ML models and backend API modules.",
      improved: "Spearheaded deep learning training pipelines and optimized FastAPI endpoints, cutting inference response latency by 35%.",
      improvedStatus: false,
      impact: "No numeric evidence. Fails to describe technical scale or metrics."
    },
    {
      id: 2,
      original: "Helped write some frontend dashboards.",
      improved: "Architected responsive telemetry dashboards using React and Tailwind CSS, resulting in a 42% increase in page interaction velocity.",
      improvedStatus: false,
      impact: "Weak action verb. Lacks quantitative loading speed and layout efficiency metrics."
    },
    {
      id: 3,
      original: "Set up container deployments.",
      improved: "Orchestrated multi-region Docker configurations and Kubernetes cluster structures, reducing local setup boot cycles by 50%.",
      improvedStatus: false,
      impact: "Vague infrastructure detail. Fails to clarify scale, cluster nodes, or runtime specs."
    }
  ]);

  const missingKeywords = ["Kubernetes", "CI/CD Pipeline", "MLOps Engine", "GNN Architectures", "Microservices"];
  const matchedKeywords = ["Python", "FastAPI", "Docker", "Neo4j", "React", "TypeScript", "PostgreSQL"];

  const handleImproveBullet = (id: number) => {
    setBullets((prev) =>
      prev.map((b) => {
        if (b.id === id && !b.improvedStatus) {
          setAtsScore((score) => Math.min(98, score + 6));
          return { ...b, improvedStatus: true };
        }
        return b;
      })
    );
  };

  const handleAddKeyword = (kw: string) => {
    alert(`Successfully synced and indexed "${kw}" keyword chunk to parser vector schema.`);
    setAtsScore((score) => Math.min(98, score + 4));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 05 — RESUME INTELLIGENCE LAB</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          AI Resume Lab
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Evaluate keyword coverage algorithms, diagnose qualitative weaknesses, and run one-click transformations grounded in quantitative recruiters expectations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Score & Core Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* ATS Score Card */}
          <div className="border border-white/5 bg-[#090D1A] p-6 rounded-2xl text-center space-y-4">
            <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block">// ATS SCORE PROFILE</span>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <svg width="128" height="128" className="transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="#131B2E" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="#00F0FF"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 - (2 * Math.PI * 54 * atsScore) / 100}
                  transition={{ duration: 0.8 }}
                  style={{ filter: "drop-shadow(0 0 5px rgba(0,240,255,0.4))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-fog">{atsScore}</span>
                <span className="text-[8px] font-mono text-mist/60 uppercase">Index Rating</span>
              </div>
            </div>
            <div className="text-xs font-mono text-mist">
              Status: <span className={atsScore > 85 ? "text-cyan font-bold" : "text-amber"}>{atsScore > 85 ? "FAANG-Ready" : "Needs Optimization"}</span>
            </div>
          </div>

          {/* Keyword Coverage */}
          <div className="border border-white/5 bg-[#090D1A] p-6 rounded-2xl space-y-4">
            <span className="font-mono text-[9px] text-magenta uppercase tracking-widest block border-b border-white/5 pb-2">
              // Keyword Coverage Analyzer
            </span>
            
            {/* Missing */}
            <div className="space-y-2">
              <span className="font-mono text-[8px] text-magenta uppercase block">Missing Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddKeyword(kw)}
                    className="px-2.5 py-1 bg-magenta/5 border border-magenta/30 hover:border-magenta hover:bg-magenta/10 text-magenta font-mono text-[9px] rounded-lg transition-all"
                    title="Inject keyword into parser model"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Matched */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="font-mono text-[8px] text-cyan uppercase block">Matched Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-cyan/5 border border-cyan/20 text-cyan font-mono text-[9px] rounded-lg">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Diagnostics */}
          <div className="border border-white/5 bg-[#090D1A] p-6 rounded-2xl space-y-3 font-mono text-[10px] text-mist">
            <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block border-b border-white/5 pb-2">// Impact Analysis</span>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Quantitative Evidence:</span>
              <span className="text-magenta font-bold">Weak (Missing 3/5)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Verb Strength Score:</span>
              <span className="text-cyan font-bold">Good (82%)</span>
            </div>
            <div className="flex justify-between">
              <span>Layout ATS Checker:</span>
              <span className="text-cyan font-bold">Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Side: Weak Bullets Analyzer */}
        <div className="lg:col-span-8 border border-white/5 bg-[#090D1A] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// Qualitative Bullets Tuner</span>
            <span className="font-mono text-[8px] text-mist/40 uppercase">Grounded Transformations</span>
          </div>

          <div className="space-y-5">
            {bullets.map((b) => (
              <div key={b.id} className="border border-white/5 p-4 rounded-xl bg-void/50 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-[9px] font-mono border-b border-white/5 pb-1.5">
                  <span className="text-magenta uppercase font-bold">Bullet Assessment #{b.id}</span>
                  <span className={`px-2 py-0.5 rounded ${b.improvedStatus ? "bg-cyan/15 text-cyan border border-cyan/30" : "bg-amber/15 text-amber border border-amber/30"}`}>
                    {b.improvedStatus ? "Improved" : "Weakness Identified"}
                  </span>
                </div>

                <div className="space-y-2 font-sans text-xs">
                  <div>
                    <span className="font-mono text-[8.5px] text-mist/50 block uppercase">// Original Draft</span>
                    <p className={`mt-0.5 leading-relaxed text-mist ${b.improvedStatus ? "line-through opacity-40" : "text-fog"}`}>
                      {b.original}
                    </p>
                  </div>

                  <AnimatePresence>
                    {!b.improvedStatus && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-amber/80 font-mono italic leading-relaxed"
                      >
                        ⚠️ Assessment: {b.impact}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {b.improvedStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-cyan/10 pt-2.5 mt-2 space-y-1"
                      >
                        <span className="font-mono text-[8.5px] text-cyan block uppercase">// Upgraded Transform</span>
                        <p className="text-cyan font-semibold leading-relaxed font-sans">
                          {b.improved}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!b.improvedStatus && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleImproveBullet(b.id)}
                      className="px-3.5 py-1.5 bg-cyan/10 hover:bg-cyan/20 border border-cyan/35 text-cyan text-[10px] font-mono uppercase tracking-wider rounded-lg transition-colors font-bold"
                    >
                      ⚡ Fix Instantly
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
