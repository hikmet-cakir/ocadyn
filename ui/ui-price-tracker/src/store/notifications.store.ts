import { create } from 'zustand';
import * as notificationsApi from '@/lib/api/notifications.api';
import type { AppNotification } from '@/types/notification.types';

type NotificationFilter = notificationsApi.NotificationFilter;

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  filter: NotificationFilter;
  isLoading: boolean;
  error: string | null;
  setFilter: (filter: NotificationFilter) => void;
  loadNotifications: (filter?: NotificationFilter) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  unreadCount: 0,
  filter: 'all',
  isLoading: false,
  error: null,

  setFilter: (filter) => {
    set({ filter });
    void get().loadNotifications(filter);
  },

  loadNotifications: async (filter = get().filter) => {
    set({ isLoading: true, error: null });
    try {
      const items = await notificationsApi.fetchNotifications(filter);
      set({ items, isLoading: false, filter });
      await get().loadUnreadCount();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
      });
    }
  },

  loadUnreadCount: async () => {
    try {
      const unreadCount = await notificationsApi.fetchUnreadCount();
      set({ unreadCount });
    } catch {
      set({ unreadCount: get().items.filter((item) => !item.read).length });
    }
  },

  markRead: async (id) => {
    try {
      await notificationsApi.markNotificationRead(id);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      });
    }
  },

  markAllRead: async () => {
    try {
      await notificationsApi.markAllNotificationsRead();
      set((state) => ({
        items: state.items.map((item) => ({ ...item, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
