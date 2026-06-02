import { ChevronRight, LogOut, Search } from 'lucide-react';
import { AppLogoMark } from '@/components/common/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function Topbar({ title, breadcrumbs }: TopbarProps) {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    window.location.href = '/';
  }

  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-border/80 bg-card/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 shrink-0 items-center gap-3 sm:max-w-[280px]">
        <a href="/dashboard" className="shrink-0 md:hidden" aria-label="OCADYN">
          <AppLogoMark className="size-9" />
        </a>
        {showBreadcrumbs ? (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 ? (
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
                  ) : null}
                  {item.href && !isLast ? (
                    <a
                      href={item.href}
                      className="truncate font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span
                      className={cn(
                        'truncate',
                        isLast
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-muted-foreground',
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        ) : (
          <h1 className="font-display truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
        )}
      </div>

      <div className="relative mx-auto hidden max-w-xl flex-1 lg:block">
        <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-[46px] rounded-full border-border/80 bg-secondary pl-11 shadow-none"
          placeholder={t('dashboard.searchPlaceholder')}
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <NotificationBell />
        <LanguageSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="hidden h-10 gap-2 rounded-xl border-border/80 px-4 font-medium shadow-sm transition-all duration-200 hover:border-primary-border hover:bg-primary-soft/50 sm:inline-flex"
        >
          <LogOut className="size-4" />
          <span className="hidden md:inline">{t('auth.logout')}</span>
        </Button>
      </div>
    </header>
  );
}
