import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { ApiError } from '@/lib/api-client';
import { useProductsStore } from '@/store/products.store';
import { isSupportedProductUrl } from '@/utils/marketplaceUrl';
import { MARKETPLACES } from '@/utils/constants';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="size-5 text-primary" />
          {t('dashboard.quickAdd.title')}
        </CardTitle>
        <CardDescription>{t('dashboard.quickAdd.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('dashboard.quickAdd.placeholder')}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" className="shrink-0 sm:min-w-[140px]" disabled={loading}>
            {loading ? t('dashboard.quickAdd.adding') ?? 'Adding…' : t('dashboard.quickAdd.submit')}
          </Button>
        </form>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {MARKETPLACES.map((name) => (
            <span
              key={name}
              className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
