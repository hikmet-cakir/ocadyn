import type { MARKETPLACES, NOTIFICATION_FREQUENCIES } from '@/utils/constants';

export type Marketplace = (typeof MARKETPLACES)[number];

export type TrackingStatus = 'active' | 'paused';

export type NotificationFrequency = (typeof NOTIFICATION_FREQUENCIES)[number];

export interface PricePoint {
  date: string;
  price: number;
}

export interface NotificationChannelSettings {
  email: boolean;
  sms: boolean;
  phone: boolean;
  push: boolean;
}

export interface TriggerSettings {
  percentDrop: number | null;
  percentRise: number | null;
  fixedDrop: number | null;
  fixedRise: number | null;
}

export interface NotificationSettings {
  channels: NotificationChannelSettings;
  triggers: TriggerSettings;
  frequency: NotificationFrequency;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  marketplace: Marketplace;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  currency: string;
  changePercent: number;
  priceHistory: PricePoint[];
  notificationSettings: NotificationSettings;
  trackingStatus: TrackingStatus;
  isFavorite: boolean;
  lastUpdated: string;
  url: string;
}
