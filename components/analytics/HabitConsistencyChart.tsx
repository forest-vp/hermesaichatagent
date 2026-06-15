'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { habitConsistency } from '@/lib/analytics-data';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111]/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-white mb-1">{label}</p>
      <p className="text-xs text-primary">
        Completion rate:{' '}
        <span className="font-bold text-white">{payload[0].value}%</span>
      </p>
    </div>
  );
}

export default function HabitConsistencyChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-white/[0.06] bg-cards/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Habit Consistency</h3>
        <p className="text-sm text-muted mt-1">Habit completion rate over time</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={habitConsistency}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="60%" stopColor="#3B82F6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={[40, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Gradient fill area under the line */}
            <defs>
              <clipPath id="habitClip">
                <rect x="0" y="0" width="100%" height="100%" />
              </clipPath>
            </defs>
            {/* We use a second invisible area-like trick: a wide stroke below */}
            <Line
              type="monotone"
              dataKey="rate"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                fill: '#3B82F6',
                stroke: '#60A5FA',
                strokeWidth: 3,
              }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            {/* Gradient glow dots at data points */}
            <Line
              type="monotone"
              dataKey="rate"
              stroke="transparent"
              strokeWidth={0}
              dot={(props: { cx: number; cy: number; index: number }) => {
                const { cx, cy, index } = props;
                const lastIndex = habitConsistency.length - 1;
                const isActive = index === lastIndex;
                if (!isActive) return <circle key={`dot-${index}`} />;
                return (
                  <g key={`dot-${index}`}>
                    <circle cx={cx} cy={cy} r={8} fill="#3B82F6" opacity={0.15} />
                    <circle cx={cx} cy={cy} r={5} fill="#3B82F6" opacity={0.3} />
                  </g>
                );
              }}
              activeDot={{
                r: 6,
                fill: '#3B82F6',
                stroke: '#60A5FA',
                strokeWidth: 3,
              }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
