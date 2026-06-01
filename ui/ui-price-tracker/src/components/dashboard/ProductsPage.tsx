import { useEffect, useState } from 'react';
import { Package, Pause, Play } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { useProductsStore } from '@/store/products.store';
import { formatPercent, formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

type Tab = 'all' | 'active' | 'paused';

export function ProductsPage() {
  const { t } = useTranslation();
  const products = useProductsStore((s) => s.products);
  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const loadProducts = useProductsStore((s) => s.loadProducts);
  const toggleTracking = useProductsStore((s) => s.toggleTracking);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const status = tab === 'all' ? undefined : tab;
    void loadProducts({
      status,
      search: search.trim() || undefined,
    });
  }, [tab, search, loadProducts]);

  const tabs: { id: Tab; labelKey: string }[] = [
    { id: 'all', labelKey: 'dashboard.products.tabs.all' },
    { id: 'active', labelKey: 'dashboard.products.tabs.active' },
    { id: 'paused', labelKey: 'dashboard.products.tabs.paused' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.watchlist')}</h2>
        <p className="text-muted-foreground">{t('dashboard.products.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
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
        <Input
          className="max-w-xs"
          placeholder={t('dashboard.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">{t('dashboard.loading') ?? 'Loading…'}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isActive = product.trackingStatus === 'active';
            return (
              <Card
                key={product.id}
                className={cn(
                  'overflow-hidden border-t-[3px] transition-shadow hover:shadow-md',
                  isActive ? 'border-t-success' : 'border-t-amber-400',
                )}
              >
                <CardContent className="p-0">
                  {/* Image with action button overlay */}
                  <div className="relative">
                    <a href={productDetailHref(product.id)} className="block">
                      <img
                        src={product.image}
                        alt=""
                        className={cn(
                          'h-40 w-full object-cover transition-opacity',
                          !isActive && 'opacity-60',
                        )}
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() => void toggleTracking(product.id)}
                      aria-label={isActive
                        ? t('dashboard.products.pauseTracking')
                        : t('dashboard.products.resumeTracking')
                      }
                      className={cn(
                        'absolute right-2 top-2 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all',
                        isActive
                          ? 'bg-black/55 text-white hover:bg-black/75'
                          : 'bg-amber-500 text-white hover:bg-amber-600',
                      )}
                    >
                      {isActive ? (
                        <>
                          <Pause className="size-3" />
                          {t('dashboard.products.pauseTracking')}
                        </>
                      ) : (
                        <>
                          <Play className="size-3" />
                          {t('dashboard.products.resumeTracking')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="space-y-3 p-4">
                    <div>
                      <a
                        href={productDetailHref(product.id)}
                        className="font-medium hover:text-primary line-clamp-2"
                      >
                        {product.title}
                      </a>
                      <div className="mt-2 flex items-center gap-2">
                        <MarketplaceBadge marketplace={product.marketplace} />
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium',
                            isActive
                              ? 'bg-success/15 text-success'
                              : 'bg-amber-400/20 text-amber-600',
                          )}
                        >
                          {isActive
                            ? t('dashboard.products.statusActive')
                            : t('dashboard.products.statusPaused')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {formatPrice(product.currentPrice, product.currency)}
                      </p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          product.changePercent < 0 && 'text-success',
                          product.changePercent > 0 && 'text-destructive',
                        )}
                      >
                        {formatPercent(product.changePercent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('dashboard.products.emptyTitle')}
          description={t('dashboard.recentProducts.empty')}
          actionLabel={t('dashboard.quickAdd.submit')}
          actionHref="/dashboard"
        />
      ) : null}
    </div>
  );
}
