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

// PREMIUM DEMO MOCK DATA
const DEMO_DOCUMENTS: DocumentOut[] = [
  { id: "d1", original_filename: "Resume_Sapna_Jha.pdf", file_type: "pdf", status: "completed", uploaded_at: "2026-07-10T12:00:00Z", processed_at: "2026-07-10T12:01:00Z" },
  { id: "d2", original_filename: "AWS_Cloud_Practitioner_Cert.pdf", file_type: "pdf", status: "completed", uploaded_at: "2026-07-11T09:00:00Z", processed_at: "2026-07-11T09:00:45Z" },
  { id: "d3", original_filename: "Google_Internship_Completion.pdf", file_type: "pdf", status: "completed", uploaded_at: "2026-07-12T14:30:00Z", processed_at: "2026-07-12T14:31:10Z" },
  { id: "d4", original_filename: "Smart_India_Hackathon_First_Prize.pdf", file_type: "pdf", status: "completed", uploaded_at: "2026-07-12T15:00:00Z", processed_at: "2026-07-12T15:00:55Z" },
  { id: "d5", original_filename: "GNN_Research_Paper.pdf", file_type: "pdf", status: "completed", uploaded_at: "2026-07-13T10:00:00Z", processed_at: "2026-07-13T10:01:30Z" }
];

const DEMO_METRICS: DashboardMetricsResponse = {
  identity_score: 94,
  score_breakdown: {
    "Projects Index": 95,
    "Skills Match": 92,
    "Certificates": 98,
    "Verification": 90
  },
  career_twin: {
    current_role_trend: "Senior Machine Learning Engineer (Graph Systems)",
    strongest_skills: ["Python", "PyTorch", "Neo4j", "Graph Neural Networks", "AWS", "FastAPI"],
    fastest_growing_skill: "Graph Neural Networks",
    career_direction: "Autonomous Agent Architect & Machine Learning Systems Lead",
    experience_summary: "1x Engineering Intern @ Google, Winner of Smart India Hackathon, author of GNN research paper, 4+ complex open-source projects.",
    recommended_next_skill: "Kubernetes Cluster Administration",
    recommended_next_project: "Build a distributed RAG graph indexing pipeline",
    career_readiness: 96
  },
  ai_summary_narrative: "Sapna Jha is a high-potential Software Engineer specializing in Graph Neural Networks and distributed system design. Backed by verified experience at Google (Internship) and an AWS Cloud Practitioner certification, her capability profile shows exceptional strength in backend engineering and machine learning.",
  stats: {
    documents_count: 5,
    skills_count: 18,
    relationships_count: 32,
    timeline_events_count: 5
  },
  updated_at: "2026-07-13T13:30:00Z"
};

const DEMO_INSIGHTS: InsightsResponse = {
  insights: [
    {
      type: "skills",
      title: "Kubernetes & Container Orchestration",
      description: "Your portfolio contains distributed ML pipeline designs, but lacks explicit cluster management signals. Acquiring container orchestration experience will increase lead eligibility.",
      impact: "high",
      actionable_step: "Deploy your GNN indexing service on a local Minikube cluster and document the Helm chart."
    },
    {
      type: "gaps",
      title: "Cloud Architecture Validation",
      description: "You hold an AWS Cloud Practitioner cert, but advanced systems validation (e.g. AWS Solutions Architect) would consolidate your cloud systems footprint.",
      impact: "medium",
      actionable_step: "Prepare for Solutions Architect Associate using the AWS Academy practice curriculum."
    },
    {
      type: "achievements",
      title: "Hackathon Leadership Expansion",
      description: "Your first place win at the Smart India Hackathon highlights strong project direction. Translating this into open-source leadership will amplify your reach.",
      impact: "low",
      actionable_step: "Publish the hackathon prototype as a template repository with detailed contributor guidelines."
    }
  ],
  updated_at: "2026-07-13T13:30:00Z"
};

const DEMO_TIMELINE: TimelineEventOut[] = [
  {
    id: "t1",
    event_date: "2026-06-15",
    event_type: "Internship",
    title: "Google Software Engineering Intern",
    description: "Collaborated on optimizing latency for high-throughput distributed graph databases.",
    document_id: "d3",
    date_inferred: false
  },
  {
    id: "t2",
    event_date: "2026-03-10",
    event_type: "Certificate",
    title: "AWS Certified Cloud Practitioner",
    description: "Demonstrated foundational knowledge of cloud services, security, architecture, and pricing.",
    document_id: "d2",
    date_inferred: false
  },
  {
    id: "t3",
    event_date: "2025-11-20",
    event_type: "Achievement",
    title: "First Place - Smart India Hackathon",
    description: "Led team of 4 to build an AI-driven disaster relief tracking system utilizing Neo4j graph schemas.",
    document_id: "d4",
    date_inferred: false
  },
  {
    id: "t4",
    event_date: "2025-08-01",
    event_type: "Project",
    title: "Graph-Based Neural Search Indexer",
    description: "Implemented a customized vector retrieval algorithm in Qdrant with Python and FastAPI.",
    document_id: "d1",
    date_inferred: false
  },
  {
    id: "t5",
    event_date: "2025-05-15",
    event_type: "Academics",
    title: "Published Research: Graph Neural Networks",
    description: "Co-authored paper on optimizing node classification efficiency in sparse topologies.",
    document_id: "d5",
    date_inferred: false
  }
];

const DEMO_GRAPH: GraphResponse = {
  nodes: [
    { id: "n1", label: "Sapna Jha", type: "Document", properties: { role: "Software Engineer" } },
    { id: "n2", label: "Google", type: "Organization", properties: { type: "Technology Corp" } },
    { id: "n3", label: "AWS Certified Cloud Practitioner", type: "Certificate", properties: { issuer: "Amazon Web Services" } },
    { id: "n4", label: "Smart India Hackathon", type: "Achievement", properties: { rank: "First Place" } },
    { id: "n5", label: "Graph Neural Networks", type: "Skill" },
    { id: "n6", label: "PyTorch", type: "Skill" },
    { id: "n7", label: "Neo4j", type: "Skill" },
    { id: "n8", label: "Qdrant", type: "Skill" },
    { id: "n9", label: "Graph-Based Neural Search Indexer", type: "Project" },
    { id: "n10", label: "GNN Research Paper", type: "Document" },
    { id: "n11", label: "Resume_Sapna_Jha.pdf", type: "Document" }
  ],
  edges: [
    { source: "n1", target: "n2", relationship: "INTERNED_AT", confidence: 1.0, reason: "Verified by Google Internship Completion document." },
    { source: "n1", target: "n3", relationship: "CERTIFIED_IN", confidence: 1.0, reason: "Verified by official AWS Certificate credentials." },
    { source: "n1", target: "n4", relationship: "WON_FIRST_PLACE_IN", confidence: 1.0, reason: "Verified by Smart India Hackathon award document." },
    { source: "n1", target: "n5", relationship: "EXPERT_IN", confidence: 0.95, reason: "Derived from GNN Research Paper and Projects." },
    { source: "n1", target: "n6", relationship: "USES", confidence: 0.95, reason: "Common framework referenced across 3 projects." },
    { source: "n9", target: "n8", relationship: "INTEGRATES_WITH", confidence: 1.0, reason: "Uses Qdrant as vector storage backend." },
    { source: "n9", target: "n7", relationship: "STORES_RELATIONS_IN", confidence: 0.95, reason: "Maintains schema connections using Neo4j database." },
    { source: "n10", target: "n5", relationship: "RESEARCHES", confidence: 1.0, reason: "Subject matter of GNN Topologies paper." },
    { source: "n11", target: "n1", relationship: "DESCRIBES", confidence: 0.9, reason: "Main resume indexing match." }
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
        original_filename: "Sapna_Portfolio.json"
      }));
      return { query, results, answer: `Sapna Jha is a qualified ML and Graph systems specialist with proven competencies in Neo4j, Qdrant, and Python.` };
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
        answer: `Under presentation mode: Sapna Jha has successfully demonstrated capabilities in Graph Neural Networks, cloud infrastructure deployment (AWS), and enterprise database structures (Google Internship).`,
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
