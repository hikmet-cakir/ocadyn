import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { PricePoint } from '@/types/product.types';
import { formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

type RangeKey = '7d' | '30d' | '90d' | 'all';

interface PriceHistoryChartProps {
  data: PricePoint[];
  currency: string;
}

export function PriceHistoryChart({ data, currency }: PriceHistoryChartProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<RangeKey>('30d');

  const ranges: { key: RangeKey; labelKey: string; days: number | null }[] = [
    { key: '7d', labelKey: 'dashboard.product.range7d', days: 7 },
    { key: '30d', labelKey: 'dashboard.product.range30d', days: 30 },
    { key: '90d', labelKey: 'dashboard.product.range90d', days: 90 },
    { key: 'all', labelKey: 'dashboard.product.rangeAll', days: null },
  ];

  const chartData = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const selected = ranges.find((r) => r.key === range);
    if (!selected?.days) {
      return sorted.map((p) => ({
        date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: p.price,
      }));
    }
    const cutoff = Date.now() - selected.days * 86400000;
    return sorted
      .filter((p) => new Date(p.date).getTime() >= cutoff)
      .map((p) => ({
        date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: p.price,
      }));
  }, [data, range]);

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t('dashboard.product.noHistory')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ranges.map(({ key, labelKey }) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={range === key ? 'default' : 'outline'}
            onClick={() => setRange(key)}
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>
      <div className={cn('h-[280px] w-full')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              width={56}
              tickFormatter={(v) => formatPrice(Number(v), currency).replace(/\.\d{2}$/, '')}
            />
            <Tooltip
              formatter={(value: number) => [formatPrice(value, currency), t('dashboard.recentProducts.price')]}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--primary)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
