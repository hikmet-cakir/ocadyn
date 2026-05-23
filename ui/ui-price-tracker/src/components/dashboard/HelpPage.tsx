import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

const faqKeys = ['track', 'alerts', 'marketplaces', 'account'] as const;

export function HelpPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>('track');

  const filtered = faqKeys.filter((id) => {
    const q = t(`dashboard.help.faq.${id}.q`).toLowerCase();
    const a = t(`dashboard.help.faq.${id}.a`).toLowerCase();
    const term = search.toLowerCase();
    return !term || q.includes(term) || a.includes(term);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('nav.help')}</h2>
        <p className="text-muted-foreground">{t('dashboard.help.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.help.categories')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {faqKeys.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setOpenId(id)}
                className={cn(
                  'block w-full rounded-lg px-3 py-2 text-left transition-colors',
                  openId === id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {t(`dashboard.help.faq.${id}.q`).replace(/\?$/, '')}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Input
            placeholder={t('dashboard.help.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-2">
            {filtered.map((id) => {
              const isOpen = openId === id;
              return (
                <Card key={id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-4 text-left font-medium"
                    onClick={() => setOpenId(isOpen ? null : id)}
                  >
                    {t(`dashboard.help.faq.${id}.q`)}
                    <ChevronDown
                      className={cn('size-5 shrink-0 transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>
                  {isOpen ? (
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {t(`dashboard.help.faq.${id}.a`)}
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
