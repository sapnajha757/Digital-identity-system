import { clsx } from "clsx";
import type { DocumentOut } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";

const STATUS_STYLES: Record<DocumentOut["status"], string> = {
  completed: "text-cyan",
  processing: "text-amber",
  pending: "text-mist",
  failed: "text-magenta",
};

const STATUS_LABEL: Record<DocumentOut["status"], string> = {
  completed: "INDEXED",
  processing: "PROCESSING",
  pending: "QUEUED",
  failed: "FAILED",
};

export function DocumentCard({ document }: { document: DocumentOut }) {
  return (
    <HudFrame
      accent={document.status === "failed" ? "magenta" : "cyan"}
      className="-translate-y-0 bg-panel/60 backdrop-blur-sm hover:-translate-y-0.5 hover:bg-panel/80"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-display text-sm font-semibold leading-snug tracking-wide text-fog">
          {document.original_filename}
        </p>
        <span
          className={clsx(
            "shrink-0 font-mono text-[10px] uppercase tracking-widest",
            STATUS_STYLES[document.status]
          )}
        >
          {STATUS_LABEL[document.status]}
        </span>
      </div>

      <div className="my-4 h-px bg-gradient-to-r from-panel-raised via-panel-raised to-transparent" />

      <div className="flex items-center justify-between font-mono text-[10px] text-mist">
        <span className="uppercase tracking-widest">{document.file_type}</span>
        <span>
          {new Date(document.uploaded_at).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </HudFrame>
  );
}
