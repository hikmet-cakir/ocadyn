import { useEffect, useState } from 'react';
import { ExternalLink, Heart, Share2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { ProductNotificationForm } from '@/components/product/ProductNotificationForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductIdFromUrl } from '@/hooks/useProductIdFromUrl';
import { useTranslation } from '@/hooks/useTranslation';
import { useProductsStore } from '@/store/products.store';
import type { NotificationSettings } from '@/types/product.types';
import { formatPercent, formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

function formatLastUpdated(iso: string, locale: string, todayLabel: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `${todayLabel}, ${time}`;
  }
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProductDetailContent() {
  const { t, locale } = useTranslation();
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

  function handleShare() {
    if (navigator.share) {
      void navigator.share({ title: product!.title, url: product!.url });
    } else {
      void navigator.clipboard.writeText(product!.url);
    }
  }

  const changeVariant =
    product.changePercent < 0 ? 'success' : product.changePercent > 0 ? 'danger' : 'muted';

  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card className="relative overflow-hidden rounded-[20px] border-border/80 p-4 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
            <button
              type="button"
              onClick={() => void toggleFavorite(product.id)}
              className="absolute right-6 top-6 z-10 flex size-10 items-center justify-center rounded-xl border border-border/80 bg-card/95 shadow-sm transition-all duration-200 hover:border-primary-border hover:bg-primary-soft"
              aria-label={
                product.isFavorite
                  ? t('dashboard.product.unfavorite')
                  : t('dashboard.product.favorite')
              }
            >
              <Heart
                className={cn(
                  'size-5 transition-colors',
                  product.isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground',
                )}
              />
            </button>
            <div className="overflow-hidden rounded-[16px] bg-secondary/80">
              <img
                src={product.image}
                alt=""
                className="aspect-square w-full object-contain p-6"
              />
            </div>
          </Card>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" size="sm" className="h-10 rounded-xl px-4" asChild>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t('dashboard.product.viewOnStore')}
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl px-4"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              {t('dashboard.product.share')}
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-4">
            <MarketplaceBadge marketplace={product.marketplace} />
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
              {product.title}
            </h2>
            <div className="flex flex-wrap items-end gap-3">
              <p className="font-display text-4xl font-bold tracking-tight text-primary sm:text-[2.5rem]">
                {formatPrice(product.currentPrice, product.currency, localeTag)}
              </p>
              <Badge variant={changeVariant} className="mb-1.5 px-3 py-1 text-sm font-semibold">
                {formatPercent(product.changePercent, localeTag)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <p>
                {t('dashboard.product.lastUpdated')}:{' '}
                <span className="font-medium text-foreground">
                  {formatLastUpdated(product.lastUpdated, localeTag, t('dashboard.product.today'))}
                </span>
              </p>
              <p>
                {t('dashboard.product.productId')}:{' '}
                <span className="font-medium text-foreground">{product.id}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="rounded-xl border border-border/80 bg-secondary/60 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">{t('dashboard.product.lowest')}</p>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatPrice(product.lowestPrice, product.currency, localeTag)}
                </p>
              </div>
              <div className="rounded-xl border border-border/80 bg-secondary/60 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">{t('dashboard.product.highest')}</p>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatPrice(product.highestPrice, product.currency, localeTag)}
                </p>
              </div>
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

      <Card className="rounded-[20px]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-xl">{t('dashboard.product.historyTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <PriceHistoryChart
            data={product.priceHistory}
            currency={product.currency}
            currentPrice={product.currentPrice}
            productTitle={product.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductDetailPage() {
  const { t } = useTranslation();
  const productId = useProductIdFromUrl();
  const product = useProductsStore((s) => (productId ? s.getProductById(productId) : undefined));

  const breadcrumbs = product
    ? [
        { label: t('nav.watchlist'), href: '/dashboard/products' },
        {
          label:
            product.title.length > 42 ? `${product.title.slice(0, 42)}…` : product.title,
        },
      ]
    : undefined;

  return (
    <AuthGuard>
      <DashboardShell
        title={product?.title ?? t('dashboard.product.notFound')}
        breadcrumbs={breadcrumbs}
      >
        <ProductDetailContent />
      </DashboardShell>
    </AuthGuard>
  );
}
