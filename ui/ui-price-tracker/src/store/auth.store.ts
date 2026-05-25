import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '@/lib/api/auth.api';
import { setAuthToken } from '@/lib/api-client';
import type { UserProfile } from '@/types/user.types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  updateProfile: (payload: { name?: string; locale?: string }) => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      login: async (email, password) => {
        const { token, user } = await authApi.login({ email, password });
        setAuthToken(token);
        set({ token, user, isAuthenticated: true });
      },

      register: async (name, email, password) => {
        const { token, user } = await authApi.register({ name, email, password });
        setAuthToken(token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        setAuthToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },

      restoreSession: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        setAuthToken(token);
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
          return true;
        } catch {
          setAuthToken(null);
          set({ token: null, user: null, isAuthenticated: false });
          return false;
        }
      },

      updateProfile: async (payload) => {
        const user = await authApi.updateProfile(payload);
        set({ user });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'ocadyn-auth',
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
