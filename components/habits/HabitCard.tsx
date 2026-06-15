'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  fetchHabits,
  fetchAllEntriesForDate,
  toggleHabitEntry,
  type Habit,
  type HabitEntry,
} from '@/lib/habits';
import WeeklyProgress from '@/components/habits/WeeklyProgress';

interface HabitWithStatus extends Habit {
  todayCompleted: boolean;
  todayCount: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  weeklyCompleted: boolean[];
}

export default function HabitCard({ habit, onToggle, onEdit }: {
  habit: HabitWithStatus;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    pink: 'border-pink-500',
    orange: 'border-orange-500',
    cyan: 'border-cyan-500',
  };

  const bgColorMap: Record<string, string> = {
    blue: 'hover:bg-blue-500/5',
    green: 'hover:bg-green-500/5',
    purple: 'hover:bg-purple-500/5',
    red: 'hover:bg-red-500/5',
    yellow: 'hover:bg-yellow-500/5',
    pink: 'hover:bg-pink-500/5',
    orange: 'hover:bg-orange-500/5',
    cyan: 'hover:bg-cyan-500/5',
  };

  const glowColorMap: Record<string, string> = {
    blue: 'shadow-blue-500/30',
    green: 'shadow-green-500/30',
    purple: 'shadow-purple-500/30',
    red: 'shadow-red-500/30',
    yellow: 'shadow-yellow-500/30',
    pink: 'shadow-pink-500/30',
    orange: 'shadow-orange-500/30',
    cyan: 'shadow-cyan-500/30',
  };

  const isCompleted = habit.todayCompleted;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border-l-4 border border-white/5 bg-cards backdrop-blur-sm transition-all duration-300',
        colorMap[habit.color] || 'border-primary',
        bgColorMap[habit.color] || 'hover:bg-white/5',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{habit.icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{habit.name}</h3>
            <p className="text-[11px] text-muted capitalize">{habit.frequency} · {habit.target_count}/day</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-muted/40 hover:text-muted transition-colors text-xs"
        >
          ✎
        </button>
      </div>

      {/* Streak + Stats */}
      <div className="flex items-center gap-4 px-4 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold text-white">{habit.currentStreak}</span>
          <span className="text-[10px] text-muted">day streak</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted">Best:</span>
          <span className="text-[11px] font-semibold text-glow">{habit.bestStreak}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted">Total:</span>
          <span className="text-[11px] font-semibold text-glow">{habit.totalCompletions}</span>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="px-4 pb-3">
        <WeeklyProgress completed={habit.weeklyCompleted} />
      </div>

      {/* Check-in Button */}
      <div className="px-4 pb-4">
        <button
          onClick={onToggle}
          className={cn(
            'w-full rounded-lg py-2 text-xs font-semibold transition-all duration-300',
            isCompleted
              ? 'bg-primary/20 text-primary shadow-glow ' + (glowColorMap[habit.color] || '')
              : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white',
          )}
        >
          {isCompleted ? '✓ Completed Today' : 'Check In'}
        </button>
      </div>

      {/* Completed glow overlay */}
      {isCompleted && (
        <div className={cn(
          'pointer-events-none absolute inset-0 rounded-xl opacity-10',
          habit.color === 'blue' ? 'bg-blue-500' :
          habit.color === 'green' ? 'bg-green-500' :
          habit.color === 'purple' ? 'bg-purple-500' :
          habit.color === 'red' ? 'bg-red-500' :
          habit.color === 'yellow' ? 'bg-yellow-500' :
          habit.color === 'pink' ? 'bg-pink-500' :
          habit.color === 'orange' ? 'bg-orange-500' :
          habit.color === 'cyan' ? 'bg-cyan-500' :
          'bg-primary',
        )} />
      )}
    </div>
  );
}
