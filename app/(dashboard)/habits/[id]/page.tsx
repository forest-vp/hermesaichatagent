'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  fetchHabitEntries,
  deleteHabit,
  updateHabit,
  calculateStreak,
  type Habit,
  type HabitEntry,
} from '@/lib/habits';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const today = new Date();

  // Load habit and entries
  useEffect(() => {
    if (!habitId) return;

    const loadData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client');

        // Fetch habit
        const { data: habitData } = await supabase
          .from('habits')
          .select('*')
          .eq('id', habitId)
          .single();

        if (!habitData) {
          router.push('/dashboard/habits');
          return;
        }

        setHabit(habitData);

        // Fetch last 365 days of entries
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 365);
        const startDateStr = startDate.toISOString().split('T')[0];

        const { data: entriesData } = await supabase
          .from('habit_entries')
          .select('*')
          .eq('habit_id', habitId)
          .gte('date', startDateStr)
          .lte('date', endDate)
          .order('date', { ascending: true });

        setEntries(entriesData ?? []);
      } catch (err) {
        console.error('Failed to load habit:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [habitId, router]);

  // Stats calculations
  const stats = useMemo(() => {
    if (!habit) return null;

    const targetCount = habit.target_count;
    const completedEntries = entries.filter(e => e.count >= targetCount);
    const totalCompletions = completedEntries.length;

    // Current streak
    const currentStreak = calculateStreak(entries, targetCount);

    // Best streak
    let bestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...new Set(entries.map(e => e.date))].sort();
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const entry = entries.find(e => e.date === dateStr);
      if (entry && entry.count >= targetCount) {
        if (prevDate) {
          const diff = (new Date(dateStr).getTime() - prevDate.getTime()) / 86400000;
          if (diff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        prevDate = new Date(dateStr);
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
        prevDate = null;
      }
    }

    // Completion rate (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentDays = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      recentDays.add(d.toISOString().split('T')[0]);
    }
    const recentCompletions = entries.filter(
      e => recentDays.has(e.date) && e.count >= targetCount
    ).length;
    const completionRate = Math.round((recentCompletions / 30) * 100);

    return {
      totalCompletions,
      currentStreak,
      bestStreak,
      completionRate,
    };
  }, [habit, entries, today]);

  // 30-day chart data
  const chartData = useMemo(() => {
    if (!habit) return [];

    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      const completed = entry ? entry.count >= habit.target_count : false;

      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completed ? 1 : 0,
        count: entry?.count ?? 0,
      });
    }

    return data;
  }, [habit, entries, today]);

  // Calendar heatmap data (last 12 weeks)
  const calendarWeeks = useMemo(() => {
    if (!habit) return [];

    const weeks: { date: string; completed: boolean; count: number }[][] = [];
    const targetCount = habit.target_count;

    // Start from 12 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 84);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let w = 0; w < 12; w++) {
      const week: { date: string; completed: boolean; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        const dateStr = cellDate.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dateStr);

        week.push({
          date: dateStr,
          completed: entry ? entry.count >= targetCount : false,
          count: entry?.count ?? 0,
        });
      }
      weeks.push(week);
    }

    return weeks;
  }, [habit, entries, today]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    if (!habit) return [];

    const months: Record<string, { total: number; completed: number }> = {};

    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);

    entries.forEach((entry) => {
      if (new Date(entry.date) >= startDate) {
        const d = new Date(entry.date);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        if (!months[key]) {
          months[key] = { total: 0, completed: 0 };
        }
        months[key].total++;
        if (entry.count >= habit.target_count) {
          months[key].completed++;
        }
      }
    });

    return Object.entries(months).map(([key, data]) => ({
      month: key,
      days: new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]), 0).getDate(),
      completions: data.completed,
      rate: Math.round((data.completed / new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]), 0).getDate()) * 100),
    }));
  }, [habit, entries, today]);

  const handleDelete = async () => {
    if (!habit || !confirm('Are you sure you want to delete this habit? This action cannot be undone.')) return;

    setDeleting(true);
    try {
      await deleteHabit(habit.id);
      router.push('/dashboard/habits');
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Failed to delete habit');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-48 rounded-lg bg-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-white/5" />
            ))}
          </div>
          <div className="h-48 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!habit) return null;

  const colorMap: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    pink: 'text-pink-500',
    orange: 'text-orange-500',
    cyan: 'text-cyan-500',
  };

  const borderColorMap: Record<string, string> = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    pink: 'border-pink-500',
    orange: 'border-orange-500',
    cyan: 'border-cyan-500',
  };

  const bgGradientMap: Record<string, string> = {
    blue: 'from-blue-500/20',
    green: 'from-green-500/20',
    purple: 'from-purple-500/20',
    red: 'from-red-500/20',
    yellow: 'from-yellow-500/20',
    pink: 'from-pink-500/20',
    orange: 'from-orange-500/20',
    cyan: 'from-cyan-500/20',
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/habits')}
        className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Habits</span>
      </button>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/10 bg-cards p-6 mb-6',
          'border-l-4',
          borderColorMap[habit.color] || 'border-primary',
        )}
      >
        {/* Background gradient */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br to-transparent opacity-50',
          bgGradientMap[habit.color] || 'from-primary/20',
        )} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{habit.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{habit.name}</h1>
              <p className="text-xs text-muted capitalize">
                {habit.frequency} · Target: {habit.target_count}/day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {/* Edit handled by parent modal trigger */}}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'Current Streak', value: stats.currentStreak, icon: Flame, suffix: 'days', highlight: true },
            { label: 'Best Streak', value: stats.bestStreak, icon: Award, suffix: 'days' },
            { label: '30-Day Rate', value: stats.completionRate, icon: Target, suffix: '%' },
            { label: 'Total Done', value: stats.totalCompletions, icon: TrendingUp, suffix: '' },
          ].map(({ label, value, icon: Icon, suffix, highlight }) => (
            <div
              key={label}
              className={cn(
                'rounded-xl border border-white/5 bg-cards p-4 transition-all',
                highlight && 'border-primary/20',
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('h-4 w-4', highlight ? 'text-primary' : 'text-muted')} />
                <span className="text-[10px] font-medium text-muted uppercase tracking-wider">{label}</span>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                highlight ? 'text-primary' : 'text-white',
              )}>
                {value}{suffix && <span className="text-sm font-normal text-muted ml-0.5">{suffix}</span>}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* 30-Day Completion Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/5 bg-cards p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-white">Completion Rate (Last 30 Days)</h2>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#A1A1AA' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tick={{ fontSize: 10, fill: '#A1A1AA' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                tickFormatter={(v: number) => (v === 0 ? 'Miss' : 'Done')}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#A1A1AA' }}
              />
              <Area
                type="stepAfter"
                dataKey="completed"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/5 bg-cards p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-white">Activity Heatmap</h2>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={cn(
                  'text-center text-[9px] font-medium text-muted/60',
                  // Only show some labels to avoid crowding
                  i % 2 === 0 ? 'block' : 'hidden sm:block',
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid - simplified to show 12 weeks */}
          <div className="flex gap-0.5 overflow-x-auto pb-2">
            {calendarWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5 shrink-0">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date}: ${day.completed ? 'Completed' : 'Missed'}`}
                    className={cn(
                      'h-3 w-3 rounded-sm transition-colors',
                      day.completed
                        ? 'bg-green-500/70 hover:bg-green-400'
                        : 'bg-white/5 hover:bg-white/10',
                    )}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="text-[9px] text-muted">Less</span>
            {[0, 1].map((v) => (
              <div
                key={v}
                className={cn(
                  'h-2.5 w-2.5 rounded-sm',
                  v ? 'bg-green-500/70' : 'bg-white/5',
                )}
              />
            ))}
            <span className="text-[9px] text-muted">More</span>
          </div>
        </motion.div>

        {/* Monthly Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-white/5 bg-cards p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-white">Monthly Breakdown</h2>
          </div>

          <div className="space-y-3">
            {monthlyStats.map(({ month, completions, days, rate }) => {
              const [year, monthNum] = month.split('-');
              const monthName = MONTH_LABELS[parseInt(monthNum) - 1];

              return (
                <div key={month} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{monthName} {year}</span>
                    <span className="text-[10px] text-muted">
                      {completions} days · {rate}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    />
                  </div>
                </div>
              );
            })}

            {monthlyStats.length === 0 && (
              <p className="text-xs text-muted text-center py-4">No data yet. Keep going!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
