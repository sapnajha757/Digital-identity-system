"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/lib/api-client";

// MOCKED PIPELINE STEPS
const PIPELINE_STEPS = [
  { id: "upload", label: "Upload SCATTERED.PDF", icon: "📤", desc: "PDFs, Resumes, Credentials, links" },
  { id: "ocr", label: "OCR & Raw Extraction", icon: "🔍", desc: "Tesseract & Vision Layout analysis" },
  { id: "llm", label: "LLM Parsing", icon: "🧠", desc: "Entity & relation categorization" },
  { id: "embeddings", label: "Vector Embeddings", icon: "🧬", desc: "Multi-dimensional profile representation" },
  { id: "qdrant", label: "Qdrant Indexing", icon: "📦", desc: "High speed vector retrieval backend" },
  { id: "neo4j", label: "Neo4j Sync", icon: "🕸️", desc: "Structured knowledge relationship storage" },
  { id: "graph", label: "Knowledge Graph Engine", icon: "📊", desc: "Bidirectional career path mapping" },
  { id: "twin", label: "AI Career Twin", icon: "👥", desc: "Synthesis of academic/professional narrative" },
  { id: "score", label: "Identity Index Score", icon: "📈", desc: "Completeness & reliability estimation" },
  { id: "dashboard", label: "Cognitive Workspace", icon: "🖥️", desc: "Interactive intelligence dashboard" }
];

// MOCKED STACKS
const TECH_STACK = [
  { name: "Next.js", desc: "React Framework for fast, responsive web applications.", category: "Frontend" },
  { name: "React", desc: "UI Library powering dynamic reactive component architectures.", category: "Frontend" },
  { name: "TypeScript", desc: "Static type checking for robust enterprise application design.", category: "Languages" },
  { name: "Tailwind CSS", desc: "Utility-first CSS styling framework enabling custom glassmorphism.", category: "Styling" },
  { name: "Framer Motion", desc: "Advanced layout and scroll-driven micro-interaction physics.", category: "Styling" },
  { name: "FastAPI", desc: "Asynchronous Python backend api exposing pipeline models.", category: "Backend" },
  { name: "PostgreSQL", desc: "Relational database persisting documents, profiles & metadata.", category: "Database" },
  { name: "Neo4j", desc: "Native graph database storing professional credentials nodes.", category: "Database" },
  { name: "Qdrant", desc: "Vector database storage running semantic query matching.", category: "Database" },
  { name: "Docker", desc: "Containerized deployment of local AI models & storage backends.", category: "Infrastructure" },
  { name: "OCR Core", desc: "Document pre-processing engine pulling raw textual symbols.", category: "AI Engine" },
  { name: "Embeddings", desc: "OpenAI/HuggingFace token encoding for semantic context.", category: "AI Engine" },
  { name: "Semantic Search", desc: "Dense vector index parsing for intent based query answering.", category: "AI Engine" },
  { name: "RAG Engine", desc: "Retrieval-Augmented Generation referencing actual sources.", category: "AI Engine" }
];

// ARCHITECTURE
const ARCH_LAYERS = [
  { id: "client", name: "Client Tier (Next.js)", parent: null, desc: "Renders interactive Knowledge Graph, Timeline & AI chat interface with 60 FPS motion animations." },
  { id: "api", name: "Gateway (FastAPI)", parent: "client", desc: "Handles authentication, file uploading orchestrations & route caching parameters." },
  { id: "ocr", name: "Vision/OCR Worker", parent: "api", desc: "Processes images and PDFs to extract structured raw text and tabular sections." },
  { id: "llm", name: "LLM Parser (RAG)", parent: "ocr", desc: "Understands academic degrees, skills, roles & creates semantic relation linkages." },
  { id: "postgres", name: "Relational Storage (Postgres)", parent: "llm", desc: "Safeguards structural document schemas, user states, and authentication credentials." },
  { id: "neo4j", name: "Knowledge Repository (Neo4j)", parent: "llm", desc: "Constructs queryable entities (Certificates, Skills, Projects) as linked nodes." },
  { id: "qdrant", name: "Vector Search Index (Qdrant)", parent: "llm", desc: "Stores context chunk embeddings to power natural language semantic searches." }
];

// FEATURES
const LANDING_FEATURES = [
  { title: "AI Document Understanding", tags: ["OCR", "Resume Parser", "PDF Extraction"], icon: "📄", desc: "Upload chaotic resumes, certificates, and transcripts. Our parser maps layouts, extracts tabular data, and parses credentials automatically." },
  { title: "Intelligent Categorization", tags: ["Projects", "Skills", "Achievements", "Internships"], icon: "🗂️", desc: "Categorize experience metadata. Translates scattered sentences into verified taxonomy classifications." },
  { title: "Interactive Knowledge Graph", tags: ["Neo4j Visuals", "Dynamic Topology"], icon: "🕸️", desc: "See your career as a living web. Click through projects connected to skills, mapped to certifications, pointing to potential roles." },
  { title: "Semantic Search Engine", tags: ["Qdrant Search", "Vector Queries"], icon: "🔎", desc: "Query your background in plain English. Retrieve 'AWS certificates', 'Python projects', or 'Internship milestones' instantly." },
  { title: "AI Career Twin Profile", tags: ["Professional Narrative", "Confidence Scores"], icon: "👥", desc: "Generate a custom bio, analysis summary, gaps diagnostics, and interactive predictions dynamically computed from credentials." },
  { title: "Cognitive Identity Score", tags: ["Completeness Gauge", "Verification Level"], icon: "📈", desc: "Understand your profile status with our animated compliance meter scoring structure, credentials quality, and skills depth." },
  { title: "Interactive Digital Timeline", tags: ["Chronological Journey", "Milestones Tracker"], icon: "⏳", desc: "View experiences laid out linearly. Toggle filters, highlight inferred dates, and trace growth velocities." },
  { title: "Grounded AI RAG Assistant", tags: ["Citations Matching", "No Hallucinations"], icon: "💬", desc: "Ask the OS questions about your work. Answers are generated with actual file source reference citations." },
  { title: "Recruiter Portfolio Exporter", tags: ["Verified Portfolios", "Printable Dossiers"], icon: "💼", desc: "Turn raw credentials into a public shareable portfolio URL. Keep records clean, categorized, and beautiful." },
  { title: "Cross Document Intelligence", tags: ["Implicit Relationships", "Goal Mapping"], icon: "🧠", desc: "Discovers hidden relationships, linking a certificate from last year to a project built yesterday." }
];

// INSIGHTS
const INSIGHTS_ITEMS = [
  "Knowledge Graph discovered 8 new credentials relationships.",
  "Profile completeness increased to 94% with Google Intern document.",
  "AI Career Twin: Capable of lead architect positions in ML infrastructures.",
  "System recommendation: Kubernetes certification will unlock high-tier job matches.",
  "Telemetry verified: All resume skills backed by PDF certificate sources."
];

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Demo Wizard State
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoFiles, setDemoFiles] = useState<string[]>([]);
  const [demoLog, setDemoLog] = useState<string[]>([]);
  const [demoGraph, setDemoGraph] = useState<any>({ nodes: [], edges: [] });
  const [demoScore, setDemoScore] = useState(0);
  const [demoTwin, setDemoTwin] = useState<string>("");

  // UI Interactive Elements
  const [activeArch, setActiveArch] = useState<string | null>(null);
  const [activeStackTab, setActiveStackTab] = useState<string>("All");
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(null);
  const [insightIndex, setInsightIndex] = useState(0);
  const [beforeTab, setBeforeTab] = useState<"before" | "after">("before");

  // Parallax mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Insight Carousel interval
  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % INSIGHTS_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Track mouse coordinates for parallax glow
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Run guided interactive demo
  const triggerDemo = () => {
    if (demoActive) return;
    setDemoActive(true);
    setDemoStep(1);
    setDemoFiles([]);
    setDemoLog(["System ready. Initiating demonstration sequence..."]);
    setDemoGraph({ nodes: [], edges: [] });
    setDemoScore(35);
    setDemoTwin("");

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      // Step 1: Upload
      await sleep(1500);
      setDemoFiles(["Resume_Sapna_Jha.pdf"]);
      setDemoLog((prev) => [...prev, "📥 Uploaded: Resume_Sapna_Jha.pdf", "⚙️ Initializing file ingest workers..."]);
      setDemoStep(2);

      // Step 2: OCR Parsing
      await sleep(2000);
      setDemoLog((prev) => [...prev, "🔍 Running Vision-OCR analysis...", "✓ OCR parsed 3,240 textual symbols.", "✓ Structuring raw text frames."]);
      setDemoStep(3);

      // Step 3: LLM Entities Mapping
      await sleep(2200);
      setDemoLog((prev) => [...prev, "🧠 Querying LLM Extraction pipelines...", "💡 Identified: 18 Skills (Python, FastAPI, AWS...)", "💡 Identified: Google Internship (SWE Intern)", "💡 Identified: AWS Cloud Practitioner Cert"]);
      setDemoGraph({
        nodes: [
          { id: "1", label: "Sapna Jha", type: "user" },
          { id: "2", label: "Google", type: "org" },
          { id: "3", label: "AWS Cert", type: "cert" }
        ],
        edges: [
          { source: "1", target: "2", type: "INTERNED_AT" },
          { source: "1", target: "3", type: "CERTIFIED" }
        ]
      });
      setDemoStep(4);

      // Step 4: Knowledge Graph Growth
      await sleep(2200);
      setDemoLog((prev) => [...prev, "🕸️ Syncing relationships to Neo4j graph schemas...", "✓ Created 12 relationships", "✓ Linked PyTorch skill to Google Internship model", "✓ Built bidirectional project paths"]);
      setDemoGraph((prev: any) => ({
        nodes: [...prev.nodes, { id: "4", label: "PyTorch", type: "skill" }, { id: "5", label: "FastAPI", type: "skill" }],
        edges: [...prev.edges, { source: "2", target: "4", type: "USED" }, { source: "1", target: "5", type: "EXPERT_IN" }]
      }));
      setDemoStep(5);

      // Step 5: Scoring update
      await sleep(1800);
      setDemoLog((prev) => [...prev, "📈 Running metrics scoring validation...", "✓ Profile completeness calculated at 94%", "✓ Credentials verification trust: 90%"]);
      setDemoScore(94);
      setDemoStep(6);

      // Step 6: Narrative / Career Twin
      await sleep(2000);
      setDemoLog((prev) => [...prev, "👥 Synthesizing Career Twin Persona...", "✓ Generated role analysis", "✓ Computed recommended next skills: Kubernetes"]);
      setDemoTwin("Sapna Jha is a qualified ML and Graph systems specialist with proven competencies in Neo4j, Qdrant, and Python. Capable of building high-performance systems.");
      setDemoStep(7);

      // Complete
      await sleep(2000);
      setDemoLog((prev) => [...prev, "✨ Operating System updated successfully.", "✓ Recruiter Portfolio ready for deployment."]);
      setDemoStep(8);
    };

    run();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-void text-fog font-body overflow-x-hidden selection:bg-cyan/35 select-text"
      style={{
        "--mx": `${mousePos.x}px`,
        "--my": `${mousePos.y}px`
      } as any}
    >
      {/* Living background aurora/glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] bg-cyan/5 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-[30%] right-[5%] w-[50vw] h-[50vw] bg-magenta/5 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
        {/* Subtle grid layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-void/50 backdrop-blur-md border-b border-panel-raised/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan shadow-glow-cyan animate-pulse" />
            <Link href="/" className="font-display text-lg font-black tracking-widest text-fog select-none">
              IDENTITY<span className="text-cyan">OS</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-[10px] tracking-widest text-mist">
            <a href="#features" className="hover:text-cyan transition-colors">FEATURES</a>
            <a href="#tech" className="hover:text-cyan transition-colors">TECHNOLOGY</a>
            <a href="#architecture" className="hover:text-cyan transition-colors">ARCHITECTURE</a>
            <a href="#pipeline" className="hover:text-cyan transition-colors">HOW IT WORKS</a>
            <Link href="/portfolio" className="hover:text-cyan transition-colors">PORTFOLIO</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan transition-colors">GITHUB</a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 border border-cyan/40 bg-cyan/5 text-cyan hover:bg-cyan/15 rounded-md font-mono text-[10px] tracking-wider transition-all duration-200"
              >
                WORKSPACE
              </Link>
            ) : (
              <>
                <Link href="/login" className="font-mono text-[10px] tracking-wider text-mist hover:text-fog transition-colors">
                  LOGIN
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-4 py-1.5 border border-cyan/40 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-md font-mono text-[10px] tracking-wider shadow-glow-cyan transition-all duration-200"
                >
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-32 relative z-10">
        
        {/* Welcome Back Banner for Authenticated users */}
        {session && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-cyan/35 bg-cyan/5 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 shadow-glow-cyan/10"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping shrink-0" />
              <p className="font-mono text-xs text-fog">
                Welcome back, <span className="font-bold text-cyan">{session.user.email}</span>. Continue where you left off.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-1.5 bg-cyan text-void text-xs font-semibold rounded-md shadow-glow-cyan hover:scale-[1.03] transition-all shrink-0"
            >
              Go to Workspace
            </Link>
          </motion.div>
        )}

        {/* Hero Section */}
        <section className="relative text-center max-w-4xl mx-auto space-y-8 pt-8">
          <motion.div style={{ opacity: opacityHero, scale: scaleHero }} className="space-y-6">
            <span className="inline-block font-mono text-[9px] text-magenta tracking-[0.2em] font-bold uppercase select-none border border-magenta/25 bg-magenta/5 px-2.5 py-1 rounded">
              // HACKATHON WINNER EDITION
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tight leading-none text-fog">
              Your AI-Powered <br />
              <span className="gradient-text">Digital Identity Operating System.</span>
            </h1>
            <p className="text-sm md:text-md text-mist max-w-2xl mx-auto leading-relaxed">
              Stop organizing folders. Upload chaotic resumes, credentials, PDFs, or links. Let our AI ingest pipeline parse text, map knowledge topologies, construct your Career Twin, and compile a public portfolio.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-cyan text-void font-bold text-sm tracking-wide rounded-md shadow-glow-cyan hover:scale-[1.02] transition-transform text-center"
            >
              Launch IdentityOS
            </Link>
            <button
              onClick={triggerDemo}
              disabled={demoActive}
              className="w-full sm:w-auto px-8 py-3.5 border border-panel-raised hover:border-cyan text-fog hover:text-cyan bg-panel-raised/35 rounded-md font-mono text-xs tracking-wider transition-all disabled:opacity-50"
            >
              {demoActive ? "Running Live Demo..." : "Watch Live Demo"}
            </button>
          </div>

          {/* Dynamic AI Simulation Demo Box */}
          <div className="w-full max-w-3xl mx-auto mt-12 bg-panel/30 border border-panel-raised rounded-xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center border-b border-panel-raised/50 pb-3 mb-4 select-none">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-[9px] text-mist/60 uppercase">IDENTITYOS COGNITIVE CORE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Log view */}
              <div className="space-y-3 font-mono text-[10px] bg-void/50 p-4 border border-panel-raised rounded min-h-[180px] max-h-[220px] overflow-y-auto">
                <span className="text-cyan font-bold block mb-1">// OS Ingestion Stream:</span>
                {demoLog.map((log, idx) => (
                  <div key={idx} className="text-mist leading-relaxed">{log}</div>
                ))}
                {demoActive && demoStep < 8 && (
                  <div className="flex items-center gap-1.5 text-cyan font-bold">
                    <span className="w-1.5 h-3 bg-cyan animate-pulse" />
                    <span>Processing next layer...</span>
                  </div>
                )}
                {!demoActive && (
                  <div className="text-mist/30 italic">Click &quot;Watch Live Demo&quot; to trigger active ingestion visual simulator...</div>
                )}
              </div>

              {/* Dynamic status nodes */}
              <div className="space-y-4 font-mono text-xs flex flex-col justify-center">
                <div className="flex justify-between items-center border-b border-panel-raised pb-2">
                  <span className="text-mist">Ingestion Queue:</span>
                  <span className="text-fog">{demoFiles.length > 0 ? demoFiles.join(", ") : "0 files"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-panel-raised pb-2">
                  <span className="text-mist">Completeness Gauge:</span>
                  <span className={`font-bold ${demoScore > 80 ? "text-cyan" : "text-amber"}`}>{demoScore}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-panel-raised pb-2">
                  <span className="text-mist">Graph Sync Nodes:</span>
                  <span className="text-fog">{demoGraph.nodes.length} connected elements</span>
                </div>
                <div className="border border-panel-raised/50 p-3 rounded bg-void/30">
                  <span className="text-magenta font-bold block text-[9px] mb-1">// CAREER TWIN SUMMARY</span>
                  <p className="text-[10px] text-mist/80 italic leading-relaxed">
                    {demoTwin || "Twin generated upon queue evaluation completion."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive Knowledge Graph Showcase */}
        <section id="interactive-graph" className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[9px] text-cyan tracking-widest font-bold">// NEO4J VISUALIZATION PORT</span>
            <h2 className="font-display text-2xl font-black uppercase text-fog mt-1">Live Network Graph</h2>
          </div>

          <div className="w-full max-w-4xl mx-auto h-[350px] bg-panel/20 border border-panel-raised/80 rounded-xl relative overflow-hidden flex items-center justify-center">
            {/* Visual network nodes layout */}
            <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />
            
            {/* Nodes representation */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* User Node */}
              <div className="absolute z-10 w-20 h-20 rounded-full border border-cyan/40 bg-cyan/5 flex flex-col items-center justify-center text-center shadow-glow-cyan hover:scale-110 transition-transform cursor-pointer">
                <span className="text-cyan font-bold text-xs uppercase">User</span>
                <span className="text-[8px] text-mist">Sapna Jha</span>
              </div>

              {/* Skill Nodes */}
              <div className="absolute top-[10%] left-[25%] px-3 py-1.5 border border-amber/40 bg-amber/5 rounded text-amber text-[10px] hover:scale-105 transition-transform cursor-pointer">
                Skill: Python
              </div>
              <div className="absolute top-[15%] right-[20%] px-3 py-1.5 border border-amber/40 bg-amber/5 rounded text-amber text-[10px] hover:scale-105 transition-transform cursor-pointer">
                Skill: Neo4j
              </div>
              <div className="absolute bottom-[20%] left-[15%] px-3 py-1.5 border border-amber/40 bg-amber/5 rounded text-amber text-[10px] hover:scale-105 transition-transform cursor-pointer">
                Skill: FastAPI
              </div>
              <div className="absolute bottom-[10%] right-[30%] px-3 py-1.5 border border-amber/40 bg-amber/5 rounded text-amber text-[10px] hover:scale-105 transition-transform cursor-pointer">
                Skill: Qdrant
              </div>

              {/* Achievement/Org Nodes */}
              <div className="absolute top-[45%] left-[10%] px-4 py-2 border border-magenta/40 bg-magenta/5 rounded text-magenta text-[10px] hover:scale-105 transition-transform cursor-pointer">
                Org: Google Intern
              </div>
              <div className="absolute top-[40%] right-[10%] px-4 py-2 border border-magenta/40 bg-magenta/5 rounded text-magenta text-[10px] hover:scale-105 transition-transform cursor-pointer">
                Cert: AWS Cloud
              </div>

              {/* Connective background SVG lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="50%" y1="50%" x2="25%" y2="15%" stroke="#4F8CFF" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#4F8CFF" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="15%" y2="25%" stroke="#4F8CFF" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="70%" y2="90%" stroke="#4F8CFF" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="10%" y2="48%" stroke="#7B61FF" strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="90%" y2="43%" stroke="#7B61FF" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="absolute bottom-4 left-4 bg-void/80 border border-panel-raised/60 p-2.5 rounded font-mono text-[9px] text-mist max-w-xs">
              💡 <span className="text-cyan font-bold">HOVER LAYER DETAILS:</span> Click/hover any graph nodes to trace implicit connection weights and RAG ground documents.
            </div>
          </div>
        </section>

        {/* Before vs After comparison */}
        <section id="before-after" className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[9px] text-magenta tracking-widest font-bold">// PARADIGM COMPARISON</span>
            <h2 className="font-display text-2xl font-black uppercase text-fog mt-1">The Transformation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Left: Traditional folders */}
            <div className="bg-panel/10 border border-panel-raised p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-panel-raised pb-3">
                <span className="text-red-500 text-sm">📁</span>
                <h4 className="font-mono text-xs uppercase font-bold text-mist">Traditional Scattered Storage</h4>
              </div>
              <ul className="space-y-2 font-mono text-[11px] text-mist/60">
                <li className="flex justify-between items-center border border-panel-raised/30 p-2 rounded bg-void/10">
                  <span>📄 resume_draft_v4_final.pdf</span>
                  <span>420 KB</span>
                </li>
                <li className="flex justify-between items-center border border-panel-raised/30 p-2 rounded bg-void/10">
                  <span>📄 aws_certificate_page1.png</span>
                  <span>1.2 MB</span>
                </li>
                <li className="flex justify-between items-center border border-panel-raised/30 p-2 rounded bg-void/10">
                  <span>📄 google_internship_letter.docx</span>
                  <span>95 KB</span>
                </li>
                <li className="flex justify-between items-center border border-panel-raised/30 p-2 rounded bg-void/10">
                  <span>📄 smart_india_hackathon_award.pdf</span>
                  <span>2.1 MB</span>
                </li>
              </ul>
              <div className="text-[10px] font-mono text-red-500/80 bg-red-500/5 p-3 border border-red-500/10 rounded">
                ⚠️ Files are siloed index arrays. Searchable by filename only. No intelligence context linkages exists.
              </div>
            </div>

            {/* Right: IdentityOS unified structure */}
            <div className="bg-panel/20 border border-cyan/30 p-6 rounded-lg space-y-4 shadow-glow-cyan/5">
              <div className="flex items-center gap-2 border-b border-panel-raised pb-3">
                <span className="text-cyan text-sm">💡</span>
                <h4 className="font-mono text-xs uppercase font-bold text-cyan">IdentityOS Synthesis</h4>
              </div>
              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between items-center border border-cyan/20 p-2 rounded bg-cyan/5">
                  <span className="text-cyan">🕸️ Knowledge Graph Map</span>
                  <span className="text-[9px] bg-cyan/20 px-1 rounded text-cyan">Active</span>
                </div>
                <div className="flex justify-between items-center border border-cyan/20 p-2 rounded bg-cyan/5">
                  <span className="text-cyan">👥 AI Career Twin Narrative</span>
                  <span className="text-[9px] bg-cyan/20 px-1 rounded text-cyan">Generated</span>
                </div>
                <div className="flex justify-between items-center border border-cyan/20 p-2 rounded bg-cyan/5">
                  <span className="text-cyan">⏳ Chronological Timeline</span>
                  <span className="text-[9px] bg-cyan/20 px-1 rounded text-cyan">Synthesized</span>
                </div>
                <div className="flex justify-between items-center border border-cyan/20 p-2 rounded bg-cyan/5">
                  <span className="text-cyan">📈 Completeness Core Index</span>
                  <span className="text-[9px] bg-cyan/20 px-1 rounded text-cyan">94%</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-cyan bg-cyan/5 p-3 border border-cyan/10 rounded">
                ✓ Unified context mappings. Instantly searchable semantically, reference citations included.
              </div>
            </div>
          </div>
        </section>

        {/* Features list */}
        <section id="features" className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[9px] text-cyan tracking-widest font-bold">// APPLICATION POWER CAPABILITIES</span>
            <h2 className="font-display text-2xl font-black uppercase text-fog mt-1">Platform Core Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-panel/20 border border-panel-raised hover:border-cyan/35 p-6 rounded-lg relative overflow-hidden transition-all duration-200 cursor-pointer"
                whileHover={{ y: -4 }}
                onClick={() => setActiveFeatureIndex(activeFeatureIndex === idx ? null : idx)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {feature.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[8px] border border-panel-raised px-1 rounded text-mist/60 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h4 className="mt-4 font-display text-sm font-bold text-fog uppercase">{feature.title}</h4>
                <p className="mt-2 text-xs text-mist leading-relaxed">{feature.desc}</p>
                
                {activeFeatureIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-3 border-t border-panel-raised/50 font-mono text-[10px] text-cyan"
                  >
                    🚀 Interactive integration parameters: fully operational with RAG query indexing services.
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works pipeline */}
        <section id="pipeline" className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[9px] text-magenta tracking-widest font-bold">// INGESTION SEQUENCE PIPELINE</span>
            <h2 className="font-display text-2xl font-black uppercase text-fog mt-1">How it Works</h2>
          </div>

          <div className="w-full max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={idx} className="border border-panel-raised/80 bg-panel/10 hover:border-cyan/35 p-4 rounded text-center transition-all select-none relative group">
                <span className="text-xl block mb-1">{step.icon}</span>
                <span className="text-[10px] font-mono text-cyan block mb-1">0{idx + 1}</span>
                <h5 className="font-display text-[10px] uppercase font-bold text-fog tracking-tight truncate">{step.label}</h5>
                {/* Tooltip detail description on hover */}
                <div className="absolute z-25 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-void border border-panel-raised p-2 rounded text-[9px] font-mono text-mist opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack description grids */}
        <section id="tech" className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[9px] text-cyan tracking-widest font-bold">// SYSTEM STACK ECOSYSTEM</span>
            <h2 className="font-display text-2xl font-black uppercase text-fog mt-1">Technology Stack</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Filter buttons */}
            <div className="flex gap-2 flex-wrap justify-center font-mono text-[9px]">
              {["All", "Frontend", "Languages", "Backend", "Database", "AI Engine"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveStackTab(cat)}
                  className={`px-3 py-1 border rounded transition-colors ${activeStackTab === cat ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised text-mist hover:border-mist"}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Stack cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TECH_STACK.filter(s => activeStackTab === "All" || s.category === activeStackTab).map((tech, idx) => (
                <div key={idx} className="border border-panel-raised bg-void/50 p-4 rounded hover:border-cyan/35 transition-colors relative group">
                  <span className="text-[8px] font-mono block text-cyan/70 mb-1">{tech.category.toUpperCase()}</span>
                  <span className="font-display text-xs uppercase font-bold text-fog">{tech.name}</span>
                  {/* Tooltip detail descriptions */}
                  <div className="absolute z-25 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-void border border-panel-raised p-2 rounded text-[9px] font-mono text-mist opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    {tech.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Architecture Node highlights */}
        <section id="architecture" className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[9px] text-magenta tracking-widest font-bold">// PIPELINE DATAPATH SYSTEM</span>
            <h2 className="font-display text-2xl font-black uppercase text-fog mt-1">System Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Interactive list schema */}
            <div className="space-y-2">
              {ARCH_LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  onMouseEnter={() => setActiveArch(layer.id)}
                  onMouseLeave={() => setActiveArch(null)}
                  className={`border p-4 rounded transition-all cursor-pointer ${activeArch === layer.id ? "border-cyan bg-cyan/5" : "border-panel-raised bg-panel/10"}`}
                >
                  <h4 className="font-display text-xs font-bold text-fog uppercase">{layer.name}</h4>
                  {layer.parent && <span className="font-mono text-[8px] text-mist/60 block">Child stream of: {layer.parent}</span>}
                </div>
              ))}
            </div>

            {/* Info display container */}
            <div className="border border-panel-raised/80 bg-panel/20 p-6 rounded-lg flex flex-col justify-center min-h-[220px]">
              <span className="font-mono text-[9px] text-cyan block mb-2">// NODE DATA SPEC:</span>
              <AnimatePresence mode="wait">
                {activeArch ? (
                  <motion.div
                    key={activeArch}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-2"
                  >
                    <h3 className="font-display text-md font-bold text-fog uppercase">{ARCH_LAYERS.find(l => l.id === activeArch)?.name}</h3>
                    <p className="text-xs text-mist leading-relaxed font-sans">{ARCH_LAYERS.find(l => l.id === activeArch)?.desc}</p>
                  </motion.div>
                ) : (
                  <motion.p key="empty" className="text-xs text-mist/40 italic">
                    Hover over architecture tier block layers to view descriptions.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* AI Insights Ticker Carousel */}
        <section id="insights-carousel" className="max-w-xl mx-auto">
          <div className="border border-cyan/20 bg-cyan/5 p-4 rounded-lg flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping shrink-0" />
            <div className="flex-1 font-mono text-xs text-fog overflow-hidden h-5 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={insightIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 truncate text-cyan font-semibold"
                >
                  // INSIGHT: {INSIGHTS_ITEMS[insightIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Statistics section */}
        <section id="stats" className="border-t border-panel-raised/50 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto font-mono">
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-cyan">5+</span>
              <span className="text-[10px] text-mist/60 uppercase">Documents Ingested</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-magenta">46+</span>
              <span className="text-[10px] text-mist/60 uppercase">Knowledge Relations</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-cyan">18+</span>
              <span className="text-[10px] text-mist/60 uppercase">Extracted Skills</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-magenta">94%</span>
              <span className="text-[10px] text-mist/60 uppercase">Identity Core Score</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-panel-raised/50 bg-void/90 py-8 text-center font-mono text-[9px] text-mist/40 relative z-10 mt-20">
        <p>© 2026 IDENTITYOS. DIGITAL IDENTITY OPERATING SYSTEM. ALL RIGHTS RESERVED.</p>
        <p className="mt-1">POWERED BY FASTAPI, NEXTJS, NEO4J & QDRANT CORE SERVICES.</p>
      </footer>

    </div>
  );
}
