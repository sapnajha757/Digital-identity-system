"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function Header({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.08] bg-slate-950/40 px-6 backdrop-blur-xl">
      <h1 className="font-display text-lg font-semibold tracking-tight text-white">
        {title || "Dashboard"}
      </h1>
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-sm text-slate-300 transition hover:border-primary-300/25 hover:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-500 text-sm font-semibold text-slate-950">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="hidden sm:inline">{user?.email || "User"}</span>
        </Link>
      </div>
    </header>
  );
}
