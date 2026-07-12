"use client";

import { useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function UploadControl({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await apiClient.uploadDocument(file);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-sm border border-cyan/50 bg-cyan/10 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition-all duration-200 hover:scale-[1.02] hover:bg-cyan/20 disabled:opacity-50 disabled:hover:scale-100"
      >
        {uploading ? "UPLOADING…" : "+ ADD DOCUMENT"}
      </button>
      {error && <p className="mt-2 font-mono text-xs text-magenta">{error}</p>}
    </div>
  );
}
