import { TrendingDown, TrendingUp } from 'lucide-react';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppNotification } from '@/types/notification.types';
import { formatPrice, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface NotificationCardProps {
  notification: AppNotification;
  onRead: (id: string) => void;
}

export function NotificationCard({ notification, onRead }: NotificationCardProps) {
  const { t } = useTranslation();
  const isDrop = notification.type === 'price_drop';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        !notification.read && 'border-primary/30 bg-primary/5',
      )}
      onClick={() => onRead(notification.id)}
    >
      <CardContent className="flex gap-4 p-4">
        <img
          src={notification.productImage}
          alt=""
          className="size-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isDrop ? 'success' : 'danger'}>
              {isDrop ? (
                <TrendingDown className="mr-1 size-3" />
              ) : (
                <TrendingUp className="mr-1 size-3" />
              )}
              {isDrop ? t('dashboard.notifications.drop') : t('dashboard.notifications.rise')}
            </Badge>
            <MarketplaceBadge marketplace={notification.marketplace} />
            {!notification.read ? (
              <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
            ) : null}
          </div>
          <p className="mt-2 font-medium">{notification.productTitle}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground line-through">
              {formatPrice(notification.previousPrice, notification.currency)}
            </span>{' '}
            <span className="font-semibold text-foreground">
              {formatPrice(notification.currentPrice, notification.currency)}
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
