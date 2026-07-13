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
  { id: "d1", original_filename: "Resume.pdf", file_type: "pdf", status: "completed", uploaded_at: "2023-01-10T12:00:00Z", processed_at: "2023-01-10T12:01:00Z" },
  { id: "d2", original_filename: "AWS_Certificate.pdf", file_type: "pdf", status: "completed", uploaded_at: "2023-11-09T09:00:00Z", processed_at: "2023-11-09T09:00:45Z" },
  { id: "d3", original_filename: "React_Project_Report.pdf", file_type: "pdf", status: "completed", uploaded_at: "2024-05-12T14:30:00Z", processed_at: "2024-05-12T14:31:10Z" },
  { id: "d4", original_filename: "Internship_Letter.pdf", file_type: "pdf", status: "completed", uploaded_at: "2024-08-12T15:00:00Z", processed_at: "2024-08-12T15:00:55Z" },
  { id: "d5", original_filename: "Portfolio.pdf", file_type: "pdf", status: "completed", uploaded_at: "2026-07-13T10:00:00Z", processed_at: "2026-07-13T10:01:30Z" }
];

const DEMO_METRICS: DashboardMetricsResponse = {
  identity_score: 92,
  score_breakdown: {
    "Projects Index": 90,
    "Skills Match": 94,
    "Certificates": 95,
    "Verification": 90
  },
  career_twin: {
    current_role_trend: "AI Engineer",
    strongest_skills: ["Python", "React", "FastAPI", "Docker", "Machine Learning", "PostgreSQL"],
    fastest_growing_skill: "Machine Learning",
    career_direction: "Artificial Intelligence & Full-Stack Systems Specialist",
    experience_summary: "Experienced AI Engineer specializing in React frontend integration, FastAPI backend services, Docker virtualization, and PostgreSQL database modeling.",
    recommended_next_skill: "Advanced Graph Representation Learning",
    recommended_next_project: "Build an LLM agent network with dynamic runtime routing",
    career_readiness: 93
  },
  ai_summary_narrative: "Alex Morgan is a talented AI Engineer specializing in end-to-end ML integration, backend design, and frontend interfaces. Verified documents validate expert proficiency in Python, React, FastAPI, Docker, and PostgreSQL databases.",
  stats: {
    documents_count: 5,
    skills_count: 6,
    relationships_count: 148,
    timeline_events_count: 4
  },
  updated_at: "2026-07-13T18:25:29Z"
};

const DEMO_INSIGHTS: InsightsResponse = {
  insights: [
    {
      type: "skills",
      title: "Advanced ML Operations (MLOps)",
      description: "Your profile shows strong capabilities in Python, FastAPI, and Docker. Transitioning to advanced MLOps tools will solidify your AI Engineering trajectory.",
      impact: "high",
      actionable_step: "Integrate model tracking with MLflow and set up CI/CD pipeline deployments."
    },
    {
      type: "gaps",
      title: "Database Performance Optimizations",
      description: "You use PostgreSQL extensively, but advanced optimization indexes and query tuning validation would enhance backend reliability.",
      impact: "medium",
      actionable_step: "Implement automated performance indexing rules on transaction logs."
    },
    {
      type: "achievements",
      title: "React Dashboard Architect",
      description: "Your React project report indicates excellent dashboard UX design. Translating this into open-source reusable components will improve industry validation.",
      impact: "low",
      actionable_step: "Package custom visualization wrappers as an npm package under your portfolio."
    }
  ],
  updated_at: "2026-07-13T18:25:29Z"
};

const DEMO_TIMELINE: TimelineEventOut[] = [
  {
    id: "t1",
    event_date: "2026-03-15",
    event_type: "Project",
    title: "IdentityOS Portfolio",
    description: "Designed and built IdentityOS portfolio visualization with high-throughput credentials verification integration.",
    document_id: "d5",
    date_inferred: false
  },
  {
    id: "t2",
    event_date: "2025-07-20",
    event_type: "Academics",
    title: "AI Research",
    description: "Co-authored and published research on AI model performance optimization in resource-constrained environments.",
    document_id: "d3",
    date_inferred: false
  },
  {
    id: "t3",
    event_date: "2024-06-01",
    event_type: "Internship",
    title: "ML Internship",
    description: "Completed Machine Learning engineering internship developing predictive models and processing datasets.",
    document_id: "d4",
    date_inferred: false
  },
  {
    id: "t4",
    event_date: "2023-02-10",
    event_type: "Skill",
    title: "Python Development",
    description: "Mastered python backend foundations, building microservices and web crawlers.",
    document_id: "d1",
    date_inferred: false
  }
];

const DEMO_GRAPH: GraphResponse = {
  nodes: [
    { id: "n1", label: "Alex Morgan", type: "Document", properties: { role: "AI Engineer" } },
    { id: "n2", label: "Python", type: "Skill" },
    { id: "n3", label: "React", type: "Skill" },
    { id: "n4", label: "FastAPI", type: "Skill" },
    { id: "n5", label: "Docker", type: "Skill" },
    { id: "n6", label: "Machine Learning", type: "Skill" },
    { id: "n7", label: "PostgreSQL", type: "Skill" },
    { id: "n8", label: "Resume.pdf", type: "Document" },
    { id: "n9", label: "AWS_Certificate.pdf", type: "Document" },
    { id: "n10", label: "React_Project_Report.pdf", type: "Document" },
    { id: "n11", label: "Internship_Letter.pdf", type: "Document" },
    { id: "n12", label: "Portfolio.pdf", type: "Document" }
  ],
  edges: [
    { source: "n8", target: "n1", relationship: "DESCRIBES", confidence: 1.0, reason: "Verified master resume document." },
    { source: "n1", target: "n2", relationship: "EXPERT_IN", confidence: 0.95, reason: "Extensive Python usage shown across all systems." },
    { source: "n1", target: "n3", relationship: "EXPERT_IN", confidence: 0.95, reason: "Verified via React project report." },
    { source: "n1", target: "n4", relationship: "DEVELOPES_IN", confidence: 0.95, reason: "Core API development language stack." },
    { source: "n1", target: "n5", relationship: "USES", confidence: 0.9, reason: "Deployment configuration artifacts." },
    { source: "n1", target: "n6", relationship: "SPECIALIZES_IN", confidence: 0.95, reason: "Core focus of career direction." },
    { source: "n1", target: "n7", relationship: "STORES_DATA_IN", confidence: 0.9, reason: "Relational database structures." },
    { source: "n9", target: "n1", relationship: "CERTIFIED", confidence: 1.0, reason: "AWS Cloud credentials." },
    { source: "n10", target: "n3", relationship: "IMPLEMENTS", confidence: 1.0, reason: "React project deliverables." },
    { source: "n11", target: "n6", relationship: "PRACTICED", confidence: 1.0, reason: "Machine Learning industry experience." },
    { source: "n12", target: "n1", relationship: "PORTFOLIO_OF", confidence: 1.0, reason: "IdentityOS visual portfolio." }
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
