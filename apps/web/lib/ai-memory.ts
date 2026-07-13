// =========================================================
// AI MEMORY ENGINE — IdentityOS Phase 8
// Persistent, evolving memory layer for the AI Chief of Staff
// =========================================================

export interface MemoryDocument {
  id: string;
  filename: string;
  uploadedAt: string;
  extractedSkills: string[];
  category: "resume" | "certificate" | "project" | "internship" | "portfolio" | "other";
  summary?: string;
}

export interface MemoryRecommendation {
  id: string;
  type: "skill" | "project" | "course" | "certification" | "internship" | "resume" | "portfolio";
  title: string;
  reason: string;
  confidence: number;
  status: "pending" | "accepted" | "rejected" | "dismissed";
  createdAt: string;
  seenAt?: string;
}

export interface MemoryConversation {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
  topics: string[];
}

export interface MemorySession {
  sessionId: string;
  date: string;
  pagesVisited: string[];
  duration: number;
  actionsPerformed: string[];
}

export interface IdentityHealthSnapshot {
  timestamp: string;
  overallHealth: number;
  completeness: number;
  verificationScore: number;
  skillDiversity: number;
  projectDiversity: number;
  documentationQuality: number;
  careerReadiness: number;
  learningVelocity: number;
}

export interface AIMemoryStore {
  userId: string;
  createdAt: string;
  lastUpdated: string;

  // Profile data
  documents: MemoryDocument[];
  extractedSkills: string[];
  internships: string[];
  projects: string[];
  certifications: string[];
  achievements: string[];

  // AI interaction history
  conversations: MemoryConversation[];
  recommendations: MemoryRecommendation[];

  // Evolution tracking
  healthHistory: IdentityHealthSnapshot[];
  sessions: MemorySession[];

  // Proactive state
  lastResumeUpdate: string | null;
  lastProfileUpdate: string | null;
  notificationsDismissed: string[];
  advisedTopics: string[];
}

const MEMORY_KEY = "identityos_ai_memory";

// Demo-mode rich memory data
const DEMO_MEMORY: AIMemoryStore = {
  userId: "demo@identityos.local",
  createdAt: "2026-01-15T08:00:00Z",
  lastUpdated: "2026-07-13T18:25:00Z",

  documents: [
    { id: "d1", filename: "Resume.pdf", uploadedAt: "2026-01-15T12:00:00Z", extractedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"], category: "resume", summary: "Senior AI Engineer resume with 3 years experience" },
    { id: "d2", filename: "AWS_Certificate.pdf", uploadedAt: "2026-03-09T09:00:00Z", extractedSkills: ["AWS", "Cloud", "EC2", "S3", "Lambda"], category: "certificate", summary: "AWS Solutions Architect Associate certification" },
    { id: "d3", filename: "React_Project_Report.pdf", uploadedAt: "2026-05-12T14:30:00Z", extractedSkills: ["React", "TypeScript", "Next.js", "TailwindCSS"], category: "project", summary: "Full-stack React dashboard project with real-time data" },
    { id: "d4", filename: "Internship_Letter.pdf", uploadedAt: "2026-06-12T15:00:00Z", extractedSkills: ["Machine Learning", "PyTorch", "Data Analysis", "Sklearn"], category: "internship", summary: "ML Engineering internship at TechCorp - 6 months" },
    { id: "d5", filename: "Portfolio.pdf", uploadedAt: "2026-07-13T10:00:00Z", extractedSkills: ["Neo4j", "Qdrant", "Vector Search", "RAG"], category: "portfolio", summary: "IdentityOS - AI-powered digital identity platform" },
  ],

  extractedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "React", "TypeScript", "Next.js", "Machine Learning", "PyTorch", "Neo4j", "Qdrant", "Vector Search", "RAG", "TailwindCSS", "Sklearn"],

  internships: ["ML Engineering @ TechCorp (6 months, 2026)", "Backend Developer Intern @ StartupXY (3 months, 2025)"],

  projects: [
    "IdentityOS — AI-powered digital identity OS with Neo4j + Qdrant",
    "React Analytics Dashboard — Real-time enterprise data visualization",
    "Predictive ML Pipeline — PyTorch model training with CI/CD",
    "FastAPI Microservices — Distributed backend with PostgreSQL"
  ],

  certifications: ["AWS Solutions Architect Associate", "Google Cloud Professional Data Engineer (in progress)"],

  achievements: [
    "Top 10% contributor in open-source AI tools repo",
    "Built IdentityOS end-to-end in 6 weeks solo",
    "Published research paper on vector search optimization"
  ],

  conversations: [
    { id: "cv1", query: "What are my strongest skills?", answer: "Your strongest verified skills are Python, React, and Machine Learning — backed by 3 uploaded documents.", timestamp: "2026-07-10T14:00:00Z", topics: ["skills", "profile"] },
    { id: "cv2", query: "Should I learn Kubernetes?", answer: "Given your Docker expertise and AWS certification, Kubernetes is the natural next step. It would unlock 4+ cloud engineering roles.", timestamp: "2026-07-11T10:00:00Z", topics: ["skills", "kubernetes", "career"] },
    { id: "cv3", query: "How complete is my profile?", answer: "Your profile is 92% complete. Missing: deployment screenshots, Node.js project, and LinkedIn URL.", timestamp: "2026-07-12T09:00:00Z", topics: ["completeness", "gaps"] },
  ],

  recommendations: [
    { id: "r1", type: "skill", title: "Learn Kubernetes", reason: "92% of AI Infrastructure roles require it. You have Docker foundation.", confidence: 0.93, status: "pending", createdAt: "2026-07-11T10:00:00Z" },
    { id: "r2", type: "certification", title: "Kubernetes CKA Certification", reason: "Validates your Docker + AWS knowledge with industry credential.", confidence: 0.88, status: "pending", createdAt: "2026-07-11T10:00:00Z" },
    { id: "r3", type: "project", title: "Build a Node.js REST API", reason: "You have 3 React projects but zero backend JS work. This gap shows in full-stack roles.", confidence: 0.85, status: "accepted", createdAt: "2026-07-09T08:00:00Z" },
    { id: "r4", type: "resume", title: "Add deployment screenshots", reason: "Portfolio.pdf mentions live deployments but no visual proof exists in your documents.", confidence: 0.91, status: "pending", createdAt: "2026-07-13T09:00:00Z" },
    { id: "r5", type: "portfolio", title: "Add GitHub profile link", reason: "Graph analysis found 3 project documents but no linked GitHub repository.", confidence: 0.96, status: "dismissed", createdAt: "2026-07-08T12:00:00Z" },
    { id: "r6", type: "course", title: "MLOps with MLflow & DVC", reason: "Strong ML engineering base — MLOps tooling is the missing production link.", confidence: 0.87, status: "pending", createdAt: "2026-07-12T16:00:00Z" },
  ],

  healthHistory: [
    { timestamp: "2026-01-15T12:00:00Z", overallHealth: 58, completeness: 45, verificationScore: 60, skillDiversity: 55, projectDiversity: 40, documentationQuality: 50, careerReadiness: 55, learningVelocity: 30 },
    { timestamp: "2026-03-09T09:00:00Z", overallHealth: 67, completeness: 60, verificationScore: 72, skillDiversity: 65, projectDiversity: 52, documentationQuality: 60, careerReadiness: 64, learningVelocity: 48 },
    { timestamp: "2026-05-12T14:00:00Z", overallHealth: 78, completeness: 74, verificationScore: 81, skillDiversity: 75, projectDiversity: 70, documentationQuality: 72, careerReadiness: 76, learningVelocity: 65 },
    { timestamp: "2026-06-12T15:00:00Z", overallHealth: 85, completeness: 83, verificationScore: 88, skillDiversity: 84, projectDiversity: 80, documentationQuality: 82, careerReadiness: 84, learningVelocity: 78 },
    { timestamp: "2026-07-13T18:25:00Z", overallHealth: 92, completeness: 89, verificationScore: 94, skillDiversity: 91, projectDiversity: 88, documentationQuality: 90, careerReadiness: 93, learningVelocity: 87 },
  ],

  sessions: [
    { sessionId: "s1", date: "2026-07-10T14:00:00Z", pagesVisited: ["/dashboard", "/chat", "/graph"], duration: 1240, actionsPerformed: ["viewed_graph", "asked_ai", "uploaded_doc"] },
    { sessionId: "s2", date: "2026-07-11T10:00:00Z", pagesVisited: ["/dashboard", "/timeline", "/portfolio"], duration: 890, actionsPerformed: ["viewed_timeline", "exported_portfolio"] },
    { sessionId: "s3", date: "2026-07-13T18:00:00Z", pagesVisited: ["/dashboard", "/graph", "/chat", "/intelligence"], duration: 2100, actionsPerformed: ["ran_simulator", "accepted_recommendation"] },
  ],

  lastResumeUpdate: "2026-01-15T12:00:00Z",
  lastProfileUpdate: "2026-07-13T10:00:00Z",
  notificationsDismissed: [],
  advisedTopics: ["kubernetes", "mlops", "portfolio"],
};

// =========================================================
// MEMORY ENGINE API
// =========================================================

export function getMemory(): AIMemoryStore {
  if (typeof window === "undefined") return DEMO_MEMORY;
  const isDemo = localStorage.getItem("dis_demo_mode") === "true";
  if (isDemo) return DEMO_MEMORY;

  const raw = localStorage.getItem(MEMORY_KEY);
  if (!raw) {
    const empty = createEmptyMemory();
    saveMemory(empty);
    return empty;
  }
  try {
    return JSON.parse(raw) as AIMemoryStore;
  } catch {
    return createEmptyMemory();
  }
}

export function saveMemory(memory: AIMemoryStore): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("dis_demo_mode") === "true") return;
  memory.lastUpdated = new Date().toISOString();
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

function createEmptyMemory(): AIMemoryStore {
  return {
    userId: "local-user",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    documents: [],
    extractedSkills: [],
    internships: [],
    projects: [],
    certifications: [],
    achievements: [],
    conversations: [],
    recommendations: [],
    healthHistory: [],
    sessions: [],
    lastResumeUpdate: null,
    lastProfileUpdate: null,
    notificationsDismissed: [],
    advisedTopics: [],
  };
}

export function recordConversation(query: string, answer: string, topics: string[]): void {
  const memory = getMemory();
  if (localStorage.getItem("dis_demo_mode") === "true") return;
  memory.conversations.unshift({
    id: `cv${Date.now()}`,
    query,
    answer,
    timestamp: new Date().toISOString(),
    topics,
  });
  // Keep last 50 conversations
  memory.conversations = memory.conversations.slice(0, 50);
  // Track advised topics
  topics.forEach(t => {
    if (!memory.advisedTopics.includes(t)) memory.advisedTopics.push(t);
  });
  saveMemory(memory);
}

export function updateRecommendationStatus(id: string, status: MemoryRecommendation["status"]): void {
  const memory = getMemory();
  if (localStorage.getItem("dis_demo_mode") === "true") return;
  const rec = memory.recommendations.find(r => r.id === id);
  if (rec) {
    rec.status = status;
    saveMemory(memory);
  }
}

export function dismissNotification(id: string): void {
  const memory = getMemory();
  if (!memory.notificationsDismissed.includes(id)) {
    memory.notificationsDismissed.push(id);
  }
  if (localStorage.getItem("dis_demo_mode") !== "true") saveMemory(memory);
}

export function getLatestHealthSnapshot(): IdentityHealthSnapshot | null {
  const memory = getMemory();
  if (memory.healthHistory.length === 0) return null;
  return memory.healthHistory[memory.healthHistory.length - 1];
}

export function getHealthTrend(): { metric: string; current: number; prev: number; delta: number }[] {
  const memory = getMemory();
  if (memory.healthHistory.length < 2) return [];
  const latest = memory.healthHistory[memory.healthHistory.length - 1];
  const prev = memory.healthHistory[memory.healthHistory.length - 2];
  const keys: (keyof IdentityHealthSnapshot)[] = [
    "overallHealth", "completeness", "verificationScore", "skillDiversity",
    "projectDiversity", "documentationQuality", "careerReadiness", "learningVelocity"
  ];
  return keys.map(k => ({
    metric: k as string,
    current: latest[k] as number,
    prev: prev[k] as number,
    delta: (latest[k] as number) - (prev[k] as number),
  }));
}

export function getPendingRecommendations(): MemoryRecommendation[] {
  return getMemory().recommendations.filter(r => r.status === "pending");
}

export function getUnseenTopics(currentTopics: string[]): string[] {
  const memory = getMemory();
  return currentTopics.filter(t => !memory.advisedTopics.includes(t));
}

export function daysSinceResumeUpdate(): number | null {
  const memory = getMemory();
  if (!memory.lastResumeUpdate) return null;
  const diff = Date.now() - new Date(memory.lastResumeUpdate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getMemorySummary(): string {
  const memory = getMemory();
  const skills = memory.extractedSkills.length;
  const docs = memory.documents.length;
  const recs = memory.recommendations.filter(r => r.status === "pending").length;
  const convs = memory.conversations.length;
  return `${docs} documents indexed · ${skills} skills mapped · ${recs} active recommendations · ${convs} conversations remembered`;
}
