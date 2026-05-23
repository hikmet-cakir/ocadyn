import { BarChart3, Bell, ShoppingBag, TrendingDown } from 'lucide-react';
import { SavingsChart } from '@/components/charts/SavingsChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { mockReportSummary } from '@/mock/reports';
import { formatPrice } from '@/utils/formatters';

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.reports')}</h2>
        <p className="text-muted-foreground">{t('dashboard.reports.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('dashboard.reports.avgSavings')}
          value={formatPrice(mockReportSummary.averageSavings, 'USD')}
          icon={TrendingDown}
          trend="down"
        />
        <StatsCard
          title={t('dashboard.reports.totalAlerts')}
          value={mockReportSummary.totalNotifications}
          icon={Bell}
          trend="neutral"
        />
        <StatsCard
          title={t('dashboard.reports.topMarketplace')}
          value={mockReportSummary.mostTrackedMarketplace}
          icon={ShoppingBag}
          trend="neutral"
        />
        <StatsCard
          title={t('dashboard.reports.successRate')}
          value={`${mockReportSummary.alertSuccessRate}%`}
          icon={BarChart3}
          trend="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.reports.chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsChart />
        </CardContent>
      </Card>
    </div>
  );
}
