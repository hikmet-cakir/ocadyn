import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  LineChart,
  Minus,
  Package,
  TrendingDown,
} from 'lucide-react';
import { PriceDropChart } from '@/components/charts/PriceDropChart';
import { EmptyState } from '@/components/common/EmptyState';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { fetchReportSummary } from '@/lib/api/reports.api';
import type { ReportMovementHighlight, ReportSummary } from '@/lib/mappers';
import { useProductsStore } from '@/store/products.store';
import type { Product } from '@/types/product.types';
import { cn } from '@/utils/cn';
import { formatPercent, formatPrice, formatRelativeTime } from '@/utils/formatters';

type ProductTab = 'dropped' | 'increased' | 'stable';

function filterProducts(products: Product[], tab: ProductTab): Product[] {
  switch (tab) {
    case 'dropped':
      return products.filter((p) => p.changePercent < 0);
    case 'increased':
      return products.filter((p) => p.changePercent > 0);
    case 'stable':
      return products.filter((p) => p.changePercent === 0);
  }
}

function sortProducts(products: Product[], tab: ProductTab): Product[] {
  return [...products].sort((a, b) => {
    if (tab === 'dropped') {
      return b.highestPrice - b.currentPrice - (a.highestPrice - a.currentPrice);
    }
    if (tab === 'increased') {
      return b.currentPrice - b.lowestPrice - (a.currentPrice - a.lowestPrice);
    }
    return a.title.localeCompare(b.title);
  });
}

function findLastDropDate(product: Product): string | null {
  const history = [...(product.priceHistory ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  for (let i = history.length - 1; i > 0; i--) {
    if (history[i - 1].price > history[i].price) {
      return history[i].date;
    }
  }
  return null;
}

function MovementHighlightCard({
  title,
  highlight,
  emptyLabel,
  trend,
  icon: Icon,
}: {
  title: string;
  highlight: ReportMovementHighlight | null;
  emptyLabel: string;
  trend: 'down' | 'up' | 'neutral';
  icon: typeof TrendingDown;
}) {
  const { t, locale } = useTranslation();
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

  if (!highlight) {
    return (
      <StatsCard
        title={title}
        subtitle={emptyLabel}
        value="—"
        icon={Icon}
        trend={trend}
      />
    );
  }

  const signedAmount =
    trend === 'down'
      ? `-${formatPrice(highlight.amount, highlight.currency, localeTag)}`
      : `+${formatPrice(highlight.amount, highlight.currency, localeTag)}`;

  return (
    <StatsCard
      title={title}
      subtitle={`${highlight.title} · ${highlight.marketplace}`}
      value={`${signedAmount} (${formatPercent(trend === 'down' ? -highlight.percent : highlight.percent, localeTag)})`}
      icon={Icon}
      trend={trend}
    />
  );
}

export function ReportsPage() {
  const { t, locale } = useTranslation();
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';
  const products = useProductsStore((s) => s.products);
  const loadProducts = useProductsStore((s) => s.loadProducts);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ProductTab>('dropped');

  useEffect(() => {
    async function load() {
      try {
        const [data] = await Promise.all([fetchReportSummary(), loadProducts()]);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [loadProducts]);

  const filteredProducts = useMemo(
    () => sortProducts(filterProducts(products, tab), tab),
    [products, tab],
  );

  const tabs: { id: ProductTab; labelKey: string }[] = [
    { id: 'dropped', labelKey: 'dashboard.reports.tabs.dropped' },
    { id: 'increased', labelKey: 'dashboard.reports.tabs.increased' },
    { id: 'stable', labelKey: 'dashboard.reports.tabs.stable' },
  ];

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

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold">{t('nav.reports')}</h2>
          <p className="text-muted-foreground">{t('dashboard.reports.subtitle')}</p>
        </div>
        <EmptyState
          icon={LineChart}
          title={t('dashboard.reports.emptyTitle')}
          description={t('dashboard.reports.emptyDescription')}
          actionLabel={t('dashboard.reports.emptyAction')}
          actionHref="/dashboard"
        />
      </div>
    );
  }

  const trendPositive = summary.monthOverMonthDropChange > 0;
  const trendNegative = summary.monthOverMonthDropChange < 0;
  const trendAmount = formatPrice(
    Math.abs(summary.monthOverMonthDropChange),
    summary.displayCurrency,
    localeTag,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.reports')}</h2>
        <p className="text-muted-foreground">{t('dashboard.reports.subtitle')}</p>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <TrendingDown className="size-4" aria-hidden />
                {t('dashboard.reports.totalDropTitle')}
              </div>
              <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {formatPrice(summary.totalPriceDrop, summary.displayCurrency, localeTag)}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t('dashboard.reports.totalDropDescription', {
                  count: String(summary.productsWithDropCount),
                })}
              </p>
              {trendPositive || trendNegative ? (
                <p
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    trendPositive
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {trendPositive ? (
                    <ArrowDownRight className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  )}
                  {t(
                    trendPositive
                      ? 'dashboard.reports.monthTrendMore'
                      : 'dashboard.reports.monthTrendLess',
                    { amount: trendAmount },
                  )}
                </p>
              ) : null}
            </div>
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 className="size-8" aria-hidden />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MovementHighlightCard
          title={t('dashboard.reports.biggestDrop')}
          highlight={summary.biggestDrop}
          emptyLabel={t('dashboard.reports.noDropYet')}
          trend="down"
          icon={TrendingDown}
        />
        <MovementHighlightCard
          title={t('dashboard.reports.biggestIncrease')}
          highlight={summary.biggestIncrease}
          emptyLabel={t('dashboard.reports.noIncreaseYet')}
          trend="up"
          icon={ArrowUpRight}
        />
        <StatsCard
          title={t('dashboard.reports.stableProducts')}
          subtitle={t('dashboard.reports.stableProductsHint')}
          value={summary.stablePriceProductCount}
          icon={Minus}
          trend="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.reports.chartTitle')}</CardTitle>
          <CardDescription>{t('dashboard.reports.chartSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PriceDropChart data={summary.priceDropChart} currency={summary.displayCurrency} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('dashboard.reports.productListTitle')}</CardTitle>
            <CardDescription>{t('dashboard.reports.productListSubtitle')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-9 rounded-xl px-4" asChild>
            <a href="/dashboard/products">{t('dashboard.reports.viewAllProducts')}</a>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-0 pt-4 sm:px-6 sm:pb-6">
          <div className="flex flex-wrap gap-2 px-6 sm:px-0">
            {tabs.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  tab === id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground sm:px-0">
              {t(`dashboard.reports.tabEmpty.${tab}`)}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-secondary/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-4">{t('dashboard.reports.columns.product')}</th>
                    <th className="px-4 py-4">
                      {tab === 'increased'
                        ? t('dashboard.reports.columns.rangeLow')
                        : t('dashboard.reports.columns.range')}
                    </th>
                    <th className="px-4 py-4">{t('dashboard.reports.columns.change')}</th>
                    <th className="px-4 py-4">{t('dashboard.reports.columns.lastDrop')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice(0, 8).map((product) => {
                    const diff =
                      tab === 'increased'
                        ? product.currentPrice - product.lowestPrice
                        : product.highestPrice - product.currentPrice;
                    const base =
                      tab === 'increased' ? product.lowestPrice : product.highestPrice;
                    const percent = base > 0 ? (diff / base) * 100 : 0;
                    const lastDrop = findLastDropDate(product);

                    return (
                      <tr
                        key={product.id}
                        className="group border-b border-border/60 transition-colors last:border-0 hover:bg-primary-soft/20"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-secondary p-1">
                              <img
                                src={product.image}
                                alt=""
                                className="size-full rounded-lg object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <a
                                href={productDetailHref(product.id)}
                                className="line-clamp-1 font-medium hover:text-primary"
                              >
                                {product.title}
                              </a>
                              <div className="mt-1">
                                <MarketplaceBadge marketplace={product.marketplace} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatPrice(
                            tab === 'increased' ? product.lowestPrice : product.highestPrice,
                            product.currency,
                            localeTag,
                          )}
                          <span className="mx-1.5">→</span>
                          {formatPrice(product.currentPrice, product.currency, localeTag)}
                        </td>
                        <td className="px-4 py-4">
                          {tab === 'stable' ? (
                            <Badge variant="secondary">{t('dashboard.reports.noChange')}</Badge>
                          ) : (
                            <Badge variant={tab === 'dropped' ? 'success' : 'danger'}>
                              {tab === 'dropped' ? '−' : '+'}
                              {formatPrice(diff, product.currency, localeTag)}
                              {' '}
                              ({formatPercent(tab === 'dropped' ? -percent : percent, localeTag)})
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {lastDrop
                            ? formatRelativeTime(lastDrop, localeTag)
                            : t('dashboard.reports.noDropRecorded')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-primary" aria-hidden />
            {t('dashboard.reports.notificationsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            {t('dashboard.reports.notificationsSent', {
              total: String(summary.totalNotifications),
            })}
          </p>
          <p>
            {t('dashboard.reports.notificationsDrops', {
              count: String(summary.priceDropNotificationCount),
            })}
          </p>
          <p className="flex items-center gap-2 pt-1 font-medium text-foreground">
            <Package className="size-4 text-primary" aria-hidden />
            {t('dashboard.reports.topMarketplaceDetail', {
              marketplace: summary.mostTrackedMarketplace,
              count: String(summary.mostTrackedMarketplaceCount),
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
