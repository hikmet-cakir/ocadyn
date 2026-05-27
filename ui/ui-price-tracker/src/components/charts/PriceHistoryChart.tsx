import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
  currentPrice?: number;
  productTitle?: string;
}

function dayKey(isoDate: string): string {
  return new Date(isoDate).toISOString().slice(0, 10);
}

function aggregateByDay(data: PricePoint[], currentPrice?: number): PricePoint[] {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const byDay = new Map<string, PricePoint>();
  for (const point of sorted) {
    byDay.set(dayKey(point.date), point);
  }
  if (currentPrice != null) {
    const today = new Date().toISOString().slice(0, 10);
    byDay.set(today, { date: new Date().toISOString(), price: currentPrice });
  }
  return Array.from(byDay.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
  priceLabel,
  locale,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
  priceLabel: string;
  locale: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-primary-border/60 bg-card px-4 py-3 shadow-[0_8px_24px_rgba(37,99,235,0.14)]">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-base font-semibold text-primary">
        {formatPrice(payload[0].value, currency, locale)}
      </p>
      <p className="text-[10px] text-muted-foreground">{priceLabel}</p>
    </div>
  );
}

export function PriceHistoryChart({
  data,
  currency,
  currentPrice,
  productTitle,
}: PriceHistoryChartProps) {
  const { t, locale } = useTranslation();
  const [range, setRange] = useState<RangeKey>('30d');
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

  const ranges: { key: RangeKey; labelKey: string; days: number | null }[] = [
    { key: '7d', labelKey: 'dashboard.product.range7d', days: 7 },
    { key: '30d', labelKey: 'dashboard.product.range30d', days: 30 },
    { key: '90d', labelKey: 'dashboard.product.range90d', days: 90 },
    { key: 'all', labelKey: 'dashboard.product.rangeAll', days: null },
  ];

  const aggregated = useMemo(
    () => aggregateByDay(data, currentPrice),
    [data, currentPrice],
  );

  const chartData = useMemo(() => {
    const selected = ranges.find((r) => r.key === range);
    const filtered = !selected?.days
      ? aggregated
      : aggregated.filter((p) => {
          const cutoff = Date.now() - selected.days! * 86400000;
          return new Date(p.date).getTime() >= cutoff;
        });
    return filtered.map((p) => ({
      date: new Date(p.date).toLocaleDateString(localeTag, { month: 'short', day: 'numeric' }),
      price: p.price,
    }));
  }, [aggregated, range, localeTag]);

  function handleDownloadCsv() {
    const rows = [
      ['date', 'price', 'currency'],
      ...aggregated.map((p) => [new Date(p.date).toISOString(), String(p.price), currency]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(productTitle ?? 'price-history').slice(0, 40).replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const hasData = data.length > 0 || currentPrice != null;

  if (!hasData) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t('dashboard.product.noHistory')}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-border/80 bg-secondary p-1">
          {ranges.map(({ key, labelKey }) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={range === key ? 'default' : 'ghost'}
              className={cn(
                'h-8 rounded-full px-4 font-medium',
                range !== key && 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setRange(key)}
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl border-border/80 px-4"
          onClick={handleDownloadCsv}
        >
          <Download className="size-4" />
          {t('dashboard.product.downloadCsv')}
        </Button>
      </div>
      <div className="h-[320px] w-full rounded-2xl bg-gradient-to-b from-primary-soft/20 to-transparent p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#EEF2FF" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              width={72}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatPrice(Number(v), currency, localeTag).replace(/\.\d{2}$/, '')}
            />
            <Tooltip
              content={
                <ChartTooltip
                  currency={currency}
                  priceLabel={t('dashboard.recentProducts.price')}
                  locale={localeTag}
                />
              }
            />
            <Area type="monotone" dataKey="price" stroke="none" fill="url(#priceGradient)" />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                fill: '#2563EB',
                stroke: '#fff',
                strokeWidth: 3,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
