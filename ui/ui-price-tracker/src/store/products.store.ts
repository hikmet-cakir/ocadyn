import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProducts } from '@/mock/products';
import type {
  NotificationSettings,
  Product,
  TrackingStatus,
} from '@/types/product.types';

interface ProductsState {
  products: Product[];
  addProductFromUrl: (url: string) => string;
  toggleTracking: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setTrackingStatus: (id: string, status: TrackingStatus) => void;
  updateNotificationSettings: (id: string, settings: NotificationSettings) => void;
  getProductById: (id: string) => Product | undefined;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: mockProducts,

      addProductFromUrl: (url) => {
        const id = `prod-${Date.now()}`;
        const newProduct: Product = {
          id,
          title: 'New tracked product',
          image:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          marketplace: 'Amazon',
          currentPrice: 299,
          lowestPrice: 279,
          highestPrice: 349,
          currency: 'USD',
          changePercent: 0,
          priceHistory: [
            {
              date: new Date(Date.now() - 86400000 * 14).toISOString(),
              price: 349,
            },
            {
              date: new Date(Date.now() - 86400000 * 7).toISOString(),
              price: 319,
            },
            { date: new Date().toISOString(), price: 299 },
          ],
          notificationSettings: { ...mockProducts[0].notificationSettings },
          trackingStatus: 'active',
          isFavorite: false,
          lastUpdated: new Date().toISOString(),
          url,
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
        return id;
      },

      toggleTracking: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  trackingStatus: p.trackingStatus === 'active' ? 'paused' : 'active',
                }
              : p,
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
          ),
        })),

      setTrackingStatus: (id, status) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, trackingStatus: status } : p,
          ),
        })),

      updateNotificationSettings: (id, settings) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, notificationSettings: settings } : p,
          ),
        })),

      getProductById: (id) => get().products.find((p) => p.id === id),
    }),
    {
      name: 'ocadyn-products',
      skipHydration: true,
      partialize: (state) => ({ products: state.products }),
    },
  ),
);
