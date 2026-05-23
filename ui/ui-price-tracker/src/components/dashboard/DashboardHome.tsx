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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    if (useProductsStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useProductsStore.persist.onFinishHydration(finish);
  }, []);

  const dropped = products.filter((p) => p.changePercent < 0).length;
  const increased = products.filter((p) => p.changePercent > 0).length;
  const unchanged = products.filter((p) => p.changePercent === 0).length;

  if (!ready) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {t('dashboard.welcome', { name: user?.name?.split(' ')[0] ?? 'User' })}
        </h2>
        <p className="text-muted-foreground">{t('dashboard.homeSubtitle')}</p>
      </div>

      <QuickAddProduct />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('dashboard.stats.total')}
          value={products.length}
          icon={Package}
          trend="neutral"
        />
        <StatsCard
          title={t('dashboard.stats.dropped')}
          value={dropped}
          icon={TrendingDown}
          trend="down"
        />
        <StatsCard
          title={t('dashboard.stats.increased')}
          value={increased}
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title={t('dashboard.stats.unchanged')}
          value={unchanged}
          icon={Minus}
          trend="neutral"
        />
      </div>

      <RecentProducts />
    </div>
  );
}
