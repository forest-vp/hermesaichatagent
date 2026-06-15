'use client';

import { cn } from '@/lib/utils';
import { Crown, Zap, X } from 'lucide-react';

interface PlanBadgeProps {
  planType: 'free' | 'pro' | 'premium' | string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
  className?: string;
}

const planConfig: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  free: {
    label: 'Free',
    icon: Zap,
    className: 'bg-white/10 text-white border-white/20',
  },
  pro: {
    label: 'Pro',
    icon: Crown,
    className: 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
  },
};

export default function PlanBadge({
  planType,
  subscriptionStatus,
  currentPeriodEnd,
  className,
}: PlanBadgeProps) {
  const config = planConfig[planType] ?? planConfig.free;
  const Icon = config.icon;

  const isCancelled = subscriptionStatus === 'cancelled';
  const isPastDue = subscriptionStatus === 'past_due';

  return (
    <div className={cn('space-y-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
          config.className
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>

      {isCancelled && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <X className="h-3 w-3" />
          Cancelled
          {currentPeriodEnd && (
            <span className="text-muted">
              · Access until {new Date(currentPeriodEnd).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </p>
      )}

      {isPastDue && (
        <p className="text-xs text-yellow-400">
          Payment overdue — please update your billing
        </p>
      )}
    </div>
  );
}
