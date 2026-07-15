"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function Header({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6">
      <h1 className="font-display text-lg font-semibold text-white">
        {title || "Dashboard"}
      </h1>
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="hidden sm:inline">{user?.email || "User"}</span>
        </Link>
      </div>
    </header>
  );
}
