"use client";

import { useRef, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const PIPELINE_STAGES = [
  "Reading document binary...",
  "Running OCR & text extraction...",
  "Classifying category taxonomy...",
  "Inferring cross-document connections...",
  "Synchronizing career timeline...",
  "Updating AI Identity profile...",
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
      }, 1200);
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
      
      // Wait to finish the visual cycle if it's faster than our animation
      await new Promise((resolve) => setTimeout(resolve, PIPELINE_STAGES.length * 1200 + 400));
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
        className="w-full text-center rounded-sm border border-cyan/40 bg-cyan/5 hover:bg-cyan/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan/5 transition-all duration-200 hover:scale-[1.01] hover:border-cyan disabled:opacity-50 disabled:hover:scale-100"
      >
        + ADD NEW DOCUMENT
      </button>
      
      {error && <p className="mt-2 font-mono text-xs text-magenta">{error}</p>}

      {/* Ingestion Pipeline Progress Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md border border-cyan/30 bg-panel p-6 shadow-glow-cyan/15 rounded-sm relative overflow-hidden">
            {/* Scanline CRT FX */}
            <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-20" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center border-b border-panel-raised pb-3 mb-4">
                <span className="font-mono text-[10px] text-magenta tracking-widest uppercase">// INGESTION PIPELINE ACTIVE</span>
                <span className="font-mono text-[10px] text-cyan">{Math.round(((currentStageIdx + 1) / PIPELINE_STAGES.length) * 100)}%</span>
              </div>

              <div className="space-y-3.5">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isActive = idx === currentStageIdx;
                  const isPending = idx > currentStageIdx;

                  let color = "text-mist/40";
                  let prefix = "[WAIT]";
                  if (isDone) {
                    color = "text-cyan";
                    prefix = "[DONE]";
                  } else if (isActive) {
                    color = "text-amber font-semibold animate-pulse";
                    prefix = "[LOAD]";
                  }

                  return (
                    <div key={idx} className={`flex items-start gap-3 font-mono text-xs ${color}`}>
                      <span>{prefix}</span>
                      <span>{stage}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-1 w-full bg-void rounded-full overflow-hidden border border-panel-raised/55">
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
