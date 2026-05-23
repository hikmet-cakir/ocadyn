import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { useProductsStore } from '@/store/products.store';
import { MARKETPLACES } from '@/utils/constants';

export function QuickAddProduct() {
  const { t } = useTranslation();
  const addProductFromUrl = useProductsStore((s) => s.addProductFromUrl);
  const [url, setUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    const id = addProductFromUrl(url.trim());
    setUrl('');
    window.location.href = productDetailHref(id);
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
          />
          <Button type="submit" className="shrink-0 sm:min-w-[140px]">
            {t('dashboard.quickAdd.submit')}
          </Button>
        </form>
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
