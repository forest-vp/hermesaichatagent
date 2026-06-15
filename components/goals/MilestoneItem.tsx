import * as React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
}

export default function MilestoneItem({
  id,
  title,
  completed,
  onToggle,
  onDelete,
  readonly = false,
}: MilestoneItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-all duration-200',
        'hover:border-white/10 hover:bg-white/[0.04]',
        completed && 'opacity-60'
      )}
    >
      <button
        onClick={() => !readonly && onToggle(id)}
        disabled={readonly}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
          completed
            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
            : 'border-white/20 bg-transparent hover:border-glow/50',
          readonly && 'cursor-default'
        )}
      >
        {completed && <Check className="h-3 w-3" />}
      </button>
      <span
        className={cn(
          'flex-1 text-sm text-white/80 transition-all duration-200',
          completed && 'line-through text-white/40'
        )}
      >
        {title}
      </span>
      {!readonly && (
        <button
          onClick={() => onDelete(id)}
          className="shrink-0 rounded-md p-1 text-muted opacity-0 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
