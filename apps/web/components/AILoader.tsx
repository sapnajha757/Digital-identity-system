"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AILoaderProps {
  status?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RING_STATUSES = [
  "Analyzing Documents...",
  "Understanding Skills...",
  "Connecting Knowledge...",
  "Computing Insights...",
];

export function AILoader({ status = "Processing...", size = "md", className = "" }: AILoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dims = size === "sm" ? 80 : size === "md" ? 140 : 200;
  const ringR = dims * 0.38;
  const cx = dims / 2;
  const cy = dims / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = ringR * (0.5 + Math.random() * 0.6);
      particles.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 60,
        maxLife: 60 + Math.random() * 60,
      });
    }

    let frame: number;
    let rot = 0;
    const animate = () => {
      ctx.clearRect(0, 0, dims, dims);
      rot += 0.012;

      // Neural mesh lines
      ctx.strokeStyle = "rgba(79,140,255,0.07)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 50) {
            ctx.globalAlpha = (1 - d / 50) * 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Particles
      particles.forEach((p) => {
        p.life++;
        if (p.life > p.maxLife) {
          const angle = Math.random() * Math.PI * 2;
          const r = ringR * (0.4 + Math.random() * 0.7);
          p.x = cx + Math.cos(angle) * r;
          p.y = cy + Math.sin(angle) * r;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = (Math.random() - 0.5) * 0.4;
          p.life = 0;
          p.maxLife = 60 + Math.random() * 60;
        }
        p.x += p.vx;
        p.y += p.vy;
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#4F8CFF";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Scanning beam
      const beamAngle = rot * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(beamAngle);
      const scanGrad = ctx.createLinearGradient(0, 0, ringR * 1.1, 0);
      scanGrad.addColorStop(0, "rgba(79,140,255,0.0)");
      scanGrad.addColorStop(0.5, "rgba(79,140,255,0.12)");
      scanGrad.addColorStop(1, "rgba(79,140,255,0.0)");
      ctx.fillStyle = scanGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, ringR * 1.1, -0.3, 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [dims, ringR, cx, cy]);

  const circumference = 2 * Math.PI * ringR;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative" style={{ width: dims, height: dims }}>
        <canvas
          ref={canvasRef}
          width={dims}
          height={dims}
          className="absolute inset-0"
        />

        {/* Outer rotating ring */}
        <svg
          width={dims}
          height={dims}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle cx={cx} cy={cy} r={ringR} stroke="#191F2A" strokeWidth={size === "sm" ? 3 : 4} fill="none" />
          {/* Animated arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={ringR}
            stroke="#4F8CFF"
            strokeWidth={size === "sm" ? 3 : 4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: [circumference * 0.75, 0, circumference * 0.75] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 6px rgba(79,140,255,0.6))" }}
          />
        </svg>

        {/* Inner counter-rotating ring */}
        <svg
          width={dims}
          height={dims}
          className="absolute inset-0"
          style={{ transform: "rotate(90deg)" }}
        >
          <motion.circle
            cx={cx}
            cy={cy}
            r={ringR * 0.72}
            stroke="#7B61FF"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.72}
            animate={{ strokeDashoffset: [0, circumference * 0.72 * 0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 4px rgba(123,97,255,0.5))" }}
          />
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="font-display font-black text-cyan"
            style={{ fontSize: size === "sm" ? 14 : size === "md" ? 22 : 32 }}
          >
            AI
          </motion.div>
        </div>
      </div>

      {/* Status text */}
      <motion.p
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="font-mono text-cyan text-center"
        style={{ fontSize: size === "sm" ? 9 : 11 }}
      >
        {status}
      </motion.p>

      {/* Streaming dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-cyan"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
