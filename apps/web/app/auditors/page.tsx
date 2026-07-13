"use client";

import { useState } from "react";
import { HudFrame } from "@/components/HudFrame";

export default function AuditorsPage() {
  const [activeTab, setActiveTab] = useState<"resume" | "portfolio">("resume");

  // Resume Auditor State variables
  const resumeScore = 88;
  const missingKeywords = ["Kubernetes", "CI/CD Pipeline", "MLOps", "Microservices"];
  const actionVerbs = ["Architected", "Spearheaded", "Calibrated", "Optimized", "Synthesized"];

  // Portfolio Auditor State variables
  const portfolioScore = 92;
  const projectComplexity = "High";
  const readmeStatus = "95% (Excellent)";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 05 — INTELLECTUAL AUDIT AGENT</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          AI Professional Auditor
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Evaluate ATS keywords compatibility, design architectures parameters, and project complexity indexes grounded in verified document uploads.
        </p>
      </div>

      {/* Tabs bar */}
      <div className="flex gap-2 border-b border-panel-raised/40 pb-2">
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-4 py-2 font-mono text-xs uppercase transition-all border-b-2 ${
            activeTab === "resume" ? "border-cyan text-cyan font-bold" : "border-transparent text-mist hover:text-fog"
          }`}
        >
          Resume Auditor
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 py-2 font-mono text-xs uppercase transition-all border-b-2 ${
            activeTab === "portfolio" ? "border-cyan text-cyan font-bold" : "border-transparent text-mist hover:text-fog"
          }`}
        >
          Portfolio Auditor
        </button>
      </div>

      {activeTab === "resume" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Main audit metrics */}
          <div className="md:col-span-8 space-y-6">
            <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
                📈 ATS Keyword Match Assessment
              </h2>
              <div className="space-y-4 font-sans text-xs text-mist">
                <div className="flex justify-between items-center bg-void/50 p-4 border border-panel-raised rounded">
                  <div>
                    <span className="font-mono text-[10px] text-cyan block mb-1">// ATS SCORES INDEX</span>
                    <p className="text-[11px] text-mist/60 leading-normal">Evaluates structural keywords density based on target AI Developer profiles.</p>
                  </div>
                  <span className="font-display text-3xl font-bold text-cyan">{resumeScore}/100</span>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-magenta uppercase font-bold tracking-wider">// missing technologies identified</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {missingKeywords.map((word, idx) => (
                      <span key={idx} className="bg-magenta/5 border border-magenta/30 text-magenta text-[9px] px-2 py-0.5 rounded font-mono">
                        {word}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-mist/60 mt-1">
                    💡 Tip: Integrate these keywords into your Resume project descriptions to rank higher in recruiter screenings.
                  </p>
                </div>

                <div className="space-y-2 border-t border-panel-raised/40 pt-4">
                  <span className="font-mono text-[9px] text-cyan uppercase font-bold tracking-wider">// recommended action verbs</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {actionVerbs.map((verb, idx) => (
                      <span key={idx} className="bg-cyan/5 border border-cyan/30 text-cyan text-[9px] px-2 py-0.5 rounded font-mono">
                        {verb}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </HudFrame>

            <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2">
                ✍️ Structural Formatting Checks
              </h2>
              <div className="space-y-3 font-mono text-[11px] text-mist">
                <div className="flex justify-between items-center border-b border-panel-raised/30 pb-2">
                  <span>Contact Information & Email:</span>
                  <span className="text-cyan font-bold">✓ Verified</span>
                </div>
                <div className="flex justify-between items-center border-b border-panel-raised/30 pb-2">
                  <span>Linked Social Profiles URL:</span>
                  <span className="text-cyan font-bold">✓ Verified</span>
                </div>
                <div className="flex justify-between items-center border-b border-panel-raised/30 pb-2">
                  <span>Project Bullet Achievements:</span>
                  <span className="text-magenta font-bold">⚠️ Needs Quantitative Data</span>
                </div>
              </div>
              <p className="text-[10.5px] font-sans text-mist/60 leading-normal">
                Evidence extracted from <span className="text-cyan font-mono">Resume.pdf</span> indicates that while technical projects are detailed, adding performance improvements metrics (e.g. &quot;optimized query latency by 40%&quot;) would enhance impact.
              </p>
            </HudFrame>
          </div>

          {/* Checklist side panel */}
          <div className="md:col-span-4">
            <HudFrame accent="cyan" className="bg-panel/40 p-5 rounded-lg border border-panel-raised space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2">
                📝 ATS Optimizer checklist
              </h3>
              <div className="space-y-3 font-mono text-[10px] text-mist">
                <div className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-cyan" />
                  <span>Verify document OCR flow status</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-cyan" />
                  <span>Map project items to Skill tags</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 accent-cyan" />
                  <span>Integrate missing MLOps framework tag</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 accent-cyan" />
                  <span>Add links to deployed web applications</span>
                </div>
              </div>
            </HudFrame>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Portfolio Auditor */}
          <div className="md:col-span-8 space-y-6">
            <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
                🛡️ Portfolio Quality Diagnostics
              </h2>
              <div className="space-y-4 font-sans text-xs text-mist">
                <div className="flex justify-between items-center bg-void/50 p-4 border border-panel-raised rounded">
                  <div>
                    <span className="font-mono text-[10px] text-cyan block mb-1">// QUALITY INDEX SCORE</span>
                    <p className="text-[11px] text-mist/60 leading-normal">Evaluates public documentation clarity, repository structure, and live deployment urls.</p>
                  </div>
                  <span className="font-display text-3xl font-bold text-cyan">{portfolioScore}/100</span>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
                  <div className="border border-panel-raised p-3 rounded bg-void/30">
                    <span className="text-mist block text-[8px] uppercase font-bold">// project diversity</span>
                    <span className="block text-fog font-bold mt-1">Excellent (4 domains)</span>
                  </div>
                  <div className="border border-panel-raised p-3 rounded bg-void/30">
                    <span className="text-mist block text-[8px] uppercase font-bold">// documentation clarity</span>
                    <span className="block text-fog font-bold mt-1">{readmeStatus}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-panel-raised/40 pt-4">
                  <span className="font-mono text-[9px] text-magenta uppercase font-bold tracking-wider block">// areas for optimization</span>
                  <div className="space-y-2 font-mono text-[10px] text-mist">
                    <div className="flex justify-between border-b border-panel-raised/35 pb-1">
                      <span>Live Demo URLs:</span>
                      <span className="text-magenta font-bold">2 Missing</span>
                    </div>
                    <div className="flex justify-between border-b border-panel-raised/35 pb-1">
                      <span>Architecture Diagrams:</span>
                      <span className="text-cyan font-bold">Linked (1 project)</span>
                    </div>
                  </div>
                </div>
              </div>
            </HudFrame>

            <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2">
                📂 Grounded Evidence Sources
              </h2>
              <p className="text-[11px] font-sans text-mist leading-relaxed">
                Auditor analysis is cross-referenced with your verified workspace repositories. In particular, <span className="text-cyan font-mono">React_Project_Report.pdf</span> and <span className="text-cyan font-mono">Portfolio.pdf</span> validate frontend design and layout credentials, while backend architectures were inferred from Neo4j node links.
              </p>
            </HudFrame>
          </div>

          <div className="md:col-span-4">
            <HudFrame accent="cyan" className="bg-panel/40 p-5 rounded-lg border border-panel-raised space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2">
                🚀 Innovation checklist
              </h3>
              <div className="space-y-3 font-mono text-[10px] text-mist">
                <div className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-cyan" />
                  <span>Verify license parameters in repo</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 accent-cyan" />
                  <span>Embed Mermaid architecture flowchart</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 accent-cyan" />
                  <span>Link verified cloud certificate credentials</span>
                </div>
              </div>
            </HudFrame>
          </div>
        </div>
      )}
    </div>
  );
}
