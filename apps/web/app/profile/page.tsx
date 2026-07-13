"use client";

import { useEffect, useState } from "react";
import { apiClient, DashboardMetricsResponse } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Get high contrast settings from DOM
    setHighContrast(document.body.classList.contains("high-contrast"));
    setReducedMotion(localStorage.getItem("reduced-motion") === "true");

    apiClient
      .getDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.error("Error loading metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.body.classList.add("high-contrast");
      localStorage.setItem("high-contrast", "true");
    } else {
      document.body.classList.remove("high-contrast");
      localStorage.setItem("high-contrast", "false");
    }
  };

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem("reduced-motion", next ? "true" : "false");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 10 — SYSTEM PROFILE</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          User Profile Center
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Manage your verified credentials, security settings, privacy overrides, and terminal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: User Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-cyan bg-void flex items-center justify-center text-cyan font-display text-4xl font-bold shadow-glow-cyan/20">
                  AM
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-cyan border-2 border-void flex items-center justify-center text-[10px] font-bold text-void" title="Identity Verified">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-fog uppercase">Alex Morgan</h3>
                <span className="font-mono text-[10px] text-cyan uppercase font-bold tracking-wider">// VERIFIED AGENT</span>
              </div>
            </div>

            <div className="border-t border-panel-raised/40 pt-4 space-y-3 font-mono text-xs text-mist">
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-cyan font-bold">✓ SECURED</span>
              </div>
              <div className="flex justify-between">
                <span>Identity Score:</span>
                <span className="text-magenta font-bold">{metrics?.identity_score ?? 10}%</span>
              </div>
              <div className="flex justify-between">
                <span>Credential Count:</span>
                <span className="text-fog">{metrics ? Object.keys(metrics.stats || {}).length : 0} Sources</span>
              </div>
            </div>
          </HudFrame>

          {/* Social connections */}
          <HudFrame accent="magenta" className="bg-panel/40 p-5 rounded-lg border border-panel-raised space-y-4">
            <h4 className="font-mono text-[10px] text-magenta uppercase font-bold tracking-wider">// CONNECTED PROTOCOLS</h4>
            <div className="space-y-3 font-mono text-xs text-mist">
              <div className="flex justify-between items-center border-b border-panel-raised/20 pb-2">
                <span>GitHub Link:</span>
                <span className="text-cyan hover:underline cursor-pointer">@github/alexm</span>
              </div>
              <div className="flex justify-between items-center border-b border-panel-raised/20 pb-2">
                <span>LinkedIn Ref:</span>
                <span className="text-cyan hover:underline cursor-pointer">in/alex-morgan-dev</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Verified Resume:</span>
                <span className="text-magenta font-bold">[ATTACHED]</span>
              </div>
            </div>
          </HudFrame>
        </div>

        {/* Right column: Settings & Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity Score Timeline */}
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
            <h4 className="font-mono text-[10px] text-cyan uppercase font-bold tracking-wider">// SCORES VELOCITY HISTORIC</h4>
            <div className="space-y-4 font-mono text-xs text-mist">
              <div className="flex items-center gap-3">
                <span className="text-cyan font-bold w-12">92%</span>
                <div className="flex-1 bg-void/50 h-2 rounded border border-panel-raised/50 overflow-hidden">
                  <div className="bg-cyan h-full" style={{ width: "92%" }} />
                </div>
                <span className="text-[10px] text-mist/60">Today (Certificate Sync)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan/70 font-bold w-12">78%</span>
                <div className="flex-1 bg-void/50 h-2 rounded border border-panel-raised/50 overflow-hidden">
                  <div className="bg-cyan/70 h-full" style={{ width: "78%" }} />
                </div>
                <span className="text-[10px] text-mist/60">1 Month Ago (Internship Ingestion)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan/50 font-bold w-12">35%</span>
                <div className="flex-1 bg-void/50 h-2 rounded border border-panel-raised/50 overflow-hidden">
                  <div className="bg-cyan/50 h-full" style={{ width: "35%" }} />
                </div>
                <span className="text-[10px] text-mist/60">Init (Resume Uploaded)</span>
              </div>
            </div>
          </HudFrame>

          {/* Theme & Terminal Settings */}
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-6">
            <h4 className="font-mono text-[10px] text-cyan uppercase font-bold tracking-wider">// COSMETIC PREFERENCES</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-mist">High Contrast Mode</span>
                  <button 
                    onClick={toggleHighContrast}
                    className={`px-3 py-1 border text-[10px] font-mono rounded transition-all ${highContrast ? "border-cyan bg-cyan/15 text-cyan" : "border-panel-raised text-mist"}`}
                  >
                    {highContrast ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>
                <p className="text-[10px] text-mist/60 leading-relaxed font-sans">
                  Improves accessibility by increasing text contrast parameters across standard components.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-mist">Reduced Motion</span>
                  <button 
                    onClick={toggleReducedMotion}
                    className={`px-3 py-1 border text-[10px] font-mono rounded transition-all ${reducedMotion ? "border-cyan bg-cyan/15 text-cyan" : "border-panel-raised text-mist"}`}
                  >
                    {reducedMotion ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>
                <p className="text-[10px] text-mist/60 leading-relaxed font-sans">
                  Silences aurora background light loops and complex transition layouts.
                </p>
              </div>
            </div>
          </HudFrame>

          {/* Account security & Privacy settings */}
          <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-4">
            <h4 className="font-mono text-[10px] text-magenta uppercase font-bold tracking-wider">// SECURITY OVERLAYS</h4>
            <div className="space-y-3 font-mono text-xs text-mist">
              <div className="flex justify-between items-center border-b border-panel-raised/20 pb-2">
                <span>Account Status:</span>
                <span className="text-cyan font-bold">✓ SECURED</span>
              </div>
              <div className="flex justify-between items-center border-b border-panel-raised/20 pb-2">
                <span>2FA Authentication:</span>
                <span className="text-mist/50">Disabled (Demo context)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Recruiter Access Logs:</span>
                <span className="text-cyan hover:underline cursor-pointer">View Audit Trails</span>
              </div>
            </div>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}
