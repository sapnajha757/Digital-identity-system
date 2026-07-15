"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";

const evolutionData = [
  { period: "Jan", score: 72, events: 12 },
  { period: "Feb", score: 75, events: 18 },
  { period: "Mar", score: 78, events: 22 },
  { period: "Apr", score: 82, events: 28 },
  { period: "May", score: 86, events: 31 },
  { period: "Jun", score: 90, events: 35 },
  { period: "Jul", score: 94, events: 42 },
];

const milestones = [
  { id: 1, date: "Jan 2026", title: "Identity Platform Launch", description: "Initial profile creation and verification system deployed." },
  { id: 2, date: "Mar 2026", title: "Knowledge Graph Integration", description: "Connected 500+ entities across multiple data sources." },
  { id: 3, date: "May 2026", title: "AI Analysis Engine", description: "Automated insight generation reached 90% accuracy." },
  { id: 4, date: "Jul 2026", title: "Full Compliance", description: "Achieved A+ audit rating with 100% checkpoint coverage." },
];

export default function EvolutionPage() {
  const maxScore = 100;

  return (
    <AppShell title="Evolution">
      <div className="space-y-6 animate-fade-in">
        <Card>
          <h3 className="font-display text-lg font-semibold text-white mb-6">Identity Score Over Time</h3>
          <div className="flex items-end gap-2 h-48">
            {evolutionData.map((data) => (
              <div key={data.period} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-primary-600 rounded-t-lg transition-all duration-500 hover:bg-primary-500"
                    style={{ height: `${(data.score / maxScore) * 100}%` }}
                  >
                    <span className="block text-center text-xs text-white pt-2 font-medium">{data.score}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{data.period}</span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <h3 className="font-display text-lg font-semibold text-white mb-4">Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{milestone.title}</h4>
                      <Badge color="accent">{milestone.date}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">{milestone.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
