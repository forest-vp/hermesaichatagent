'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

interface FeatureComparisonProps {
  className?: string;
}

const features: Feature[] = [
  { name: 'Goal tracking', free: true, pro: true, premium: true },
  { name: 'Habit building', free: true, pro: true, premium: true },
  { name: 'Streak tracking', free: true, pro: true, premium: true },
  { name: 'Basic analytics', free: true, pro: true, premium: true },
  { name: 'Achievement badges', free: true, pro: true, premium: true },
  { name: 'Goal categories', free: '3', pro: 'Unlimited', premium: 'Unlimited' },
  { name: 'Active goals', free: '5', pro: '25', premium: 'Unlimited' },
  { name: 'AI Coach insights', free: false, pro: true, premium: true },
  { name: 'Advanced analytics & reports', free: false, pro: true, premium: true },
  { name: 'Export data (CSV/PDF)', free: false, pro: true, premium: true },
  { name: 'Priority support', free: false, pro: true, premium: true },
  { name: 'Team collaboration', free: false, pro: false, premium: true },
  { name: 'Custom integrations', free: false, pro: false, premium: true },
  { name: 'White-label reports', free: false, pro: false, premium: true },
  { name: 'Dedicated account manager', free: false, pro: false, premium: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium text-primary">{value}</span>;
  }
  if (value) {
    return <Check className="mx-auto h-5 w-5 text-green-400" />;
  }
  return <X className="mx-auto h-5 w-5 text-white/20" />;
}

export default function FeatureComparison({ className }: FeatureComparisonProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-white/10 bg-cards', className)}>
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 border-b border-white/10 bg-cards px-6 py-4">
        <div className="text-sm font-medium text-muted">Feature</div>
        <div className="text-center text-sm font-bold text-white">Free</div>
        <div className="text-center text-sm font-bold text-primary">Pro</div>
        <div className="text-center text-sm font-bold text-purple-400">Premium</div>
      </div>

      {/* Features */}
      <div className="divide-y divide-white/5">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              'grid grid-cols-4 gap-4 px-6 py-4 transition-colors',
              index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
            )}
          >
            <div className="flex items-center text-sm text-white/70">{feature.name}</div>
            <div className="flex items-center justify-center">
              <FeatureValue value={feature.free} />
            </div>
            <div className="flex items-center justify-center">
              <FeatureValue value={feature.pro} />
            </div>
            <div className="flex items-center justify-center">
              <FeatureValue value={feature.premium} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
