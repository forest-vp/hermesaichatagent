'use client';

import { cn } from '@/lib/utils';
import { Check, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  currentPlan?: boolean;
  buttonText: string;
  buttonDisabled?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export default function PricingCard({ plan, onSelect, loading }: PricingCardProps) {
  const highlighted = plan.highlighted;
  const isCurrent = plan.currentPlan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
        highlighted
          ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-cards shadow-glow'
          : 'border-white/10 bg-cards hover:border-white/20',
        isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-black'
      )}
    >
      {/* Badge */}
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
            <Zap className="h-3 w-3" />
            Current Plan
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'text-4xl font-extrabold',
            highlighted ? 'text-primary' : 'text-white'
          )}>
            {plan.price}
          </span>
          <span className="text-sm text-muted">{plan.period}</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(plan.id)}
        disabled={plan.buttonDisabled || loading}
        className={cn(
          'mb-8 w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200',
          plan.buttonDisabled
            ? 'cursor-not-allowed bg-white/5 text-muted'
            : highlighted
              ? 'bg-primary text-white shadow-glow hover:bg-primary/90 hover:shadow-glow-lg'
              : 'bg-white/10 text-white hover:bg-white/20',
          isCurrent && 'border border-primary/50 bg-primary/10 text-primary'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          plan.buttonText
        )}
      </button>

      {/* Features list */}
      <ul className="flex-1 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={cn(
              'mt-0.5 h-4 w-4 shrink-0',
              highlighted ? 'text-primary' : 'text-green-400'
            )} />
            <span className="text-sm text-white/80">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Glow effect for highlighted card */}
      {highlighted && (
        <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 opacity-50 blur-sm" />
      )}
    </motion.div>
  );
}
