"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface IdentityRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function IdentityRing({ score, size = 160, label = "Identity Score" }: IdentityRingProps) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const innerR = r * 0.78;
  const innerCircumference = 2 * Math.PI * innerR;

  const dash = (circumference * score) / 100;
  const innerDash = (innerCircumference * Math.min(score + 5, 100)) / 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Outer track */}
          <circle cx={cx} cy={cy} r={r} stroke="#191F2A" strokeWidth={size * 0.05} fill="none" />
          {/* Outer filled arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="url(#ringGrad)"
            strokeWidth={size * 0.05}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            style={{ filter: "drop-shadow(0 0 8px rgba(79,140,255,0.5))" }}
          />
          {/* Inner track */}
          <circle cx={cx} cy={cy} r={innerR} stroke="#191F2A" strokeWidth={size * 0.025} fill="none" />
          {/* Inner arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={innerR}
            stroke="#7B61FF"
            strokeWidth={size * 0.025}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={innerCircumference}
            initial={{ strokeDashoffset: innerCircumference }}
            animate={{ strokeDashoffset: innerCircumference - innerDash }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.5 }}
            style={{ filter: "drop-shadow(0 0 4px rgba(123,97,255,0.4))" }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F8CFF" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display font-black text-fog"
            style={{ fontSize: size * 0.22 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {score}%
          </motion.span>
          <span className="font-mono text-mist/60" style={{ fontSize: size * 0.07 }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
