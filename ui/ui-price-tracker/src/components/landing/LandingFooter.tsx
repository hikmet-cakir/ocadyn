import { Hexagon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { APP_NAME, MARKETPLACES } from '@/utils/constants';

export function LandingFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Hexagon className="size-4" aria-hidden />
              </div>
              <span className="font-display text-lg font-bold">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">{t('app.tagline')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t('landing.footer.product')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground">
                  {t('landing.nav.features')}
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-foreground">
                  {t('common.getStarted')}
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-foreground">
                  {t('auth.login.submit')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t('landing.footer.stores')}</h4>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {MARKETPLACES.slice(0, 5).map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {year} {APP_NAME}. {t('landing.footer.rights')}
        </p>
      </div>
    </footer>
  );
}
