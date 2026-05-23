import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUser } from '@/mock/users';
import type { UserProfile } from '@/types/user.types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: (email, _password) => {
        if (!email.trim()) return false;
        set({
          isAuthenticated: true,
          user: { ...mockUser, email: email.trim() },
        });
        return true;
      },

      register: (name, email, _password) => {
        if (!name.trim() || !email.trim()) return false;
        set({
          isAuthenticated: true,
          user: { ...mockUser, name: name.trim(), email: email.trim() },
        });
        return true;
      },

      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'ocadyn-auth',
      skipHydration: true,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
);
