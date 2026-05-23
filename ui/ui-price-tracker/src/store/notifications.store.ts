import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockNotifications } from '@/mock/notifications';
import type { AppNotification } from '@/types/notification.types';

type NotificationFilter = 'all' | 'price_drop' | 'price_increase' | 'system';

interface NotificationsState {
  items: AppNotification[];
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      items: mockNotifications,
      filter: 'all',
      setFilter: (filter) => set({ filter }),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((state) => ({
          items: state.items.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'ocadyn-notifications',
      skipHydration: true,
    },
  ),
);
