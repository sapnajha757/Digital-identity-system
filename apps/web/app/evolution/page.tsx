"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { apiClient, GraphResponse, GraphNode, GraphEdge } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";
import { motion } from "framer-motion";

const NODE_COLOR: Record<string, { bg: string; border: string; glow: string }> = {
  Document: { bg: "#0d0526", border: "#7a7195", glow: "rgba(122, 113, 149, 0.3)" },
  Skill: { bg: "#0d0526", border: "#FFB627", glow: "rgba(255, 182, 39, 0.3)" },
  Certificate: { bg: "#0d0526", border: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)" },
  Achievement: { bg: "#0d0526", border: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)" },
  Project: { bg: "#0d0526", border: "#FF2E9A", glow: "rgba(255, 46, 154, 0.3)" },
  Internship: { bg: "#0d0526", border: "#FF2E9A", glow: "rgba(255, 46, 154, 0.3)" },
  Organization: { bg: "#0d0526", border: "#a855f7", glow: "rgba(168, 85, 247, 0.3)" },
};

export default function EvolutionPage() {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [playbackStep, setPlaybackStep] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);

  // Growth Stats mock
  const scoreHistory = [
    { label: "Jan", score: 45, nodes: 4, skills: 3 },
    { label: "Feb", score: 55, nodes: 6, skills: 5 },
    { label: "Mar", score: 72, nodes: 8, skills: 6 },
    { label: "Apr", score: 85, nodes: 10, skills: 8 },
    { label: "May", score: 92, nodes: 12, skills: 11 },
  ];

  useEffect(() => {
    apiClient
      .getGraph()
      .then(setGraph)
      .finally(() => setLoading(false));
  }, []);

  // Time travel playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackStep((prev) => {
          if (prev >= (graph?.nodes.length || 1)) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, graph]);

  // Compute sliced nodes for time-travel
  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };
    const center = { x: 300, y: 250 };
    
    // Select subset of nodes based on slider position
    const slicedNodesData = graph.nodes.slice(0, playbackStep);
    const slicedNodeIds = new Set(slicedNodesData.map((n) => n.id));
    const radius = Math.max(160, slicedNodesData.length * 24);

    const nodesList: Node[] = slicedNodesData.map((n, i) => {
      const angle = (2 * Math.PI * i) / Math.max(slicedNodesData.length, 1);
      const colors = NODE_COLOR[n.type] ?? { bg: "#0d0526", border: "#7a7195", glow: "rgba(122, 113, 149, 0.3)" };
      return {
        id: n.id,
        position: {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        },
        data: { label: n.label, type: n.type },
        style: {
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 6,
          color: "#E9E4F0",
          fontFamily: "monospace",
          fontSize: 10,
          padding: "6px 10px",
          boxShadow: `0 0 12px ${colors.glow}`,
          cursor: "pointer",
        },
      };
    });

    const edgesList: Edge[] = graph.edges
      .filter((e) => slicedNodeIds.has(e.source) && slicedNodeIds.has(e.target))
      .map((e, idx) => ({
        id: `playback-edge-${idx}`,
        source: e.source,
        target: e.target,
        label: e.relationship,
        style: { stroke: "#00F0FF", strokeWidth: 1.5 },
        labelStyle: { fill: "#7A7195", fontSize: 8 },
        animated: true,
      }));

    return { nodes: nodesList, edges: edgesList };
  }, [graph, playbackStep]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 07 — GROWTH TRACKING MATRIX</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          Digital Identity Evolution
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Trace career progression indexes, skills growth velocities, and watch the living Knowledge Graph expand chronologically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Score growth history list & Twin evolution */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-6">
          <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised flex-1">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
              📈 Score Growth Trends
            </h2>
            <div className="space-y-4 font-mono text-xs text-mist">
              {scoreHistory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-panel-raised/35 pb-2 last:border-0">
                  <div>
                    <span className="text-fog font-bold">{item.label} (Index update)</span>
                    <p className="text-[10px] text-mist/50">Nodes: {item.nodes} | Verified Skills: {item.skills}</p>
                  </div>
                  <span className="text-cyan font-bold bg-cyan/5 px-2 py-0.5 border border-cyan/35 rounded">
                    {item.score}%
                  </span>
                </div>
              ))}
            </div>
          </HudFrame>

          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-3">
              👥 Career Twin Evolution
            </h2>
            <p className="text-[11px] font-sans text-mist leading-relaxed">
              Your Professional Twin began as a basic <span className="text-cyan font-mono">Backend engineer</span> concept in January. By cataloging certificate details and repository reports across March and May, the twin synthesized your focus towards <span className="text-magenta font-semibold">AI Integration & Knowledge Graph Systems</span>.
            </p>
          </HudFrame>
        </div>

        {/* Right Side: Graph Time Travel playback container */}
        <div className="md:col-span-7 flex">
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised w-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2 mb-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog">
                  ⏱️ Knowledge Graph Time Travel
                </h2>
                <span className="font-mono text-[9px] text-cyan uppercase">// PLAYBACK CONSOLE</span>
              </div>
              <p className="text-[11px] font-sans text-mist/60 leading-normal mb-4">
                Drag the timeline slider to view how nodes and credentials associations are woven chronologically.
              </p>
            </div>

            {/* Micro Flow view */}
            <div className="h-[260px] bg-void/50 border border-panel-raised rounded relative overflow-hidden my-4">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-mist">
                  Loading telemetry...
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#11082d" gap={16} size={1} />
                </ReactFlow>
              )}
            </div>

            {/* Playback controller */}
            <div className="space-y-4 border-t border-panel-raised/40 pt-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 border border-cyan/40 hover:border-cyan text-cyan rounded bg-cyan/5 uppercase tracking-wider font-bold"
                >
                  {isPlaying ? "[Pause playback]" : "[Start timeline playback]"}
                </button>
                <span>Nodes shown: {playbackStep}/{graph?.nodes.length || 0}</span>
              </div>
              <input
                type="range"
                min={2}
                max={graph?.nodes.length || 10}
                value={playbackStep}
                onChange={(e) => setPlaybackStep(Number(e.target.value))}
                className="w-full h-1 bg-panel-raised rounded-lg appearance-none cursor-pointer accent-cyan"
              />
            </div>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}
