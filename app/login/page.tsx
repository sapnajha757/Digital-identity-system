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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Digital Identity Platform</h1>
          <p className="mt-2 text-slate-400">AI-powered identity and knowledge management</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 animate-fade-in">
          <div className="flex gap-2 mb-6 p-1 bg-slate-800 rounded-lg">
            <button
              onClick={() => { setMode("signin"); setResetMode(false); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signin" && !resetMode ? "bg-primary-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setResetMode(false); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signup" && !resetMode ? "bg-primary-600 text-white" : "text-slate-400 hover:text-white"
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
