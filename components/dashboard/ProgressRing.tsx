'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  delay?: number;
}

export default function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  label,
  delay = 0,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const data = [
    { value: percentage, fill: '#3B82F6' },
    { value: 100 - percentage, fill: '#1a1a2e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={radius - strokeWidth}
            outerRadius={radius}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="false"
            cornerRadius={8}
          >
            <Cell fill="#3B82F6" />
            <Cell fill="#1a1a2e" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
        {label && <span className="text-xs text-muted mt-1">{label}</span>}
      </div>

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{
          background: `conic-gradient(from -90deg, #3B82F6 ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
        }}
      />
    </motion.div>
  );
}
