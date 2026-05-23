import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend = 'neutral', className }: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            'flex size-9 items-center justify-center rounded-lg',
            trend === 'down' && 'bg-success/15 text-success',
            trend === 'up' && 'bg-destructive/15 text-destructive',
            trend === 'neutral' && 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-display text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
