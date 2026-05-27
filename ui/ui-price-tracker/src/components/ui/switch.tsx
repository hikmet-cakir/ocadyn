import * as React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
  size = 'md',
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'md' ? 'h-7 w-12' : 'h-6 w-11',
        checked ? 'bg-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]' : 'bg-muted',
        className,
      )}
      style={checked ? { boxShadow: '0 0 0 0 transparent, inset 0 1px 2px rgba(0,0,0,0.06)' } : undefined}
    >
      <span
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-md transition-transform duration-200 ease-out',
          size === 'md' ? 'size-6' : 'size-5',
          checked ? (size === 'md' ? 'translate-x-5' : 'translate-x-5') : 'translate-x-0',
        )}
      />
    </button>
  );
}
