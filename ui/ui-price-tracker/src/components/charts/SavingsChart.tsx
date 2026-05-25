import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice } from '@/utils/formatters';

interface SavingsChartProps {
  data: Array<{ month: string; savings: number }>;
}

export function SavingsChart({ data }: SavingsChartProps) {
  const { t } = useTranslation();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(value: number) => [
              formatPrice(value, 'USD'),
              t('dashboard.reports.savings'),
            ]}
            contentStyle={{
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
              background: 'var(--card)',
            }}
          />
          <Bar dataKey="savings" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
