'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  Flag,
  BarChart3,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import MilestoneItem from '@/components/goals/MilestoneItem';
import GoalModal from '@/components/goals/GoalModal';
import DeleteModal from '@/components/goals/DeleteModal';
import { supabase } from '@/lib/supabase/client';
import type { Goal, Milestone } from '@/types/database.types';

interface GoalWithPriority extends Goal {
  priority: 'high' | 'medium' | 'low';
}

interface GoalDetailPageProps {
  params: { id: string };
}

const priorityConfig = {
  high: { label: 'High', variant: 'danger' as const, color: 'bg-red-500', textColor: 'text-red-400' },
  medium: { label: 'Medium', variant: 'warning' as const, color: 'bg-amber-500', textColor: 'text-amber-400' },
  low: { label: 'Low', variant: 'success' as const, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
};

const categoryColors: Record<string, string> = {
  Work: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Health: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Personal: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Finance: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Education: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Fitness: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  Custom: 'bg-white/10 text-white/70 border-white/10',
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
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// SVG Progress Ring component
function ProgressRing({
  progress,
  size = 180,
  strokeWidth = 12,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-white"
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-xs text-muted">complete</span>
      </div>
    </div>
  );
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const router = useRouter();
  const [goal, setGoal] = useState<GoalWithPriority | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoal() {
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('id', params.id)
        .single();
      if (goalData) {
        setGoal(goalData as GoalWithPriority);
        const { data: msData } = await supabase
          .from('goal_milestones')
          .select('*')
          .eq('goal_id', params.id)
          .order('created_at', { ascending: true });
        if (msData) setMilestones(msData as Milestone[]);
      }
      setLoading(false);
    }
    fetchGoal();
  }, [params.id]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Target className="w-12 h-12 text-muted mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Goal not found</h2>
        <Link href="/goals">
          <Button variant="outline">Back to Goals</Button>
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(goal.target_date);

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const pConfig = priorityConfig[goal.priority];

  // Calculate completion prediction
  const completionPrediction = useMemo(() => {
    if (goal.progress >= 100) return 'Completed! 🎉';
    if (goal.progress === 0 || !goal.target_date) return 'Not started';

    const created = new Date(goal.created_at);
    const target = new Date(goal.target_date);
    const totalDays = Math.ceil((target.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) return 'No target date';

    const rate = goal.progress / Math.max(elapsed, 1);
    if (rate <= 0) return 'Calculating...';

    const remainingProgress = 100 - goal.progress;
    const estimatedDays = Math.ceil(remainingProgress / rate);

    if (estimatedDays <= 0) return 'Almost there!';
    if (estimatedDays <= 7) return `${estimatedDays} days`;
    if (estimatedDays <= 30) return `${Math.ceil(estimatedDays / 7)} weeks`;
    return `${Math.ceil(estimatedDays / 30)} months`;
  }, [goal.progress, goal.created_at, goal.target_date]);

  const handleToggleMilestone = async (id: string) => {
    const milestone = milestones.find((m) => m.id === id);
    if (!milestone) return;

    const newCompleted = !milestone.completed;
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: newCompleted } : m))
    );

    // Update in Supabase
    await supabase
      .from('milestones')
      .update({ completed: newCompleted })
      .eq('id', id);

    // Recalculate progress
    const updatedMilestones = milestones.map((m) =>
      m.id === id ? { ...m, completed: newCompleted } : m
    );
    const completed = updatedMilestones.filter((m) => m.completed).length;
    const total = updatedMilestones.length;
    const newProgress = total > 0 ? (completed / total) * 100 : goal.progress;

    if (total > 0) {
      await supabase
        .from('goals')
        .update({ progress: Math.round(newProgress) })
        .eq('id', goal.id);
    }
  };

  const handleMarkComplete = async () => {
    setActionLoading(true);
    try {
      await supabase
        .from('goals')
        .update({ status: 'completed' as const, progress: 100 })
        .eq('id', goal.id);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await supabase.from('goals').delete().eq('id', goal.id);
      router.push('/dashboard/goals');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    targetDate: string;
    milestones: { id: string; title: string }[];
  }) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: data.title,
          description: data.description || null,
          category: data.category,
          target_date: data.targetDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  // Timeline data
  const timelineEvents = useMemo(() => {
    const events: { date: string; label: string; type: 'created' | 'milestone' | 'target' | 'today' }[] = [];

    events.push({
      date: goal.created_at,
      label: 'Goal created',
      type: 'created',
    });

    milestones.forEach((m) => {
      if (m.completed) {
        events.push({
          date: m.updated_at || m.created_at,
          label: `Milestone: ${m.title}`,
          type: 'milestone',
        });
      }
    });

    if (goal.target_date) {
      events.push({
        date: goal.target_date,
        label: 'Target date',
        type: 'target',
      });
    }

    events.push({
      date: new Date().toISOString(),
      label: 'Today',
      type: 'today',
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [goal, milestones]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/dashboard/goals"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-cards/80 backdrop-blur-xl p-6 lg:p-8 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Progress Ring */}
          <div className="flex justify-center lg:justify-start shrink-0">
            <ProgressRing progress={goal.progress} />
          </div>

          {/* Goal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {goal.category && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                    categoryColors[goal.category] || categoryColors.Custom
                  )}
                >
                  {goal.category}
                </span>
              )}
              <Badge variant={pConfig.variant}>
                <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', pConfig.color)} />
                {pConfig.label} Priority
              </Badge>
              {goal.status === 'completed' && <Badge variant="success">Completed</Badge>}
              {goal.status === 'archived' && <Badge variant="outline">On Hold</Badge>}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{goal.title}</h1>

            {goal.description && (
              <p className="text-muted text-sm leading-relaxed mb-4">{goal.description}</p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-muted text-xs mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  Days Remaining
                </div>
                <p className={cn(
                  'text-lg font-bold',
                  daysRemaining === null ? 'text-muted' :
                  daysRemaining < 0 ? 'text-red-400' :
                  daysRemaining <= 7 ? 'text-amber-400' : 'text-white'
                )}>
                  {daysRemaining === null ? '—' : daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : daysRemaining === 0 ? 'Today' : daysRemaining}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-muted text-xs mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created
                </div>
                <p className="text-lg font-bold text-white">
                  {formatShortDate(goal.created_at)}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-muted text-xs mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Prediction
                </div>
                <p className="text-lg font-bold text-white">{completionPrediction}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-muted text-xs mb-1">
                  <Flag className="h-3.5 w-3.5" />
                  Milestones
                </div>
                <p className="text-lg font-bold text-white">
                  {completedMilestones}/{milestones.length}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {goal.status !== 'completed' && (
                <Button size="sm" onClick={handleMarkComplete} disabled={actionLoading}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-cards/80 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Milestones
            </h2>
            <span className="text-sm text-muted">
              {completedMilestones} of {milestones.length} completed
            </span>
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <MilestoneItem
                  key={milestone.id}
                  id={milestone.id}
                  title={milestone.title}
                  completed={milestone.completed}
                  onToggle={handleToggleMilestone}
                  onDelete={() => {
                    // Delete milestone locally and in DB
                    setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));
                    supabase.from('milestones').delete().eq('id', milestone.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Flag className="h-8 w-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No milestones yet</p>
              <p className="text-xs text-muted/60 mt-1">
                Add milestones when editing this goal
              </p>
            </div>
          )}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-cards/80 backdrop-blur-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            Timeline
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

            <div className="space-y-4">
              {timelineEvents.map((event, i) => {
                const isToday = event.type === 'today';
                const isTarget = event.type === 'target';
                const isMilestone = event.type === 'milestone';

                return (
                  <div key={i} className="relative flex items-start gap-3 pl-6">
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2',
                        isToday
                          ? 'border-primary bg-primary/20'
                          : isTarget
                          ? 'border-amber-500 bg-amber-500/20'
                          : isMilestone
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-white/20 bg-white/10'
                      )}
                    />
                    <div>
                      <p className={cn(
                        'text-sm font-medium',
                        isToday ? 'text-primary' : 'text-white/80'
                      )}>
                        {event.label}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted flex items-center gap-1.5">
                <Zap className="h-3 w-3" />
                Overall Progress
              </span>
              <span className="text-xs font-semibold text-white">{Math.round(goal.progress)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  goal.progress >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-primary to-glow'
                )}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={{
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          priority: goal.priority,
          targetDate: goal.target_date,
          milestones: milestones.map((m) => ({ id: m.id, title: m.title })),
        }}
        mode="edit"
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        goalTitle={goal.title}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
