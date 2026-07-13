"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { apiClient, GraphResponse, GraphNode, GraphEdge } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

const NODE_COLOR: Record<string, { bg: string; border: string; glow: string }> = {
  Document: { bg: "#0d0526", border: "#7a7195", glow: "rgba(122, 113, 149, 0.3)" },
  Skill: { bg: "#0d0526", border: "#FFB627", glow: "rgba(255, 182, 39, 0.3)" },
  Certificate: { bg: "#0d0526", border: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)" },
  Achievement: { bg: "#0d0526", border: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)" },
  Project: { bg: "#0d0526", border: "#FF2E9A", glow: "rgba(255, 46, 154, 0.3)" },
  Internship: { bg: "#0d0526", border: "#FF2E9A", glow: "rgba(255, 46, 154, 0.3)" },
  Organization: { bg: "#0d0526", border: "#a855f7", glow: "rgba(168, 85, 247, 0.3)" },
};

export default function GraphPage() {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    Document: true,
    Skill: true,
    Certificate: true,
    Achievement: true,
    Project: true,
    Internship: true,
    Organization: true,
  });

  // Selected & Hovered nodes
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getGraph()
      .then(setGraph)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: string) => {
    setCategoryFilters((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Compute connected nodes for highlighting
  const activeFocusId = hoveredNodeId || selectedNode?.id || null;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId || !graph) return new Set<string>();
    const ids = new Set<string>();
    graph.edges.forEach((edge) => {
      if (edge.source === activeFocusId) ids.add(edge.target);
      if (edge.target === activeFocusId) ids.add(edge.source);
    });
    return ids;
  }, [activeFocusId, graph]);

  // Compute nodes and edges with interactive styling
  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };

    const center = { x: 500, y: 350 };
    
    // Filter nodes
    const filteredNodesData = graph.nodes.filter((n) => {
      const matchesCategory = categoryFilters[n.type] ?? true;
      const matchesSearch = searchQuery 
        ? n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });

    const radius = Math.max(240, filteredNodesData.length * 22);

    const nodesList: Node[] = filteredNodesData.map((n, i) => {
      const angle = (2 * Math.PI * i) / Math.max(filteredNodesData.length, 1);
      const colors = NODE_COLOR[n.type] ?? { bg: "#0d0526", border: "#7a7195", glow: "rgba(122, 113, 149, 0.3)" };
      
      const isFocused = activeFocusId === n.id;
      const isConnected = connectedNodeIds.has(n.id);
      const hasAnyFocus = activeFocusId !== null;
      
      let opacity = 1.0;
      let scale = 1.0;
      let borderStyle = `1.5px solid ${colors.border}`;
      let boxShadow = `0 0 15px ${colors.glow}`;

      if (hasAnyFocus) {
        if (isFocused) {
          scale = 1.08;
          boxShadow = `0 0 25px ${colors.border}, 0 0 10px ${colors.border}`;
          borderStyle = `2px solid #ffffff`;
        } else if (isConnected) {
          scale = 1.03;
          boxShadow = `0 0 18px ${colors.border}`;
        } else {
          opacity = 0.25;
        }
      }

      // Special style if searching matching
      if (searchQuery && n.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        boxShadow = `0 0 25px #00F0FF, 0 0 5px #00F0FF`;
      }

      return {
        id: n.id,
        position: {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        },
        data: { label: n.label, type: n.type, properties: n.properties },
        style: {
          background: colors.bg,
          border: borderStyle,
          borderRadius: 6,
          color: "#E9E4F0",
          fontFamily: "var(--font-rajdhani)",
          fontSize: 13,
          fontWeight: "500",
          padding: "10px 14px",
          boxShadow: boxShadow,
          cursor: "pointer",
          opacity: opacity,
          transform: `scale(${scale})`,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        },
      };
    });

    const activeNodeIds = new Set(nodesList.map((n) => n.id));

    const edgesList: Edge[] = graph.edges
      .filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .map((e, i) => {
        const isHighConfidence = (e.confidence ?? 1.0) >= 0.9;
        
        const isConnectedToFocus = activeFocusId === e.source || activeFocusId === e.target;
        const hasAnyFocus = activeFocusId !== null;

        let strokeColor = isHighConfidence ? "#00F0FF" : "#7A7195";
        let strokeWidth = isHighConfidence ? 1.5 : 1.0;
        let opacity = 0.8;
        let animated = isHighConfidence;

        if (hasAnyFocus) {
          if (isConnectedToFocus) {
            strokeColor = "#00F0FF";
            strokeWidth = 2.5;
            opacity = 1.0;
            animated = true;
          } else {
            opacity = 0.08;
          }
        }

        return {
          id: `${e.source}-${e.target}-${i}`,
          source: e.source,
          target: e.target,
          label: e.relationship,
          data: { confidence: e.confidence, reason: e.reason, metadata: e.metadata, timestamp: e.timestamp },
          style: { 
            stroke: strokeColor, 
            strokeWidth: strokeWidth,
            opacity: opacity,
            transition: "all 0.3s ease-out",
          },
          labelStyle: { fill: "#7A7195", fontFamily: "var(--font-jetbrains)", fontSize: 9 },
          animated: animated,
        };
      });

    return { nodes: nodesList, edges: edgesList };
  }, [graph, searchQuery, categoryFilters, activeFocusId, connectedNodeIds]);

  // Find connections for selected node
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNode || !graph) return [];
    return graph.edges
      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
      .map((e) => {
        const otherId = e.source === selectedNode.id ? e.target : e.source;
        const otherNode = graph.nodes.find((n) => n.id === otherId);
        return {
          edge: e,
          node: otherNode,
          direction: e.source === selectedNode.id ? "Outgoing" : "Incoming",
        };
      });
  }, [selectedNode, graph]);

  return (
    <div className="flex h-screen overflow-hidden bg-void text-fog">
      {/* Main Content */}
      <div className="flex flex-1 flex-col px-6 py-8 md:px-10 overflow-hidden relative">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 03 — KNOWLEDGE GRAPH</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">
            <span className="gradient-text">Identity Network.</span>
          </h1>
          <p className="mt-2 max-w-xl text-mist text-sm font-sans">
            AI-discovered nodes and cross-document validation paths. Click on nodes to inspect context, reasons, and confidence scoring. Hover nodes to view connected segments.
          </p>
        </div>

        {/* Dashboard Bar (Search & Category Filters) */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-y border-panel-raised py-4 z-10 bg-void/50 backdrop-blur-sm">
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search nodes or types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-panel-raised focus:border-cyan text-sm px-4 py-2 rounded-sm font-sans focus:outline-none placeholder-mist text-fog transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-2.5 text-xs text-mist hover:text-magenta"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters checkboxes */}
          <div className="flex flex-wrap gap-3">
            {Object.keys(categoryFilters).map((cat) => {
              const active = categoryFilters[cat];
              const borderCol = NODE_COLOR[cat]?.border ?? "#7A7195";
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  style={{ borderColor: active ? borderCol : "#150A2E" }}
                  className={`border px-3 py-1 text-xs rounded-full font-mono uppercase transition-all duration-200 ${
                    active ? "bg-panel text-fog shadow-sm" : "bg-panel/20 text-mist"
                  }`}
                >
                  {cat}s
                </button>
              );
            })}
          </div>
        </div>

        {loading && <p className="font-mono text-xs text-mist mt-8 animate-pulse">// loading graph network…</p>}
        {error && (
          <p className="font-mono text-xs text-magenta mt-8">
            [ERROR] Couldn&apos;t reach the API — is the backend running? ({error})
          </p>
        )}
        {!loading && !error && nodes.length === 0 && (
          <div className="mt-8 rounded-sm border border-dashed border-panel-raised px-6 py-12 text-center">
            <p className="font-display text-sm uppercase tracking-wide text-fog">No matching nodes.</p>
            <p className="mt-1 text-sm text-mist">
              Try adjusting your query or toggle filters to view your nodes.
            </p>
          </div>
        )}

        {!loading && !error && nodes.length > 0 && (
          <div className="flex-1 mt-6 overflow-hidden rounded-sm border border-cyan/20 bg-panel/30 shadow-glow-cyan/5 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              onNodeClick={(_, node) => setSelectedNode(node)}
              onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
              onNodeMouseLeave={() => setHoveredNodeId(null)}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#10072b" gap={24} size={1} />
              <Controls className="bg-panel border border-panel-raised text-fog fill-fog" />
              <MiniMap 
                nodeStrokeColor={(n) => NODE_COLOR[n.data?.type]?.border ?? "#7a7195"}
                nodeColor={() => "#0d0526"}
                maskColor="rgba(10, 1, 24, 0.6)"
                className="bg-panel/80 border border-panel-raised"
              />
            </ReactFlow>
          </div>
        )}
      </div>

      {/* Side Info Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-80 md:w-96 border-l border-panel-raised bg-panel/90 backdrop-blur-md p-6 flex flex-col h-full overflow-y-auto z-30"
          >
            <div className="flex justify-between items-start">
              <div>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold"
                  style={{
                    backgroundColor: `${NODE_COLOR[selectedNode.data?.type]?.border}22`,
                    color: NODE_COLOR[selectedNode.data?.type]?.border,
                    border: `1px solid ${NODE_COLOR[selectedNode.data?.type]?.border}44`
                  }}
                >
                  {selectedNode.data?.type}
                </span>
                <h2 className="mt-3 font-display text-xl font-bold uppercase tracking-wide text-fog">
                  {selectedNode.data?.label}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-mist hover:text-magenta font-mono text-xs transition-colors border border-panel-raised bg-void px-2 py-1 rounded"
              >
                CLOSE
              </button>
            </div>

            <div className="my-6 h-px bg-panel-raised" />

            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase text-magenta tracking-wider">// properties</h3>
              <div className="bg-void/60 border border-panel-raised/50 p-4 rounded space-y-3 font-mono text-xs text-mist">
                <div>
                  <span className="text-fog">ID:</span>
                  <span className="block text-[11px] truncate text-cyan mt-0.5">{selectedNode.id}</span>
                </div>
                {selectedNode.data?.properties?.date && (
                  <div>
                    <span className="text-fog">Date:</span>
                    <span className="block text-amber mt-0.5">{selectedNode.data.properties.date}</span>
                  </div>
                )}
                {selectedNode.data?.properties?.type && (
                  <div>
                    <span className="text-fog">File format:</span>
                    <span className="block text-fog mt-0.5 uppercase">{selectedNode.data.properties.type}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex-1">
              <h3 className="font-mono text-xs uppercase text-magenta tracking-wider mb-4">// relations ({selectedNodeConnections.length})</h3>
              <div className="space-y-3">
                {selectedNodeConnections.map(({ edge, node, direction }, i) => {
                  if (!node) return null;
                  const nodeCol = NODE_COLOR[node.type]?.border ?? "#7a7195";
                  const isHighConf = (edge.confidence ?? 1.0) >= 0.9;
                  return (
                    <div key={i} className="border border-panel-raised p-3 bg-void/35 rounded-sm hover:border-cyan/30 transition-all">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-magenta font-mono text-[10px] uppercase font-bold">{edge.relationship}</span>
                        <span 
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isHighConf ? "text-cyan bg-cyan/10 border border-cyan/35" : "text-mist bg-panel/30"
                          }`}
                        >
                          {Math.round((edge.confidence ?? 1.0) * 100)}% Match
                        </span>
                      </div>

                      <div className="mt-2 text-sm font-display font-medium text-fog flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: nodeCol }} />
                        <span className="truncate">{node.label}</span>
                      </div>

                      <p className="mt-2 text-xs text-mist font-sans leading-relaxed">
                        {edge.reason ?? "Direct reference path."}
                      </p>

                      <div className="mt-2 flex justify-between items-center text-[10px] font-mono text-mist/60">
                        <span>{direction}</span>
                        {edge.timestamp && (
                          <span>{new Date(edge.timestamp).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {selectedNodeConnections.length === 0 && (
                  <p className="font-mono text-xs text-mist">// no connected relations found.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
