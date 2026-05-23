import type { AppNotification } from '@/types/notification.types';

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    productId: 'prod-iphone-15',
    productTitle: 'Apple iPhone 15 128GB',
    productImage:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    marketplace: 'Amazon',
    type: 'price_drop',
    message: 'Price dropped by 4.2%',
    previousPrice: 939,
    currentPrice: 899,
    currency: 'USD',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    productId: 'prod-ps5',
    productTitle: 'PlayStation 5 Console',
    productImage:
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    marketplace: 'Walmart',
    type: 'price_increase',
    message: 'Price increased by 2.1%',
    previousPrice: 439,
    currentPrice: 449,
    currency: 'USD',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: 'notif-3',
    productId: 'prod-oled-tv',
    productTitle: 'Samsung 65" OLED 4K Smart TV',
    productImage:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    marketplace: 'Trendyol',
    type: 'price_drop',
    message: 'Price dropped by 6.5%',
    previousPrice: 1399,
    currentPrice: 1299,
    currency: 'USD',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
];
