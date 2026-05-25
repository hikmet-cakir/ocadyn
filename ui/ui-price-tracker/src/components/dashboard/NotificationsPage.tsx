import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotificationsStore } from '@/store/notifications.store';
import { cn } from '@/utils/cn';

const filters = [
  { id: 'all' as const, labelKey: 'dashboard.notifications.tabs.all' },
  { id: 'price_drop' as const, labelKey: 'dashboard.notifications.tabs.drop' },
  { id: 'price_increase' as const, labelKey: 'dashboard.notifications.tabs.rise' },
];

export function NotificationsPage() {
  const { t } = useTranslation();
  const items = useNotificationsStore((s) => s.items);
  const filter = useNotificationsStore((s) => s.filter);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const isLoading = useNotificationsStore((s) => s.isLoading);
  const error = useNotificationsStore((s) => s.error);
  const setFilter = useNotificationsStore((s) => s.setFilter);
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">{t('nav.notifications')}</h2>
          <p className="text-muted-foreground">
            {t('dashboard.notifications.subtitle', { count: String(unreadCount) })}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
            {t('dashboard.notifications.markAllRead')}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filter === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">{t('dashboard.loading') ?? 'Loading…'}</p>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <NotificationCard key={n.id} notification={n} onRead={(id) => void markRead(id)} />
          ))}
          {items.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t('dashboard.notifications.empty')}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
