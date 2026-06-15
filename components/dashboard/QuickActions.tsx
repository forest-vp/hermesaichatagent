'use client';

import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Sparkles } from 'lucide-react';

const actions = [
  {
    label: 'Add Goal',
    icon: Plus,
    color: 'from-primary to-blue-600',
    shadow: 'shadow-glow',
  },
  {
    label: 'Log Habit',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  },
  {
    label: 'Ask AI',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
  },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-cards/80 p-5 backdrop-blur-sm"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${action.color} p-4 text-white ${action.shadow} transition-all duration-200 hover:brightness-110`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
