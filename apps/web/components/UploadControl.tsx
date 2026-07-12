"use client";

import { useRef, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const PIPELINE_STAGES = [
  "Reading Files",
  "Extracting Text",
  "Understanding Content",
  "Finding Skills",
  "Building Relationships",
  "Updating Timeline",
  "Growing Knowledge Graph",
  "Computing Identity Score",
  "Generating AI Narrative",
  "Refreshing Career Twin",
  "Identity Updated",
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
      }, 900); // Cycle every 900ms to span about 10 seconds total
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
      
      // Wait to finish the visual cycle fully before reloading dashboard data
      await new Promise((resolve) => setTimeout(resolve, PIPELINE_STAGES.length * 900 + 500));
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
        className="w-full text-center rounded-sm border border-cyan/40 bg-cyan/5 hover:bg-cyan/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-cyan shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-cyan disabled:opacity-50 disabled:hover:scale-100"
      >
        + ADD NEW CREDENTIAL
      </button>
      
      {error && <p className="mt-2 font-mono text-xs text-magenta">{error}</p>}

      {/* Cinematic Ingestion Pipeline Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-void/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md border border-cyan/20 bg-panel/90 p-6 shadow-2xl rounded-sm relative overflow-hidden">
            {/* Scanline CRT FX */}
            <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-15" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Radar spin animation */}
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan/20 animate-ping opacity-75" />
                <div className="absolute inset-2 rounded-full border border-magenta/25 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-void flex items-center justify-center border border-cyan/40">
                  <span className="font-mono text-xs text-cyan font-bold">
                    {Math.round(((currentStageIdx + 1) / PIPELINE_STAGES.length) * 100)}%
                  </span>
                </div>
              </div>

              <div className="w-full border-b border-panel-raised/35 pb-2.5 mb-4">
                <span className="font-mono text-[9px] text-magenta tracking-widest uppercase">// SYSTEM INGESTION SYNCHRONIZER</span>
              </div>

              <div className="w-full text-left space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isActive = idx === currentStageIdx;
                  const isPending = idx > currentStageIdx;

                  let color = "text-mist/30";
                  let prefix = "[WAIT]";
                  if (isDone) {
                    color = "text-cyan";
                    prefix = "[DONE]";
                  } else if (isActive) {
                    color = "text-amber font-semibold animate-pulse";
                    prefix = "[SYNC]";
                  }

                  return (
                    <div key={idx} className={`flex items-start gap-3 font-mono text-[11px] ${color}`}>
                      <span className="shrink-0">{prefix}</span>
                      <span>{stage}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-1 w-full bg-void rounded-full overflow-hidden border border-panel-raised/30">
                <div 
                  className="h-full bg-cyan transition-all duration-300"
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
