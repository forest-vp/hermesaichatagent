'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Repeat, Grid3X3, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  fetchHabits,
  fetchAllEntriesForDate,
  toggleHabitEntry,
  calculateStreak,
  type Habit,
  type HabitEntry,
} from '@/lib/habits';
import HabitCard from '@/components/habits/HabitCard';
import HabitModal from '@/components/habits/HabitModal';
import HabitCalendarView from '@/components/habits/CalendarView';

interface HabitWithStatus extends Habit {
  todayCompleted: boolean;
  todayCount: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  weeklyCompleted: boolean[];
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [_todayEntries, setTodayEntries] = useState<HabitEntry[]>([]);
  const [allEntries, setAllEntries] = useState<HabitEntry[]>([]);
  const [_updating, setUpdating] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    try {
      const habitsData = await fetchHabits();
      const entries = await fetchAllEntriesForDate(today);

      const { supabase } = await import('@/lib/supabase/client');
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const { data: allEntriesData } = await supabase
        .from('habit_entries')
        .select('*')
        .gte('date', ninetyDaysAgo.toISOString().split('T')[0]);

      const allEntriesList = allEntriesData ?? [];

      const habitsWithStatus: HabitWithStatus[] = habitsData.map((habit) => {
        const habitEntries = allEntriesList.filter(e => e.habit_id === habit.id);
        const todayEntry = entries.find(e => e.habit_id === habit.id);
        const todayCompleted = todayEntry ? todayEntry.count >= habit.target_count : false;

        const currentStreak = calculateStreak(habitEntries, habit.target_count);

        let bestStreak = 0;
        let tempStreak = 0;
        const sortedDates = [...new Set(habitEntries.map(e => e.date))].sort();
        let prevDate: Date | null = null;

        for (const dateStr of sortedDates) {
          const entry = habitEntries.find(e => e.date === dateStr);
          if (entry && entry.count >= habit.target_count) {
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

        const totalCompletions = habitEntries.filter(e => e.count >= habit.target_count).length;

        const weeklyCompleted: boolean[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const entry = habitEntries.find(e => e.date === dateStr);
          weeklyCompleted.push(entry ? entry.count >= habit.target_count : false);
        }

        return {
          ...habit,
          todayCompleted,
          todayCount: todayEntry?.count ?? 0,
          currentStreak,
          bestStreak,
          totalCompletions,
          weeklyCompleted,
        };
      });

      setHabits(habitsWithStatus);
      setTodayEntries(entries);
      setAllEntries(allEntriesList);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (habitId: string) => {
    setUpdating(habitId);
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      await toggleHabitEntry(habitId, today, habit.target_count);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleEdit = (habit: Habit | null) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingHabit(null);
    loadData();
  };

  const completedToday = habits.filter(h => h.todayCompleted).length;
  const totalHabits = habits.length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Repeat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Habits</h1>
            <p className="text-xs text-muted">Build consistency, one day at a time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg bg-white/5 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all',
                viewMode === 'grid'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted hover:text-white',
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all',
                viewMode === 'calendar'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted hover:text-white',
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          {/* New Habit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleEdit(null)}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-glow hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Habit</span>
          </motion.button>
        </div>
      </div>

      {/* Today's Summary Bar */}
      {totalHabits > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-white/5 bg-gradient-to-r from-primary/10 via-cards to-primary/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {completedToday} of {totalHabits} habits completed today
                </p>
                <p className="text-[11px] text-muted">
                  {completedToday === totalHabits
                    ? '🎉 All done! Great job!'
                    : `${totalHabits - completedToday} more to go`
                  }
                </p>
              </div>
            </div>

            {/* Progress ring */}
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${(completedToday / Math.max(totalHabits, 1)) * 94.2} 94.2`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
                {Math.round((completedToday / Math.max(totalHabits, 1)) * 100)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Repeat className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No habits yet</h3>
          <p className="text-sm text-muted text-center max-w-sm mb-6">
            Start building better habits today. Create your first habit and track your progress over time.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleEdit(null)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
          >
            <Plus className="h-4 w-4" />
            Create Your First Habit
          </motion.button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => handleToggle(habit.id)}
              onEdit={() => handleEdit(habit)}
            />
          ))}
        </div>
      ) : (
        <HabitCalendarView />
      )}

      {/* Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingHabit(null); }}
        onSave={handleSave}
        habit={editingHabit}
      />
    </div>
  );
}
