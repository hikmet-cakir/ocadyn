import { useTranslation } from '@/hooks/useTranslation';
import { dashboardNavItems, isNavActive } from '@/utils/navigation';
import { cn } from '@/utils/cn';

const mobileNavHrefs = [
  '/dashboard',
  '/dashboard/products',
  '/dashboard/notifications',
  '/dashboard/settings',
];

interface MobileNavProps {
  pathname: string;
}

export function MobileNav({ pathname }: MobileNavProps) {
  const { t } = useTranslation();
  const items = dashboardNavItems.filter((item) => mobileNavHrefs.includes(item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <a
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden />
              <span className="truncate">{t(labelKey)}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
