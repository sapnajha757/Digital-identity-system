"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const BOOT_STEPS = [
  { id: "init", label: "Initializing IdentityOS", icon: "⚡", delay: 0 },
  { id: "mem", label: "Loading AI Memory", icon: "🧠", delay: 700 },
  { id: "docs", label: "Reading Documents", icon: "📄", delay: 1400 },
  { id: "graph", label: "Building Knowledge Graph", icon: "🕸️", delay: 2100 },
  { id: "twin", label: "Creating Career Twin", icon: "👥", delay: 2800 },
  { id: "insights", label: "Generating AI Insights", icon: "✨", delay: 3500 },
  { id: "mission", label: "Preparing Mission Control", icon: "🖥️", delay: 4200 },
  { id: "done", label: "Launch Complete", icon: "✓", delay: 4900 },
];

interface Particle { x: number; y: number; vx: number; vy: number; r: number; alpha: number; }

export default function BootPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [activeSteps, setActiveSteps] = useState<Set<string>>(new Set());
  const [currentStatus, setCurrentStatus] = useState("Initializing IdentityOS...");
  const [progress, setProgress] = useState(0);
  const [launched, setLaunched] = useState(false);

  // Canvas neural background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.globalAlpha = ((1 - d / 120) * 0.25);
            ctx.strokeStyle = "#4F8CFF";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#4F8CFF";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Boot sequence
  useEffect(() => {
    BOOT_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setActiveSteps((prev) => new Set([...prev, step.id]));
        setCurrentStatus(step.label + "...");
        setProgress(Math.round(((idx + 1) / BOOT_STEPS.length) * 100));
      }, step.delay);
    });

    // Auto-transition to dashboard
    setTimeout(() => {
      setLaunched(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    }, 5900);
  }, [router]);

  return (
    <div className="relative min-h-screen bg-[#07090F] text-fog flex items-center justify-center overflow-hidden">
      {/* Neural network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(79,140,255,0.06) 0%, transparent 70%)" }}
        />
      </div>

      {/* Main boot terminal */}
      <AnimatePresence>
        {!launched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            {/* Glass terminal */}
            <div
              className="border border-white/8 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 8px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,140,255,0.1)",
              }}
            >
              {/* Terminal title bar */}
              <div className="border-b border-white/5 px-5 py-3.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="flex-1 text-center font-mono text-[9px] text-mist/50 uppercase tracking-widest">
                  IDENTITYOS KERNEL — BOOT SEQUENCE
                </span>
              </div>

              <div className="p-8 space-y-7">
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center space-y-1"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.span
                      className="w-2.5 h-2.5 rounded-full bg-cyan"
                      animate={{ boxShadow: ["0 0 4px #4F8CFF", "0 0 16px #4F8CFF", "0 0 4px #4F8CFF"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-display font-black text-2xl tracking-widest text-fog">
                      IDENTITY<span className="text-cyan">OS</span>
                    </span>
                  </div>
                  <p className="font-mono text-[9px] text-mist/50 tracking-widest uppercase">
                    AI Digital Identity Operating System v3.0
                  </p>
                </motion.div>

                {/* Boot steps */}
                <div className="space-y-2">
                  {BOOT_STEPS.map((step, idx) => {
                    const isActive = activeSteps.has(step.id);
                    const isLast = step.id === "done";
                    return (
                      <AnimatePresence key={step.id}>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex items-center gap-3"
                          >
                            <span className="w-4 shrink-0 text-center" style={{ fontSize: 12 }}>
                              {isLast ? (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-cyan font-bold"
                                >
                                  ✓
                                </motion.span>
                              ) : (
                                step.icon
                              )}
                            </span>
                            <span
                              className={`font-mono text-xs ${isLast ? "text-cyan font-bold" : "text-fog"}`}
                            >
                              {step.label}
                            </span>
                            {isLast ? (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-auto font-mono text-[9px] text-cyan font-bold"
                              >
                                READY
                              </motion.span>
                            ) : (
                              <motion.span
                                className="ml-auto font-mono text-[9px] text-mist/40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                OK
                              </motion.span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-mist/50 uppercase tracking-widest">
                      {currentStatus}
                    </span>
                    <span className="font-mono text-[9px] text-cyan font-bold">{progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #4F8CFF, #00F0FF)",
                        boxShadow: "0 0 8px rgba(79,140,255,0.6)",
                      }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Streaming cursor */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-cyan/70">identityos@kernel:~$</span>
                  <motion.span
                    className="inline-block w-2 h-3 bg-cyan"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
