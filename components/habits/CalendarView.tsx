'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  fetchHabits,
  fetchAllEntriesForDate,
  type Habit,
  type HabitEntry,
} from '@/lib/habits';

interface DayData {
  date: string;
  day: number;
  completionPercent: number;
  entries: HabitEntry[];
  isCurrentMonth: boolean;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEntries, setDayEntries] = useState<Record<string, HabitEntry[]>>({});
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Fetch habits on mount
  useEffect(() => {
    fetchHabits().then(setHabits).catch(console.error);
  }, []);

  // Fetch all entries for the visible month
  useEffect(() => {
    const fetchMonthEntries = async () => {
      setLoading(true);
      try {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        // Fetch entries for each habit
        const allEntriesMap: Record<string, HabitEntry[]> = {};
        for (const habit of habits) {
          const { supabase } = await import('@/lib/supabase/client');
          const { data } = await supabase
            .from('habit_entries')
            .select('*')
            .eq('habit_id', habit.id)
            .gte('date', startDate)
            .lte('date', endDate);

          if (data) {
            for (const entry of data) {
              if (!allEntriesMap[entry.date]) {
                allEntriesMap[entry.date] = [];
              }
              allEntriesMap[entry.date].push(entry);
            }
          }
        }
        setDayEntries(allEntriesMap);
      } catch (err) {
        console.error('Failed to fetch entries:', err);
      } finally {
        setLoading(false);
      }
    };

    if (habits.length > 0) {
      fetchMonthEntries();
    }
  }, [year, month, habits]);

  const calendarDays = useMemo(() => {
    const days: (DayData | null)[] = [];
    const totalHabits = habits.length;

    // Empty cells for days before the first
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entries = dayEntries[dateStr] || [];
      const completedCount = totalHabits > 0
        ? entries.filter(e => {
            const habit = habits.find(h => h.id === e.habit_id);
            return habit && e.count >= habit.target_count;
          }).length
        : 0;

      days.push({
        date: dateStr,
        day: d,
        completionPercent: totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0,
        entries,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [year, month, habits, dayEntries, daysInMonth, firstDayOfWeek]);

  const selectedDayData = selectedDay ? calendarDays.find(d => d?.date === selectedDay) : null;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getHeatColor = (percent: number) => {
    if (percent === 0) return 'bg-white/5';
    if (percent <= 25) return 'bg-green-500/20';
    if (percent <= 50) return 'bg-green-500/40';
    if (percent <= 75) return 'bg-green-500/60';
    return 'bg-green-500/80';
  };

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-white capitalize">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-white transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <div key={label} className="py-1 text-center text-[10px] font-medium text-muted/60 uppercase tracking-wider">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const isToday = (() => {
            const today = new Date();
            return (
              day.day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            );
          })();

          const isSelected = selectedDay === day.date;

          return (
            <motion.button
              key={day.date}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day.date)}
              className={cn(
                'relative aspect-square rounded-lg flex items-center justify-center text-xs transition-all',
                getHeatColor(day.completionPercent),
                isToday && 'ring-1 ring-primary',
                isSelected && 'ring-2 ring-white',
              )}
            >
              <span className={cn(
                'font-medium',
                day.completionPercent > 50 ? 'text-white' : 'text-muted',
              )}>
                {day.day}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <span className="text-[10px] text-muted">Less</span>
        {[0, 25, 50, 75, 100].map((p) => (
          <div
            key={p}
            className={cn('h-2.5 w-2.5 rounded-sm', getHeatColor(p))}
          />
        ))}
        <span className="text-[10px] text-muted">More</span>
      </div>

      {/* Selected Day Detail */}
      <AnimatePresence>
        {selectedDay && selectedDayData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">
                  {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-muted hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedDayData.entries.length === 0 ? (
                <p className="text-xs text-muted">No habits completed this day</p>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => {
                    const entry = selectedDayData.entries.find(e => e.habit_id === habit.id);
                    const completed = entry && entry.count >= habit.target_count;

                    return (
                      <div key={habit.id} className="flex items-center gap-3">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-xs text-white flex-1">{habit.name}</span>
                        <span className={cn(
                          'text-[10px] font-semibold',
                          completed ? 'text-green-400' : 'text-muted',
                        )}>
                          {completed ? '✓' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completion bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500/60 to-green-400 transition-all duration-500"
                  style={{ width: `${selectedDayData.completionPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-muted text-right">
                {Math.round(selectedDayData.completionPercent)}% complete
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
