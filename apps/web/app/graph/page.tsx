"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { apiClient, GraphResponse, GraphNode, GraphEdge } from "@/lib/api-client";

const NODE_COLOR: Record<string, { bg: string; border: string; glow: string }> = {
  Document: { bg: "#0d0526", border: "#7a7195", glow: "rgba(122, 113, 149, 0.3)" },
  Skill: { bg: "#0d0526", border: "#FFB627", glow: "rgba(255, 182, 39, 0.3)" },
  Certificate: { bg: "#0d0526", border: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)" },
  Achievement: { bg: "#0d0526", border: "#00F0FF", glow: "rgba(0, 240, 255, 0.3)" },
  Project: { bg: "#0d0526", border: "#FF2E9A", glow: "rgba(255, 46, 154, 0.3)" },
  Internship: { bg: "#0d0526", border: "#FF2E9A", glow: "rgba(255, 46, 154, 0.3)" },
  Organization: { bg: "#0d0526", border: "#a855f7", glow: "rgba(168, 85, 247, 0.3)" },
};

function layoutGraph(
  graph: GraphResponse,
  searchQuery: string,
  categoryFilters: Record<string, boolean>
): { nodes: Node[]; edges: Edge[] } {
  const center = { x: 500, y: 350 };

  // Filter nodes first
  const filteredNodesData = graph.nodes.filter((n) => {
    const matchesCategory = categoryFilters[n.type] ?? true;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const radius = Math.max(220, filteredNodesData.length * 20);

  const nodes: Node[] = filteredNodesData.map((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(filteredNodesData.length, 1);
    const colors = NODE_COLOR[n.type] ?? { bg: "#0d0526", border: "#7a7195", glow: "rgba(122, 113, 149, 0.3)" };
    return {
      id: n.id,
      position: {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      },
      data: { label: n.label, type: n.type, properties: n.properties },
      style: {
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 6,
        color: "#E9E4F0",
        fontFamily: "var(--font-rajdhani)",
        fontSize: 13,
        fontWeight: "500",
        padding: "10px 14px",
        boxShadow: `0 0 15px ${colors.glow}`,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      },
    };
  });

  const activeNodeIds = new Set(nodes.map((n) => n.id));

  const edges: Edge[] = graph.edges
    .filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
    .map((e, i) => {
      const isHighConfidence = (e.confidence ?? 1.0) >= 0.9;
      return {
        id: `${e.source}-${e.target}-${i}`,
        source: e.source,
        target: e.target,
        label: e.relationship,
        data: { confidence: e.confidence, reason: e.reason, metadata: e.metadata, timestamp: e.timestamp },
        style: { 
          stroke: isHighConfidence ? "#00F0FF" : "#7A7195", 
          strokeWidth: isHighConfidence ? 1.5 : 1.0,
          opacity: 0.8
        },
        labelStyle: { fill: "#7A7195", fontFamily: "var(--font-jetbrains)", fontSize: 9 },
        animated: isHighConfidence,
      };
    });

  return { nodes, edges };
}

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

  // Selected details drawer
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  const { nodes, edges } = useMemo(
    () => (graph ? layoutGraph(graph, searchQuery, categoryFilters) : { nodes: [], edges: [] }),
    [graph, searchQuery, categoryFilters]
  );

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
      <div className="flex flex-1 flex-col px-6 py-8 md:px-10 overflow-hidden">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 03 — KNOWLEDGE GRAPH</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">
            <span className="gradient-text">Identity Network.</span>
          </h1>
          <p className="mt-2 max-w-xl text-mist text-sm">
            AI-discovered nodes and cross-document validation paths. Click on nodes to inspect context, reasons, and confidence scoring.
          </p>
        </div>

        {/* Dashboard Bar (Search & Category Filters) */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-y border-panel-raised py-4">
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search nodes or types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-panel-raised focus:border-cyan text-sm px-4 py-2 rounded-sm font-sans focus:outline-none placeholder-mist text-fog"
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
                    active ? "bg-panel text-fog" : "bg-panel/20 text-mist"
                  }`}
                >
                  {cat}s
                </button>
              );
            })}
          </div>
        </div>

        {loading && <p className="font-mono text-xs text-mist mt-8">// loading graph network…</p>}
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
      {selectedNode && (
        <div className="w-80 md:w-96 border-l border-panel-raised bg-panel/90 backdrop-blur-md p-6 flex flex-col h-full overflow-y-auto animate-fade-in">
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
              className="text-mist hover:text-magenta font-mono text-sm transition-colors"
            >
              [CLOSE]
            </button>
          </div>

          <div className="my-6 h-px bg-panel-raised" />

          {/* Node attributes */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase text-magenta tracking-wider">// properties</h3>
            <div className="bg-void/60 border border-panel-raised p-4 rounded space-y-3 font-mono text-xs text-mist">
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

          {/* Node Connections & Reasons */}
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
                          isHighConf ? "text-cyan bg-cyan/10" : "text-mist bg-panel/30"
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
        </div>
      )}
    </div>
  );
}
