"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";

const insights = [
  { id: 1, title: "Identity Strength Trending Up", description: "Your identity score has improved by 12% over the past 30 days, driven by profile enrichment and verification.", severity: "positive", category: "Identity" },
  { id: 2, title: "Knowledge Gap Detected", description: "The 'Publications' section has minimal entries. Consider adding more to improve coverage.", severity: "warning", category: "Knowledge" },
  { id: 3, title: "Audit Compliance Verified", description: "All audit checkpoints passed in the latest review cycle.", severity: "positive", category: "Audit" },
  { id: 4, title: "New Connection Opportunity", description: "3 entities in your graph share common attributes with high-relevance external nodes.", severity: "info", category: "Graph" },
  { id: 5, title: "Document Expiry Approaching", description: "Your passport verification expires in 45 days. Renew now to maintain compliance.", severity: "warning", category: "Documents" },
  { id: 6, title: "AI Confidence High", description: "Latest AI analysis reports 94% confidence in identity verification accuracy.", severity: "positive", category: "AI" },
];

const severityColors = {
  positive: "accent",
  warning: "warning",
  info: "primary",
} as const;

export default function IntelligencePage() {
  return (
    <AppShell title="Intelligence">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-slate-400">Total Insights</p>
            <p className="mt-2 text-3xl font-bold text-white">{insights.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-400">Positive</p>
            <p className="mt-2 text-3xl font-bold text-accent-400">
              {insights.filter((i) => i.severity === "positive").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-400">Warnings</p>
            <p className="mt-2 text-3xl font-bold text-warning-400">
              {insights.filter((i) => i.severity === "warning").length}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-base font-semibold text-white">{insight.title}</h3>
                <Badge color={severityColors[insight.severity as keyof typeof severityColors]}>
                  {insight.category}
                </Badge>
              </div>
              <p className="text-sm text-slate-400">{insight.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
