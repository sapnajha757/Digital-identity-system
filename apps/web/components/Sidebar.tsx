"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";

const SECTIONS = [
  { href: "/", label: "DOCUMENTS", code: "01" },
  { href: "/timeline", label: "TIMELINE", code: "02" },
  { href: "/graph", label: "GRAPH", code: "03" },
  { href: "/chat", label: "ASK", code: "04" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-panel-raised bg-panel/70 backdrop-blur-md md:flex">
      <div className="border-b border-panel-raised px-6 py-7">
        <p className="font-display text-lg font-bold tracking-widest gradient-text">
          IDENT.SYS
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist">
          v1.0 // dossier engine
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        {SECTIONS.map((section) => {
          const active = pathname === section.href;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={clsx(
                "mb-1 flex items-center gap-3 rounded-sm border px-3 py-2.5 font-mono text-xs tracking-wide transition-all duration-200",
                active
                  ? "border-cyan/40 bg-cyan/5 text-cyan shadow-glow-cyan"
                  : "border-transparent text-mist hover:border-panel-raised hover:bg-panel-raised/40 hover:text-fog"
              )}
            >
              <span className={active ? "text-magenta" : "text-mist/60"}>{section.code}</span>
              <span>{section.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-panel-raised px-6 py-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-cyan">System online</span>
        </div>

        {session?.user?.email && (
          <p className="mb-2 truncate font-mono text-[10px] text-mist" title={session.user.email}>
            {session.user.email}
          </p>
        )}

        <button
          type="button"
          onClick={signOut}
          className="font-mono text-[10px] uppercase tracking-widest text-mist transition-colors hover:text-magenta"
        >
          [ Log out ]
        </button>
      </div>
    </aside>
  );
}
