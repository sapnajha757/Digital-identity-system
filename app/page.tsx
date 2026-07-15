"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Workflow", href: "#workflow" },
  { label: "Retrieval", href: "#retrieval" },
];

const modules = [
  {
    label: "01",
    title: "AI Data Ingestion",
    description:
      "Upload certificates, resumes, project reports, internship letters, portfolio links, achievements, and academic or professional documents.",
  },
  {
    label: "02",
    title: "Intelligent Categorization",
    description:
      "Automatically classify content into projects, skills, certifications, internships, achievements, academics, and other meaningful groups.",
  },
  {
    label: "03",
    title: "Relationship Engine",
    description:
      "Connect evidence across the journey: certification to skill, skill to project, project to internship, and internship to career path.",
  },
  {
    label: "04",
    title: "Digital Journey Timeline",
    description:
      "Generate a visual timeline that helps students understand growth, achievements, learning records, and professional milestones over time.",
  },
  {
    label: "05",
    title: "Smart Retrieval System",
    description:
      "Search naturally for documents and facts, such as certificates, AI projects, internship files, or the latest resume.",
  },
  {
    label: "06",
    title: "Original File Access",
    description:
      "Keep every uploaded file accessible in its original format while the AI layer creates structure, metadata, and searchable context.",
  },
];

const workflow = [
  {
    title: "Upload fragmented data",
    description:
      "Students add files and links from folders, emails, drives, portfolios, and devices.",
  },
  {
    title: "AI reads and organizes",
    description:
      "The system extracts text, detects document type, tags entities, creates embeddings, and assigns categories.",
  },
  {
    title: "Knowledge gets connected",
    description:
      "Related skills, projects, certifications, internships, achievements, and academic records become linked.",
  },
  {
    title: "Search or showcase instantly",
    description:
      "Users retrieve original files, inspect connected evidence, and present a structured digital identity.",
  },
];

const acceptedInputs = [
  "Certificates",
  "Resumes",
  "Project Reports",
  "Internship Letters",
  "Portfolio Links",
  "GitHub Repositories",
  "Achievements",
  "Learning Records",
  "Academic Documents",
];

const relationshipExamples = [
  "Certification -> Skill",
  "Skill -> Project",
  "Project -> Internship",
  "Internship -> Career Path",
  "Achievement -> Timeline Event",
  "Resume -> Work History",
];

const searchExamples = [
  "Show all my certificates",
  "Show my AI projects",
  "Show internship documents",
  "Show my latest resume",
];

const aiStack = [
  "NLP extraction",
  "Embeddings",
  "Semantic search",
  "Vector database",
  "RAG retrieval",
  "Knowledge mapping",
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
            AI-powered student identity and knowledge repository
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Never search through folders for your journey again.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Upload certificates, resumes, reports, internships, portfolios, and
            learning records. The system organizes, connects, and retrieves your
            academic and professional evidence instantly.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-100/20 bg-cyan-300 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_22px_70px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Get Started
            </Link>
            <Link
              href="#modules"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] px-6 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-black/10 backdrop-blur-xl transition hover:border-cyan-200/30 hover:bg-white/[0.085]"
            >
              View Modules
            </Link>
          </div>

          <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              ["Organize", "Auto-classify uploaded content"],
              ["Connect", "Map skills, projects, and proof"],
              ["Retrieve", "Search naturally and open originals"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl"
              >
                <p className="font-display text-lg font-semibold text-white">
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
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-slate-400">Knowledge Repository</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-white">
                    Student Digital Journey
                  </p>
                </div>
                <span className="rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  Structured
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Ingest", "Classify", "Retrieve"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                  >
                    <p className="font-display text-lg font-semibold text-white">
                      {item}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">AI module</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">
                  Example knowledge connection
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-300">
                  {relationshipExamples.slice(0, 4).map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {searchExamples.slice(0, 3).map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-xs font-bold text-cyan-100">
                      AI
                    </span>
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="modules" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="What to build"
            title="All core modules for an intelligent digital identity system"
            description="This is not cloud storage. The platform preserves original files while adding AI organization, knowledge connections, semantic retrieval, and a journey view."
          />

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <motion.article
                key={module.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...animation, delay: index * 0.04 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/10 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-200/25 hover:bg-white/[0.07] hover:shadow-cyan-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-cyan-100">
                    {module.label}
                  </span>
                  <span className="h-px w-14 bg-gradient-to-r from-cyan-200/60 to-transparent" />
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold text-white">
                  {module.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {module.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={animation}
            className="rounded-3xl border border-white/10 bg-[#07101f]/72 p-7 shadow-2xl shadow-black/15 backdrop-blur-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Inputs
            </p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-white">
              Built for the real student footprint
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Students should be able to upload or link the records they already
              have, without manually building folders first.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ ...animation, delay: 0.08 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {acceptedInputs.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm font-medium text-slate-200 backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="AI workflow"
            title="From scattered files to a connected knowledge repository"
            description="The workflow is designed around the evaluation criteria: AI organization, categorization, relationship mapping, retrieval quality, and clear explanation."
          />

          <div className="mt-16 grid gap-4 lg:grid-cols-4">
            {workflow.map((step, index) => (
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
                <h3 className="mt-8 font-display text-xl font-semibold text-white">
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

      <section id="retrieval" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={animation}
            className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/15 backdrop-blur-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Natural retrieval
            </p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-white">
              Search by meaning, not folder names
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Users can ask natural questions and still open the original file
              in its original format.
            </p>
            <div className="mt-7 space-y-3">
              {searchExamples.map((query) => (
                <div
                  key={query}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200"
                >
                  &quot;{query}&quot;
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ ...animation, delay: 0.08 }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/15 backdrop-blur-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              AI techniques
            </p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-white">
              Designed for semantic understanding
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The product direction aligns with reviewer expectations around
              NLP, embeddings, vector databases, semantic search, RAG, and
              knowledge mapping.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {aiStack.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-cyan-200/15 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Demo moment
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-normal text-white sm:text-5xl">
            &quot;I never have to search through folders again.&quot;
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            A student can upload fragmented academic and professional evidence,
            then retrieve the right document, relationship, or timeline event
            instantly.
          </p>
          <Link
            href="/login"
            className="mt-9 inline-flex items-center justify-center rounded-xl border border-cyan-100/20 bg-cyan-300 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_22px_70px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Open Prototype
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
            <Link href="#modules" className="transition hover:text-white">
              Modules
            </Link>
            <Link href="#workflow" className="transition hover:text-white">
              Workflow
            </Link>
            <Link href="#retrieval" className="transition hover:text-white">
              Retrieval
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
