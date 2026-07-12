"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace("/");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setInfo("Account created — check your inbox to confirm your email, then log in.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold tracking-widest gradient-text">IDENT.SYS</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist">
            {mode === "login" ? "// authenticate" : "// register"}
          </p>
        </div>

        <HudFrame accent="cyan" className="bg-panel/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-mist">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-panel-raised bg-panel/60 px-4 py-2.5 font-mono text-sm text-fog placeholder:text-mist focus:border-cyan focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-mist">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-panel-raised bg-panel/60 px-4 py-2.5 font-mono text-sm text-fog placeholder:text-mist focus:border-cyan focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="font-mono text-xs text-magenta">[ERROR] {error}</p>}
            {info && <p className="font-mono text-xs text-cyan">{info}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm border border-cyan/50 bg-cyan/10 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition-all duration-200 hover:scale-[1.02] hover:bg-cyan/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </HudFrame>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center font-mono text-xs text-mist transition-colors hover:text-cyan"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
