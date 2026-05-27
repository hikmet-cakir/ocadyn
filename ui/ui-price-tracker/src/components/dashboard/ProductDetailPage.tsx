import { useEffect, useState } from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { ProductNotificationForm } from '@/components/product/ProductNotificationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductIdFromUrl } from '@/hooks/useProductIdFromUrl';
import { useTranslation } from '@/hooks/useTranslation';
import { useProductsStore } from '@/store/products.store';
import type { NotificationSettings } from '@/types/product.types';
import { formatPercent, formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

function ProductDetailContent() {
  const { t } = useTranslation();
  const productId = useProductIdFromUrl();
  const product = useProductsStore((s) => (productId ? s.getProductById(productId) : undefined));
  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const loadProductById = useProductsStore((s) => s.loadProductById);
  const toggleFavorite = useProductsStore((s) => s.toggleFavorite);
  const updateNotificationSettings = useProductsStore((s) => s.updateNotificationSettings);
  const [draftSettings, setDraftSettings] = useState<NotificationSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!productId) return;
    void loadProductById(productId);
  }, [productId, loadProductById]);

  useEffect(() => {
    if (product) {
      setDraftSettings(product.notificationSettings);
      setSaved(false);
      setSaveError('');
    }
  }, [product]);

  if (!productId) {
    return (
      <PlaceholderPage
        titleKey="dashboard.product.notFound"
        descriptionKey="dashboard.product.notFoundDesc"
      />
    );
  }

  if (isLoading && !product) {
    return (
      <p className="py-12 text-center text-muted-foreground">{t('dashboard.loading') ?? 'Loading…'}</p>
    );
  }

  if (!product || !draftSettings) {
    return (
      <PlaceholderPage
        titleKey="dashboard.product.notFound"
        descriptionKey="dashboard.product.notFoundDesc"
      />
    );
  }

  async function handleSave() {
    if (!product || !draftSettings) return;
    setSaveError('');
    try {
      await updateNotificationSettings(product.id, draftSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <img src={product.image} alt="" className="aspect-square w-full object-cover" />
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t('dashboard.product.viewOnStore')}
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void toggleFavorite(product.id)}>
              <Heart
                className={cn('size-4', product.isFavorite && 'fill-destructive text-destructive')}
              />
              {product.isFavorite
                ? t('dashboard.product.unfavorite')
                : t('dashboard.product.favorite')}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <MarketplaceBadge marketplace={product.marketplace} />
            <h2 className="mt-3 font-display text-2xl font-bold">{product.title}</h2>
            <p className="mt-2 text-3xl font-bold text-primary">
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
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                {t('dashboard.product.lowest')}:{' '}
                <strong className="text-foreground">
                  {formatPrice(product.lowestPrice, product.currency)}
                </strong>
              </span>
              <span>
                {t('dashboard.product.highest')}:{' '}
                <strong className="text-foreground">
                  {formatPrice(product.highestPrice, product.currency)}
                </strong>
              </span>
            </div>
          </div>

          <ProductNotificationForm
            formKey={product.id}
            settings={draftSettings}
            onChange={setDraftSettings}
            onSave={() => void handleSave()}
          />
          {saved ? (
            <p className="text-sm font-medium text-success">{t('dashboard.product.saved')}</p>
          ) : null}
          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.product.historyTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceHistoryChart data={product.priceHistory} currency={product.currency} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductDetailPage() {
  const { t } = useTranslation();
  const productId = useProductIdFromUrl();
  const product = useProductsStore((s) => (productId ? s.getProductById(productId) : undefined));

  return (
    <AuthGuard>
      <DashboardShell title={product?.title ?? t('dashboard.product.notFound')}>
        <ProductDetailContent />
      </DashboardShell>
    </AuthGuard>
  );
}
