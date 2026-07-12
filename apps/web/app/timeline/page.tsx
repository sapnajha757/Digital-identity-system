"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, TimelineEventOut } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";
import Link from "next/link";

const EVENT_TYPE_COLOR: Record<string, string> = {
  certificate: "border-cyan text-cyan bg-cyan/5 shadow-glow-cyan/20",
  achievement: "border-cyan text-cyan bg-cyan/5 shadow-glow-cyan/20",
  internship: "border-magenta text-magenta bg-magenta/5 shadow-glow-magenta/20",
  project: "border-magenta text-magenta bg-magenta/5 shadow-glow-magenta/20",
  academic: "border-amber text-amber bg-amber/5 shadow-glow-amber/20",
  skill: "border-amber text-amber bg-amber/5 shadow-glow-amber/20",
  other: "border-mist text-mist bg-mist/5 shadow-glow-mist/20",
};

const DOT_TYPE_COLOR: Record<string, string> = {
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
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiClient
      .getTimeline()
      .then((data) => {
        setEvents(data);
        // Expand all years by default
        const years: Record<string, boolean> = {};
        data.forEach((e) => {
          const year = new Date(e.event_date).getFullYear().toString();
          years[year] = true;
        });
        setExpandedYears(years);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group events by year
  const eventsByYear = useMemo(() => {
    const groups: Record<string, TimelineEventOut[]> = {};
    events.forEach((event) => {
      const year = new Date(event.event_date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(event);
    });
    // Sort years descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [events]);

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 bg-void text-fog min-h-screen">
      <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 02 — TIMELINE</p>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide">
        <span className="gradient-text">Career Journey.</span>
      </h1>
      <p className="mt-3 max-w-xl text-mist text-sm">
        A chronological roadmap of your achievements, internships, and skill validations, inferred automatically from your digital footprint.
      </p>

      <div className="my-10 h-px bg-panel-raised" />

      {loading && <p className="font-mono text-xs text-mist">// loading chronological registry…</p>}
      {error && (
        <p className="font-mono text-xs text-magenta">
          [ERROR] Couldn&apos;t reach the API — is the backend running? ({error})
        </p>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="rounded-sm border border-dashed border-panel-raised px-6 py-12 text-center">
          <p className="font-display text-sm uppercase tracking-wide text-fog">No milestones generated.</p>
          <p className="mt-1 text-sm text-mist">Upload documents, resumes, or letters to begin synthesizing your journey.</p>
        </div>
      )}

      {!loading && !error && eventsByYear.length > 0 && (
        <div className="relative border-l border-panel-raised/40 pl-8 ml-4 space-y-12">
          {eventsByYear.map(([year, yearEvents]) => {
            const isExpanded = expandedYears[year] ?? true;
            return (
              <div key={year} className="relative">
                {/* Year Marker Header */}
                <div 
                  onClick={() => toggleYear(year)}
                  className="absolute -left-[45px] top-0 flex items-center gap-3 cursor-pointer group select-none"
                >
                  <span className="bg-panel-raised border border-cyan/45 hover:border-cyan text-cyan font-display text-xs font-bold px-2.5 py-1 rounded font-mono shadow-glow-cyan/10 transition-all">
                    {year}
                  </span>
                  <span className="text-[10px] font-mono text-mist group-hover:text-cyan transition-colors">
                    {isExpanded ? "[COLLAPSE]" : `[EXPAND (${yearEvents.length})]`}
                  </span>
                </div>

                {/* Vertical Offset for events */}
                {isExpanded && (
                  <div className="mt-12 space-y-8 animate-fade-in">
                    {yearEvents.map((event) => {
                      const isIntern = event.event_type === "internship";
                      const isProject = event.event_type === "project";
                      
                      return (
                        <div key={event.id} className="relative group/item">
                          {/* Inner timeline dot */}
                          <span
                            className={`absolute -left-[39px] mt-3 h-3 w-3 rounded-full border border-void ${
                              DOT_TYPE_COLOR[event.event_type] ?? "bg-mist"
                            } transition-transform duration-200 group-hover/item:scale-125`}
                          />

                          <HudFrame 
                            accent={isIntern || isProject ? "magenta" : "cyan"} 
                            className="bg-panel/40 group-hover/item:border-cyan/40 transition-all duration-300 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-raised/35 pb-2.5">
                              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mist">
                                <span className="text-amber">
                                  {new Date(event.event_date).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="text-panel-raised">|</span>
                                <span 
                                  className={`border px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                    EVENT_TYPE_COLOR[event.event_type] ?? "border-mist text-mist"
                                  }`}
                                >
                                  {event.event_type}
                                </span>
                                {event.date_inferred && (
                                  <span className="italic text-mist/60 text-[9px]">(Inferred)</span>
                                )}
                              </div>

                              {/* Action Link to Graph */}
                              {event.document_id && (
                                <Link
                                  href={`/graph`}
                                  className="font-mono text-[10px] text-cyan hover:text-magenta transition-colors hover:underline"
                                >
                                  [VIEW IN GRAPH] →
                                </Link>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="mt-4 flex items-start gap-4">
                              {/* Left Icon / Initial placeholder */}
                              <div className="w-10 h-10 rounded border border-panel-raised bg-void/50 flex items-center justify-center font-display text-sm font-bold text-mist uppercase shrink-0">
                                {event.title.substring(0, 2)}
                              </div>

                              <div className="flex-1">
                                <h3 className="font-display text-sm font-semibold tracking-wide text-fog group-hover/item:text-cyan transition-colors">
                                  {event.title}
                                </h3>
                                {event.description && (
                                  <p className="mt-2 text-xs text-mist leading-relaxed font-sans">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </HudFrame>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Visual spacing when collapsed */}
                {!isExpanded && <div className="h-6" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
