"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
];

const features = [
  {
    icon: "D",
    title: "Dashboard",
    description:
      "See your credentials, milestones, skill signals, and profile health in one calm workspace.",
  },
  {
    icon: "G",
    title: "Knowledge Graph",
    description:
      "Connect certificates, roles, projects, and skills into a structured career map.",
  },
  {
    icon: "S",
    title: "Career Simulator",
    description:
      "Explore paths, gaps, and next steps based on the identity data you already have.",
  },
  {
    icon: "R",
    title: "Resume Assistant",
    description:
      "Turn verified work history into clear, role-specific resume and profile content.",
  },
  {
    icon: "E",
    title: "Explainability",
    description:
      "Understand why each skill, recommendation, and profile insight appears.",
  },
  {
    icon: "P",
    title: "Shareable Profile",
    description:
      "Create a professional profile that is organized, credible, and easy to review.",
  },
];

const steps = [
  {
    title: "Upload documents",
    description:
      "Add resumes, certificates, credentials, transcripts, and work artifacts.",
  },
  {
    title: "System organizes your data",
    description:
      "IdentityOS extracts key signals and structures them into a usable identity layer.",
  },
  {
    title: "Share your profile",
    description:
      "Publish a clean career profile for recruiters, teams, auditors, or collaborators.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

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
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl font-semibold tracking-normal text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(51,119,255,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0)_0%,#020617_78%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-500/15 text-sm font-semibold text-primary-100 shadow-[0_0_28px_rgba(51,119,255,0.16)]">
              ID
            </span>
            <span className="font-display text-lg font-semibold tracking-normal text-white">
              Digital Identity Platform
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-5 py-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
              Trusted identity infrastructure for modern careers
            </div>
            <h1 className="mt-7 font-display text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              A structured, verifiable digital identity for your career
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Upload your credentials and let IdentityOS organize them into a
              clear, shareable professional profile.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary-500/20 transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-slate-400">Career Profile</p>
                    <p className="mt-1 font-display text-xl font-semibold text-white">
                      Professional Identity
                    </p>
                  </div>
                  <span className="rounded-full border border-primary-300/30 bg-primary-400/10 px-3 py-1 text-xs font-medium text-primary-200">
                    Verified
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {["Credentials", "Skills", "Projects"].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/10 bg-white/[0.035] p-4"
                    >
                      <p className="text-2xl font-semibold text-white">
                        {[18, 42, 12][index]}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "Verified credentials and certificates",
                    "Structured skills and work history",
                    "Shareable professional profile",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-300" />
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Features"
            title="Everything your professional identity needs"
            description="IdentityOS turns scattered career evidence into an organized system that is useful for both you and the people reviewing your work."
          />

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
                className="rounded-xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur transition hover:border-primary-300/30 hover:bg-white/[0.055]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary-300/25 bg-primary-500/10 font-display text-sm font-semibold text-primary-200">
                  {feature.icon}
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
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
            title="From documents to a profile people can trust"
            description="The workflow is intentionally simple: provide the evidence, let the system structure it, then share a clear profile."
          />

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                  ease: "easeOut",
                }}
                className="relative rounded-xl border border-white/10 bg-slate-900/40 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
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
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-12 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-10"
        >
          <h2 className="font-display text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Build a career profile that is organized from day one.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Start with your existing documents and turn them into a structured
            professional identity you can use, update, and share with confidence.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-500/15 text-xs font-semibold text-primary-100">
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
          <p>Copyright 2026 IdentityOS. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
