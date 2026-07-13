"use client";

import { motion } from "framer-motion";

interface RecruiterGaugeProps {
  value: number;
  size?: number;
  label?: string;
}

export function RecruiterGauge({ value, size = 180, label = "Recruiter Readiness" }: RecruiterGaugeProps) {
  const cx = size / 2;
  const cy = size * 0.62;
  const r = size * 0.42;
  // Half-circle gauge
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const arcAngle = startAngle + (value / 100) * Math.PI;

  const polarToXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  const trackStart = polarToXY(startAngle, r);
  const trackEnd = polarToXY(endAngle, r);
  const fillEnd = polarToXY(arcAngle, r);

  const trackPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 0 1 ${trackEnd.x} ${trackEnd.y}`;
  const largeFill = value > 50 ? 1 : 0;
  const fillPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeFill} 1 ${fillEnd.x} ${fillEnd.y}`;

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];

  // Color based on value
  const strokeColor = value >= 80 ? "#4F8CFF" : value >= 60 ? "#F59E0B" : "#7B61FF";
  const glowColor = value >= 80 ? "rgba(79,140,255,0.5)" : value >= 60 ? "rgba(245,158,11,0.5)" : "rgba(123,97,255,0.5)";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.72}>
        {/* Track */}
        <path d={trackPath} fill="none" stroke="#191F2A" strokeWidth={size * 0.055} strokeLinecap="round" />

        {/* Fill arc */}
        <motion.path
          d={fillPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={size * 0.055}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />

        {/* Tick labels */}
        {ticks.map((tick) => {
          const a = Math.PI + (tick / 100) * Math.PI;
          const p = polarToXY(a, r + 16);
          return (
            <text
              key={tick}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#94A3B8"
              fontSize={8}
              fontFamily="var(--font-jetbrains)"
            >
              {tick}
            </text>
          );
        })}

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={polarToXY(arcAngle, r * 0.75).x}
          y2={polarToXY(arcAngle, r * 0.75).y}
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ rotate: 0 }}
          animate={{ rotate: 0 }}
          style={{ transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 3px ${strokeColor})` }}
        />
        <circle cx={cx} cy={cy} r={5} fill={strokeColor} style={{ filter: `drop-shadow(0 0 4px ${strokeColor})` }} />

        {/* Center value */}
        <text x={cx} y={cy - r * 0.35} textAnchor="middle" fill="#F8FAFC" fontSize={size * 0.14} fontFamily="var(--font-space-grotesk)" fontWeight="900">
          {value}%
        </text>
        <text x={cx} y={cy - r * 0.35 + size * 0.11} textAnchor="middle" fill="#94A3B8" fontSize={8} fontFamily="var(--font-jetbrains)">
          {label}
        </text>
      </svg>
    </div>
  );
}
