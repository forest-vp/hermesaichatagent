'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Calendar, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface GoalCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  targetDate: string | null;
  status: 'active' | 'completed' | 'archived';
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Work: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Health: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Personal: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Finance: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Education: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Fitness: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  Custom: 'bg-white/10 text-white/70 border-white/10',
};

const priorityConfig = {
  high: { label: 'High', variant: 'danger' as const, color: 'text-red-400', bg: 'bg-red-500' },
  medium: { label: 'Medium', variant: 'warning' as const, color: 'text-amber-400', bg: 'bg-amber-500' },
  low: { label: 'Low', variant: 'success' as const, color: 'text-emerald-400', bg: 'bg-emerald-500' },
};

function getDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function GoalCard({
  id,
  title,
  description,
  category,
  priority,
  progress,
  targetDate,
  status,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const daysRemaining = getDaysRemaining(targetDate);
  const pConfig = priorityConfig[priority];
  const truncatedDesc = description && description.length > 80
    ? description.slice(0, 80) + '...'
    : description;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border border-white/10 bg-cards/80 backdrop-blur-xl p-5 transition-all duration-300',
        'hover:border-glow/30 hover:shadow-glow',
        status === 'completed' && 'opacity-70'
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <Link href={`/dashboard/goals/${id}`} className="block group/title">
            <h3 className="text-base font-semibold text-white truncate group-hover/title:text-glow transition-colors">
              {title}
            </h3>
          </Link>
          {truncatedDesc && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{truncatedDesc}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); onEdit(id); }}
            className="rounded-lg p-1.5 text-muted opacity-0 transition-all duration-200 hover:bg-white/10 hover:text-white group-hover:opacity-100"
            title="Edit goal"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(id); }}
            className="rounded-lg p-1.5 text-muted opacity-0 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
            title="Delete goal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="relative flex flex-wrap items-center gap-2 mb-4">
        {category && (
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border', categoryColors[category] || categoryColors.Custom)}>
            {category}
          </span>
        )}
        <Badge variant={pConfig.variant}>
          <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', pConfig.bg)} />
          {pConfig.label}
        </Badge>
        {status === 'completed' && (
          <Badge variant="success">Completed</Badge>
        )}
        {status === 'archived' && (
          <Badge variant="outline">On Hold</Badge>
        )}
      </div>

      {/* Progress */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted">Progress</span>
          <span className="text-xs font-semibold text-white">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full transition-colors',
              progress >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : progress >= 60
                ? 'bg-gradient-to-r from-primary to-glow'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            )}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(targetDate)}</span>
        </div>
        {daysRemaining !== null && status !== 'completed' && (
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium',
            daysRemaining < 0 ? 'text-red-400' : daysRemaining <= 7 ? 'text-amber-400' : 'text-muted'
          )}>
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysRemaining < 0
                ? `${Math.abs(daysRemaining)}d overdue`
                : daysRemaining === 0
                ? 'Due today'
                : `${daysRemaining}d left`}
            </span>
          </div>
        )}
        {status === 'completed' && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <Target className="h-3.5 w-3.5" />
            <span>Done</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
