import { ChevronLeft, ChevronUp, Hexagon } from 'lucide-react';
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

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar({ pathname }: SidebarProps) {
  const { t } = useTranslation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        'ocadyn-sidebar hidden min-h-screen shrink-0 flex-col shadow-[4px_0_24px_rgba(67,56,202,0.25)] transition-[width] duration-300 ease-out md:flex md:self-stretch',
        collapsed ? 'w-[76px]' : 'w-[260px]',
      )}
      style={{
        background: 'linear-gradient(180deg, var(--sidebar-from) 0%, var(--sidebar-to) 100%)',
        color: '#ffffff',
      }}
    >
      <div className="flex h-[72px] items-center justify-between border-b border-white/15 px-4">
        <a href="/dashboard" className="flex items-center gap-3 overflow-hidden !text-white">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <Hexagon className="size-5 !text-white" aria-hidden />
          </div>
          {!collapsed ? (
            <span className="font-display text-lg font-bold tracking-tight !text-white">{APP_NAME}</span>
          ) : null}
        </a>
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg !text-white/90 transition-colors hover:bg-white/15"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('size-4', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 pt-5">
        {dashboardNavItems.map(({ href, labelKey, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <a
              key={href}
              href={href}
              className={cn(
                'ocadyn-sidebar-link flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                active && 'is-active',
              )}
              title={collapsed ? t(labelKey) : undefined}
            >
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              {!collapsed ? <span className="truncate font-medium">{t(labelKey)}</span> : null}
              {active && !collapsed ? (
                <span className="ml-auto size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
              ) : null}
            </a>
          );
        })}
      </nav>

      {!collapsed && user ? (
        <div className="mt-auto p-3 pb-4">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold !text-white ring-2 ring-white/20">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold !text-white">{user.name}</p>
                <p className="ocadyn-sidebar-muted truncate text-xs font-medium">
                  {t(`dashboard.plan.${user.plan}`)}
                </p>
              </div>
              <ChevronUp className="size-4 shrink-0 !text-white/60" aria-hidden />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
