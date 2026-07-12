"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient, DocumentOut } from "@/lib/api-client";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadControl } from "@/components/UploadControl";

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiClient
      .listDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = documents.length;
    const indexed = documents.filter((d) => d.status === "completed").length;
    const processing = documents.filter((d) => d.status === "processing" || d.status === "pending").length;
    return { total, indexed, processing };
  }, [documents]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 01 — DOCUMENTS</p>
      <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight tracking-wide text-fog sm:text-5xl">
        Every credential.
        <br />
        <span className="gradient-text">Indexed.</span>
      </h1>
      <p className="mt-4 max-w-xl text-mist">
        Certificates, project reports, internship letters — upload them here and the system reads,
        categorizes, and connects them for you.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <UploadControl onUploaded={load} />
      </div>

      {!loading && !error && documents.length > 0 && (
        <div className="mt-8 grid grid-cols-3 divide-x divide-panel-raised rounded-sm border border-panel-raised bg-panel/40 backdrop-blur-sm">
          <StatCell label="TOTAL" value={stats.total} color="text-fog" />
          <StatCell label="INDEXED" value={stats.indexed} color="text-cyan" />
          <StatCell label="IN QUEUE" value={stats.processing} color="text-amber" />
        </div>
      )}

      <div className="my-10 h-px bg-panel-raised" />

      {loading && <p className="font-mono text-xs text-mist">// loading documents…</p>}

      {error && (
        <p className="font-mono text-xs text-magenta">
          [ERROR] Couldn&apos;t reach the API — is the backend running on port 8000? ({error})
        </p>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="rounded-sm border border-dashed border-panel-raised px-6 py-10 text-center">
          <p className="font-display text-sm uppercase tracking-wide text-fog">No records found.</p>
          <p className="mt-1 text-sm text-mist">Add your first document to start building your dossier.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </div>
  );
}

function StatCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-5 py-4">
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">{label}</p>
    </div>
  );
}
