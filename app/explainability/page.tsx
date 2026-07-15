"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";

const factors = [
  { id: 1, name: "Profile Completeness", weight: 25, score: 92, description: "How complete your profile information is." },
  { id: 2, name: "Verification Status", weight: 20, score: 100, description: "Identity verification through official documents." },
  { id: 3, name: "Knowledge Coverage", weight: 20, score: 78, description: "Breadth and depth of knowledge graph entities." },
  { id: 4, name: "Activity Consistency", weight: 15, score: 88, description: "Regular engagement and updates to your identity." },
  { id: 5, name: "Audit Compliance", weight: 10, score: 100, description: "Adherence to audit requirements and standards." },
  { id: 6, name: "AI Confidence", weight: 10, score: 94, description: "AI model confidence in identity verification." },
];

export default function ExplainabilityPage() {
  const overallScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)
  );

  return (
    <AppShell title="Explainability">
      <div className="space-y-6 animate-fade-in">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Overall Identity Score</h3>
              <p className="text-sm text-slate-400 mt-1">Weighted score across all factors</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary-400">{overallScore}</p>
              <Badge color="accent">Excellent</Badge>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {factors.map((factor) => (
            <Card key={factor.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{factor.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{factor.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-bold text-white">{factor.score}</p>
                  <p className="text-xs text-slate-500">Weight: {factor.weight}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.score >= 90 ? "bg-accent-500" : factor.score >= 75 ? "bg-primary-600" : "bg-warning-500"
                  }`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
