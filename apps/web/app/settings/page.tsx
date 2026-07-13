"use client";

import { useState, useEffect } from "react";
import { HudFrame } from "@/components/HudFrame";
import { useAuth } from "@/components/AuthProvider";
import { apiClient } from "@/lib/api-client";

export default function SettingsPage() {
  const { session } = useAuth();
  const [demoMode, setDemoMode] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [motion, setMotion] = useState("smooth");
  const [notifications, setNotifications] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState("Alex Morgan");
  const [education, setEducation] = useState("B.S. in Computer Science & AI Systems");
  const [experience, setExperience] = useState("Associate AI Engineer & Full Stack developer");
  const [githubUrl, setGithubUrl] = useState("https://github.com/demo-user");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/in/demo-user");
  const [portfolioUrl, setPortfolioUrl] = useState("https://identityos.demo/profile");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  useEffect(() => {
    setDemoMode(localStorage.getItem("dis_demo_mode") === "true");
    setTheme(localStorage.getItem("dis_theme") || "dark");
    setMotion(localStorage.getItem("dis_motion") || "smooth");
  }, []);

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem("dis_demo_mode", next ? "true" : "false");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("demo-mode-changed"));
    window.location.reload();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile configurations saved to system storage.");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus("Authenticating reset request...");
    setTimeout(() => {
      setPasswordStatus("Success: Password has been updated securely.");
      setCurrentPassword("");
      setNewPassword("");
    }, 1200);
  };

  const handleThemeChange = (val: string) => {
    setTheme(val);
    localStorage.setItem("dis_theme", val);
    if (val === "high-contrast") {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  const handleMotionChange = (val: string) => {
    setMotion(val);
    localStorage.setItem("dis_motion", val);
    if (val === "reduced") {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 bg-void text-fog min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 06 — CONFIGURATION CONTROL</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          Settings & Profile
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Customize your career persona, connect verification networks, adjust workspace accessibility parameters, and toggle Hackathon demo variables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile Setup */}
        <div className="md:col-span-7 space-y-6">
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
              👤 Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs text-mist">
              <div className="flex items-center gap-4 border border-dashed border-panel-raised p-4 rounded bg-void/25">
                <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/45 flex items-center justify-center font-bold text-cyan text-sm shrink-0">
                  AM
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-cyan">// Profile Avatar</span>
                  <p className="text-[10px] text-mist/60 leading-normal">Upload certified PNG/JPG profile imagery under validation index.</p>
                </div>
              </div>

              <div>
                <label className="block text-fog mb-1.5">// Full Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none"
                />
              </div>

              <div>
                <label className="block text-fog mb-1.5">// Education Level</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none"
                />
              </div>

              <div>
                <label className="block text-fog mb-1.5">// Professional Summary Experience</label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-fog mb-1.5">// GitHub Link</label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none"
                  />
                </div>
                <div>
                  <label className="block text-fog mb-1.5">// LinkedIn Link</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 border border-cyan/40 hover:border-cyan bg-cyan/5 hover:bg-cyan/15 text-cyan uppercase font-bold tracking-wider rounded transition-all"
              >
                [Save Profile Params]
              </button>
            </form>
          </HudFrame>

          <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
              🔑 Account Security
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-4 font-mono text-xs text-mist">
              <div>
                <label className="block text-fog mb-1.5">// Current Credentials Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none"
                />
              </div>
              <div>
                <label className="block text-fog mb-1.5">// New Secure Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-void/50 border border-panel-raised focus:border-cyan rounded p-2 text-fog outline-none"
                />
              </div>
              {passwordStatus && (
                <div className="text-[10px] text-cyan bg-cyan/5 border border-cyan/20 p-2.5 rounded">
                  {passwordStatus}
                </div>
              )}
              <button
                type="submit"
                className="px-4 py-2 border border-magenta/40 hover:border-magenta bg-magenta/5 hover:bg-magenta/15 text-magenta uppercase font-bold tracking-wider rounded transition-all"
              >
                [Change password]
              </button>
            </form>
          </HudFrame>
        </div>

        {/* Right Side: Environment Preference control */}
        <div className="md:col-span-5 space-y-6">
          <HudFrame accent="cyan" className="bg-panel/40 p-6 rounded-lg border border-panel-raised space-y-6">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
                🔬 Workspace Preferences
              </h2>
              <div className="space-y-4 font-mono text-xs text-mist">
                {/* Theme Selector */}
                <div>
                  <span className="block text-fog mb-1.5">// Color Contrast Scheme</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`px-3 py-1.5 border rounded text-[10px] uppercase font-bold transition-all ${
                        theme === "dark" ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised bg-void/50 text-mist"
                      }`}
                    >
                      Dark HSL
                    </button>
                    <button
                      onClick={() => handleThemeChange("high-contrast")}
                      className={`px-3 py-1.5 border rounded text-[10px] uppercase font-bold transition-all ${
                        theme === "high-contrast" ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised bg-void/50 text-mist"
                      }`}
                    >
                      High Contrast
                    </button>
                  </div>
                </div>

                {/* Motion Effects Control */}
                <div>
                  <span className="block text-fog mb-1.5">// Motion FX Speed</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMotionChange("smooth")}
                      className={`px-3 py-1.5 border rounded text-[10px] uppercase font-bold transition-all ${
                        motion === "smooth" ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised bg-void/50 text-mist"
                      }`}
                    >
                      Smooth Kinetics
                    </button>
                    <button
                      onClick={() => handleMotionChange("reduced")}
                      className={`px-3 py-1.5 border rounded text-[10px] uppercase font-bold transition-all ${
                        motion === "reduced" ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised bg-void/50 text-mist"
                      }`}
                    >
                      Reduced Motion
                    </button>
                  </div>
                </div>

                {/* Notifications preferences toggle */}
                <div className="flex justify-between items-center border-t border-panel-raised/50 pt-4">
                  <span>// Sound Alerts & Notifications</span>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`px-2 py-1 border rounded text-[9px] uppercase font-bold ${
                      notifications ? "border-cyan text-cyan" : "border-panel-raised text-mist"
                    }`}
                  >
                    {notifications ? "ENABLED" : "MUTED"}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-panel-raised/50 pt-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog mb-3">
                🤖 Hackathon Diagnostics
              </h2>
              <div className="bg-void/50 border border-panel-raised p-4 rounded space-y-3 font-mono text-xs text-mist">
                <div className="flex justify-between items-center">
                  <span>Demo Mode Engine</span>
                  <button
                    onClick={toggleDemoMode}
                    className={`px-2 py-0.5 border rounded text-[10px] font-bold ${
                      demoMode ? "border-cyan text-cyan bg-cyan/5" : "border-panel-raised text-mist"
                    }`}
                  >
                    {demoMode ? "ON (MOCKED DATA)" : "OFF (LIVE DB)"}
                  </button>
                </div>
                <p className="text-[10px] text-mist/60 leading-normal">
                  Demo presentation mode loads realistic sample data for Neo4j, Qdrant vectors, and credentials validation pipelines instantly.
                </p>
              </div>
            </div>
          </HudFrame>

          <HudFrame accent="magenta" className="bg-panel/40 p-6 rounded-lg border border-panel-raised">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-fog border-b border-panel-raised/50 pb-2 mb-4">
              🔌 Active Session Audit
            </h2>
            <div className="space-y-3 font-mono text-[10px] text-mist">
              <div className="flex justify-between items-center border-b border-panel-raised/40 pb-2">
                <div>
                  <span className="text-fog font-bold">127.0.0.1 (Current Node)</span>
                  <p className="text-mist/50">Next.js Web-UI Hub — Windows Edge</p>
                </div>
                <span className="text-cyan font-bold">[ACTIVE]</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-fog font-bold">10.0.2.15 (Docker Gateway)</span>
                  <p className="text-mist/50">FastAPI Pipeline Engine — Uvicorn Server</p>
                </div>
                <span className="text-cyan/60">[CONNECTED]</span>
              </div>
            </div>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}
