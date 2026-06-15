'use client';

import * as React from 'react';
import { useState } from 'react';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Milestone {
  id: string;
  title: string;
}

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  milestones: Milestone[];
}

interface FormErrors {
  title?: string;
  targetDate?: string;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    priority: 'low' | 'medium' | 'high';
    targetDate?: string | null;
    target_date?: string | null;
    milestones?: Milestone[];
  };
  mode?: 'create' | 'edit';
}

const categories = ['Work', 'Health', 'Personal', 'Finance', 'Education', 'Fitness', 'Custom'];

const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: 'bg-emerald-500', ring: 'ring-emerald-500/30', desc: 'Nice to have' },
  { value: 'medium' as const, label: 'Medium', color: 'bg-amber-500', ring: 'ring-amber-500/30', desc: 'Important' },
  { value: 'high' as const, label: 'High', color: 'bg-red-500', ring: 'ring-red-500/30', desc: 'Critical' },
];

export default function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: GoalModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? categories[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority ?? 'medium');
  const [targetDate, setTargetDate] = useState(initialData?.targetDate ?? '');
  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones ?? []
  );
  const [newMilestone, setNewMilestone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '');
      setDescription(initialData?.description ?? '');
      setCategory(initialData?.category ?? categories[0]);
      setPriority(initialData?.priority ?? 'medium');
      setTargetDate(initialData?.targetDate ?? '');
      setMilestones(initialData?.milestones ?? []);
      setNewMilestone('');
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Goal title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (targetDate) {
      const date = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (mode === 'create' && date < today) {
        newErrors.targetDate = 'Target date cannot be in the past';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        targetDate,
        milestones,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const addMilestone = () => {
    const trimmed = newMilestone.trim();
    if (!trimmed) return;
    setMilestones((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed },
    ]);
    setNewMilestone('');
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Goal' : 'Edit Goal'}
      description={mode === 'create' ? 'Define a new goal to track your progress' : 'Update your goal details'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            Goal Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Learn TypeScript in 3 months"
            className={cn(
              'flex h-11 w-full rounded-lg border bg-white/5 px-4 py-2 text-sm text-white placeholder:text-muted/50 transition-all duration-200',
              'focus:outline-none focus:border-glow/60 focus:ring-2 focus:ring-glow/20 focus:bg-white/[0.07]',
              'hover:border-white/20',
              errors.title ? 'border-red-500/60' : 'border-white/10'
            )}
          />
          {errors.title && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your goal in detail..."
            rows={3}
            className={cn(
              'flex w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-muted/50 transition-all duration-200 resize-none',
              'focus:outline-none focus:border-glow/60 focus:ring-2 focus:ring-glow/20 focus:bg-white/[0.07]',
              'hover:border-white/20'
            )}
          />
        </div>

        {/* Category & Priority row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(
                'flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all duration-200',
                'focus:outline-none focus:border-glow/60 focus:ring-2 focus:ring-glow/20',
                'hover:border-white/20 appearance-none cursor-pointer'
              )}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-cards text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Target Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={cn(
                  'flex h-11 w-full rounded-lg border bg-white/5 px-4 py-2 text-sm text-white transition-all duration-200',
                  'focus:outline-none focus:border-glow/60 focus:ring-2 focus:ring-glow/20',
                  'hover:border-white/20',
                  '[color-scheme:dark]',
                  errors.targetDate ? 'border-red-500/60' : 'border-white/10'
                )}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            </div>
            {errors.targetDate && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {errors.targetDate}
              </p>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-3">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200',
                  priority === opt.value
                    ? `border-white/20 bg-white/5 ring-2 ${opt.ring}`
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('h-3 w-3 rounded-full', opt.color)} />
                  <span className={cn(
                    'text-sm font-medium',
                    priority === opt.value ? 'text-white' : 'text-white/60'
                  )}>
                    {opt.label}
                  </span>
                </div>
                <span className="text-[10px] text-muted">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Milestones
          </label>
          <div className="space-y-2 mb-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="group flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <span className="flex-1 text-sm text-white/70">{milestone.title}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="rounded p-1 text-muted opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMilestone();
                }
              }}
              placeholder="Add a milestone..."
              className={cn(
                'flex h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/50 transition-all duration-200',
                'focus:outline-none focus:border-glow/60 focus:ring-2 focus:ring-glow/20',
                'hover:border-white/20'
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMilestone}
              disabled={!newMilestone.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
              ? 'Create Goal'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
