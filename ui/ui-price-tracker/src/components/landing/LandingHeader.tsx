import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/common/AppLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth.store';

export function LandingHeader() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const dashboardHref = isHydrated && isAuthenticated ? '/dashboard' : '/login';
  const getStartedHref = isHydrated && isAuthenticated ? '/dashboard' : '/register';

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center">
          <AppLogo variant="wordmark" />
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
            {t('landing.nav.features')}
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
            {t('landing.nav.pricing')}
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
            {t('landing.nav.faq')}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <a href={dashboardHref}>{t('auth.login.submit')}</a>
          </Button>
          <Button size="sm" asChild>
            <a href={getStartedHref}>{t('common.getStarted')}</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
