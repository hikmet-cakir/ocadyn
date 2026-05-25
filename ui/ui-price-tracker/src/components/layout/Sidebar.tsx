import { ChevronLeft, Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { APP_NAME } from '@/utils/constants';
import { dashboardNavItems, isNavActive } from '@/utils/navigation';
import { cn } from '@/utils/cn';

interface SidebarProps {
  pathname: string;
}

export function Sidebar({ pathname }: SidebarProps) {
  const { t } = useTranslation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        'hidden min-h-screen shrink-0 flex-col border-r border-sidebar-muted bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out md:flex md:self-stretch',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-muted px-4">
        <a href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <Hexagon className="size-5" aria-hidden />
          </div>
          {!collapsed ? (
            <span className="font-display text-lg font-bold truncate">{APP_NAME}</span>
          ) : null}
        </a>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-sidebar-foreground hover:bg-sidebar-muted"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('size-4 transition-transform', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {dashboardNavItems.map(({ href, labelKey, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <a
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-white',
              )}
              title={collapsed ? t(labelKey) : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {!collapsed ? <span>{t(labelKey)}</span> : null}
            </a>
          );
        })}
      </nav>

      {!collapsed && user ? (
        <div className="mt-auto border-t border-sidebar-muted p-4">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/70">{user.email}</p>
        </div>
      ) : null}
    </aside>
  );
}
