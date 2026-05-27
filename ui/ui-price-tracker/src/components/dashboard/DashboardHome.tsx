import { useEffect, useState } from 'react';
import { Minus, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { DashboardHomeSkeleton } from '@/components/dashboard/DashboardHomeSkeleton';
import { QuickAddProduct } from '@/components/dashboard/QuickAddProduct';
import { RecentProducts } from '@/components/dashboard/RecentProducts';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import { useProductsStore } from '@/store/products.store';

export function DashboardHome() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const products = useProductsStore((s) => s.products);
  const stats = useProductsStore((s) => s.stats);
  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const loadProducts = useProductsStore((s) => s.loadProducts);
  const loadStats = useProductsStore((s) => s.loadStats);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      await Promise.all([loadProducts(), loadStats()]);
      setReady(true);
    }
    void load();
  }, [loadProducts, loadStats]);

  const dropped = stats?.dropped ?? products.filter((p) => p.changePercent < 0).length;
  const increased = stats?.increased ?? products.filter((p) => p.changePercent > 0).length;
  const unchanged = stats?.unchanged ?? products.filter((p) => p.changePercent === 0).length;
  const total = stats?.total ?? products.length;

  if (!ready || isLoading) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[20px] border border-border/80 bg-card/80 px-6 py-5 shadow-sm backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          {t('dashboard.welcome', { name: user?.name?.split(' ')[0] ?? 'User' })}
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {t('dashboard.homeSubtitle')}
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <QuickAddProduct />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('dashboard.stats.total')}
          subtitle={t('dashboard.stats.totalSubtitle')}
          value={total}
          icon={Package}
          trend="neutral"
        />
        <StatsCard
          title={t('dashboard.stats.dropped')}
          subtitle={t('dashboard.stats.periodSubtitle')}
          value={dropped}
          icon={TrendingDown}
          trend="down"
        />
        <StatsCard
          title={t('dashboard.stats.increased')}
          subtitle={t('dashboard.stats.periodSubtitle')}
          value={increased}
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title={t('dashboard.stats.unchanged')}
          subtitle={t('dashboard.stats.periodSubtitle')}
          value={unchanged}
          icon={Minus}
          trend="neutral"
        />
      </div>

      <RecentProducts />
    </div>
  );
}
