"use client";

import { motion } from "framer-motion";

interface SkillRadarProps {
  skills: Array<{ name: string; value: number }>;
  size?: number;
}

export function SkillRadar({ skills, size = 220 }: SkillRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = skills.length;

  const getPoint = (i: number, r: number) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const rings = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = skills.map((s, i) => getPoint(i, (s.value / 100) * maxR));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const axisPoints = skills.map((_, i) => getPoint(i, maxR));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Rings */}
        {rings.map((r, ri) => (
          <polygon
            key={ri}
            points={axisPoints.map((_, i) => {
              const p = getPoint(i, r * maxR);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="#191F2A"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisPoints.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#191F2A" strokeWidth={1} />
        ))}

        {/* Data fill */}
        <motion.path
          d={dataPath}
          fill="rgba(79,140,255,0.15)"
          stroke="#4F8CFF"
          strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px`, filter: "drop-shadow(0 0 6px rgba(79,140,255,0.3))" }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#4F8CFF"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.06 }}
            style={{ filter: "drop-shadow(0 0 3px #4F8CFF)" }}
          />
        ))}

        {/* Labels */}
        {skills.map((s, i) => {
          const p = getPoint(i, maxR + 18);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#94A3B8"
              fontSize={9}
              fontFamily="var(--font-jetbrains)"
            >
              {s.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
