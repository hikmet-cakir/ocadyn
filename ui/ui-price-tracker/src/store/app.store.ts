import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_LOCALE,
  STORAGE_KEYS,
  type SupportedLocale,
} from '@/utils/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  theme: ThemeMode;
  locale: SupportedLocale;
  sidebarCollapsed: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: SupportedLocale) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      locale: DEFAULT_LOCALE,
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'ocadyn-app',
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

export { STORAGE_KEYS };
