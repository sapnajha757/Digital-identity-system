"use client";

import AppShell from "@/components/AppShell";
import { StatCard, Card, Badge } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

const recentActivity = [
  { id: 1, action: "Profile updated", time: "2 hours ago", status: "completed" },
  { id: 2, action: "Knowledge graph sync", time: "5 hours ago", status: "completed" },
  { id: 3, action: "AI chat session", time: "1 day ago", status: "completed" },
  { id: 4, action: "Document analysis", time: "2 days ago", status: "processing" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Welcome back, {user?.user_metadata?.full_name || user?.email || "User"}
          </h2>
          <p className="mt-1 text-slate-400">Here&apos;s an overview of your digital identity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Identity Score" value="94" trend="+2 this week" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
          <StatCard label="Knowledge Nodes" value="1,247" trend="+38 new" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
          <StatCard label="AI Sessions" value="56" trend="+12 this month" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
          <StatCard label="Audit Score" value="A+" trend="Excellent" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-white/[0.06] py-2 last:border-0">
                  <div>
                    <p className="text-sm text-white">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                  <Badge color={item.status === "completed" ? "accent" : "warning"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold text-white mb-4">Identity Components</h3>
            <div className="space-y-4">
              {[
                { label: "Profile Completeness", value: 92 },
                { label: "Verification Status", value: 100 },
                { label: "Knowledge Coverage", value: 78 },
                { label: "Audit Readiness", value: 85 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-300 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all duration-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
