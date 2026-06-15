'use client';

import { cn } from '@/lib/utils';

interface WeeklyProgressProps {
  completed: boolean[];
  size?: 'sm' | 'md';
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function WeeklyProgress({ completed, size = 'md' }: WeeklyProgressProps) {
  const today = new Date();

  return (
    <div className="flex items-center justify-between gap-1">
      {completed.map((done, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const label = DAY_LABELS[d.getDay()];
        const isToday = i === 6;

        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span
              className={cn(
                'text-[9px] font-medium uppercase tracking-wider',
                isToday ? 'text-primary' : 'text-muted/60',
              )}
            >
              {label}
            </span>
            <div
              className={cn(
                'rounded-full transition-all duration-500',
                size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
                done
                  ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  : 'bg-white/10',
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
