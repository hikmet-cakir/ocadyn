import type { Marketplace } from '@/types/product.types';

export type NotificationType = 'price_drop' | 'price_increase' | 'system';

export interface AppNotification {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  marketplace: Marketplace;
  type: NotificationType;
  message: string;
  previousPrice: number;
  currentPrice: number;
  currency: string;
  createdAt: string;
  read: boolean;
}
