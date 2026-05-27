import { useState } from 'react';
import { ArrowRight, Link2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MarketplaceChipRow } from '@/components/product/MarketplaceChip';
import { MarketplaceIcon } from '@/components/product/MarketplaceIcon';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { ApiError } from '@/lib/api-client';
import { useProductsStore } from '@/store/products.store';
import { isSupportedProductUrl } from '@/utils/marketplaceUrl';
import { MARKETPLACES } from '@/utils/constants';
import type { Marketplace } from '@/types/product.types';

export function QuickAddProduct() {
  const { t } = useTranslation();
  const addProductFromUrl = useProductsStore((s) => s.addProductFromUrl);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isSupportedProductUrl(url.trim())) {
      setError(t('dashboard.quickAdd.unsupportedMarketplace'));
      return;
    }

    setError('');
    setLoading(true);
    try {
      const id = await addProductFromUrl(url.trim());
      setUrl('');
      window.location.href = productDetailHref(id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('dashboard.quickAdd.error') ?? 'Could not add product. Check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="premium-card-hover overflow-hidden border-primary-border/30 bg-gradient-to-br from-card via-card to-primary-soft/20">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[1fr_auto]">
          <div className="space-y-6 p-6 sm:p-8 lg:p-10">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-border/50 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                {t('dashboard.quickAdd.badge') ?? 'Price tracking'}
              </div>
              <h3 className="font-display flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Link2 className="size-4" />
                </span>
                {t('dashboard.quickAdd.title')}
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t('dashboard.quickAdd.description')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('dashboard.quickAdd.placeholder')}
                className="h-[46px] flex-1 rounded-[14px] border-input bg-card text-base shadow-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                className="h-[44px] shrink-0 rounded-xl px-6 sm:min-w-[180px]"
                disabled={loading}
              >
                {loading ? t('dashboard.quickAdd.adding') ?? 'Adding…' : t('dashboard.quickAdd.submit')}
                {!loading ? <ArrowRight className="size-4" /> : null}
              </Button>
            </form>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('dashboard.quickAdd.supportedStores')}
              </p>
              <MarketplaceChipRow />
            </div>
          </div>

          <div className="hidden items-center justify-center px-10 lg:flex">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-primary/8 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-3">
                {MARKETPLACES.map((name, i) => (
                  <div
                    key={name}
                    className="flex size-[4.5rem] items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-border/50 hover:shadow-md"
                    style={{ transform: `rotate(${(i - 1.5) * 4}deg)` }}
                  >
                    <MarketplaceIcon marketplace={name as Marketplace} size={36} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
