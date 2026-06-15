'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { goalsByCategory } from '@/lib/analytics-data';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: data } = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111]/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <p className="text-sm font-semibold text-white">{name}</p>
      </div>
      <p className="text-xs text-muted">
        <span className="font-bold text-white">{value}</span> goals
      </p>
    </div>
  );
}

export default function CategoryBreakdown() {
  const total = goalsByCategory.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="rounded-2xl border border-white/[0.06] bg-cards/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Goals by Category</h3>
        <p className="text-sm text-muted mt-1">Distribution across all categories</p>
      </div>

      <div className="h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={goalsByCategory}
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {goalsByCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.2))',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-muted">{value}</span>
              )}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '60px' }}>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
