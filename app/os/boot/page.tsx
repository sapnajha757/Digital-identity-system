"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const bootLines = [
  "Initializing Digital Identity OS...",
  "Loading identity modules... OK",
  "Connecting to Supabase... OK",
  "Mounting knowledge graph... OK",
  "Starting AI engine... OK",
  "Verifying audit compliance... OK",
  "Loading user profile... OK",
  "Boot complete.",
];

export default function BootPage() {
  const router = useRouter();
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleLines < bootLines.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 300);
      return () => clearTimeout(timer);
    } else {
      setDone(true);
      const timer = setTimeout(() => router.push("/dashboard"), 1000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono">
      <div className="w-full max-w-2xl px-8">
        <div className="mb-6 text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <h1 className="mt-4 text-2xl font-bold text-white font-display">DI-OS Boot</h1>
        </div>
        <div className="space-y-1">
          {bootLines.slice(0, visibleLines).map((line, i) => (
            <p key={i} className="text-sm text-accent-400 animate-fade-in">
              <span className="text-slate-600">[{String(i + 1).padStart(2, "0")}]</span> {line}
            </p>
          ))}
          {done && (
            <p className="text-sm text-primary-400 animate-fade-in mt-4">
              Redirecting to dashboard...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
