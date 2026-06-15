import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type = 'text', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-white/80">{label}</label>}
      <div className="relative">
        {leftIcon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</div>}
        <input
          ref={ref}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-muted/50 transition-all duration-200',
            'focus:border-primary/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
