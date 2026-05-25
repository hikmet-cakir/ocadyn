import { useEffect, useState } from 'react';
import { BarChart3, Bell, ShoppingBag, TrendingDown } from 'lucide-react';
import { SavingsChart } from '@/components/charts/SavingsChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchReportSummary } from '@/lib/api/reports.api';
import type { ReportSummary } from '@/lib/mappers';
import { formatPrice } from '@/utils/formatters';

export function ReportsPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReportSummary();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <p className="py-12 text-center text-muted-foreground">{t('dashboard.loading') ?? 'Loading…'}</p>
    );
  }

  if (!summary) {
    return (
      <p className="py-12 text-center text-destructive">
        {error || t('dashboard.reports.error') || 'Could not load reports'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.reports')}</h2>
        <p className="text-muted-foreground">{t('dashboard.reports.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('dashboard.reports.avgSavings')}
          value={formatPrice(summary.averageSavings, 'USD')}
          icon={TrendingDown}
          trend="down"
        />
        <StatsCard
          title={t('dashboard.reports.totalAlerts')}
          value={summary.totalNotifications}
          icon={Bell}
          trend="neutral"
        />
        <StatsCard
          title={t('dashboard.reports.topMarketplace')}
          value={summary.mostTrackedMarketplace}
          icon={ShoppingBag}
          trend="neutral"
        />
        <StatsCard
          title={t('dashboard.reports.successRate')}
          value={`${summary.alertSuccessRate}%`}
          icon={BarChart3}
          trend="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.reports.chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsChart data={summary.savingsChart} />
        </CardContent>
      </Card>
    </div>
  );
}
