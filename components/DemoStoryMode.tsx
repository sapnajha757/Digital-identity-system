"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export interface DemoStep {
  id: string;
  route: string;
  label: string;
  icon: string;
  description: string;
  highlight: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: "mission",
    route: "/dashboard",
    label: "Mission Control",
    icon: "🖥️",
    description: "The AI-powered command center. Every credential, insight, and career metric — unified in one view.",
    highlight: "Identity Health + Daily AI Briefing",
  },
  {
    id: "docs",
    route: "/dashboard",
    label: "Document Intelligence",
    icon: "📄",
    description: "Upload any document. IdentityOS extracts entities, skills, and relationships automatically using OCR + LLM.",
    highlight: "Upload a document to trigger the Magic Moment",
  },
  {
    id: "graph",
    route: "/graph",
    label: "Knowledge Graph",
    icon: "🕸️",
    description: "Every skill, project, certificate, and internship — mapped as a living neural network with confidence scores.",
    highlight: "Hover nodes to see relationships + reasoning",
  },
  {
    id: "timeline",
    route: "/timeline",
    label: "Career Timeline",
    icon: "⏳",
    description: "Chronological journey of your professional growth. AI-inferred dates, milestones, and skill evolution.",
    highlight: "Interactive timeline with type filters",
  },
  {
    id: "twin",
    route: "/evolution",
    label: "Career Twin",
    icon: "👥",
    description: "A dynamic AI persona synthesized from all your documents — complete with role predictions and readiness scores.",
    highlight: "Career Twin + Salary Predictions",
  },
  {
    id: "portfolio",
    route: "/portfolio",
    label: "Portfolio",
    icon: "💼",
    description: "One shareable link. A stunning recruiter-ready portfolio auto-generated from your credentials.",
    highlight: "Public portfolio with export options",
  },
  {
    id: "explainability",
    route: "/explainability",
    label: "AI Explainability",
    icon: "🔍",
    description: "Every AI decision is grounded in real sources. See exactly which document backs each insight.",
    highlight: "Full citation trail + confidence breakdown",
  },
  {
    id: "recruiter",
    route: "/auditors",
    label: "Recruiter Mode",
    icon: "🎯",
    description: "Switch to the recruiter lens. Only the polished, verified professional story — nothing else.",
    highlight: "Presentation Mode for live demos",
  },
];

interface DemoStoryModeProps {
  isActive: boolean;
  onExit: () => void;
}

export function DemoStoryMode({ isActive, onExit }: DemoStoryModeProps) {
  const [step, setStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);
  const router = useRouter();

  const currentStep = DEMO_STEPS[step];

  const goTo = useCallback(
    (newStep: number) => {
      if (newStep < 0 || newStep >= DEMO_STEPS.length) return;
      setStep(newStep);
      setShowTooltip(false);
      router.push(DEMO_STEPS[newStep].route);
      setTimeout(() => setShowTooltip(true), 400);
    },
    [router]
  );

  useEffect(() => {
    if (!isActive) return;
    router.push(DEMO_STEPS[0].route);
    setStep(0);
    setTimeout(() => setShowTooltip(true), 400);
  }, [isActive, router]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (e.key === "ArrowRight") goTo(step + 1);
      if (e.key === "ArrowLeft") goTo(step - 1);
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, step, goTo, onExit]);

  if (!isActive) return null;

  return (
    <>
      {/* Floating Step Controls */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10"
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,140,255,0.15)",
        }}
      >
        {/* Step indicator pills */}
        <div className="flex gap-1 mr-2">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="w-1.5 h-4 rounded-full transition-all duration-300"
              style={{ background: i === step ? "#4F8CFF" : "#191F2A" }}
              title={s.label}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className="px-3 py-1.5 font-mono text-[10px] text-mist border border-white/10 rounded-lg hover:border-cyan/40 hover:text-cyan disabled:opacity-30 transition-all"
        >
          ← PREV
        </button>

        {/* Current step label */}
        <div className="px-3 py-1.5 font-mono text-[10px] text-cyan border border-cyan/30 rounded-lg bg-cyan/5 min-w-[120px] text-center">
          {step + 1}/{DEMO_STEPS.length} · {currentStep.label}
        </div>

        <button
          onClick={() => goTo(step + 1)}
          disabled={step === DEMO_STEPS.length - 1}
          className="px-3 py-1.5 font-mono text-[10px] text-mist border border-white/10 rounded-lg hover:border-cyan/40 hover:text-cyan disabled:opacity-30 transition-all"
        >
          NEXT →
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          onClick={onExit}
          className="px-3 py-1.5 font-mono text-[10px] text-mist/60 border border-white/5 rounded-lg hover:border-magenta/40 hover:text-magenta transition-all"
        >
          EXIT
        </button>
      </motion.div>

      {/* Feature Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed top-6 right-6 z-[90] max-w-xs"
          >
            <div
              className="border border-cyan/25 rounded-xl p-4 space-y-2"
              style={{
                background: "rgba(15,23,42,0.88)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 16px rgba(79,140,255,0.08)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentStep.icon}</span>
                <div>
                  <p className="font-mono text-[9px] text-cyan/70 uppercase tracking-widest">Step {step + 1} of {DEMO_STEPS.length}</p>
                  <h3 className="font-display font-bold text-sm text-fog">{currentStep.label}</h3>
                </div>
              </div>
              <p className="text-xs text-mist leading-relaxed">{currentStep.description}</p>
              <div className="border-t border-white/5 pt-2">
                <p className="font-mono text-[9px] text-cyan/80">
                  ✦ {currentStep.highlight}
                </p>
              </div>
              <p className="font-mono text-[8px] text-mist/40">Use ← → arrow keys to navigate</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo mode banner at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-[80] flex items-center justify-center py-1.5 pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(79,140,255,0.15), rgba(123,97,255,0.15))" }}
      >
        <span className="font-mono text-[9px] text-cyan/80 uppercase tracking-widest">
          ✦ Demo Presentation Mode — Use arrow keys or controls below ✦
        </span>
      </motion.div>
    </>
  );
}
