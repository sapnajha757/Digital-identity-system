"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";

const events = [
  { id: 1, date: "2026-07-15", time: "14:32", event: "Identity score updated to 94", category: "Identity", status: "completed" },
  { id: 2, date: "2026-07-15", time: "10:15", event: "Knowledge graph synced with 38 new nodes", category: "Graph", status: "completed" },
  { id: 3, date: "2026-07-14", time: "16:45", event: "AI chat session completed", category: "AI", status: "completed" },
  { id: 4, date: "2026-07-14", time: "09:20", event: "Document uploaded for analysis", category: "Documents", status: "completed" },
  { id: 5, date: "2026-07-13", time: "18:00", event: "Audit review passed", category: "Audit", status: "completed" },
  { id: 6, date: "2026-07-12", time: "11:30", event: "Profile information updated", category: "Profile", status: "completed" },
  { id: 7, date: "2026-07-11", time: "15:10", event: "New knowledge connection discovered", category: "Graph", status: "completed" },
  { id: 8, date: "2026-07-10", time: "08:00", event: "Weekly AI insight report generated", category: "AI", status: "completed" },
];

const categoryColors: Record<string, "primary" | "accent" | "warning" | "error"> = {
  Identity: "primary",
  Graph: "primary",
  AI: "accent",
  Documents: "warning",
  Audit: "accent",
  Profile: "primary",
};

export default function TimelinePage() {
  return (
    <AppShell title="Timeline">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative pl-12">
                <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-primary-600 border-4 border-slate-950" />
                <Card className="hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white">{event.event}</p>
                      <p className="text-xs text-slate-500 mt-1">{event.date} at {event.time}</p>
                    </div>
                    <Badge color={categoryColors[event.category] || "primary"}>
                      {event.category}
                    </Badge>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
