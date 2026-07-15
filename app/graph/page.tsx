"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import AppShell from "@/components/AppShell";

const initialNodes: Node[] = [
  { id: "1", data: { label: "Digital Identity" }, position: { x: 250, y: 0 }, style: { background: "#1b52f5", color: "#fff", border: "none" } },
  { id: "2", data: { label: "Profile" }, position: { x: 100, y: 100 }, style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" } },
  { id: "3", data: { label: "Knowledge" }, position: { x: 400, y: 100 }, style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" } },
  { id: "4", data: { label: "Documents" }, position: { x: 250, y: 200 }, style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" } },
  { id: "5", data: { label: "Audit Trail" }, position: { x: 100, y: 200 }, style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" } },
  { id: "6", data: { label: "AI Insights" }, position: { x: 400, y: 200 }, style: { background: "#059669", color: "#fff", border: "none" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#3377ff" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#3377ff" } },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "#475569" } },
  { id: "e2-5", source: "2", target: "5", style: { stroke: "#475569" } },
  { id: "e3-6", source: "3", target: "6", animated: true, style: { stroke: "#10b981" } },
  { id: "e4-6", source: "4", target: "6", style: { stroke: "#475569" } },
];

export default function GraphPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <AppShell title="Knowledge Graph">
      <div className="h-[calc(100vh-8rem)] rounded-xl border border-slate-800 overflow-hidden animate-fade-in">
        {mounted && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            className="bg-slate-950"
          >
            <Background color="#1e293b" gap={20} />
            <Controls className="!bg-slate-900 !border-slate-700" />
            <MiniMap
              className="!bg-slate-900 !border-slate-700"
              nodeColor={(n) => (n.style?.background as string) || "#1e293b"}
              maskColor="rgba(2, 6, 23, 0.7)"
            />
          </ReactFlow>
        )}
      </div>
    </AppShell>
  );
}
