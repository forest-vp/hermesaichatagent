import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-white/80 border border-white/10',
        primary: 'bg-primary/15 text-primary border border-primary/20',
        success: 'bg-success/15 text-success border border-success/20',
        warning: 'bg-warning/15 text-warning border border-warning/20',
        danger: 'bg-danger/15 text-danger border border-danger/20',
        purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
        outline: 'bg-transparent text-muted border border-white/15',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
