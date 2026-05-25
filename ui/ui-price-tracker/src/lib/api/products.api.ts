import { apiRequest } from '@/lib/api-client';
import {
  mapNotificationSettingsToApi,
  mapProduct,
  mapTrackingStatusToApi,
} from '@/lib/mappers';
import type {
  ApiProductResponse,
  ApiProductStatsResponse,
} from '@/types/api.types';
import type { NotificationSettings, Product, TrackingStatus } from '@/types/product.types';

export interface ProductQuery {
  status?: TrackingStatus;
  favorite?: boolean;
  search?: string;
}

function buildProductQuery(query: ProductQuery = {}): string {
  const params = new URLSearchParams();
  if (query.status) params.set('status', mapTrackingStatusToApi(query.status));
  if (query.favorite !== undefined) params.set('favorite', String(query.favorite));
  if (query.search?.trim()) params.set('search', query.search.trim());
  const qs = params.toString();
  return qs ? `/api/products?${qs}` : '/api/products';
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const response = await apiRequest<ApiProductResponse[]>(buildProductQuery(query));
  return response.map(mapProduct);
}

export async function fetchProductStats(): Promise<ApiProductStatsResponse> {
  return apiRequest<ApiProductStatsResponse>('/api/products/stats');
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiRequest<ApiProductResponse>(`/api/products/${id}`);
  return mapProduct(response);
}

export async function createProductFromUrl(url: string): Promise<Product> {
  const response = await apiRequest<ApiProductResponse>('/api/products', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
  return mapProduct(response);
}

export async function updateTrackingStatus(
  id: string,
  trackingStatus: TrackingStatus,
): Promise<Product> {
  const response = await apiRequest<ApiProductResponse>(`/api/products/${id}/tracking`, {
    method: 'PATCH',
    body: JSON.stringify({ trackingStatus: mapTrackingStatusToApi(trackingStatus) }),
  });
  return mapProduct(response);
}

export async function updateFavorite(id: string, favorite: boolean): Promise<Product> {
  const response = await apiRequest<ApiProductResponse>(`/api/products/${id}/favorite`, {
    method: 'PATCH',
    body: JSON.stringify({ favorite }),
  });
  return mapProduct(response);
}

export async function updateNotificationSettings(
  id: string,
  settings: NotificationSettings,
): Promise<Product> {
  const response = await apiRequest<ApiProductResponse>(
    `/api/products/${id}/notification-settings`,
    {
      method: 'PUT',
      body: JSON.stringify({ notificationSettings: mapNotificationSettingsToApi(settings) }),
    },
  );
  return mapProduct(response);
}
