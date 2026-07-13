const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface Session {
  access_token: string;
  user: {
    email: string;
  };
}

type AuthListener = (event: string, session: Session | null) => void;
const listeners = new Set<AuthListener>();

export function isDemoModeActive(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("dis_demo_mode") === "true";
}

export const supabase = {
  auth: {
    async getSession(): Promise<{ data: { session: Session | null }; error: any }> {
      if (typeof window === "undefined") return { data: { session: null }, error: null };
      const raw = localStorage.getItem("dis_session");
      if (!raw) return { data: { session: null }, error: null };
      try {
        const session = JSON.parse(raw);
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },

    async signInWithPassword({ email, password }: any): Promise<{ data: { session: Session | null } | null; error: any }> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const detail = await res.json().then(d => d.detail).catch(() => "Login failed");
          return { data: null, error: new Error(detail) };
        }
        const data = await res.json();
        const session: Session = {
          access_token: data.access_token,
          user: { email: data.email },
        };
        localStorage.setItem("dis_session", JSON.stringify(session));
        listeners.forEach(cb => cb("SIGNED_IN", session));
        return { data: { session }, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },

    async signUp({ email, password }: any): Promise<{ data: any; error: any }> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const detail = await res.json().then(d => d.detail).catch(() => "Registration failed");
          return { data: null, error: new Error(detail) };
        }
        return { data: { user: { email } }, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },

    async signOut(): Promise<{ error: any }> {
      localStorage.removeItem("dis_session");
      listeners.forEach(cb => cb("SIGNED_OUT", null));
      return { error: null };
    },

    onAuthStateChange(callback: AuthListener): { data: { subscription: { unsubscribe: () => void } } } {
      listeners.add(callback);
      this.getSession().then(({ data }) => {
        callback("INITIAL_SESSION", data.session);
      });
      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(callback);
            },
          },
        },
      };
    },
  },
};

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DocumentOut {
  id: string;
  original_filename: string;
  file_type: "pdf" | "docx" | "image" | "link";
  status: "pending" | "processing" | "completed" | "failed";
  uploaded_at: string;
  processed_at: string | null;
}

export interface SearchResultItem {
  document_id: string;
  chunk_text: string;
  score: number;
  original_filename: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  answer: string | null;
}

export interface TimelineEventOut {
  id: string;
  event_date: string;
  event_type: string;
  title: string;
  description: string | null;
  document_id: string | null;
  date_inferred: boolean;
}

export interface ChatResponse {
  query: string;
  answer: string;
  sources: SearchResultItem[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  confidence?: number;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface InsightItem {
  type: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable_step: string;
}

export interface InsightsResponse {
  insights: InsightItem[];
  updated_at: string;
}

export interface CareerTwin {
  current_role_trend: string;
  strongest_skills: string[];
  fastest_growing_skill: string;
  career_direction: string;
  experience_summary: string;
  recommended_next_skill: string;
  recommended_next_project: string;
  career_readiness: number;
}

export interface DashboardMetricsResponse {
  identity_score: number;
  score_breakdown: Record<string, number>;
  career_twin: CareerTwin;
  ai_summary_narrative: string;
  stats: Record<string, number>;
  updated_at: string;
}

// DEMO DATASET V2 — 30 documents, 250 relationships, 200 skills
const DEMO_DOCUMENTS: DocumentOut[] = [
  { id: "d1",  original_filename: "Resume_2026.pdf",                file_type: "pdf",   status: "completed", uploaded_at: "2023-01-10T12:00:00Z", processed_at: "2023-01-10T12:01:00Z" },
  { id: "d2",  original_filename: "AWS_Solutions_Architect.pdf",   file_type: "pdf",   status: "completed", uploaded_at: "2023-11-09T09:00:00Z", processed_at: "2023-11-09T09:00:45Z" },
  { id: "d3",  original_filename: "React_Dashboard_Project.pdf",   file_type: "pdf",   status: "completed", uploaded_at: "2024-05-12T14:30:00Z", processed_at: "2024-05-12T14:31:10Z" },
  { id: "d4",  original_filename: "ML_Internship_Letter.pdf",      file_type: "pdf",   status: "completed", uploaded_at: "2024-08-12T15:00:00Z", processed_at: "2024-08-12T15:00:55Z" },
  { id: "d5",  original_filename: "IdentityOS_Portfolio.pdf",      file_type: "pdf",   status: "completed", uploaded_at: "2026-07-13T10:00:00Z", processed_at: "2026-07-13T10:01:30Z" },
  { id: "d6",  original_filename: "Google_Internship_Offer.pdf",   file_type: "pdf",   status: "completed", uploaded_at: "2024-01-15T08:00:00Z", processed_at: "2024-01-15T08:01:20Z" },
  { id: "d7",  original_filename: "Docker_Certificate.pdf",        file_type: "pdf",   status: "completed", uploaded_at: "2023-07-20T11:00:00Z", processed_at: "2023-07-20T11:00:38Z" },
  { id: "d8",  original_filename: "Kubernetes_Cert.pdf",           file_type: "pdf",   status: "completed", uploaded_at: "2025-02-10T09:00:00Z", processed_at: "2025-02-10T09:01:05Z" },
  { id: "d9",  original_filename: "Neo4j_Graph_Project.pdf",       file_type: "pdf",   status: "completed", uploaded_at: "2025-06-01T13:00:00Z", processed_at: "2025-06-01T13:01:00Z" },
  { id: "d10", original_filename: "AI_Research_Paper.pdf",         file_type: "pdf",   status: "completed", uploaded_at: "2025-07-20T10:30:00Z", processed_at: "2025-07-20T10:31:15Z" },
  { id: "d11", original_filename: "Hackathon_Winner_Certificate.pdf", file_type: "pdf", status: "completed", uploaded_at: "2025-12-01T08:00:00Z", processed_at: "2025-12-01T08:00:50Z" },
  { id: "d12", original_filename: "FastAPI_Backend_Project.pdf",   file_type: "pdf",   status: "completed", uploaded_at: "2024-03-15T14:00:00Z", processed_at: "2024-03-15T14:01:00Z" },
  { id: "d13", original_filename: "Transcript_2024.pdf",           file_type: "pdf",   status: "completed", uploaded_at: "2024-06-30T09:00:00Z", processed_at: "2024-06-30T09:01:10Z" },
  { id: "d14", original_filename: "GCP_Associate_Cert.pdf",        file_type: "pdf",   status: "completed", uploaded_at: "2025-01-10T10:00:00Z", processed_at: "2025-01-10T10:00:45Z" },
  { id: "d15", original_filename: "OpenAI_API_Project.pdf",        file_type: "pdf",   status: "completed", uploaded_at: "2025-09-05T12:00:00Z", processed_at: "2025-09-05T12:01:00Z" },
  { id: "d16", original_filename: "Leadership_Award_2024.pdf",     file_type: "pdf",   status: "completed", uploaded_at: "2024-11-20T08:00:00Z", processed_at: "2024-11-20T08:00:35Z" },
  { id: "d17", original_filename: "RAG_Pipeline_Design.pdf",       file_type: "pdf",   status: "completed", uploaded_at: "2026-01-15T11:00:00Z", processed_at: "2026-01-15T11:01:00Z" },
  { id: "d18", original_filename: "TypeScript_Expert_Cert.pdf",    file_type: "pdf",   status: "completed", uploaded_at: "2023-09-01T09:00:00Z", processed_at: "2023-09-01T09:00:30Z" },
  { id: "d19", original_filename: "Startup_Internship_2023.pdf",   file_type: "pdf",   status: "completed", uploaded_at: "2023-06-01T08:00:00Z", processed_at: "2023-06-01T08:01:00Z" },
  { id: "d20", original_filename: "PostgreSQL_DBA_Cert.pdf",       file_type: "pdf",   status: "completed", uploaded_at: "2024-04-10T10:00:00Z", processed_at: "2024-04-10T10:00:40Z" },
  { id: "d21", original_filename: "Qdrant_Vector_Project.pdf",     file_type: "pdf",   status: "completed", uploaded_at: "2025-11-01T12:00:00Z", processed_at: "2025-11-01T12:01:00Z" },
  { id: "d22", original_filename: "GraphQL_API_Project.pdf",       file_type: "pdf",   status: "completed", uploaded_at: "2024-09-20T14:00:00Z", processed_at: "2024-09-20T14:01:10Z" },
  { id: "d23", original_filename: "MLOps_Certificate.pdf",         file_type: "pdf",   status: "completed", uploaded_at: "2026-02-01T09:00:00Z", processed_at: "2026-02-01T09:01:00Z" },
  { id: "d24", original_filename: "Cover_Letter_Staff_Eng.pdf",    file_type: "pdf",   status: "completed", uploaded_at: "2026-06-01T08:00:00Z", processed_at: "2026-06-01T08:00:50Z" },
  { id: "d25", original_filename: "Deep_Learning_Cert.pdf",        file_type: "pdf",   status: "completed", uploaded_at: "2025-04-15T10:00:00Z", processed_at: "2025-04-15T10:01:00Z" },
  { id: "d26", original_filename: "System_Design_Notes.pdf",       file_type: "pdf",   status: "completed", uploaded_at: "2025-08-10T11:00:00Z", processed_at: "2025-08-10T11:01:00Z" },
  { id: "d27", original_filename: "Open_Source_Contrib.pdf",       file_type: "pdf",   status: "completed", uploaded_at: "2024-12-05T09:00:00Z", processed_at: "2024-12-05T09:00:45Z" },
  { id: "d28", original_filename: "Vector_DB_Research.pdf",        file_type: "pdf",   status: "completed", uploaded_at: "2026-03-20T13:00:00Z", processed_at: "2026-03-20T13:01:00Z" },
  { id: "d29", original_filename: "Fintech_Hackathon_Project.pdf", file_type: "pdf",   status: "completed", uploaded_at: "2025-03-10T10:00:00Z", processed_at: "2025-03-10T10:01:00Z" },
  { id: "d30", original_filename: "AI_Career_Vision_2027.pdf",     file_type: "pdf",   status: "completed", uploaded_at: "2026-07-01T08:00:00Z", processed_at: "2026-07-01T08:01:00Z" },
];

const DEMO_METRICS: DashboardMetricsResponse = {
  identity_score: 94,
  score_breakdown: {
    "Projects Index": 96,
    "Skills Match": 97,
    "Certificates": 98,
    "Verification": 95,
    "Leadership": 88,
    "Research": 92
  },
  career_twin: {
    current_role_trend: "Senior AI Engineer → Staff Engineer",
    strongest_skills: ["Python", "React", "FastAPI", "Docker", "Machine Learning", "Neo4j", "Kubernetes", "RAG Pipelines"],
    fastest_growing_skill: "RAG Pipeline Architecture",
    career_direction: "AI-Native Systems Architect · Full-Stack Intelligence Platform Builder",
    experience_summary: "Alex Morgan is a world-class AI Engineer with verified expertise across ML systems, graph databases, cloud infrastructure, and enterprise-grade React applications. 8 internships, 15 projects, and 25 certifications validate a rare combination of depth and breadth.",
    recommended_next_skill: "Graph Neural Networks (GNN) + LLM Agent Orchestration",
    recommended_next_project: "Build a production multi-agent RAG system with dynamic tool routing",
    career_readiness: 96
  },
  ai_summary_narrative: "Alex Morgan is a world-class AI Engineer with verified expertise in ML systems, knowledge graphs, cloud infrastructure, and enterprise React applications. 30 documents, 8 internships, 15 projects, and 25 certifications confirm exceptional technical depth. Career trajectory points directly toward Staff Engineer or AI Architect roles at top-tier technology companies within 2–4 months.",
  stats: {
    documents_count: 30,
    skills_count: 42,
    relationships_count: 250,
    timeline_events_count: 12
  },
  updated_at: "2026-07-13T18:25:29Z"
};

const DEMO_INSIGHTS: InsightsResponse = {
  insights: [
    {
      type: "career",
      title: "Staff Engineer Pathway Unlocked",
      description: "React + Docker + AWS + Kubernetes credentials now satisfy the technical bar for Staff Engineer roles at FAANG-tier companies. Your identity score of 94% is in the top 3% of profiles.",
      impact: "high",
      actionable_step: "Apply to Staff Engineer roles at Google DeepMind, Anthropic, and OpenAI — your profile matches 94% of their JD criteria."
    },
    {
      type: "skills",
      title: "Leadership Signals Detected Across 3 Projects",
      description: "AI analysis detected leadership patterns in your hackathon winner certificate, ML internship, and Google internship documents. This qualifies for engineering lead consideration.",
      impact: "high",
      actionable_step: "Add a dedicated leadership section to your portfolio highlighting cross-team collaboration and mentoring."
    },
    {
      type: "gaps",
      title: "GNN + LLM Agent Orchestration Gap",
      description: "Your RAG pipeline and vector DB skills are exceptional, but Graph Neural Networks remain an emerging gap that would make you uniquely qualified in the AI systems space.",
      impact: "medium",
      actionable_step: "Complete the Stanford CS224W Graph ML course and build a GNN-powered recommendation system."
    }
  ],
  updated_at: "2026-07-13T18:25:29Z"
};

const DEMO_TIMELINE: TimelineEventOut[] = [
  { id: "t1",  event_date: "2026-07-01", event_type: "Project",     title: "IdentityOS AI Platform",        description: "Built world-class AI Digital Identity OS — featured at national hackathon. Knowledge Graph, RAG pipelines, Career Twin, and full deployment.", document_id: "d5",  date_inferred: false },
  { id: "t2",  event_date: "2026-02-15", event_type: "Certificate", title: "MLOps Practitioner Certified",    description: "Completed advanced MLOps certification covering model tracking, CI/CD pipelines, and production deployment strategies.", document_id: "d23", date_inferred: false },
  { id: "t3",  event_date: "2025-12-01", event_type: "Achievement", title: "National Hackathon Winner",       description: "Won first place in national AI hackathon among 800+ teams. Demonstrated real-time knowledge graph construction from unstructured documents.", document_id: "d11", date_inferred: false },
  { id: "t4",  event_date: "2025-09-05", event_type: "Project",     title: "OpenAI-Powered RAG Engine",      description: "Designed and deployed production-grade Retrieval-Augmented Generation pipeline serving 10K+ queries per day with sub-100ms latency.", document_id: "d15", date_inferred: false },
  { id: "t5",  event_date: "2025-07-20", event_type: "Academics",   title: "AI Research Publication",        description: "Co-authored peer-reviewed paper on AI model performance optimization in resource-constrained edge environments.", document_id: "d10", date_inferred: false },
  { id: "t6",  event_date: "2025-02-10", event_type: "Certificate", title: "Certified Kubernetes Administrator", description: "Passed CKA certification — container orchestration, networking, storage, and production cluster management.", document_id: "d8",  date_inferred: false },
  { id: "t7",  event_date: "2024-11-20", event_type: "Achievement", title: "Engineering Leadership Award",    description: "Recognized for leading a 6-person team to deliver a real-time ML pipeline ahead of schedule, improving inference time by 40%.", document_id: "d16", date_inferred: false },
  { id: "t8",  event_date: "2024-08-01", event_type: "Internship",  title: "Google ML Engineering Internship", description: "Contributed to TensorFlow Extended (TFX) pipeline optimizations. Achieved 30% speed improvement in distributed training workloads.", document_id: "d6",  date_inferred: false },
  { id: "t9",  event_date: "2024-06-01", event_type: "Internship",  title: "ML Research Internship",          description: "Developed predictive models for time-series anomaly detection. Deployed to production serving 50K daily predictions.", document_id: "d4",  date_inferred: false },
  { id: "t10", event_date: "2023-11-09", event_type: "Certificate", title: "AWS Solutions Architect — Pro",   description: "Earned AWS Professional certification covering multi-region architectures, cost optimization, and enterprise security patterns.", document_id: "d2",  date_inferred: false },
  { id: "t11", event_date: "2023-06-01", event_type: "Internship",  title: "FinTech Startup Internship",      description: "Built real-time fraud detection system using Python, FastAPI, and PostgreSQL. Reduced false positives by 28%.", document_id: "d19", date_inferred: false },
  { id: "t12", event_date: "2023-01-10", event_type: "Skill",       title: "Full-Stack Foundation",           description: "Mastered React, TypeScript, FastAPI, Docker, and PostgreSQL through intensive project-based learning and production deployments.", document_id: "d1",  date_inferred: false },
];

const DEMO_GRAPH: GraphResponse = {
  nodes: [
    // Core identity
    { id: "n1",  label: "Alex Morgan",          type: "Document",     properties: { role: "Senior AI Engineer", email: "alex@identityos.ai" } },
    // Skills
    { id: "n2",  label: "Python",               type: "Skill",        properties: { years: 4, confidence: 0.98 } },
    { id: "n3",  label: "React",                type: "Skill",        properties: { years: 3, confidence: 0.96 } },
    { id: "n4",  label: "FastAPI",              type: "Skill",        properties: { years: 3, confidence: 0.95 } },
    { id: "n5",  label: "Docker",               type: "Skill",        properties: { years: 3, confidence: 0.93 } },
    { id: "n6",  label: "Machine Learning",     type: "Skill",        properties: { years: 3, confidence: 0.95 } },
    { id: "n7",  label: "PostgreSQL",           type: "Skill",        properties: { years: 4, confidence: 0.92 } },
    { id: "n8",  label: "Neo4j",                type: "Skill",        properties: { years: 2, confidence: 0.91 } },
    { id: "n9",  label: "Kubernetes",           type: "Skill",        properties: { years: 2, confidence: 0.90 } },
    { id: "n10", label: "RAG Pipelines",        type: "Skill",        properties: { years: 1, confidence: 0.94 } },
    { id: "n11", label: "TypeScript",           type: "Skill",        properties: { years: 3, confidence: 0.93 } },
    { id: "n12", label: "Next.js",              type: "Skill",        properties: { years: 2, confidence: 0.92 } },
    { id: "n13", label: "Qdrant",               type: "Skill",        properties: { years: 1, confidence: 0.89 } },
    { id: "n14", label: "Deep Learning",        type: "Skill",        properties: { years: 2, confidence: 0.88 } },
    { id: "n15", label: "GraphQL",              type: "Skill",        properties: { years: 2, confidence: 0.87 } },
    // Certificates
    { id: "n16", label: "AWS Solutions Architect Pro", type: "Certificate", properties: { date: "2023-11-09", issuer: "Amazon Web Services" } },
    { id: "n17", label: "Certified Kubernetes Admin",  type: "Certificate", properties: { date: "2025-02-10", issuer: "CNCF" } },
    { id: "n18", label: "MLOps Practitioner",          type: "Certificate", properties: { date: "2026-02-15", issuer: "DataCamp" } },
    { id: "n19", label: "GCP Associate",               type: "Certificate", properties: { date: "2025-01-10", issuer: "Google Cloud" } },
    { id: "n20", label: "Deep Learning Specialization", type: "Certificate", properties: { date: "2025-04-15", issuer: "DeepLearning.AI" } },
    // Projects
    { id: "n21", label: "IdentityOS Platform",    type: "Project",      properties: { date: "2026-07-01", stars: 280 } },
    { id: "n22", label: "RAG Pipeline Engine",    type: "Project",      properties: { date: "2025-09-05", queries_per_day: 10000 } },
    { id: "n23", label: "Neo4j Graph System",     type: "Project",      properties: { date: "2025-06-01", nodes: 5000 } },
    { id: "n24", label: "Fintech Fraud Detector", type: "Project",      properties: { date: "2023-06-01", accuracy: 0.97 } },
    { id: "n25", label: "React Dashboard Suite",  type: "Project",      properties: { date: "2024-05-12", components: 48 } },
    // Internships
    { id: "n26", label: "Google ML Internship",   type: "Internship",   properties: { date: "2024-08-01", duration: "12 weeks" } },
    { id: "n27", label: "ML Research Internship", type: "Internship",   properties: { date: "2024-06-01", duration: "10 weeks" } },
    { id: "n28", label: "FinTech Startup Intern", type: "Internship",   properties: { date: "2023-06-01", duration: "8 weeks" } },
    // Achievements
    { id: "n29", label: "National Hackathon Winner",  type: "Achievement", properties: { date: "2025-12-01", rank: 1 } },
    { id: "n30", label: "Engineering Leadership Award", type: "Achievement", properties: { date: "2024-11-20" } },
    // Organizations
    { id: "n31", label: "Google",      type: "Organization", properties: { type: "Tech Giant" } },
    { id: "n32", label: "AWS",         type: "Organization", properties: { type: "Cloud Platform" } },
    { id: "n33", label: "CNCF",        type: "Organization", properties: { type: "Standards Body" } },
    // Education
    { id: "n34", label: "B.Tech Computer Science", type: "Education", properties: { year: "2024", gpa: "9.1/10" } },
    // Documents
    { id: "n35", label: "Resume_2026.pdf",      type: "Document", properties: {} },
    { id: "n36", label: "AI Research Paper",    type: "Document", properties: { date: "2025-07-20" } },
    { id: "n37", label: "Vector DB Research",   type: "Document", properties: { date: "2026-03-20" } },
    { id: "n38", label: "System Design Notes",  type: "Document", properties: { date: "2025-08-10" } },
    { id: "n39", label: "Career Vision 2027",   type: "Document", properties: { date: "2026-07-01" } },
    { id: "n40", label: "Open Source Contrib",  type: "Document", properties: { date: "2024-12-05" } },
  ],
  edges: [
    // Core identity links
    { source: "n35", target: "n1",  relationship: "DESCRIBES",       confidence: 1.0,  reason: "Verified master resume document.", timestamp: "2023-01-10T12:00:00Z" },
    { source: "n1",  target: "n34", relationship: "GRADUATED_FROM",  confidence: 1.0,  reason: "Academic transcript verified.", timestamp: "2024-06-30T00:00:00Z" },
    // Skills from identity
    { source: "n1",  target: "n2",  relationship: "EXPERT_IN",       confidence: 0.98, reason: "Python used across 8 projects and 3 internships.", timestamp: "2023-01-10T12:00:00Z" },
    { source: "n1",  target: "n3",  relationship: "EXPERT_IN",       confidence: 0.96, reason: "React verified via 3 project reports and 15 components.", timestamp: "2024-05-12T00:00:00Z" },
    { source: "n1",  target: "n4",  relationship: "DEVELOPS_WITH",   confidence: 0.95, reason: "FastAPI is core API development stack.", timestamp: "2023-01-10T12:00:00Z" },
    { source: "n1",  target: "n5",  relationship: "USES",            confidence: 0.93, reason: "Docker used in all 3 internships for deployment.", timestamp: "2023-06-01T00:00:00Z" },
    { source: "n1",  target: "n6",  relationship: "SPECIALIZES_IN",  confidence: 0.95, reason: "Core ML focus confirmed by 2 internships + research.", timestamp: "2024-06-01T00:00:00Z" },
    { source: "n1",  target: "n7",  relationship: "STORES_DATA_IN",  confidence: 0.92, reason: "PostgreSQL in all backend projects.", timestamp: "2023-01-10T12:00:00Z" },
    { source: "n1",  target: "n8",  relationship: "BUILT_WITH",      confidence: 0.91, reason: "Neo4j used in IdentityOS knowledge graph engine.", timestamp: "2025-06-01T00:00:00Z" },
    { source: "n1",  target: "n9",  relationship: "CERTIFIED_IN",    confidence: 0.90, reason: "CKA certification and production cluster management.", timestamp: "2025-02-10T00:00:00Z" },
    { source: "n1",  target: "n10", relationship: "ARCHITECT_OF",    confidence: 0.94, reason: "Designed RAG pipeline serving 10K queries/day.", timestamp: "2025-09-05T00:00:00Z" },
    { source: "n1",  target: "n11", relationship: "CODES_IN",        confidence: 0.93, reason: "TypeScript used across all frontend systems.", timestamp: "2023-01-10T12:00:00Z" },
    { source: "n1",  target: "n12", relationship: "BUILDS_WITH",     confidence: 0.92, reason: "Next.js powers IdentityOS frontend.", timestamp: "2026-07-01T00:00:00Z" },
    { source: "n1",  target: "n13", relationship: "INTEGRATES",      confidence: 0.89, reason: "Qdrant used as vector search backend.", timestamp: "2025-11-01T00:00:00Z" },
    { source: "n1",  target: "n14", relationship: "STUDIES",         confidence: 0.88, reason: "Deep learning cert + AI research publication.", timestamp: "2025-04-15T00:00:00Z" },
    { source: "n1",  target: "n15", relationship: "USES",            confidence: 0.87, reason: "GraphQL API project deliverable.", timestamp: "2024-09-20T00:00:00Z" },
    // Certificate links
    { source: "n16", target: "n1",  relationship: "CERTIFIES",       confidence: 1.0,  reason: "AWS Professional credential issued.", timestamp: "2023-11-09T00:00:00Z" },
    { source: "n17", target: "n1",  relationship: "CERTIFIES",       confidence: 1.0,  reason: "CKA issued by CNCF.", timestamp: "2025-02-10T00:00:00Z" },
    { source: "n18", target: "n1",  relationship: "CERTIFIES",       confidence: 1.0,  reason: "MLOps Practitioner certification.", timestamp: "2026-02-15T00:00:00Z" },
    { source: "n19", target: "n1",  relationship: "CERTIFIES",       confidence: 1.0,  reason: "GCP Associate certification.", timestamp: "2025-01-10T00:00:00Z" },
    { source: "n20", target: "n1",  relationship: "CERTIFIES",       confidence: 1.0,  reason: "DeepLearning.AI specialization.", timestamp: "2025-04-15T00:00:00Z" },
    // Project links
    { source: "n21", target: "n8",  relationship: "USES_TECHNOLOGY", confidence: 0.98, reason: "Neo4j is the graph engine in IdentityOS.", timestamp: "2026-07-01T00:00:00Z" },
    { source: "n21", target: "n10", relationship: "IMPLEMENTS",      confidence: 0.97, reason: "RAG engine is core of IdentityOS AI layer.", timestamp: "2026-07-01T00:00:00Z" },
    { source: "n21", target: "n12", relationship: "BUILT_WITH",      confidence: 0.96, reason: "Next.js 14 powers IdentityOS frontend.", timestamp: "2026-07-01T00:00:00Z" },
    { source: "n22", target: "n13", relationship: "USES_TECHNOLOGY", confidence: 0.95, reason: "Qdrant powers RAG vector search.", timestamp: "2025-09-05T00:00:00Z" },
    { source: "n22", target: "n6",  relationship: "APPLIES",         confidence: 0.94, reason: "ML models underpin RAG semantic layer.", timestamp: "2025-09-05T00:00:00Z" },
    { source: "n23", target: "n8",  relationship: "IMPLEMENTS",      confidence: 1.0,  reason: "Neo4j project deliverable.", timestamp: "2025-06-01T00:00:00Z" },
    { source: "n24", target: "n4",  relationship: "BUILT_WITH",      confidence: 0.96, reason: "FastAPI backend in FinTech fraud detector.", timestamp: "2023-06-01T00:00:00Z" },
    { source: "n25", target: "n3",  relationship: "IMPLEMENTS",      confidence: 1.0,  reason: "React Dashboard Suite project.", timestamp: "2024-05-12T00:00:00Z" },
    // Internship links
    { source: "n26", target: "n31", relationship: "AT_ORGANIZATION", confidence: 1.0,  reason: "Google ML Engineering internship.", timestamp: "2024-08-01T00:00:00Z" },
    { source: "n26", target: "n6",  relationship: "PRACTICED",       confidence: 0.98, reason: "Worked on TFX distributed training.", timestamp: "2024-08-01T00:00:00Z" },
    { source: "n27", target: "n14", relationship: "PRACTICED",       confidence: 0.95, reason: "Deep learning models for anomaly detection.", timestamp: "2024-06-01T00:00:00Z" },
    { source: "n28", target: "n7",  relationship: "USED_DATABASE",   confidence: 0.92, reason: "PostgreSQL backend for fraud system.", timestamp: "2023-06-01T00:00:00Z" },
    // Achievement links
    { source: "n29", target: "n21", relationship: "AWARDED_FOR",     confidence: 1.0,  reason: "Hackathon won with IdentityOS project.", timestamp: "2025-12-01T00:00:00Z" },
    { source: "n30", target: "n26", relationship: "RECOGNIZED_DURING", confidence: 0.95, reason: "Leadership demonstrated during Google internship.", timestamp: "2024-11-20T00:00:00Z" },
    // Org links
    { source: "n16", target: "n32", relationship: "ISSUED_BY",       confidence: 1.0,  reason: "AWS cert issued by Amazon.", timestamp: "2023-11-09T00:00:00Z" },
    { source: "n17", target: "n33", relationship: "ISSUED_BY",       confidence: 1.0,  reason: "CKA issued by CNCF.", timestamp: "2025-02-10T00:00:00Z" },
    // Research documents
    { source: "n36", target: "n6",  relationship: "CONTRIBUTES_TO",  confidence: 0.95, reason: "AI paper extends ML knowledge domain.", timestamp: "2025-07-20T00:00:00Z" },
    { source: "n37", target: "n13", relationship: "ANALYZES",        confidence: 0.93, reason: "Vector DB research focuses on Qdrant.", timestamp: "2026-03-20T00:00:00Z" },
    { source: "n40", target: "n2",  relationship: "DEMONSTRATES",    confidence: 0.91, reason: "Open source Python contributions.", timestamp: "2024-12-05T00:00:00Z" },
    { source: "n39", target: "n1",  relationship: "PLANS_FOR",       confidence: 0.88, reason: "Career vision document outlines 2027 goals.", timestamp: "2026-07-01T00:00:00Z" },
  ]
};

export const apiClient = {
  async uploadDocument(file: File): Promise<{ document_id: string; status: string }> {
    if (isDemoModeActive()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ document_id: "demo-doc-new", status: "completed" });
        }, 1500);
      });
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: await authHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return res.json();
  },

  async listDocuments(): Promise<DocumentOut[]> {
    if (isDemoModeActive()) return DEMO_DOCUMENTS;
    const res = await fetch(`${API_BASE_URL}/documents`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to list documents: ${res.statusText}`);
    return res.json();
  },

  async search(query: string, topK = 5): Promise<SearchResponse> {
    if (isDemoModeActive()) {
      const results: SearchResultItem[] = DEMO_TIMELINE.map((item) => ({
        document_id: item.document_id || "d1",
        chunk_text: `${item.title}: ${item.description}`,
        score: 0.92,
        original_filename: "Demo_Portfolio.json"
      }));
      return { query, results, answer: `Alex Morgan is a qualified ML and Graph systems specialist with proven competencies in Neo4j, Qdrant, and Python.` };
    }
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    return res.json();
  },

  async chat(query: string, topK = 5): Promise<ChatResponse> {
    if (isDemoModeActive()) {
      const sources: SearchResultItem[] = DEMO_DOCUMENTS.map((doc) => ({
        document_id: doc.id,
        chunk_text: `Verified source document containing details matching: ${query}`,
        score: 0.88,
        original_filename: doc.original_filename
      }));
      return {
        query,
        answer: `Under presentation mode: Alex Morgan has successfully demonstrated capabilities in Graph Neural Networks, cloud infrastructure deployment (AWS), and enterprise database structures (Google Internship).`,
        sources
      };
    }
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
    return res.json();
  },

  async getTimeline(): Promise<TimelineEventOut[]> {
    if (isDemoModeActive()) return DEMO_TIMELINE;
    const res = await fetch(`${API_BASE_URL}/timeline`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to load timeline: ${res.statusText}`);
    return res.json();
  },

  async getGraph(): Promise<GraphResponse> {
    if (isDemoModeActive()) return DEMO_GRAPH;
    const res = await fetch(`${API_BASE_URL}/graph`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to load graph: ${res.statusText}`);
    return res.json();
  },

  async getInsights(): Promise<InsightsResponse> {
    if (isDemoModeActive()) return DEMO_INSIGHTS;
    const res = await fetch(`${API_BASE_URL}/insights`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to load insights: ${res.statusText}`);
    return res.json();
  },

  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    if (isDemoModeActive()) return DEMO_METRICS;
    const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to load dashboard metrics: ${res.statusText}`);
    return res.json();
  },
};
