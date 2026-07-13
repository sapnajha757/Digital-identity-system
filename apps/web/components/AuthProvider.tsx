"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, Session } from "@/lib/api-client";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    if (!session && !isPublicRoute) {
      router.replace("/login");
    }
  }, [session, loading, pathname, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Avoid flashing protected content before the redirect check above runs.
  if (loading || (!session && !isPublicRoute)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-xs text-mist">// initializing session…</p>
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
