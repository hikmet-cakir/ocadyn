import type {
  ApiMarketplace,
  ApiNotificationFrequency,
  ApiNotificationResponse,
  ApiNotificationSettings,
  ApiNotificationType,
  ApiProductResponse,
  ApiReportSummaryResponse,
  ApiTrackingStatus,
  ApiUserPlan,
  ApiUserResponse,
} from '@/types/api.types';
import type { AppNotification, NotificationType } from '@/types/notification.types';
import type {
  Marketplace,
  NotificationFrequency,
  NotificationSettings,
  Product,
  TrackingStatus,
} from '@/types/product.types';
import type { UserProfile } from '@/types/user.types';

const MARKETPLACE_FROM_API: Record<ApiMarketplace, Marketplace> = {
  AMAZON: 'Amazon',
  TRENDYOL: 'Trendyol',
  N11: 'N11',
  WALMART: 'Walmart',
  OTHER: 'Other',
};

const MARKETPLACE_TO_API: Partial<Record<Marketplace, ApiMarketplace>> = {
  Amazon: 'AMAZON',
  Trendyol: 'TRENDYOL',
  N11: 'N11',
  Walmart: 'WALMART',
  Other: 'OTHER',
};

const TRACKING_FROM_API: Record<ApiTrackingStatus, TrackingStatus> = {
  ACTIVE: 'active',
  PAUSED: 'paused',
};

const TRACKING_TO_API: Record<TrackingStatus, ApiTrackingStatus> = {
  active: 'ACTIVE',
  paused: 'PAUSED',
};

const FREQUENCY_FROM_API: Record<ApiNotificationFrequency, NotificationFrequency> = {
  HOURLY: 'hourly',
  SIX_HOURS: '6h',
  TWELVE_HOURS: '12h',
  DAILY: 'daily',
  WEEKLY: 'weekly',
};

const FREQUENCY_TO_API: Record<NotificationFrequency, ApiNotificationFrequency> = {
  hourly: 'HOURLY',
  '6h': 'SIX_HOURS',
  '12h': 'TWELVE_HOURS',
  daily: 'DAILY',
  weekly: 'WEEKLY',
};

const NOTIFICATION_TYPE_FROM_API: Record<ApiNotificationType, NotificationType> = {
  PRICE_DROP: 'price_drop',
  PRICE_INCREASE: 'price_increase',
  SYSTEM: 'system',
};

const PLAN_FROM_API: Record<ApiUserPlan, UserProfile['plan']> = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

export function mapUser(user: ApiUserResponse): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: PLAN_FROM_API[user.plan],
    locale: user.locale === 'tr' ? 'tr' : 'en',
  };
}

export function mapMarketplaceFromApi(marketplace: ApiMarketplace): Marketplace {
  return MARKETPLACE_FROM_API[marketplace] ?? 'Amazon';
}

export function mapMarketplaceToApi(marketplace: Marketplace): ApiMarketplace {
  return MARKETPLACE_TO_API[marketplace] ?? 'OTHER';
}

export function mapMarketplaceLabel(marketplace: ApiMarketplace | null): string {
  if (!marketplace) return '—';
  return mapMarketplaceFromApi(marketplace);
}

function mapNotificationSettings(settings: ApiNotificationSettings): NotificationSettings {
  return {
    channels: { ...settings.channels },
    triggers: { ...settings.triggers },
    frequency: FREQUENCY_FROM_API[settings.frequency],
  };
}

export function mapNotificationSettingsToApi(
  settings: NotificationSettings,
): ApiNotificationSettings {
  return {
    channels: { ...settings.channels },
    triggers: { ...settings.triggers },
    frequency: FREQUENCY_TO_API[settings.frequency],
  };
}

export function mapProduct(product: ApiProductResponse): Product {
  return {
    id: product.id,
    title: product.title,
    image: product.image,
    url: product.url,
    marketplace: mapMarketplaceFromApi(product.marketplace),
    currentPrice: product.currentPrice,
    lowestPrice: product.lowestPrice,
    highestPrice: product.highestPrice,
    currency: product.currency,
    changePercent: product.changePercent,
    priceHistory: product.priceHistory.map((point) => ({ ...point })),
    notificationSettings: mapNotificationSettings(product.notificationSettings),
    trackingStatus: TRACKING_FROM_API[product.trackingStatus],
    isFavorite: product.favorite,
    lastUpdated: product.lastUpdated,
  };
}

export function mapTrackingStatusToApi(status: TrackingStatus): ApiTrackingStatus {
  return TRACKING_TO_API[status];
}

export function mapNotification(notification: ApiNotificationResponse): AppNotification {
  return {
    id: notification.id,
    productId: notification.productId,
    productTitle: notification.productTitle,
    productImage: notification.productImage,
    marketplace: mapMarketplaceFromApi(notification.marketplace),
    type: NOTIFICATION_TYPE_FROM_API[notification.type],
    message: notification.message,
    previousPrice: notification.previousPrice,
    currentPrice: notification.currentPrice,
    currency: notification.currency,
    createdAt: notification.createdAt,
    read: notification.read,
  };
}

export function mapReportSummary(summary: ApiReportSummaryResponse) {
  return {
    averageSavings: summary.averageSavings,
    totalNotifications: summary.totalNotifications,
    mostTrackedMarketplace: mapMarketplaceLabel(summary.mostTrackedMarketplace),
    alertSuccessRate: summary.alertSuccessRate,
    savingsChart: summary.savingsChart.map((point) => ({ ...point })),
  };
}

export type ReportSummary = ReturnType<typeof mapReportSummary>;

export function mapNotificationFilterToApi(
  filter: 'all' | 'price_drop' | 'price_increase' | 'system',
): string | undefined {
  switch (filter) {
    case 'price_drop':
      return 'PRICE_DROP';
    case 'price_increase':
      return 'PRICE_INCREASE';
    case 'system':
      return 'SYSTEM';
    default:
      return undefined;
  }
}

export function mapProductStatusFilterToApi(
  tab: 'all' | 'active' | 'paused',
): ApiTrackingStatus | undefined {
  if (tab === 'active') return 'ACTIVE';
  if (tab === 'paused') return 'PAUSED';
  return undefined;
}
