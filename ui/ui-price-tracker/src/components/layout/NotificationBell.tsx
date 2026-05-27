import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotificationsStore } from '@/store/notifications.store';
import { cn } from '@/utils/cn';

export function NotificationBell() {
  const { t } = useTranslation();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const loadUnreadCount = useNotificationsStore((s) => s.loadUnreadCount);

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="topbar-icon-btn relative size-10 rounded-xl shadow-sm"
      aria-label={t('nav.notifications')}
      asChild
    >
      <a href="/dashboard/notifications">
        <Bell className="size-[18px]" />
        {unreadCount > 0 ? (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card',
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </a>
    </Button>
  );
}
