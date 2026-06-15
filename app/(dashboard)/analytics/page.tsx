'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  Repeat,
  Flame,
  TrendingUp,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { summaryStats } from '@/lib/analytics-data';
import {
  GoalCompletionChart,
  HabitConsistencyChart,
  ProductivityScoreChart,
  CategoryBreakdown,
  HeatmapChart,
  InsightsPanel,
} from '@/components/analytics';

// ── Date range options ──────────────────────────────────────────────
type DateRange = '7d' | '30d' | '90d' | 'all';

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

// ── Summary stat card config ────────────────────────────────────────
interface StatConfig {
  icon: typeof Target;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
}

const statsConfig: StatConfig[] = [
  {
    icon: Target,
    value: summaryStats.totalGoals,
    label: 'Total Goals',
    trend: 'up',
    trendValue: '+5 this month',
    color: 'text-primary',
  },
  {
    icon: CheckCircle2,
    value: `${summaryStats.completionRate}%`,
    label: 'Completion Rate',
    trend: 'up',
    trendValue: '+8% vs last month',
    color: 'text-emerald-400',
  },
  {
    icon: Repeat,
    value: summaryStats.activeHabits,
    label: 'Active Habits',
    trend: 'neutral',
    trendValue: 'Same as last week',
    color: 'text-purple-400',
  },
  {
    icon: Flame,
    value: `${summaryStats.currentStreak} days`,
    label: 'Current Streak',
    trend: 'up',
    trendValue: 'Personal best!',
    color: 'text-orange-400',
  },
  {
    icon: TrendingUp,
    value: summaryStats.productivityScore,
    label: 'Productivity Score',
    trend: 'up',
    trendValue: '+12 pts this month',
    color: 'text-glow',
  },
];

// ── Stat card component ─────────────────────────────────────────────
function StatCard({ config, delay }: { config: StatConfig; delay: number }) {
  const Icon = config.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-cards/80 p-5 backdrop-blur-sm hover:border-white/10 transition-all duration-300"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted font-medium">{config.label}</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">
            {config.value}
          </p>
          {config.trendValue && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                config.trend === 'up'
                  ? 'text-emerald-400'
                  : config.trend === 'down'
                  ? 'text-red-400'
                  : 'text-muted'
              )}
            >
              {config.trend === 'up' && '↑ '}
              {config.trend === 'down' && '↓ '}
              {config.trendValue}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl bg-white/5',
            config.color
          )}
        >
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Date range selector ─────────────────────────────────────────────
function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = dateRangeOptions.find((o) => o.value === value)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-cards/80 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:border-white/10 transition-colors"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span>{selected.label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-white/10 bg-[#111111] py-1.5 shadow-2xl"
            >
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    option.value === value
                      ? 'text-primary bg-primary/10'
                      : 'text-muted hover:bg-white/5 hover:text-white'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Analytics page ─────────────────────────────────────────────
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-muted mt-1">
            Track your progress and discover patterns
          </p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </motion.div>

      {/* ── Summary stats row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsConfig.map((stat, i) => (
          <StatCard key={stat.label} config={stat} delay={0.05 * i} />
        ))}
      </div>

      {/* ── Charts grid (2-column) ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GoalCompletionChart />
        <HabitConsistencyChart />
        <ProductivityScoreChart />
        <CategoryBreakdown />
      </div>

      {/* ── Heatmap (full width) ──────────────────────────────── */}
      <HeatmapChart />

      {/* ── AI Insights ───────────────────────────────────────── */}
      <InsightsPanel />
    </div>
  );
}
