"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RetrievedChunk {
  id: string;
  source: string;
  text: string;
  score: number;
}

interface ReasoningNode {
  id: string;
  type: "chunk" | "skill" | "role" | "output";
  label: string;
}

interface ReasoningEdge {
  from: string;
  to: string;
  label: string;
}

export default function ExplainabilityPage() {
  const [selectedChunkId, setSelectedChunkId] = useState<string>("c1");

  const chunks: RetrievedChunk[] = [
    { id: "c1", source: "resume.pdf", text: "Led migration of legacy monolith to FastAPI microservices on AWS EKS.", score: 0.94 },
    { id: "c2", source: "github_sync", text: "Commit: 'feat: add vector search indexing with pgvector'", score: 0.88 },
    { id: "c3", source: "linkedin_profile", text: "Endorsed for System Architecture and Cloud Computing by 14 colleagues.", score: 0.82 },
    { id: "c4", source: "aws_cert.pdf", text: "AWS Certified Solutions Architect – Professional (Valid till 2026)", score: 0.97 },
  ];

  const nodes: ReasoningNode[] = [
    { id: "c1", type: "chunk", label: "FastAPI / EKS" },
    { id: "c2", type: "chunk", label: "pgvector" },
    { id: "c4", type: "chunk", label: "AWS Pro" },
    { id: "s1", type: "skill", label: "Cloud Native" },
    { id: "s2", type: "skill", label: "Vector DBs" },
    { id: "r1", type: "role", label: "AI Architect" },
  ];

  const edges: ReasoningEdge[] = [
    { from: "c1", to: "s1", label: "infers" },
    { from: "c4", to: "s1", label: "validates" },
    { from: "c2", to: "s2", label: "demonstrates" },
    { from: "s1", to: "r1", label: "requires" },
    { from: "s2", to: "r1", label: "requires" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 bg-void text-fog min-h-screen flex flex-col space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">// 08 — TRACEABILITY & EXPLAINABILITY ENGINE</p>
          <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-wider text-white">
            Inference Debugger
          </h1>
        </div>
        <div className="flex gap-2 font-mono text-[10px] text-mist/60 uppercase">
          <span className="px-2 py-1 border border-white/5 bg-white/5 rounded">Engine: GPT-4 Omni</span>
          <span className="px-2 py-1 border border-cyan/20 text-cyan bg-cyan/5 rounded flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" /> Live Trace
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* LEFT COLUMN: Retrieved Chunks */}
        <div className="lg:col-span-3 flex flex-col border border-white/5 bg-[#090D1A] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist">1. Vector Retrieval</span>
            <span className="font-mono text-[9px] text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">Top K=4</span>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {chunks.map((chunk) => (
              <div 
                key={chunk.id} 
                onClick={() => setSelectedChunkId(chunk.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedChunkId === chunk.id 
                    ? "border-cyan bg-cyan/5" 
                    : "border-white/5 hover:border-white/20 bg-void/50"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${selectedChunkId === chunk.id ? "bg-cyan text-[#090D1A] font-bold" : "bg-white/10 text-mist"}`}>
                    {chunk.source}
                  </span>
                  <span className="font-mono text-[9px] text-magenta">
                    {(chunk.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className={`text-[11px] font-sans leading-relaxed ${selectedChunkId === chunk.id ? "text-cyan" : "text-mist"}`}>
                  &quot;{chunk.text}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: GNN Reasoning Paths */}
        <div className="lg:col-span-5 flex flex-col border border-white/5 bg-[#090D1A] rounded-xl overflow-hidden relative">
          <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0 z-10 relative">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist">2. Reasoning Graph</span>
            <span className="font-mono text-[9px] text-magenta bg-magenta/10 px-1.5 py-0.5 rounded">Multi-hop GNN</span>
          </div>
          
          <div className="flex-1 relative p-6 flex flex-col justify-center items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]">
            <div className="absolute inset-0 bg-scanlines opacity-5 pointer-events-none" />
            
            {/* Visual Graph Representation */}
            <div className="relative w-full h-[400px] flex items-center justify-center">
              {/* Fake SVG Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0,240,255,0.5)" />
                    <stop offset="100%" stopColor="rgba(255,0,255,0.5)" />
                  </linearGradient>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,0,255,0.6)" />
                  </marker>
                </defs>
                
                {/* Lines simulating paths */}
                <path d="M 120 100 C 180 100, 220 150, 280 150" fill="none" stroke="url(#edge-grad)" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow)" className="animate-pulse" />
                <path d="M 120 200 C 180 200, 220 150, 280 150" fill="none" stroke="rgba(0,240,255,0.3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <path d="M 120 300 C 180 300, 220 250, 280 250" fill="none" stroke="rgba(0,240,255,0.3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <path d="M 320 150 C 380 150, 420 200, 480 200" fill="none" stroke="url(#edge-grad)" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow)" className="animate-pulse" />
                <path d="M 320 250 C 380 250, 420 200, 480 200" fill="none" stroke="url(#edge-grad)" strokeWidth="1.5" markerEnd="url(#arrow)" />
              </svg>

              {/* Fake Nodes */}
              <div className="absolute left-[80px] top-[80px] bg-void border border-cyan/40 px-3 py-1.5 rounded text-[10px] font-mono text-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">c1: FastAPI/EKS</div>
              <div className="absolute left-[80px] top-[180px] bg-void border border-white/20 px-3 py-1.5 rounded text-[10px] font-mono text-mist">c4: AWS Pro</div>
              <div className="absolute left-[80px] top-[280px] bg-void border border-white/20 px-3 py-1.5 rounded text-[10px] font-mono text-mist">c2: pgvector</div>

              <div className="absolute left-[280px] top-[130px] bg-cyan/10 border border-cyan px-3 py-1.5 rounded text-[10px] font-mono text-cyan font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]">s1: Cloud Native</div>
              <div className="absolute left-[280px] top-[230px] bg-void border border-white/20 px-3 py-1.5 rounded text-[10px] font-mono text-mist">s2: Vector DBs</div>

              <div className="absolute left-[480px] top-[180px] bg-magenta/10 border border-magenta px-4 py-2 rounded text-[11px] font-mono text-magenta font-bold shadow-[0_0_25px_rgba(255,0,255,0.4)]">r1: AI Architect</div>
            </div>

            {/* Explanation box */}
            <div className="absolute bottom-6 left-6 right-6 bg-void/80 backdrop-blur border border-white/10 p-3 rounded-lg text-xs font-sans text-mist leading-relaxed text-center">
              The system connects evidence <span className="text-cyan font-mono">c1</span> and <span className="text-cyan font-mono">c4</span> to substantiate the <span className="text-white font-bold">Cloud Native</span> skill, satisfying a core requirement for the <span className="text-magenta font-bold">AI Architect</span> target role.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Explanation */}
        <div className="lg:col-span-4 flex flex-col border border-white/5 bg-[#090D1A] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist">3. Synthesis Output</span>
            <span className="font-mono text-[9px] text-amber bg-amber/10 px-1.5 py-0.5 rounded">Final Generation</span>
          </div>
          
          <div className="p-5 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
            
            <div className="space-y-2">
              <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block border-b border-white/5 pb-1">Context Injected</span>
              <div className="bg-void p-3 rounded border border-white/5 text-[10px] font-mono text-mist/80 leading-relaxed max-h-32 overflow-y-auto">
                <p>System Prompt: You are a technical career evaluator. Based on the provided validated skill nodes, generate a one-sentence role alignment justification.</p>
                <p className="mt-2 text-cyan">Input: [Cloud Native: verified, Vector DBs: verified]</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] text-magenta uppercase tracking-widest block border-b border-white/5 pb-1">Generated Output</span>
              <div className="bg-magenta/5 border border-magenta/20 p-4 rounded-lg relative">
                <div className="absolute -left-1 top-4 bottom-4 w-0.5 bg-magenta rounded-full" />
                <p className="text-sm font-sans text-white leading-relaxed">
                  The candidate possesses validated expertise in Cloud Native architectures and Vector Database implementations, strongly aligning with the technical requirements for an AI Systems Architect role.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <span className="font-mono text-[9px] text-mist uppercase tracking-widest block border-b border-white/5 pb-1">Confidence Metrics</span>
              <ul className="space-y-2 text-[11px] font-mono">
                <li className="flex justify-between items-center">
                  <span className="text-mist">Factual Grounding</span>
                  <span className="text-cyan font-bold">98%</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-mist">Relevance Score</span>
                  <span className="text-cyan font-bold">94%</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-mist">Hallucination Risk</span>
                  <span className="text-magenta font-bold">Low (0.02)</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
