"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login";

  return (
    <div className="relative z-10 flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className={hideSidebar ? "flex-1" : "flex-1 md:pl-60"}>{children}</main>
    </div>
  );
}
