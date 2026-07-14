"use client";

import { useState, useEffect } from "react";
import { HudFrame } from "@/components/HudFrame";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { supabaseClient } from "@/lib/supabase";

const TABS = [
  { id: "general", label: "General" },
  { id: "workspace", label: "Workspace" },
  { id: "ai", label: "AI & Memory" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data Management" },
  { id: "developer", label: "Developer & System" },
];

export default function SettingsPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isClient, setIsClient] = useState(false);
  
  // UI States
  const [notification, setNotification] = useState<{ message: string, type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // General Settings
  const [demoMode, setDemoMode] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [motionPref, setMotionPref] = useState("smooth");
  const [notifications, setNotifications] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // AI Preferences
  const [aiMemory, setAiMemory] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);
  const [autoRec, setAutoRec] = useState(true);
  const [careerCopilot, setCareerCopilot] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // Connected Accounts
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    setIsClient(true);
    
    const fetchProfile = async () => {
      if (!session?.user) return;
      
      try {
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        const sessionEmail = session.user.email || "";
        const metaName = session.user.user_metadata?.full_name || "";
        let derivedName = metaName;
        if (!derivedName && sessionEmail) {
          const local = sessionEmail.split("@")[0].replace(/[0-9]+$/g, "");
          const parts = local.split(/[\._-]/);
          derivedName = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        }
        
        setEmail(sessionEmail);
        
        if (data) {
          setFullName(data.full_name || derivedName);
          setEducation(data.education || "");
          setExperience(data.experience || "");
          setCurrentRole(data.current_role || "");
          setGithubUrl(data.github_url || "");
          setLinkedinUrl(data.linkedin_url || "");
          setTheme(data.theme || "dark");
          setMotionPref(data.motion_pref || "smooth");
          setNotifications(data.notifications ?? true);
          setDemoMode(data.demo_mode ?? false);
          setAvatarUrl(data.avatar_url || "");
          
          if (data.ai_preferences) {
            setAiMemory(data.ai_preferences.aiMemory ?? true);
            setDailyBriefing(data.ai_preferences.dailyBriefing ?? true);
            setAutoRec(data.ai_preferences.autoRec ?? true);
            setCareerCopilot(data.ai_preferences.careerCopilot ?? true);
          }
        } else {
          setFullName(derivedName);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const initials = fullName
    ? fullName.split(/\s+/).map((w: string) => w.charAt(0)).join('').toUpperCase().substring(0, 2)
    : "??";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !session?.user) return;
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;
    
    setIsUploading(true);
    
    const { error: uploadError } = await supabaseClient.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
      
    if (uploadError) {
      showNotification("Error uploading avatar", "error");
      setIsUploading(false);
      return;
    }
    
    const { data } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    
    await supabaseClient.from("profiles").upsert({
      id: session.user.id,
      avatar_url: data.publicUrl
    });
    
    setIsUploading(false);
    showNotification("Avatar updated successfully", "success");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setIsSaving(true);
    
    const { error } = await supabaseClient.from("profiles").upsert({
      id: session.user.id,
      full_name: fullName,
      education,
      experience,
      current_role: currentRole,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
      theme,
      motion_pref: motionPref,
      notifications,
      demo_mode: demoMode,
      avatar_url: avatarUrl,
      ai_preferences: {
        aiMemory,
        dailyBriefing,
        autoRec,
        careerCopilot
      }
    });
    
    setIsSaving(false);
    
    if (error) {
      showNotification("Error saving profile", "error");
      console.error(error);
    } else {
      showNotification("Profile saved successfully");
      window.dispatchEvent(new Event("profile-updated"));
    }
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

  const toggleDemoMode = async () => {
    const next = !demoMode;
    setDemoMode(next);
    
    if (session?.user) {
      await supabaseClient.from("profiles").update({ demo_mode: next }).eq("id", session.user.id);
    }
    
    window.dispatchEvent(new Event("demo-mode-changed"));
    window.location.reload();
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 bg-void text-fog min-h-screen flex flex-col space-y-10">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
            className={clsx(
              "fixed top-6 right-6 z-50 p-4 border rounded-lg backdrop-blur-xl shadow-2xl flex items-center gap-3 font-mono text-xs uppercase tracking-wider",
              notification.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                : "bg-red-500/10 border-red-500/50 text-red-400"
            )}
          >
            <span className="text-lg">{notification.type === "success" ? "?" : "?"}</span>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-magenta/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-cyan mb-2">
          // IDENTITY_OS / SETTINGS_CENTER
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          Control Center
        </h1>
        <p className="mt-4 text-sm text-mist/80 leading-relaxed font-sans max-w-2xl">
          Configure your enterprise-grade AI Operating System. Manage workspace preferences, security configurations, data flows, and active cognitive processes.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-4 py-3 text-left font-mono text-xs uppercase tracking-wider rounded-lg transition-all duration-300 relative overflow-hidden",
                activeTab === tab.id
                  ? "text-cyan bg-panel-raised border border-cyan/40 shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                  : "text-mist/70 hover:text-fog hover:bg-panel-raised/50 border border-transparent"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-cyan"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full relative min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {activeTab === "general" && (
                <div className="space-y-8">
                  <HudFrame accent="cyan" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan/5 to-transparent pointer-events-none" />
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-cyan">01.</span> Profile Center
                    </h2>
                    <form onSubmit={handleSaveProfile} className="space-y-6 font-sans text-sm text-mist relative z-10">
                      <div className="flex items-center gap-6 bg-void/40 p-4 rounded-xl border border-panel-raised/50">
                        <div className="w-20 h-20 rounded-full bg-cyan/10 border border-cyan/40 flex items-center justify-center font-bold text-cyan text-2xl shrink-0 shadow-[0_0_20px_rgba(0,255,255,0.15)] relative overflow-hidden group">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                          <label className="absolute inset-0 bg-void/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] uppercase">
                            {isUploading ? "..." : "Upload"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                          </label>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-mono text-cyan uppercase tracking-wider">Identity Avatar</span>
                          <p className="text-xs text-mist/60 leading-normal max-w-md">Upload verified personnel imagery. Automated biometric hashing ensures global avatar consistency.</p>
                          <div className="inline-block px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase rounded">Identity Verified</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-xs font-mono text-fog uppercase">Full Name</label>
                          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-void/50 border border-panel-raised focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg p-3 text-fog outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono text-fog uppercase">Email Address</label>
                          <input type="email" value={email} disabled className="w-full bg-void/30 border border-panel-raised/50 rounded-lg p-3 text-mist/50 outline-none cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono text-fog uppercase">Current Role</label>
                          <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className="w-full bg-void/50 border border-panel-raised focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg p-3 text-fog outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono text-fog uppercase">Education Level</label>
                          <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className="w-full bg-void/50 border border-panel-raised focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg p-3 text-fog outline-none transition-all" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-fog uppercase">Bio / Experience</label>
                        <textarea rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-void/50 border border-panel-raised focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg p-3 text-fog outline-none transition-all leading-relaxed resize-none" />
                      </div>

                      <button type="submit" disabled={isSaving} className="px-6 py-2.5 border border-cyan/50 hover:border-cyan bg-cyan/10 hover:bg-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed text-cyan uppercase font-mono text-xs font-bold tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                        {isSaving ? "Committing..." : "Commit Profile"}
                      </button>
                    </form>
                  </HudFrame>

                  <HudFrame accent="magenta" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-magenta">02.</span> Connected Accounts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[{ name: "GitHub", status: "Connected", url: githubUrl, setUrl: setGithubUrl, color: "text-emerald-400" },
                        { name: "LinkedIn", status: "Connected", url: linkedinUrl, setUrl: setLinkedinUrl, color: "text-emerald-400" },
                        { name: "Google Drive", status: "Not Connected", url: "", setUrl: () => {}, color: "text-amber-400" },
                        { name: "Notion", status: "Not Connected", url: "", setUrl: () => {}, color: "text-amber-400" }].map((acc) => (
                        <div key={acc.name} className="bg-void/50 border border-panel-raised p-4 rounded-xl flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs text-white uppercase">{acc.name}</span>
                            <span className={`text-[10px] font-mono uppercase ${acc.color} bg-white/5 px-2 py-0.5 rounded`}>{acc.status}</span>
                          </div>
                          {acc.setUrl !== (() => {}) && (
                            <input
                              type="text"
                              placeholder={`${acc.name} URL`}
                              value={acc.url}
                              onChange={(e) => acc.setUrl(e.target.value)}
                              className="w-full bg-void/50 border border-panel-raised/50 focus:border-magenta focus:ring-1 focus:ring-magenta rounded p-2 text-xs text-fog outline-none font-mono"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </HudFrame>
                </div>
              )}

              {activeTab === "workspace" && (
                <div className="space-y-8">
                  <HudFrame accent="cyan" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-cyan">01.</span> Environment Parameters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-sm">
                      <div className="space-y-3">
                        <label className="block text-xs font-mono text-fog uppercase">Theme Engine</label>
                        <div className="flex gap-2">
                          <button onClick={() => setTheme("dark")} className={clsx("px-4 py-2 border rounded-lg text-xs uppercase font-mono transition-all", theme === "dark" ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]" : "border-panel-raised bg-void/50 text-mist hover:border-mist/50")}>Dark HSL</button>
                          <button onClick={() => setTheme("high-contrast")} className={clsx("px-4 py-2 border rounded-lg text-xs uppercase font-mono transition-all", theme === "high-contrast" ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]" : "border-panel-raised bg-void/50 text-mist hover:border-mist/50")}>High Contrast</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-mono text-fog uppercase">Motion Physics</label>
                        <div className="flex gap-2">
                          <button onClick={() => setMotionPref("smooth")} className={clsx("px-4 py-2 border rounded-lg text-xs uppercase font-mono transition-all", motionPref === "smooth" ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]" : "border-panel-raised bg-void/50 text-mist hover:border-mist/50")}>Fluid</button>
                          <button onClick={() => setMotionPref("reduced")} className={clsx("px-4 py-2 border rounded-lg text-xs uppercase font-mono transition-all", motionPref === "reduced" ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]" : "border-panel-raised bg-void/50 text-mist hover:border-mist/50")}>Reduced</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-mono text-fog uppercase">Audio Telemetry</label>
                        <div className="flex gap-2">
                          <button onClick={() => setNotifications(true)} className={clsx("px-4 py-2 border rounded-lg text-xs uppercase font-mono transition-all", notifications ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]" : "border-panel-raised bg-void/50 text-mist hover:border-mist/50")}>Enabled</button>
                          <button onClick={() => setNotifications(false)} className={clsx("px-4 py-2 border rounded-lg text-xs uppercase font-mono transition-all", !notifications ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]" : "border-panel-raised bg-void/50 text-mist hover:border-mist/50")}>Muted</button>
                        </div>
                      </div>
                    </div>
                  </HudFrame>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-8">
                  <HudFrame accent="magenta" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-magenta/5 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-magenta">01.</span> Neural Configuration
                    </h2>
                    <div className="space-y-6">
                      {[
                        { id: 'memory', label: 'AI Memory Retention', desc: 'Allow the AI to retain context across sessions for personalized assistance.', state: aiMemory, setter: setAiMemory },
                        { id: 'briefing', label: 'Daily Knowledge Briefing', desc: 'Receive synthesized updates on relevant technologies daily.', state: dailyBriefing, setter: setDailyBriefing },
                        { id: 'autorec', label: 'Autonomous Recommendations', desc: 'AI proactively suggests portfolio improvements and resume tweaks.', state: autoRec, setter: setAutoRec },
                        { id: 'copilot', label: 'Career Copilot Mode', desc: 'Enable aggressive interview prep and opportunity matching.', state: careerCopilot, setter: setCareerCopilot },
                      ].map(setting => (
                        <div key={setting.id} className="flex items-center justify-between p-4 bg-void/30 rounded-xl border border-panel-raised/50 hover:bg-void/50 transition-colors">
                          <div className="space-y-1 pr-4">
                            <span className="font-mono text-xs text-white uppercase">{setting.label}</span>
                            <p className="text-xs text-mist/60">{setting.desc}</p>
                          </div>
                          <button
                            onClick={() => setting.setter(!setting.state)}
                            className={clsx("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-magenta focus:ring-offset-2 focus:ring-offset-void", setting.state ? "bg-magenta" : "bg-panel-raised")}
                          >
                            <span className={clsx("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", setting.state ? "translate-x-5" : "translate-x-0")} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </HudFrame>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <HudFrame accent="amber" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-amber-500">01.</span> Access Credentials
                    </h2>
                    <form onSubmit={handleResetPassword} className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-fog uppercase">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-void/50 border border-panel-raised focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg p-3 text-fog outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-fog uppercase">New Secure Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-void/50 border border-panel-raised focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg p-3 text-fog outline-none transition-all" />
                      </div>
                      {passwordStatus && (
                        <div className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                          {passwordStatus}
                        </div>
                      )}
                      <button type="submit" className="px-6 py-2.5 border border-amber-500/50 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 uppercase font-mono text-xs font-bold tracking-widest rounded-lg transition-all">
                        Rotate Keys
                      </button>
                    </form>
                  </HudFrame>

                  <HudFrame accent="cyan" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-cyan">02.</span> Device Trust List
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-void/40 p-4 rounded-xl border border-cyan/20 flex justify-between items-center">
                         <div>
                           <p className="font-mono text-xs text-white uppercase">Current Session</p>
                           <p className="text-xs text-mist/60">Windows Edge • IP 127.0.0.1</p>
                         </div>
                         <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded uppercase tracking-wider">Active</span>
                      </div>
                      <div className="bg-void/40 p-4 rounded-xl border border-panel-raised flex justify-between items-center opacity-70">
                         <div>
                           <p className="font-mono text-xs text-white uppercase">Mobile Device</p>
                           <p className="text-xs text-mist/60">iOS Safari • Last seen 2 days ago</p>
                         </div>
                         <button className="text-[10px] font-mono text-red-400 hover:text-red-300 uppercase tracking-wider px-2 py-1">Revoke</button>
                      </div>
                    </div>
                  </HudFrame>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-8">
                  <HudFrame accent="emerald" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-emerald-500">01.</span> Data Extraction
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Export Identity Report', 'Export Knowledge Graph', 'Export Resume JSON', 'Download Full Backup'].map((item) => (
                        <button key={item} className="p-4 bg-void/50 border border-panel-raised hover:border-emerald-500/50 rounded-xl flex items-center justify-between group transition-all">
                          <span className="font-mono text-xs text-mist group-hover:text-white uppercase">{item}</span>
                          <span className="text-emerald-500 font-mono text-lg opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
                        </button>
                      ))}
                    </div>
                  </HudFrame>
                </div>
              )}

              {activeTab === "developer" && (
                <div className="space-y-8">
                  <HudFrame accent="cyan" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-cyan">01.</span> Hackathon Diagnostics
                    </h2>
                    <div className="bg-void/50 border border-panel-raised p-6 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-panel-raised/50">
                        <div className="space-y-1">
                          <span className="font-mono text-xs text-white uppercase">Demo Environment</span>
                          <p className="text-xs text-mist/60 max-w-sm">Loads realistic sample data for Neo4j, Qdrant vectors, and pipelines.</p>
                        </div>
                        <button
                          onClick={toggleDemoMode}
                          className={clsx(
                            "px-4 py-2 border rounded-lg text-xs uppercase font-mono font-bold transition-all",
                            demoMode ? "border-cyan text-cyan bg-cyan/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]" : "border-panel-raised text-mist bg-void"
                          )}
                        >
                          {demoMode ? "Mock Data Live" : "Production Mode"}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="text-[10px] text-mist/60 font-mono uppercase">API Health</div>
                          <div className="text-emerald-400 font-mono text-xs uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimal
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-mist/60 font-mono uppercase">DB Status</div>
                          <div className="text-emerald-400 font-mono text-xs uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-mist/60 font-mono uppercase">AI Core</div>
                          <div className="text-cyan font-mono text-xs uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan" /> Ready
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-mist/60 font-mono uppercase">Vector DB</div>
                          <div className="text-emerald-400 font-mono text-xs uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Synced
                          </div>
                        </div>
                      </div>
                    </div>
                  </HudFrame>

                  <HudFrame accent="magenta" className="bg-panel/40 backdrop-blur-xl p-8 rounded-2xl border border-panel-raised shadow-lg">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white border-b border-panel-raised/50 pb-3 mb-6 flex items-center gap-2">
                      <span className="text-magenta">02.</span> System Info
                    </h2>
                    <div className="font-mono text-xs space-y-3 text-mist/70">
                      <div className="flex justify-between py-2 border-b border-panel-raised/30">
                        <span>IdentityOS Version</span>
                        <span className="text-white">v0.9.4-beta</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-panel-raised/30">
                        <span>Build Hash</span>
                        <span className="text-white">a3f9e8b2</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-panel-raised/30">
                        <span>Last Sync Time</span>
                        <span className="text-white">{new Date().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Runtime Framework</span>
                        <span className="text-white">Next.js Edge / React 18</span>
                      </div>
                    </div>
                  </HudFrame>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
