import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { useProductsStore } from '@/store/products.store';
import { formatPercent, formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export function FavoritesPage() {
  const { t } = useTranslation();
  const products = useProductsStore((s) => s.products);
  const favorites = products.filter((p) => p.isFavorite);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.favorites')}</h2>
        <p className="text-muted-foreground">{t('dashboard.favorites.subtitle')}</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('nav.favorites')}
          description={t('dashboard.favorites.empty')}
          actionLabel={t('dashboard.recentProducts.viewAll')}
          actionHref="/dashboard/products"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex gap-4 p-4">
                <img
                  src={product.image}
                  alt=""
                  className="size-20 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={productDetailHref(product.id)}
                    className="font-medium hover:text-primary line-clamp-2"
                  >
                    {product.title}
                  </a>
                  <div className="mt-2">
                    <MarketplaceBadge marketplace={product.marketplace} />
                  </div>
                  <p className="mt-2 font-bold">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
