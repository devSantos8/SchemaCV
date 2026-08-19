import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatarUrl?: string;
  bannerTheme?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  experienceYears?: string;
  availability?: string;
  joinedDate: string;
  isDemoUser?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isSettingsModalOpen: boolean;
  authMode: "login" | "register";

  // Acciones
  login: (email: string, name?: string) => void;
  register: (name: string, email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean, mode?: "login" | "register") => void;
  setSettingsModalOpen: (open: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: "user-demo-01",
  name: "Joain Matias Monroy",
  email: "matiasmonroy483@gmail.com",
  headline: "Senior Full Stack & Cloud Developer",
  bio: "Ingeniero de software con foco en arquitecturas distribuidas, diseño UI/UX de alta fidelidad y optimización para filtros ATS.",
  location: "Santiago, Chile",
  phone: "+56 9 4900 2793",
  githubUrl: "https://github.com/devSantos8",
  linkedinUrl: "https://linkedin.com/in/joain-monroy",
  websiteUrl: "https://schemacv.dev",
  bannerTheme: "warm_amber",
  experienceYears: "5+ Años Exp.",
  availability: "Disponible Inmediato",
  joinedDate: "Agosto 2026",
  isDemoUser: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_DEMO_USER,
      isAuthenticated: true,
      isAuthModalOpen: false,
      isSettingsModalOpen: false,
      authMode: "login",

      login: (email: string, name?: string) => {
        const user: UserProfile = {
          ...DEFAULT_DEMO_USER,
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
          ...DEFAULT_DEMO_USER,
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

      setSettingsModalOpen: (open: boolean) => {
        set({ isSettingsModalOpen: open });
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
