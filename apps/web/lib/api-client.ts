/**
 * Thin typed wrapper around the FastAPI backend.
 * Every call attaches the Supabase access token automatically.
 */
import { createClient } from "@supabase/supabase-js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

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

export interface GraphResponse {
  nodes: { id: string; label: string; type: string }[];
  edges: { source: string; target: string; relationship: string }[];
}

export const apiClient = {
  async uploadDocument(file: File): Promise<{ document_id: string; status: string }> {
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
    const res = await fetch(`${API_BASE_URL}/documents`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to list documents: ${res.statusText}`);
    return res.json();
  },

  async search(query: string, topK = 5): Promise<SearchResponse> {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    return res.json();
  },

  async chat(query: string, topK = 5): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
    return res.json();
  },

  async getTimeline(): Promise<TimelineEventOut[]> {
    const res = await fetch(`${API_BASE_URL}/timeline`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to load timeline: ${res.statusText}`);
    return res.json();
  },

  async getGraph(): Promise<GraphResponse> {
    const res = await fetch(`${API_BASE_URL}/graph`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to load graph: ${res.statusText}`);
    return res.json();
  },
};
