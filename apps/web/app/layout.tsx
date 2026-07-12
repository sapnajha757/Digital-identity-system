import type { Metadata } from "next";
import { Orbitron, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/components/AuthProvider";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["500", "600", "700"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "IDENT.SYS — Digital Identity System",
  description: "Your academic and professional journey, scanned, indexed, and connected.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-body text-fog antialiased">
        <div className="scanlines" aria-hidden="true" />
        <div className="glow-orb glow-orb-cyan" aria-hidden="true" />
        <div className="glow-orb glow-orb-magenta" aria-hidden="true" />
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
