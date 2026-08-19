import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
  isDemoUser?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "register";

  // Acciones
  login: (email: string, name?: string) => void;
  register: (name: string, email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean, mode?: "login" | "register") => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: "user-demo-01",
  name: "Joain Matias Monroy",
  email: "matiasmonroy483@gmail.com",
  joinedDate: "Agosto 2026",
  isDemoUser: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_DEMO_USER,
      isAuthenticated: true,
      isAuthModalOpen: false,
      authMode: "login",

      login: (email: string, name?: string) => {
        const user: UserProfile = {
          id: `user-${Date.now()}`,
          name: name || email.split("@")[0],
          email,
          joinedDate: new Date().toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          }),
          isDemoUser: false,
        };
        set({ user, isAuthenticated: true, isAuthModalOpen: false });
      },

      register: (name: string, email: string) => {
        const user: UserProfile = {
          id: `user-${Date.now()}`,
          name,
          email,
          joinedDate: new Date().toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          }),
          isDemoUser: false,
        };
        set({ user, isAuthenticated: true, isAuthModalOpen: false });
      },

      loginAsGuest: () => {
        set({
          user: DEFAULT_DEMO_USER,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAuthModalOpen: true,
          authMode: "login",
        });
      },

      setAuthModalOpen: (open: boolean, mode = "login") => {
        set({ isAuthModalOpen: open, authMode: mode });
      },

      updateUserProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: "schemacv-auth-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
