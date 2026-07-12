"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { apiClient, GraphResponse } from "@/lib/api-client";

const NODE_COLOR: Record<string, { bg: string; border: string }> = {
  Document: { bg: "#150A2E", border: "#7A7195" },
  Skill: { bg: "#150A2E", border: "#FFB627" },
  Certificate: { bg: "#150A2E", border: "#00F0FF" },
  Achievement: { bg: "#150A2E", border: "#00F0FF" },
  Project: { bg: "#150A2E", border: "#FF2E9A" },
  Internship: { bg: "#150A2E", border: "#FF2E9A" },
};

function layoutGraph(graph: GraphResponse): { nodes: Node[]; edges: Edge[] } {
  const center = { x: 420, y: 320 };
  const radius = Math.max(180, graph.nodes.length * 18);

  const nodes: Node[] = graph.nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(graph.nodes.length, 1);
    const colors = NODE_COLOR[n.type] ?? { bg: "#150A2E", border: "#7A7195" };
    return {
      id: n.id,
      position: {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      },
      data: { label: n.label },
      style: {
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 4,
        color: "#E9E4F0",
        fontFamily: "var(--font-rajdhani)",
        fontSize: 12,
        padding: "8px 12px",
        boxShadow: `0 0 10px ${colors.border}33`,
      },
    };
  });

  const edges: Edge[] = graph.edges.map((e, i) => ({
    id: `${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    label: e.relationship,
    style: { stroke: "#7A7195" },
    labelStyle: { fill: "#7A7195", fontFamily: "var(--font-jetbrains)", fontSize: 10 },
    animated: false,
  }));

  return { nodes, edges };
}

export default function GraphPage() {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getGraph()
      .then(setGraph)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { nodes, edges } = useMemo(() => (graph ? layoutGraph(graph) : { nodes: [], edges: [] }), [graph]);

  return (
    <div className="flex h-screen flex-col px-6 py-8 md:px-10">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 03 — GRAPH</p>
        <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide text-fog">
          <span className="gradient-text">Network map.</span>
        </h1>
        <p className="mt-3 max-w-xl text-mist">
          Certificates that granted skills, skills used in projects — the relationships behind your documents.
        </p>
      </div>

      <div className="my-8 h-px bg-panel-raised" />

      {loading && <p className="font-mono text-xs text-mist">// loading graph…</p>}
      {error && (
        <p className="font-mono text-xs text-magenta">
          [ERROR] Couldn&apos;t reach the API — is the backend running? ({error})
        </p>
      )}
      {!loading && !error && nodes.length === 0 && (
        <div className="rounded-sm border border-dashed border-panel-raised px-6 py-10 text-center">
          <p className="font-display text-sm uppercase tracking-wide text-fog">No connections logged.</p>
          <p className="mt-1 text-sm text-mist">
            Upload a few documents that share skills or technologies to see them link up.
          </p>
        </div>
      )}

      {!loading && !error && nodes.length > 0 && (
        <div className="flex-1 overflow-hidden rounded-sm border border-cyan/30 bg-panel/60 shadow-glow-cyan">
          <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
            <Background color="#1E1040" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
