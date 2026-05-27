import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from '@/hooks/useTranslation';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/utils/constants';
import { cn } from '@/utils/cn';

const labels: Record<SupportedLocale, string> = {
  en: 'EN',
  tr: 'TR',
};

export function LanguageSwitcher() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const { t } = useTranslation();

  return (
    <div
      className="inline-flex rounded-xl border border-border/80 bg-secondary/80 p-1 shadow-sm"
      role="group"
      aria-label={t('common.language')}
    >
      {SUPPORTED_LOCALES.map((code) => (
        <Button
          key={code}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 min-w-10 rounded-lg px-3 text-xs font-semibold transition-all duration-200',
            locale === code
              ? 'bg-primary text-primary-foreground shadow-sm hover:bg-[var(--primary-hover)]'
              : 'text-muted-foreground hover:bg-card hover:text-foreground',
          )}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
        >
          {labels[code]}
        </Button>
      ))}
    </div>
  );
}
