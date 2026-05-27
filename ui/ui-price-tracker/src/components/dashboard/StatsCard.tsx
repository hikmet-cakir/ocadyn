import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const accentStyles = {
  down: 'before:bg-success',
  up: 'before:bg-destructive',
  neutral: 'before:bg-primary',
} as const;

const iconStyles = {
  down: 'bg-success-soft text-success',
  up: 'bg-destructive-soft text-destructive',
  neutral: 'bg-primary-soft text-primary',
} as const;

export function StatsCard({
  title,
  subtitle,
  value,
  icon: Icon,
  trend = 'neutral',
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        'premium-card-hover group relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-[20px]',
        accentStyles[trend],
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5 pl-1">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {subtitle ? (
                <p className="mt-0.5 text-xs text-muted-foreground/80">{subtitle}</p>
              ) : null}
            </div>
            <p className="font-display text-[2rem] font-bold leading-none tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={cn(
              'flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-105',
              iconStyles[trend],
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
