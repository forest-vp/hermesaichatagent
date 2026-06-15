'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { insights } from '@/lib/analytics-data';

export default function InsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-primary/30 bg-cards/80 p-6 backdrop-blur-sm shadow-glow relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/[0.03] pointer-events-none" />
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-600/5 blur-2xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-4 w-4 text-glow" />
          </div>
          <h3 className="text-base font-semibold text-glow">AI Insights</h3>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              className="group relative rounded-xl border border-primary/10 bg-primary/[0.04] p-4 hover:bg-primary/[0.08] hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{insight.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white leading-snug">
                    {insight.text}
                  </p>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed">
                    {insight.detail}
                  </p>
                </div>
              </div>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
