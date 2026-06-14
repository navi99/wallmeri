import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setTokens } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setAuth: (res: AuthResponse) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setAuth: (res) => {
        setTokens(res.tokens);
        set({ user: res.user });
      },
      logout: () => {
        setTokens(null);
        set({ user: null });
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "wallmeri.auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
