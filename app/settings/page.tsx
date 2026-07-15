"use client";

import AppShell from "@/components/AppShell";
import { Card, Badge, Button } from "@/components/ui";

const settings = [
  { id: "notifications", label: "Email Notifications", description: "Receive email updates about your identity status", enabled: true },
  { id: "ai_analysis", label: "AI Analysis", description: "Allow AI to analyze your identity data for insights", enabled: true },
  { id: "audit_logging", label: "Audit Logging", description: "Log all access and changes for compliance", enabled: true },
  { id: "auto_sync", label: "Auto Sync", description: "Automatically sync knowledge graph changes", enabled: false },
  { id: "two_factor", label: "Two-Factor Authentication", description: "Require 2FA for sensitive operations", enabled: false },
];

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <h3 className="font-display text-lg font-semibold text-white mb-4">Preferences</h3>
          <div className="space-y-1">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{setting.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{setting.description}</p>
                </div>
                <button
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    setting.enabled ? "bg-primary-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      setting.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-white mb-4">API Access</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-400 mb-1.5">API Key</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value="di_sk_••••••••••••••••"
                  readOnly
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm"
                />
                <Button variant="secondary">Copy</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="accent">Active</Badge>
              <span className="text-xs text-slate-500">Last used 2 hours ago</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-white mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data.</p>
          <Button variant="secondary" className="!text-error-400 !border !border-error-500/30 hover:!bg-error-500/10">
            Delete Account
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
