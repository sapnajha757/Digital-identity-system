"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function CareerSimulatorPage() {
  // Simulator Sliders State
  const [years, setYears] = useState(3);
  const [projects, setProjects] = useState(6);
  const [internships, setInternships] = useState(2);
  const [openSource, setOpenSource] = useState(15);
  const [research, setResearch] = useState(1);
  const [cloud, setCloud] = useState(3);
  const [ai, setAi] = useState(4);
  const [leadership, setLeadership] = useState(2);

  // Dynamic Calculators
  const {
    identityScore,
    recruiterScore,
    salary,
    probabilities,
    roadmap,
    radarPoints,
  } = useMemo(() => {
    // 1. Identity Score Calculation
    const idScore = Math.min(
      99,
      Math.round(
        35 +
          years * 2.5 +
          projects * 2.0 +
          internships * 3.5 +
          openSource * 0.2 +
          research * 3.0 +
          cloud * 2.5 +
          ai * 3.0 +
          leadership * 2.0
      )
    );

    // 2. Recruiter Score Calculation
    const recScore = Math.min(
      99,
      Math.round(
        40 +
          years * 3.0 +
          projects * 1.5 +
          internships * 4.5 +
          openSource * 0.15 +
          research * 2.0 +
          cloud * 3.0 +
          ai * 3.0 +
          leadership * 3.0
      )
    );

    // 3. Salary Estimation (USD)
    const sal =
      65000 +
      years * 11000 +
      projects * 2500 +
      internships * 7500 +
      openSource * 400 +
      research * 6000 +
      cloud * 3500 +
      ai * 8500 +
      leadership * 5500;

    // 4. Role Match Probabilities
    const probArchitect = Math.min(99, Math.round(ai * 6 + cloud * 5 + years * 2 + 10));
    const probMLOps = Math.min(99, Math.round(cloud * 7 + ai * 5 + projects * 1.5 + 15));
    const probLead = Math.min(99, Math.round(leadership * 8 + years * 4 + 10));

    // 5. Dynamic Roadmap items
    const roadmapItems = [];
    if (ai < 6) {
      roadmapItems.push("Deploy a Graph Neural Network (GNN) matching pipeline.");
    }
    if (cloud < 5) {
      roadmapItems.push("Earn AWS Certified DevOps Engineer or Kubernetes CKA credential.");
    }
    if (leadership < 5) {
      roadmapItems.push("Lead a cross-functional system engineering task force.");
    }
    if (research < 3) {
      roadmapItems.push("Publish a comparative study on dense vector index architectures.");
    }
    if (openSource < 30) {
      roadmapItems.push("Contribute 15+ commits to vector DB or graph query engines.");
    }
    if (roadmapItems.length === 0) {
      roadmapItems.push("Ready for Executive AI Architect screening parameters.");
    }

    // 6. SVG Radar Chart Points
    // Order: Experience, Projects, Cloud, AI, Leadership, Research
    // Map each out of 10. (openSource capped to 50 for radar, mapped to 0-10)
    const values = [
      Math.min(10, (years / 12) * 10),
      Math.min(10, (projects / 20) * 10),
      Math.min(10, (cloud / 8) * 10),
      Math.min(10, (ai / 8) * 10),
      Math.min(10, (leadership / 8) * 10),
      Math.min(10, (research / 5) * 10),
    ];

    const labels = ["Experience", "Projects", "Cloud", "AI", "Leadership", "Research"];
    const pointsList: { x: number; y: number; label: string; val: number }[] = [];
    const center = 100;
    const rScale = 7.5; // multiplier for value

    values.forEach((v, idx) => {
      const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
      const radius = v * rScale;
      pointsList.push({
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        label: labels[idx],
        val: Math.round(v * 10),
      });
    });

    const polygonPoints = pointsList.map((p) => `${p.x},${p.y}`).join(" ");

    return {
      identityScore: idScore,
      recruiterScore: recScore,
      salary: sal,
      probabilities: { Architect: probArchitect, MLOps: probMLOps, Lead: probLead },
      roadmap: roadmapItems,
      radarPoints: { points: polygonPoints, markers: pointsList },
    };
  }, [years, projects, internships, openSource, research, cloud, ai, leadership]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 07 — COGNITIVE SIMULATOR ENGINE</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          Career Evolution Simulator
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Adjust your professional twin parameters to compute real-time scores, salary ranges, GNN skill topologies, and optimal roadmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Sliders Console */}
        <div className="lg:col-span-6 border border-white/5 bg-[#090D1A] p-6 rounded-2xl space-y-5">
          <div className="border-b border-white/5 pb-2">
            <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">// Parameter Controls</span>
          </div>

          <div className="space-y-4">
            {/* Years Experience */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Years Experience</span>
                <span className="text-cyan font-bold">{years} yrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* Projects */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Completed Projects</span>
                <span className="text-cyan font-bold">{projects} projects</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={projects}
                onChange={(e) => setProjects(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* Internships */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Internships Completed</span>
                <span className="text-cyan font-bold">{internships} roles</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={internships}
                onChange={(e) => setInternships(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* Open Source */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Open Source Contributions</span>
                <span className="text-cyan font-bold">{openSource} PRs</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={openSource}
                onChange={(e) => setOpenSource(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* Research */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Research Publications</span>
                <span className="text-cyan font-bold">{research} papers</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={research}
                onChange={(e) => setResearch(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* Cloud certifications */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Cloud Credentials</span>
                <span className="text-cyan font-bold">{cloud} certs</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={cloud}
                onChange={(e) => setCloud(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* AI competencies */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">AI Systems & ML Stack</span>
                <span className="text-cyan font-bold">{ai} skills</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={ai}
                onChange={(e) => setAi(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>

            {/* Leadership roles */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-mist">Leadership Assessment</span>
                <span className="text-cyan font-bold">{leadership} index</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={leadership}
                onChange={(e) => setLeadership(Number(e.target.value))}
                className="w-full h-1 bg-void rounded appearance-none cursor-pointer accent-cyan"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Telemetry Results */}
        <div className="lg:col-span-6 space-y-6">
          {/* Dashboard Metrics (Score & Salary) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-white/5 bg-[#090D1A] p-4 rounded-2xl text-center">
              <span className="font-mono text-[8px] text-mist/60 uppercase block">Identity Index</span>
              <span className="text-2xl font-black font-display text-cyan block mt-1">{identityScore}%</span>
            </div>
            <div className="border border-white/5 bg-[#090D1A] p-4 rounded-2xl text-center">
              <span className="font-mono text-[8px] text-mist/60 uppercase block">Recruiter Score</span>
              <span className="text-2xl font-black font-display text-magenta block mt-1">{recruiterScore}%</span>
            </div>
            <div className="border border-white/5 bg-[#090D1A] p-4 rounded-2xl text-center">
              <span className="font-mono text-[8px] text-mist/60 uppercase block">Projected Salary</span>
              <span className="text-md font-bold font-mono text-amber block mt-2">
                ${salary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Interactive Radar Chart and Role Probabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Radar SVG */}
            <div className="border border-white/5 bg-[#090D1A] p-5 rounded-2xl flex flex-col items-center justify-center">
              <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block mb-4">// GNN SKILL Topography</span>
              <div className="relative w-44 h-44">
                <svg width="176" height="176" viewBox="0 0 200 200" className="overflow-visible">
                  {/* Grid rings */}
                  {[20, 40, 60, 80].map((r, i) => (
                    <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="#1E293B" strokeWidth="0.8" />
                  ))}
                  {/* Spider axis lines */}
                  {radarPoints.markers.map((m, idx) => {
                    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                    return (
                      <line
                        key={idx}
                        x1="100"
                        y1="100"
                        x2={100 + 80 * Math.cos(angle)}
                        y2={100 + 80 * Math.sin(angle)}
                        stroke="#1E293B"
                        strokeWidth="0.8"
                      />
                    );
                  })}
                  {/* Values Polygon */}
                  <polygon
                    points={radarPoints.points}
                    fill="rgba(0, 240, 255, 0.15)"
                    stroke="#00F0FF"
                    strokeWidth="1.5"
                    style={{ filter: "drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))" }}
                  />
                  {/* Label nodes */}
                  {radarPoints.markers.map((m, idx) => {
                    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                    const lx = 100 + 94 * Math.cos(angle);
                    const ly = 100 + 94 * Math.sin(angle);
                    return (
                      <text
                        key={idx}
                        x={lx}
                        y={ly}
                        fill="#94A3B8"
                        fontSize="7"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="font-mono"
                      >
                        {m.label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Role match checklist */}
            <div className="border border-white/5 bg-[#090D1A] p-5 rounded-2xl space-y-4">
              <span className="font-mono text-[9px] text-magenta uppercase tracking-widest block border-b border-white/5 pb-2">
                // Role Match Matrix
              </span>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>AI solutions architect</span>
                    <span className="text-cyan font-bold">{probabilities.Architect}%</span>
                  </div>
                  <div className="w-full bg-void h-1.5 rounded overflow-hidden">
                    <div className="bg-cyan h-full transition-all duration-300" style={{ width: `${probabilities.Architect}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Senior MLOps systems</span>
                    <span className="text-cyan font-bold">{probabilities.MLOps}%</span>
                  </div>
                  <div className="w-full bg-void h-1.5 rounded overflow-hidden">
                    <div className="bg-cyan h-full transition-all duration-300" style={{ width: `${probabilities.MLOps}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>AI Technical Lead</span>
                    <span className="text-magenta font-bold">{probabilities.Lead}%</span>
                  </div>
                  <div className="w-full bg-void h-1.5 rounded overflow-hidden">
                    <div className="bg-magenta h-full transition-all duration-300" style={{ width: `${probabilities.Lead}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Learning Roadmap */}
          <div className="border border-white/5 bg-[#090D1A] p-5 rounded-2xl space-y-4">
            <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block border-b border-white/5 pb-2">
              // Personalized Learning Roadmap
            </span>
            <div className="space-y-2.5 font-mono text-xs text-mist">
              {roadmap.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start border-b border-white/5 pb-2 last:border-0">
                  <span className="text-cyan text-[10px]">&gt;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
