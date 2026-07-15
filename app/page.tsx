"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
];

const features = [
  {
    label: "01",
    title: "Dashboard",
    description:
      "A composed operating view for documents, credentials, milestones, and profile readiness.",
  },
  {
    label: "02",
    title: "Knowledge Graph",
    description:
      "Connect roles, certificates, skills, projects, and evidence into one structured career layer.",
  },
  {
    label: "03",
    title: "Career Simulator",
    description:
      "Model paths, gaps, and next moves using the professional evidence already in your profile.",
  },
  {
    label: "04",
    title: "Resume Assistant",
    description:
      "Transform verified career data into polished resume and profile narratives for each role.",
  },
  {
    label: "05",
    title: "Explainability",
    description:
      "See the reasoning behind skills, recommendations, profile scores, and career insights.",
  },
  {
    label: "06",
    title: "Shareable Profile",
    description:
      "Publish a refined professional identity that is easy to review, verify, and trust.",
  },
];

const steps = [
  {
    title: "Upload documents",
    description:
      "Bring in certificates, resumes, transcripts, proof of work, and professional records.",
  },
  {
    title: "System organizes your data",
    description:
      "The platform extracts signals and turns scattered evidence into a structured identity model.",
  },
  {
    title: "Share your profile",
    description:
      "Create a clean, credible profile for recruiters, clients, auditors, and collaborators.",
  },
];

const profileRows = [
  "Verified credentials and certificates",
  "Structured skills and work history",
  "Shareable professional profile",
];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

const animation = {
  duration: 0.55,
  ease: "easeOut",
} as const;

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={animation}
      className="mx-auto max-w-3xl text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
        {eyebrow}
      </p>
      <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
        {description}
      </p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),transparent_28%),linear-gradient(220deg,rgba(20,184,166,0.12),transparent_30%),linear-gradient(180deg,#030712_0%,#050816_48%,#020617_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.18]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-300/10 to-transparent" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200/25 bg-gradient-to-br from-white/16 to-cyan-300/10 text-sm font-semibold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_55px_rgba(14,165,233,0.16)]">
              ID
            </span>
            <span className="truncate font-display text-base font-semibold tracking-normal text-white sm:text-lg">
              Digital Identity Platform
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-200/25 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_18px_55px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...animation, duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(103,232,249,0.9)]" />
            Verifiable career identity, beautifully structured
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
            A structured, verifiable digital identity for your career
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Upload your credentials and let Digital Identity Platform organize
            them into a clear, shareable professional profile.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-100/20 bg-cyan-300 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_22px_70px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] px-6 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-black/10 backdrop-blur-xl transition hover:border-cyan-200/30 hover:bg-white/[0.085]"
            >
              Explore Platform
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["99%", "Profile clarity"],
              ["3 min", "Setup flow"],
              ["Secure", "Sharing"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl"
              >
                <p className="font-display text-xl font-semibold text-white">
                  {value}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...animation, duration: 0.7, delay: 0.12 }}
          className="relative"
        >
          <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-cyan-200/35 via-white/10 to-teal-300/20 opacity-70 blur-sm" />
          <div className="relative rounded-[2rem] border border-white/14 bg-white/[0.065] p-3 shadow-[0_35px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
            <div className="rounded-[1.55rem] border border-white/10 bg-[#07101f]/78 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-slate-400">Career Profile</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-white">
                    Professional Identity
                  </p>
                </div>
                <span className="rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  Verified
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Credentials", "Skills", "Projects"].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                  >
                    <p className="font-display text-3xl font-semibold text-white">
                      {[18, 42, 12][index]}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    Identity readiness
                  </p>
                  <p className="text-sm font-semibold text-cyan-100">86%</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-cyan-200 to-teal-300 shadow-[0_0_28px_rgba(45,212,191,0.35)]" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {profileRows.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-xs font-bold text-cyan-100">
                      ✓
                    </span>
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Features"
            title="A premium identity layer for serious careers"
            description="The platform turns professional evidence into a refined, structured system that is useful for you and credible to anyone reviewing your work."
          />

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...animation, delay: index * 0.04 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/10 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-200/25 hover:bg-white/[0.07] hover:shadow-cyan-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-cyan-100">
                    {feature.label}
                  </span>
                  <span className="h-px w-14 bg-gradient-to-r from-cyan-200/60 to-transparent" />
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="How it works"
            title="A calm workflow from evidence to identity"
            description="No cluttered onboarding, no noisy dashboards. Add the evidence, let the system structure it, and share a profile that feels complete."
          />

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...animation, delay: index * 0.06 }}
                className="rounded-3xl border border-white/10 bg-[#07101f]/72 p-7 shadow-2xl shadow-black/15 backdrop-blur-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 font-display text-sm font-semibold text-cyan-100">
                  0{index + 1}
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={animation}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.06] px-6 py-14 text-center shadow-[0_35px_130px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:px-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold leading-tight tracking-normal text-white sm:text-5xl">
            Build a professional identity that feels complete, credible, and
            ready to share.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Start with existing documents and turn them into a structured career
            profile with a polished, trustworthy presentation layer.
          </p>
          <Link
            href="/login"
            className="mt-9 inline-flex items-center justify-center rounded-xl border border-cyan-100/20 bg-cyan-300 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_22px_70px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/25 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
              ID
            </span>
            <span className="font-display font-semibold">
              Digital Identity Platform
            </span>
          </Link>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="#how-it-works" className="transition hover:text-white">
              How it Works
            </Link>
            <Link href="/login" className="transition hover:text-white">
              Login
            </Link>
          </div>
          <p>Copyright 2026 Digital Identity Platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
