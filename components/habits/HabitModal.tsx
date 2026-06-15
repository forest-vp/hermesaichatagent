'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createHabit, updateHabit, type Habit } from '@/lib/habits';

const ICONS = ['💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎵', '☕', '🛏️', '🧹', '🎨', '📝'];
const COLORS = [
  { name: 'blue', class: 'bg-blue-500', ring: 'ring-blue-500' },
  { name: 'green', class: 'bg-green-500', ring: 'ring-green-500' },
  { name: 'purple', class: 'bg-purple-500', ring: 'ring-purple-500' },
  { name: 'red', class: 'bg-red-500', ring: 'ring-red-500' },
  { name: 'yellow', class: 'bg-yellow-500', ring: 'ring-yellow-500' },
  { name: 'pink', class: 'bg-pink-500', ring: 'ring-pink-500' },
  { name: 'orange', class: 'bg-orange-500', ring: 'ring-orange-500' },
  { name: 'cyan', class: 'bg-cyan-500', ring: 'ring-cyan-500' },
];
const FREQUENCIES = ['Daily', 'Weekdays', 'Weekends', 'Custom'] as const;

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  habit?: Habit | null;
}

export default function HabitModal({ isOpen, onClose, onSave, habit }: HabitModalProps) {
  const [name, setName] = useState(habit?.name ?? '');
  const [icon, setIcon] = useState(habit?.icon ?? '💪');
  const [color, setColor] = useState(habit?.color ?? 'blue');
  const [frequency, setFrequency] = useState<string>(habit?.frequency ?? 'Daily');
  const [targetCount, setTargetCount] = useState(habit?.target_count ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!habit;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const userId = (await (await import('@/lib/supabase/client')).supabase.auth.getUser()).data.user?.id ?? '';

      if (isEditing && habit) {
        const updated = await updateHabit(habit.id, {
          name: name.trim(),
          icon,
          color,
          frequency,
          target_count: targetCount,
        });
        onSave(updated);
      } else {
        const created = await createHabit({
          user_id: userId,
          name: name.trim(),
          icon,
          color,
          frequency,
          target_count: targetCount,
        });
        onSave(created);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-6">
              {isEditing ? 'Edit Habit' : 'New Habit'}
            </h2>

            {/* Name */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted mb-2">Habit Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning Run"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-muted/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Icon Picker */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted mb-2">Icon</label>
              <div className="grid grid-cols-7 gap-2">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-all',
                      icon === emoji
                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                        : 'bg-white/5 hover:bg-white/10',
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all',
                      c.class,
                      color === c.name
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111111] scale-110'
                        : 'opacity-50 hover:opacity-80',
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted mb-2">Frequency</label>
              <div className="grid grid-cols-4 gap-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={cn(
                      'rounded-lg py-2 text-xs font-medium transition-all',
                      frequency === f
                        ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                        : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Count */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-muted mb-2">Target per Day</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-lg font-bold"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-white w-8 text-center">{targetCount}</span>
                <button
                  onClick={() => setTargetCount(Math.min(10, targetCount + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="mb-4 text-xs text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Create Habit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
