'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import GoalCard from '@/components/goals/GoalCard';
import GoalModal from '@/components/goals/GoalModal';
import DeleteModal from '@/components/goals/DeleteModal';
import { supabase } from '@/lib/supabase/client';
import type { Goal, Milestone } from '@/types/database.types';

type StatusFilter = 'all' | 'active' | 'completed' | 'archived';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

// Extend Goal with priority field (stored in app, may be added to DB)
interface GoalWithPriority extends Goal {
  priority: 'high' | 'medium' | 'low';
}

interface GoalsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'On Hold' },
];

const priorityFilters: { value: PriorityFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'low', label: 'Low', color: 'bg-emerald-500' },
];

function migrateStatus(status: string): 'active' | 'completed' | 'archived' {
  if (status === 'completed' || status === 'archived' || status === 'active') return status;
  return 'active';
}

function assignPriority(goal: Goal): 'high' | 'medium' | 'low' {
  // Derive priority from goal data if not stored in DB yet
  // Use a hash of the ID for deterministic assignment
  const hash = goal.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  return priorities[hash % 3];
}

export default function GoalsPage({ searchParams }: GoalsPageProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithPriority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setGoals(
          data.map((g: any) => ({ ...g, priority: assignPriority(g), status: migrateStatus(g.status) }))
        );
      }
      setLoading(false);
    }
    fetchGoals();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithPriority | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalWithPriority | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      // Status filter
      if (statusFilter !== 'all' && goal.status !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== 'all' && goal.priority !== priorityFilter) return false;
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          goal.title.toLowerCase().includes(q) ||
          (goal.description?.toLowerCase().includes(q) ?? false) ||
          (goal.category?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [goals, statusFilter, priorityFilter, searchQuery]);

  const handleCreateGoal = async (data: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    targetDate: string;
    milestones: { id: string; title: string }[];
  }) => {
    setActionLoading(true);
    try {
      // Create goal in Supabase
      const { data: newGoal, error } = await supabase
        .from('goals')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // placeholder; use auth.uid() in production
          title: data.title,
          description: data.description || null,
          category: data.category,
          target_date: data.targetDate || null,
          status: 'active' as const,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Create milestones
      if (data.milestones.length > 0) {
        await supabase.from('milestones').insert(
          data.milestones.map((m) => ({
            goal_id: newGoal.id,
            title: m.title,
            completed: false,
          }))
        );
      }

      const goalWithPriority: GoalWithPriority = {
        ...newGoal,
        priority: data.priority,
        status: 'active',
      };

      setGoals((prev) => [goalWithPriority, ...prev]);
      setIsModalOpen(false);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditGoal = async (data: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    targetDate: string;
    milestones: { id: string; title: string }[];
  }) => {
    if (!editingGoal) return;
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
        .eq('id', editingGoal.id);

      if (error) throw error;

      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? {
                ...g,
                title: data.title,
                description: data.description || null,
                category: data.category,
                target_date: data.targetDate || null,
                priority: data.priority,
              }
            : g
        )
      );
      setEditingGoal(null);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('goals').delete().eq('id', deletingGoal.id);
      if (error) throw error;
      setGoals((prev) => prev.filter((g) => g.id !== deletingGoal.id));
      setDeletingGoal(null);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) setEditingGoal(goal);
  };

  const handleDelete = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) setDeletingGoal(goal);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Goals
          </h1>
          <p className="text-muted mt-1">Track and achieve your goals</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                statusFilter === tab.value
                  ? 'bg-primary/15 text-primary shadow-glow'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {priorityFilters.map((pf) => (
            <button
              key={pf.value}
              onClick={() => setPriorityFilter(pf.value)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                priorityFilter === pf.value
                  ? 'bg-white/10 text-white'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )}
            >
              {pf.color && (
                <span className={cn('h-2 w-2 rounded-full', pf.color)} />
              )}
              {pf.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 lg:max-w-xs lg:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals..."
            className={cn(
              'flex h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-muted/50 transition-all duration-200',
              'focus:outline-none focus:border-glow/60 focus:ring-2 focus:ring-glow/20',
              'hover:border-white/20'
            )}
          />
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                title={goal.title}
                description={goal.description}
                category={goal.category}
                priority={goal.priority}
                progress={goal.progress}
                targetDate={goal.target_date}
                status={goal.status}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Target className="h-10 w-10 text-muted" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'No matching goals'
              : 'No goals yet'}
          </h3>
          <p className="text-muted max-w-sm mb-6">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters or search query to find what you\'re looking for.'
              : 'Start your journey by creating your first goal. Break it down into milestones and track your progress.'}
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first goal
            </Button>
          )}
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Create Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGoal}
        mode="create"
      />

      {/* Edit Modal */}
      <GoalModal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSubmit={handleEditGoal}
        initialData={editingGoal ?? undefined}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={!!deletingGoal}
        goalTitle={deletingGoal?.title ?? ''}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteGoal}
        loading={actionLoading}
      />
    </div>
  );
}
