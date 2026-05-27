import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { useProductsStore } from '@/store/products.store';
import { formatPercent, formatPrice } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

export function RecentProducts() {
  const { t, locale } = useTranslation();
  const products = useProductsStore((s) => s.products);
  const toggleTracking = useProductsStore((s) => s.toggleTracking);
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <CardTitle className="text-xl">{t('dashboard.recentProducts.title')}</CardTitle>
          <CardDescription className="mt-1">{t('dashboard.recentProducts.description')}</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-9 rounded-xl px-4" asChild>
          <a href="/dashboard/products">{t('dashboard.recentProducts.viewAll')}</a>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-4">{t('dashboard.recentProducts.product')}</th>
                <th className="px-4 py-4">{t('dashboard.recentProducts.marketplace')}</th>
                <th className="px-4 py-4">{t('dashboard.recentProducts.price')}</th>
                <th className="px-4 py-4">{t('dashboard.recentProducts.change')}</th>
                <th className="px-4 py-4">{t('dashboard.recentProducts.tracking')}</th>
                <th className="px-4 py-4">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr
                  key={product.id}
                  className="group border-b border-border/60 transition-all duration-200 last:border-0 hover:bg-primary-soft/25"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-secondary p-1 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
                        <img
                          src={product.image}
                          alt=""
                          className="size-full rounded-lg object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={productDetailHref(product.id)}
                          className="line-clamp-1 font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {product.title}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <MarketplaceBadge marketplace={product.marketplace} />
                  </td>
                  <td className="px-4 py-4 font-semibold text-foreground">
                    {formatPrice(product.currentPrice, product.currency, localeTag)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        product.changePercent < 0
                          ? 'success'
                          : product.changePercent > 0
                            ? 'danger'
                            : 'muted'
                      }
                      className="font-semibold"
                    >
                      {formatPercent(product.changePercent, localeTag)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Switch
                      checked={product.trackingStatus === 'active'}
                      onCheckedChange={() => void toggleTracking(product.id)}
                      aria-label={t('dashboard.recentProducts.tracking')}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground opacity-0 transition-all duration-200 hover:bg-muted hover:text-foreground group-hover:opacity-100"
                      asChild
                    >
                      <a href={productDetailHref(product.id)} aria-label={t('common.viewDetails')}>
                        <MoreVertical className="size-4" />
                      </a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">
            {t('dashboard.recentProducts.empty')}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
