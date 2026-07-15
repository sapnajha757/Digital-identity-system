"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";

const projects = [
  { id: 1, name: "Identity Verification System", status: "active", progress: 100, tags: ["Security", "AI"] },
  { id: 2, name: "Knowledge Graph Builder", status: "active", progress: 78, tags: ["Graph", "NLP"] },
  { id: 3, name: "Audit Compliance Engine", status: "active", progress: 92, tags: ["Compliance"] },
  { id: 4, name: "Document Analyzer", status: "paused", progress: 45, tags: ["OCR", "ML"] },
  { id: 5, name: "Timeline Tracker", status: "completed", progress: 100, tags: ["Tracking"] },
];

export default function PortfolioPage() {
  return (
    <AppShell title="Portfolio">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <p className="text-slate-400">Manage your digital identity projects and track progress.</p>
          <Button variant="secondary">New Project</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:border-primary-500/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-base font-semibold text-white">{project.name}</h3>
                <Badge color={project.status === "active" ? "accent" : project.status === "completed" ? "primary" : "warning"}>
                  {project.status}
                </Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-slate-800 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
