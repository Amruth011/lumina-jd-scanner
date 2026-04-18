import React from "react";
import { motion } from "framer-motion";

interface RadarEntry {
  label: string;
  value: number; // 0-100
}

interface LuminaRadarProps {
  data: RadarEntry[];
  size?: number;
  color?: string;
}

export const LuminaRadar = ({ data, size = 300, color = "var(--accent-blue)" }: LuminaRadarProps) => {
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / data.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = data.map((d, i) => getCoordinates(i, d.value));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Concentric Circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius * r}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
            className="text-foreground"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
              className="text-foreground"
            />
          );
        })}

        {/* Shape */}
        <motion.path
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, fillOpacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={path}
          fill={color}
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 10px ${color}44)` }}
        />

        {/* Value Nodes */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={color}
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, 115);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              className="text-[12px] uppercase font-bold tracking-widest fill-muted-foreground transition-all duration-300"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
