"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/auth/reset-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get current session on mount
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout / recovery)
    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) {
        localStorage.removeItem("dis_demo_mode");
        window.dispatchEvent(new Event("demo-mode-changed"));
      }
      
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/auth/reset-password");
      } else if (event === "SIGNED_IN" && PUBLIC_ROUTES.includes(window.location.pathname)) {
        router.replace("/dashboard");
      }
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    if (!session && !isPublicRoute) {
      router.replace("/login");
    }
  }, [session, loading, pathname, router]);

  async function signOut() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("dis_demo_mode");
    localStorage.removeItem("dis_session");
    window.dispatchEvent(new Event("demo-mode-changed"));
    router.replace("/login");
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Avoid flashing protected content before the redirect check above runs.
  if (loading || (!session && !isPublicRoute)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <p className="font-mono text-xs text-mist animate-pulse">// initializing session…</p>
      </div>
    );
  }

  return <AuthContext.Provider value={{ session, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
