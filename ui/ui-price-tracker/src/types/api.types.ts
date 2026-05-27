export type ApiUserPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type ApiMarketplace =
  | 'AMAZON'
  | 'TRENDYOL'
  | 'N11'
  | 'WALMART'
  | 'OTHER';
export type ApiTrackingStatus = 'ACTIVE' | 'PAUSED';
export type ApiNotificationType = 'PRICE_DROP' | 'PRICE_INCREASE' | 'SYSTEM';
export type ApiNotificationFrequency =
  | 'HOURLY'
  | 'SIX_HOURS'
  | 'TWELVE_HOURS'
  | 'DAILY'
  | 'WEEKLY';

export interface ApiUserResponse {
  id: string;
  name: string;
  email: string;
  plan: ApiUserPlan;
  locale: string;
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUserResponse;
}

export interface ApiPricePoint {
  date: string;
  price: number;
}

export interface ApiNotificationChannelSettings {
  email: boolean;
  sms: boolean;
  phone: boolean;
  push: boolean;
}

export interface ApiTriggerSettings {
  percentDrop: number | null;
  percentRise: number | null;
  fixedDrop: number | null;
  fixedRise: number | null;
}

export interface ApiNotificationSettings {
  channels: ApiNotificationChannelSettings;
  triggers: ApiTriggerSettings;
  frequency: ApiNotificationFrequency;
  instantAlertsEnabled: boolean;
}

export interface ApiProductResponse {
  id: string;
  title: string;
  image: string;
  url: string;
  marketplace: ApiMarketplace;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  currency: string;
  changePercent: number;
  priceHistory: ApiPricePoint[];
  notificationSettings: ApiNotificationSettings;
  trackingStatus: ApiTrackingStatus;
  favorite: boolean;
  lastUpdated: string;
}

export interface ApiProductStatsResponse {
  total: number;
  dropped: number;
  increased: number;
  unchanged: number;
}

export interface ApiNotificationResponse {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  marketplace: ApiMarketplace;
  type: ApiNotificationType;
  message: string;
  previousPrice: number;
  currentPrice: number;
  currency: string;
  read: boolean;
  createdAt: string;
}

export interface ApiUnreadCountResponse {
  count: number;
}

export interface ApiSavingsChartPoint {
  month: string;
  savings: number;
}

export interface ApiReportSummaryResponse {
  averageSavings: number;
  totalNotifications: number;
  mostTrackedMarketplace: ApiMarketplace | null;
  alertSuccessRate: number;
  savingsChart: ApiSavingsChartPoint[];
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  message?: string;
  fields?: Record<string, string>;
}
