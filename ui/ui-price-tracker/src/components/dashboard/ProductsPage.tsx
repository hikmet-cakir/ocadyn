import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
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
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <a href={productDetailHref(product.id)} className="block">
                  <img src={product.image} alt="" className="h-40 w-full object-cover" />
                </a>
                <div className="space-y-3 p-4">
                  <div>
                    <a
                      href={productDetailHref(product.id)}
                      className="font-medium hover:text-primary line-clamp-2"
                    >
                      {product.title}
                    </a>
                    <div className="mt-2">
                      <MarketplaceBadge marketplace={product.marketplace} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
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
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.trackingStatus === 'active'}
                      onClick={() => void toggleTracking(product.id)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                        product.trackingStatus === 'active' ? 'bg-primary' : 'bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block size-5 rounded-full bg-white shadow transition-transform',
                          product.trackingStatus === 'active'
                            ? 'translate-x-5'
                            : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
