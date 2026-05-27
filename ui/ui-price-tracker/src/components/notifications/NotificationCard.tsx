import { Bell, TrendingDown, TrendingUp } from 'lucide-react';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { productDetailHref } from '@/hooks/useProductIdFromUrl';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppNotification } from '@/types/notification.types';
import { formatPrice, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface NotificationCardProps {
  notification: AppNotification;
  onRead: (id: string) => void;
}

type DisplayKind = 'drop' | 'rise' | 'update';

function resolveDisplayKind(notification: AppNotification): DisplayKind {
  const { previousPrice, currentPrice, type } = notification;
  const unchanged = Math.abs(previousPrice - currentPrice) < 0.005;

  if (type === 'system' || unchanged) {
    return 'update';
  }
  if (type === 'price_drop' || currentPrice < previousPrice) {
    return 'drop';
  }
  if (type === 'price_increase' || currentPrice > previousPrice) {
    return 'rise';
  }
  return 'update';
}

export function NotificationCard({ notification, onRead }: NotificationCardProps) {
  const { t } = useTranslation();
  const displayKind = resolveDisplayKind(notification);
  const href = productDetailHref(notification.productId);
  const priceChanged = displayKind !== 'update';

  function handleClick() {
    void onRead(notification.id);
    window.location.href = href;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <Card
      role="link"
      tabIndex={0}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        !notification.read && 'border-primary/30 bg-primary/5',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex gap-4 p-4">
        <img
          src={notification.productImage}
          alt=""
          className="size-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                displayKind === 'drop'
                  ? 'success'
                  : displayKind === 'rise'
                    ? 'danger'
                    : 'secondary'
              }
            >
              {displayKind === 'drop' ? (
                <TrendingDown className="mr-1 size-3" />
              ) : displayKind === 'rise' ? (
                <TrendingUp className="mr-1 size-3" />
              ) : (
                <Bell className="mr-1 size-3" />
              )}
              {displayKind === 'drop'
                ? t('dashboard.notifications.drop')
                : displayKind === 'rise'
                  ? t('dashboard.notifications.rise')
                  : t('dashboard.notifications.update')}
            </Badge>
            <MarketplaceBadge marketplace={notification.marketplace} />
            {!notification.read ? (
              <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
            ) : null}
          </div>
          <p className="mt-2 font-medium">{notification.productTitle}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="mt-1 text-sm">
            {priceChanged ? (
              <>
                <span className="text-muted-foreground line-through">
                  {formatPrice(notification.previousPrice, notification.currency)}
                </span>{' '}
                <span className="font-semibold text-foreground">
                  {formatPrice(notification.currentPrice, notification.currency)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-foreground">
                {formatPrice(notification.currentPrice, notification.currency)}
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
