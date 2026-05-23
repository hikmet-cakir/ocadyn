import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { useProductsStore } from '@/store/products.store';
import { formatPercent, formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export function RecentProducts() {
  const { t } = useTranslation();
  const products = useProductsStore((s) => s.products);
  const toggleTracking = useProductsStore((s) => s.toggleTracking);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('dashboard.recentProducts.title')}</CardTitle>
          <CardDescription>{t('dashboard.recentProducts.description')}</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/products">{t('dashboard.recentProducts.viewAll')}</a>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">{t('dashboard.recentProducts.product')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.recentProducts.marketplace')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.recentProducts.price')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.recentProducts.change')}</th>
                <th className="px-6 py-3 font-medium">{t('dashboard.recentProducts.tracking')}</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt=""
                        className="size-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <a
                          href={productDetailHref(product.id)}
                          className="font-medium hover:text-primary line-clamp-1"
                        >
                          {product.title}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <MarketplaceBadge marketplace={product.marketplace} />
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {formatPrice(product.currentPrice, product.currency)}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-4 font-medium',
                      product.changePercent < 0 && 'text-success',
                      product.changePercent > 0 && 'text-destructive',
                    )}
                  >
                    {formatPercent(product.changePercent)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.trackingStatus === 'active'}
                      onClick={() => toggleTracking(product.id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 ? (
          <p className="px-6 py-8 text-center text-muted-foreground">
            {t('dashboard.recentProducts.empty')}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
