"use client";

import { useEffect, useState } from "react";
import { apiClient, TimelineEventOut } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";

const EVENT_TYPE_COLOR: Record<string, string> = {
  certificate: "bg-cyan shadow-glow-cyan",
  achievement: "bg-cyan shadow-glow-cyan",
  internship: "bg-magenta shadow-glow-magenta",
  project: "bg-magenta shadow-glow-magenta",
  academic: "bg-amber",
  skill: "bg-amber",
  other: "bg-mist",
};

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEventOut[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getTimeline()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 02 — TIMELINE</p>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide text-fog">
        <span className="gradient-text">Chronolog.</span>
      </h1>
      <p className="mt-3 max-w-xl text-mist">
        Every certificate, project, and internship — laid out in the order it happened.
      </p>

      <div className="my-10 h-px bg-panel-raised" />

      {loading && <p className="font-mono text-xs text-mist">// loading timeline…</p>}
      {error && (
        <p className="font-mono text-xs text-magenta">
          [ERROR] Couldn&apos;t reach the API — is the backend running? ({error})
        </p>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="rounded-sm border border-dashed border-panel-raised px-6 py-10 text-center">
          <p className="font-display text-sm uppercase tracking-wide text-fog">No events logged.</p>
          <p className="mt-1 text-sm text-mist">Upload documents and they&apos;ll appear here, in order.</p>
        </div>
      )}

      <ol className="relative border-l border-panel-raised pl-8">
        {events.map((event) => (
          <li key={event.id} className="mb-8 last:mb-0">
            <span
              className={`absolute -left-[7px] mt-2 h-3.5 w-3.5 rounded-full border-2 border-void ${
                EVENT_TYPE_COLOR[event.event_type] ?? "bg-mist"
              }`}
            />
            <HudFrame accent={event.event_type === "internship" || event.event_type === "project" ? "magenta" : "cyan"} className="bg-panel/60">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mist">
                <span>
                  {new Date(event.event_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-cyan">·</span>
                <span>{event.event_type}</span>
                {event.date_inferred && (
                  <span className="italic text-mist/70">(est. from upload date)</span>
                )}
              </div>
              <p className="mt-2 font-display text-sm font-semibold tracking-wide text-fog">{event.title}</p>
              {event.description && <p className="mt-1 text-sm text-mist">{event.description}</p>}
            </HudFrame>
          </li>
        ))}
      </ol>
    </div>
  );
}
