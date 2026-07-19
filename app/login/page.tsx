"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setError("Password reset link sent. Check your email.");
        setResetMode(false);
      } else if (mode === "signin") {
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/dashboard");
      } else {
        const { error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone } },
        });
        if (signUpError) throw signUpError;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),transparent_30%),linear-gradient(220deg,rgba(20,184,166,0.12),transparent_32%),linear-gradient(180deg,#030712_0%,#050816_55%,#020617_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.16]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-300/25 bg-gradient-to-br from-white/16 to-primary-300/10 font-display text-base font-semibold text-primary-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_55px_rgba(14,165,233,0.16)]">
            ID
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Digital Identity Platform</h1>
          <p className="mt-2 text-slate-400">AI-powered identity and knowledge management</p>
        </div>

        <div className="animate-fade-in rounded-2xl border border-white/[0.08] bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
            <button
              onClick={() => { setMode("signin"); setResetMode(false); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === "signin" && !resetMode ? "bg-primary-500/15 text-primary-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setResetMode(false); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === "signup" && !resetMode ? "bg-primary-500/15 text-primary-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-sm text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && !resetMode && (
              <>
                <Input label="Full Name" value={name} onChange={setName} placeholder="John Doe" />
                <Input label="Phone" value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
              </>
            )}
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            {!resetMode && (
              <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            )}

            {!resetMode && (
              <button
                type="button"
                onClick={() => { setResetMode(true); setError(null); }}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </button>
            )}

            {resetMode && (
              <button
                type="button"
                onClick={() => { setResetMode(false); setError(null); }}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Back to sign in
              </button>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : resetMode ? "Send Reset Link" : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
