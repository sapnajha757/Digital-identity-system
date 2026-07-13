"use client";

import { useRef, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const PIPELINE_STAGES = [
  "Ingesting Document",
  "Reading Vector Chunks",
  "Extracting Raw Text",
  "Analyzing Professional Footprint",
  "Finding Core Expertise Skills",
  "Mapping Graph Relationships",
  "Growing Live Knowledge Network",
  "Updating Chronological Timeline",
  "Computing Dossier Identity Score",
  "Generating Synced Career Twin Narrative",
  "Dossier Identity Successfully Updated",
];

export function UploadControl({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uploading) {
      setCurrentStageIdx(0);
      interval = setInterval(() => {
        setCurrentStageIdx((prev) => {
          if (prev >= PIPELINE_STAGES.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 700); // 700ms cycles ~ 8s total sequence
    }
    return () => clearInterval(interval);
  }, [uploading]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await apiClient.uploadDocument(file);
      
      // Complete the visual pipeline run
      await new Promise((resolve) => setTimeout(resolve, PIPELINE_STAGES.length * 700 + 400));
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
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
        className="w-full text-center rounded-md border border-cyan/40 bg-cyan/5 hover:bg-cyan/15 px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-cyan disabled:opacity-50 disabled:hover:scale-100 font-bold"
      >
        + ADD NEW CREDENTIAL
      </button>
      
      {error && <p className="mt-2.5 font-mono text-xs text-magenta">[ERROR] {error}</p>}

      {/* Cinematic Ingestion Pipeline Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-void/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-lg border border-panel-raised bg-panel p-8 shadow-2xl rounded-lg relative overflow-hidden">
            {/* Scanline CRT FX */}
            <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-10" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Radar spin animation */}
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan/20 animate-ping opacity-75" />
                <div className="absolute inset-2 rounded-full border border-magenta/25 animate-pulse" />
                <div className="w-14 h-14 rounded-full bg-void flex items-center justify-center border border-cyan/40 shadow-glow-cyan">
                  <span className="font-mono text-sm text-cyan font-bold">
                    {Math.round(((currentStageIdx + 1) / PIPELINE_STAGES.length) * 100)}%
                  </span>
                </div>
              </div>

              <div className="w-full border-b border-panel-raised/50 pb-3 mb-4">
                <span className="font-mono text-[9px] text-magenta tracking-widest uppercase font-bold">// DYNAMIC IDENTITY OS INGESTION PIPELINE</span>
              </div>

              <div className="w-full text-left space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isActive = idx === currentStageIdx;

                  let color = "text-mist/30";
                  let prefix = "[WAIT]";
                  if (isDone) {
                    color = "text-cyan font-semibold";
                    prefix = "[DONE]";
                  } else if (isActive) {
                    color = "text-amber font-bold animate-pulse";
                    prefix = "[SYNC]";
                  }

                  return (
                    <div key={idx} className={`flex items-start gap-3 font-mono text-[11px] ${color} transition-colors duration-200`}>
                      <span className="shrink-0">{prefix}</span>
                      <span>{stage}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-1 w-full bg-void rounded-full overflow-hidden border border-panel-raised">
                <div 
                  className="h-full bg-gradient-to-r from-cyan to-magenta transition-all duration-300"
                  style={{ width: `${((currentStageIdx + 1) / PIPELINE_STAGES.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
