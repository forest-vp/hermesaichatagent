'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
}

export default function SettingsSection({
  title,
  description,
  icon,
  children,
  className,
  variant = 'default',
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-xl p-6 sm:p-8 transition-all duration-200',
        variant === 'default' &&
          'border-white/10 bg-cards/80 hover:border-white/15',
        variant === 'danger' &&
          'border-red-500/20 bg-red-950/20 hover:border-red-500/30',
        className
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1.5">
          {icon && (
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                variant === 'default'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-red-500/10 text-red-400'
              )}
            >
              {icon}
            </span>
          )}
          <h2
            className={cn(
              'text-xl font-bold',
              variant === 'default' ? 'text-white' : 'text-red-100'
            )}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p
            className={cn(
              'text-sm',
              variant === 'default' ? 'text-muted' : 'text-red-300/60'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
