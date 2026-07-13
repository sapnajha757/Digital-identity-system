"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, { Background, Controls, Edge, Node, MiniMap, useReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { apiClient, GraphResponse } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { AILoader } from "@/components/AILoader";

const NODE_COLOR: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  Document:     { bg: "#0A0E1A", border: "#7a7195", glow: "rgba(122,113,149,0.4)", text: "#7a7195" },
  Skill:        { bg: "#0A0E1A", border: "#FFB627", glow: "rgba(255,182,39,0.4)",  text: "#FFB627" },
  Certificate:  { bg: "#0A0E1A", border: "#00F0FF", glow: "rgba(0,240,255,0.4)",   text: "#00F0FF" },
  Achievement:  { bg: "#0A0E1A", border: "#00F0FF", glow: "rgba(0,240,255,0.4)",   text: "#00F0FF" },
  Project:      { bg: "#0A0E1A", border: "#FF2E9A", glow: "rgba(255,46,154,0.4)",  text: "#FF2E9A" },
  Internship:   { bg: "#0A0E1A", border: "#FF2E9A", glow: "rgba(255,46,154,0.4)",  text: "#FF2E9A" },
  Organization: { bg: "#0A0E1A", border: "#a855f7", glow: "rgba(168,85,247,0.4)",  text: "#a855f7" },
  Education:    { bg: "#0A0E1A", border: "#4F8CFF", glow: "rgba(79,140,255,0.4)",  text: "#4F8CFF" },
};

function GraphInner({ graph, loading, error }: { graph: GraphResponse | null; loading: boolean; error: string | null }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    Document: true, Skill: true, Certificate: true, Achievement: true,
    Project: true, Internship: true, Organization: true, Education: true,
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  const toggleCategory = (cat: string) => {
    setCategoryFilters((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const activeFocusId = hoveredNodeId ?? selectedNode?.id ?? null;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId || !graph) return new Set<string>();
    const ids = new Set<string>();
    graph.edges.forEach((e) => {
      if (e.source === activeFocusId) ids.add(e.target);
      if (e.target === activeFocusId) ids.add(e.source);
    });
    return ids;
  }, [activeFocusId, graph]);

  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };
    const center = { x: 600, y: 400 };

    const filtered = graph.nodes.filter((n) => {
      const cat = categoryFilters[n.type] ?? true;
      const search = searchQuery
        ? n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return cat && search;
    });

    const radius = Math.max(280, filtered.length * 26);

    const nodesList: Node[] = filtered.map((n, i) => {
      const nodeR = radius * (1 + (i % 3 === 0 ? 0.18 : i % 3 === 1 ? -0.1 : 0.05));
      const angle = (2 * Math.PI * i) / Math.max(filtered.length, 1);
      const colors = NODE_COLOR[n.type] ?? { bg: "#0A0E1A", border: "#7a7195", glow: "rgba(122,113,149,0.3)", text: "#7a7195" };

      const isFocused = activeFocusId === n.id;
      const isConnected = connectedNodeIds.has(n.id);
      const hasAnyFocus = activeFocusId !== null;

      let opacity = 1.0;
      let boxShadow = `0 0 14px ${colors.glow}`;
      let borderStyle = `1.5px solid ${colors.border}`;

      if (hasAnyFocus) {
        if (isFocused) {
          boxShadow = `0 0 28px ${colors.border}, 0 0 8px ${colors.border}`;
          borderStyle = `2px solid #ffffff`;
        } else if (isConnected) {
          boxShadow = `0 0 18px ${colors.glow}`;
        } else {
          opacity = 0.18;
        }
      }

      if (searchQuery && n.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        boxShadow = `0 0 28px #00F0FF, 0 0 8px #00F0FF`;
      }

      return {
        id: n.id,
        position: {
          x: center.x + nodeR * Math.cos(angle),
          y: center.y + nodeR * Math.sin(angle),
        },
        data: { label: n.label, type: n.type, properties: n.properties },
        className: "animate-node-breathe",
        style: {
          background: colors.bg,
          border: borderStyle,
          borderRadius: 8,
          color: "#E9E4F0",
          fontFamily: "var(--font-jetbrains)",
          fontSize: 12,
          fontWeight: "500",
          padding: "9px 14px",
          boxShadow,
          cursor: "pointer",
          opacity,
          transition: "all 0.28s cubic-bezier(0.16,1,0.3,1)",
        },
      };
    });

    const activeIds = new Set(nodesList.map((n) => n.id));

    const edgesList: Edge[] = graph.edges
      .filter((e) => activeIds.has(e.source) && activeIds.has(e.target))
      .map((e, i) => {
        const isHigh = (e.confidence ?? 1.0) >= 0.88;
        const isConnectedToFocus = activeFocusId === e.source || activeFocusId === e.target;
        const hasAnyFocus = activeFocusId !== null;

        let strokeColor = isHigh ? "#4F8CFF" : "#7A7195";
        let strokeWidth = isHigh ? 1.8 : 1.0;
        let opacity = isHigh ? 0.85 : 0.5;
        let animated = isHigh;
        let filter: string | undefined = isHigh ? "drop-shadow(0 0 3px rgba(79,140,255,0.5))" : undefined;

        if (hasAnyFocus) {
          if (isConnectedToFocus) {
            strokeColor = "#00F0FF";
            strokeWidth = 2.5;
            opacity = 1.0;
            animated = true;
            filter = "drop-shadow(0 0 6px rgba(0,240,255,0.8))";
          } else {
            opacity = 0.06;
            filter = undefined;
            animated = false;
          }
        }

        return {
          id: `e-${e.source}-${e.target}-${i}`,
          source: e.source,
          target: e.target,
          label: e.relationship,
          data: { confidence: e.confidence, reason: e.reason, metadata: e.metadata, timestamp: e.timestamp },
          style: { stroke: strokeColor, strokeWidth, opacity, filter, transition: "all 0.28s ease-out" },
          labelStyle: { fill: "#7A7195", fontFamily: "var(--font-jetbrains)", fontSize: 8 },
          animated,
        };
      });

    return { nodes: nodesList, edges: edgesList };
  }, [graph, searchQuery, categoryFilters, activeFocusId, connectedNodeIds]);

  const selectedConnections = useMemo(() => {
    if (!selectedNode || !graph) return [];
    return graph.edges
      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
      .map((e) => {
        const otherId = e.source === selectedNode.id ? e.target : e.source;
        const other = graph.nodes.find((n) => n.id === otherId);
        return { edge: e, node: other, direction: e.source === selectedNode.id ? "→" : "←" };
      });
  }, [selectedNode, graph]);

  // Auto-focus camera on selected node
  useEffect(() => {
    if (selectedNode) {
      setTimeout(() => fitView({ nodes: [selectedNode], duration: 500, padding: 0.5 }), 50);
    }
  }, [selectedNode, fitView]);

  return (
    <div className="flex h-screen overflow-hidden bg-void text-fog">
      <div className="flex flex-1 flex-col px-6 py-8 md:px-10 overflow-hidden relative">
        {/* Header */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 03 — KNOWLEDGE GRAPH V4</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide">
            <span className="gradient-text">Living Identity Network.</span>
          </h1>
          <p className="mt-2 max-w-xl text-mist text-sm">
            AI-discovered nodes as a living neural network. Hover to inspect confidence, reasoning, and source documents.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap gap-3 items-center justify-between border-y border-white/5 py-4 z-10 bg-void/70 backdrop-blur-sm">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search nodes or types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-white/8 focus:border-cyan text-xs px-4 py-2 rounded-lg font-mono focus:outline-none placeholder-mist/40 text-fog transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-xs text-mist hover:text-magenta">✕</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryFilters).map((cat) => {
              const active = categoryFilters[cat];
              const col = NODE_COLOR[cat]?.border ?? "#7A7195";
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  style={{ borderColor: active ? col : "#191F2A", color: active ? col : "#94A3B8" }}
                  className={`border px-3 py-1 text-[10px] rounded-full font-mono uppercase transition-all duration-200 ${active ? "bg-panel" : "bg-panel/20"}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Graph canvas */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <AILoader status="Building Knowledge Graph..." size="lg" />
          </div>
        )}
        {error && <p className="font-mono text-xs text-magenta mt-8">[ERROR] {error}</p>}
        {!loading && !error && nodes.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-white/8 px-6 py-12 text-center">
            <p className="font-display text-sm uppercase tracking-wide text-fog">No matching nodes found.</p>
          </div>
        )}

        {!loading && !error && nodes.length > 0 && (
          <div className="flex-1 mt-4 overflow-hidden rounded-xl border border-cyan/15 bg-[#06080E] relative shadow-[0_0_40px_rgba(79,140,255,0.04)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              onNodeClick={(_, node) => setSelectedNode(prev => prev?.id === node.id ? null : node)}
              onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
              onNodeMouseLeave={() => setHoveredNodeId(null)}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#0F172A" gap={28} size={1} />
              <Controls className="bg-panel border border-white/8 text-fog fill-fog" />
              <MiniMap
                nodeStrokeColor={(n) => NODE_COLOR[n.data?.type]?.border ?? "#7a7195"}
                nodeColor={() => "#0A0E1A"}
                maskColor="rgba(6,8,14,0.7)"
                className="bg-panel/90 border border-white/8 rounded-lg"
              />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-[#07090F]/90 border border-white/8 p-3 rounded-xl font-mono text-[8px] space-y-1.5 backdrop-blur-sm">
              {Object.entries(NODE_COLOR).slice(0, 5).map(([type, c]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.border, boxShadow: `0 0 4px ${c.glow}` }} />
                  <span style={{ color: c.text }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side Info Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="w-80 md:w-96 border-l border-white/5 bg-[#0A0E1A]/95 backdrop-blur-xl p-6 flex flex-col h-full overflow-y-auto z-30"
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold"
                  style={{
                    backgroundColor: `${NODE_COLOR[selectedNode.data?.type]?.border}20`,
                    color: NODE_COLOR[selectedNode.data?.type]?.border,
                    border: `1px solid ${NODE_COLOR[selectedNode.data?.type]?.border}40`,
                  }}
                >
                  {selectedNode.data?.type}
                </span>
                <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-wide text-fog">
                  {selectedNode.data?.label}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-mist hover:text-magenta font-mono text-[10px] transition-colors border border-white/8 bg-white/3 px-2 py-1 rounded-lg hover:border-magenta/40"
              >
                CLOSE
              </button>
            </div>

            <div className="my-5 h-px bg-white/5" />

            {/* Properties */}
            <div className="space-y-3 mb-5">
              <h3 className="font-mono text-[10px] uppercase text-magenta tracking-wider">// Properties</h3>
              <div className="bg-void/80 border border-white/5 p-4 rounded-xl space-y-2 font-mono text-xs text-mist">
                <div><span className="text-fog">ID:</span> <span className="block text-[10px] text-cyan mt-0.5 truncate">{selectedNode.id}</span></div>
                {selectedNode.data?.properties?.date && (
                  <div><span className="text-fog">Date:</span> <span className="block text-amber mt-0.5">{selectedNode.data.properties.date}</span></div>
                )}
                {selectedNode.data?.properties?.role && (
                  <div><span className="text-fog">Role:</span> <span className="block text-fog mt-0.5">{selectedNode.data.properties.role}</span></div>
                )}
              </div>
            </div>

            {/* Connections */}
            <div className="flex-1">
              <h3 className="font-mono text-[10px] uppercase text-magenta tracking-wider mb-3">
                // Connections ({selectedConnections.length})
              </h3>
              <div className="space-y-2.5">
                {selectedConnections.map(({ edge, node, direction }, i) => {
                  if (!node) return null;
                  const col = NODE_COLOR[node.type]?.border ?? "#7a7195";
                  const isHigh = (edge.confidence ?? 1.0) >= 0.88;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border border-white/5 p-3 rounded-xl hover:border-cyan/20 transition-all"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-magenta font-mono font-bold uppercase">{edge.relationship}</span>
                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isHigh ? "text-cyan bg-cyan/10 border border-cyan/30" : "text-mist bg-panel/30"}`}>
                          {Math.round((edge.confidence ?? 1.0) * 100)}% match
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-display font-medium text-fog flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col, boxShadow: `0 0 4px ${col}` }} />
                        <span className="truncate">{direction} {node.label}</span>
                      </div>
                      <p className="mt-1.5 text-[10px] text-mist font-mono leading-relaxed">{edge.reason ?? "Direct reference path."}</p>
                      {edge.timestamp && (
                        <span className="font-mono text-[8px] text-mist/40">{new Date(edge.timestamp).toLocaleDateString()}</span>
                      )}
                    </motion.div>
                  );
                })}
                {selectedConnections.length === 0 && (
                  <p className="font-mono text-xs text-mist/40">// No connected relations found.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GraphPage() {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getGraph()
      .then(setGraph)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ReactFlowProvider>
      <GraphInner graph={graph} loading={loading} error={error} />
    </ReactFlowProvider>
  );
}
