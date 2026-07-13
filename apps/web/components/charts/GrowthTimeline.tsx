"use client";

import { motion } from "framer-motion";

interface GrowthTimelineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

export function GrowthTimeline({ data, width = 200, height = 60, color = "#4F8CFF", label }: GrowthTimelineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * w,
    y: pad + h - ((v - min) / range) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${pad + h} L${points[0].x},${pad + h} Z`;
  const totalLen = data.length * 15;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="font-mono text-[9px] text-mist/60 uppercase">{label}</span>}
      <svg width={width} height={height}>
        <defs>
          <linearGradient id={`areaGrad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill={`url(#areaGrad-${color.replace("#","")})`} />
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
        {/* Last point dot */}
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    </div>
  );
}
