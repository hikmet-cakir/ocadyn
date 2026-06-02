import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export type ChartPeriod = 3 | 6 | 12;

interface PriceDropChartProps {
  data: Array<{ month: number; year: number; amount: number }>;
  currency: string;
}

function formatChartLabel(month: number, year: number, locale: string): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function PriceDropChart({ data, currency }: PriceDropChartProps) {
  const { t, locale } = useTranslation();
  const [period, setPeriod] = useState<ChartPeriod>(6);
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

  const chartData = useMemo(() => {
    const sliced = (data ?? []).slice(-period);
    return sliced
      .filter((point) => point.amount > 0)
      .map((point) => ({
        ...point,
        label: formatChartLabel(point.month, point.year, locale),
      }));
  }, [data, period, locale]);

  const periods: ChartPeriod[] = [3, 6, 12];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {periods.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={period === value ? 'default' : 'outline'}
            className={cn('h-8 rounded-lg px-3 text-xs')}
            onClick={() => setPeriod(value)}
          >
            {t(`dashboard.reports.periods.${value}`)}
          </Button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t('dashboard.reports.chartEmpty')}
        </p>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  formatPrice(value, currency, localeTag).replace(/\s/g, '')
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  formatPrice(value, currency, localeTag),
                  t('dashboard.reports.priceDrop'),
                ]}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
              />
              <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t('dashboard.reports.chartNote')}</p>
    </div>
  );
}
