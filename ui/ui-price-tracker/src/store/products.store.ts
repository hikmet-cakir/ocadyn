import { create } from 'zustand';
import * as productsApi from '@/lib/api/products.api';
import type { ApiProductStatsResponse } from '@/types/api.types';
import type { NotificationSettings, Product, TrackingStatus } from '@/types/product.types';

interface ProductsState {
  products: Product[];
  stats: ApiProductStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  loadProducts: (query?: productsApi.ProductQuery) => Promise<void>;
  loadStats: () => Promise<void>;
  loadProductById: (id: string) => Promise<Product | null>;
  addProductFromUrl: (url: string) => Promise<string>;
  toggleTracking: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateNotificationSettings: (id: string, settings: NotificationSettings) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  upsertProduct: (product: Product) => void;
  clearError: () => void;
}

function replaceProduct(products: Product[], updated: Product): Product[] {
  const index = products.findIndex((item) => item.id === updated.id);
  if (index === -1) return [updated, ...products];
  const next = [...products];
  next[index] = updated;
  return next;
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  stats: null,
  isLoading: false,
  error: null,

  loadProducts: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsApi.fetchProducts(query);
      set({ products, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load products',
      });
    }
  },

  loadStats: async () => {
    try {
      const stats = await productsApi.fetchProductStats();
      set({ stats });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load stats',
      });
    }
  },

  loadProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productsApi.fetchProductById(id);
      set((state) => ({
        products: replaceProduct(state.products, product),
        isLoading: false,
      }));
      return product;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load product',
      });
      return null;
    }
  },

  addProductFromUrl: async (url) => {
    set({ error: null });
    const product = await productsApi.createProductFromUrl(url);
    set((state) => ({
      products: [product, ...state.products.filter((item) => item.id !== product.id)],
    }));
    return product.id;
  },

  toggleTracking: async (id) => {
    const current = get().products.find((product) => product.id === id);
    if (!current) return;

    const nextStatus: TrackingStatus =
      current.trackingStatus === 'active' ? 'paused' : 'active';

    try {
      const updated = await productsApi.updateTrackingStatus(id, nextStatus);
      set((state) => ({
        products: replaceProduct(state.products, updated),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update tracking',
      });
    }
  },

  toggleFavorite: async (id) => {
    const current = get().products.find((product) => product.id === id);
    if (!current) return;

    try {
      const updated = await productsApi.updateFavorite(id, !current.isFavorite);
      set((state) => ({
        products: replaceProduct(state.products, updated),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update favorite',
      });
    }
  },

  updateNotificationSettings: async (id, settings) => {
    try {
      const updated = await productsApi.updateNotificationSettings(id, settings);
      set((state) => ({
        products: replaceProduct(state.products, updated),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save notification settings',
      });
      throw error;
    }
  },

  getProductById: (id) => get().products.find((product) => product.id === id),

  upsertProduct: (product) =>
    set((state) => ({
      products: replaceProduct(state.products, product),
    })),

  clearError: () => set({ error: null }),
}));
