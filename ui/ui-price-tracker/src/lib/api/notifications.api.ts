import { apiRequest } from '@/lib/api-client';
import { mapNotification, mapNotificationFilterToApi } from '@/lib/mappers';
import type { ApiNotificationResponse, ApiUnreadCountResponse } from '@/types/api.types';
import type { AppNotification } from '@/types/notification.types';

export type NotificationFilter = 'all' | 'price_drop' | 'price_increase' | 'system';

export async function fetchNotifications(
  filter: NotificationFilter = 'all',
): Promise<AppNotification[]> {
  const type = mapNotificationFilterToApi(filter);
  const path = type ? `/api/notifications?type=${type}` : '/api/notifications';
  const response = await apiRequest<ApiNotificationResponse[]>(path);
  return response.map(mapNotification);
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiRequest<ApiUnreadCountResponse>('/api/notifications/unread-count');
  return response.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest<void>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest<void>('/api/notifications/read-all', { method: 'POST' });
}
