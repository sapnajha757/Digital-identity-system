"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";

const audits = [
  { id: 1, name: "Identity Verification Audit", date: "2026-07-10", status: "passed", score: "100%", checks: 24 },
  { id: 2, name: "Data Integrity Audit", date: "2026-06-28", status: "passed", score: "98%", checks: 18 },
  { id: 3, name: "Knowledge Graph Audit", date: "2026-06-15", status: "passed", score: "95%", checks: 32 },
  { id: 4, name: "Compliance Review", date: "2026-05-30", status: "passed", score: "100%", checks: 15 },
  { id: 5, name: "Security Assessment", date: "2026-05-12", status: "warning", score: "87%", checks: 20 },
];

export default function AuditorsPage() {
  return (
    <AppShell title="Auditors">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <p className="text-slate-400">Review audit history and compliance status.</p>
          <Button variant="secondary">Run Audit</Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Audit Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Checks</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-white">{audit.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">{audit.date}</td>
                    <td className="py-3 px-4">
                      <Badge color={audit.status === "passed" ? "accent" : "warning"}>
                        {audit.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-medium">{audit.score}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">{audit.checks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
