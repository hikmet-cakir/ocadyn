import { LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth.store';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
      <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">{title}</h1>

      <div className="relative ml-auto hidden max-w-md flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder={t('dashboard.searchPlaceholder')} />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <ThemeToggle />
        <LanguageSwitcher />
        <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
          <LogOut className="size-4" />
          {t('auth.logout')}
        </Button>
      </div>
    </header>
  );
}
