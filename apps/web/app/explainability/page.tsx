"use client";

import { useState } from "react";
import { HudFrame } from "@/components/HudFrame";

interface SourceItem {
  filename: string;
  sourceText: string;
  confidence: number;
  weight: number;
}

export default function ExplainabilityPage() {
  const [selectedSource, setSelectedSource] = useState<number>(0);

  const sources: SourceItem[] = [
    {
      filename: "Resume.pdf",
      sourceText: "Associate ML Engineer at tech incubator. Spearheaded Python microservices using FastAPI, Docker container orchestration, and Neo4j graph schemas.",
      confidence: 96,
      weight: 90
    },
    {
      filename: "AWS_Certificate.pdf",
      sourceText: "Certified Solutions Architect Associate demonstrating ability to design resilient architectures on Amazon Web Services cloud infrastructure.",
      confidence: 98,
      weight: 95
    },
    {
      filename: "React_Project_Report.pdf",
      sourceText: "Implemented responsive web dashboard using React, Tailwind CSS utility layers, and interactive timeline analytics interfaces.",
      confidence: 94,
      weight: 85
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 08 — COGNITIVE EXPLAINABILITY CONTROL</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          Explainability Center
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Trace grounding evidence chunks, confidence ratings, and review exact document locations that influenced your Core Index scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Grounding details list */}
        <div className="md:col-span-7 space-y-6">
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2">
              📂 Grounded Document Citations
            </h2>
            <div className="space-y-3 font-mono text-xs">
              {sources.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSource(idx)}
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    selectedSource === idx ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised text-mist hover:border-mist"
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{item.filename}</span>
                    <span className="text-[10px]">Confidence: {item.confidence}%</span>
                  </div>
                  <p className="mt-2 text-[10px] text-mist/70 leading-relaxed truncate font-sans">
                    {item.sourceText}
                  </p>
                </div>
              ))}
            </div>
          </HudFrame>

          {/* Selected chunk details container */}
          <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog">
              🔎 Chunk Vector Diagnostics
            </h2>
            <div className="bg-void/50 border border-panel-raised p-4 rounded space-y-3 font-mono text-xs text-mist">
              <div>
                <span className="text-cyan block mb-0.5">// source path</span>
                <span className="text-fog font-bold">{sources[selectedSource].filename}</span>
              </div>
              <div>
                <span className="text-cyan block mb-0.5">// matching chunk content</span>
                <p className="text-[11px] leading-relaxed text-fog font-sans font-light italic bg-void p-2.5 rounded border border-panel-raised/40">
                  &quot;{sources[selectedSource].sourceText}&quot;
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] border-t border-panel-raised/40 pt-2.5 mt-2">
                <span>Vector Score Match: {sources[selectedSource].confidence}%</span>
                <span>Neo4j confidence weight: {sources[selectedSource].weight}%</span>
              </div>
            </div>
          </HudFrame>
        </div>

        {/* Right Side: Explainability charts */}
        <div className="md:col-span-5 space-y-6">
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2">
              ⚖️ Confidence Weights Mappings
            </h2>
            <div className="space-y-4 font-mono text-[11px] text-mist">
              <div>
                <div className="flex justify-between mb-1">
                  <span>ATS Skills Weight:</span>
                  <span className="text-cyan font-bold">95%</span>
                </div>
                <div className="w-full bg-void/50 h-1.5 rounded overflow-hidden">
                  <div className="bg-cyan h-full" style={{ width: "95%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Verification Credibility:</span>
                  <span className="text-cyan font-bold">90%</span>
                </div>
                <div className="w-full bg-void/50 h-1.5 rounded overflow-hidden">
                  <div className="bg-cyan h-full" style={{ width: "90%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Graph Node Completeness:</span>
                  <span className="text-magenta font-bold">85%</span>
                </div>
                <div className="w-full bg-void/50 h-1.5 rounded overflow-hidden">
                  <div className="bg-magenta h-full" style={{ width: "85%" }} />
                </div>
              </div>
            </div>
          </HudFrame>

          <HudFrame accent="magenta" className="bg-panel/40 p-5 rounded-lg border border-panel-raised space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fog">
              💡 Affected System Metrics
            </h3>
            <p className="text-[11.5px] font-sans text-mist leading-relaxed">
              Updating these source files or improving the quality index will immediately trigger recalculation pipelines in your **Core Completeness Score** and **Career Twin recommended next milestones**.
            </p>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}
