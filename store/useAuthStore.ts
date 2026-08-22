import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOutUser,
} from "@/lib/supabase/auth";
import { getSupabaseProfile, updateSupabaseProfile } from "@/lib/supabase/db";

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
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginWithProvider: (provider: "google" | "linkedin" | "github") => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  setAuthModalOpen: (open: boolean, mode?: "login" | "register") => void;
  setSettingsModalOpen: (open: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  initSession: () => Promise<void>;
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
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      isSettingsModalOpen: false,
      authMode: "login",
      isLoading: false,
      error: null,

      initSession: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await getSupabaseProfile(session.user.id);
            const user: UserProfile = {
              id: session.user.id,
              name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuario",
              email: session.user.email || "",
              avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
              bannerTheme: profile?.banner_theme || "default",
              joinedDate: new Date(session.user.created_at).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              }),
              isDemoUser: false,
            };
            set({ user, isAuthenticated: true });
          }
        } catch (err) {
          console.error("Error al inicializar sesión de Supabase:", err);
        }
      },

      login: async (email: string, password?: string) => {
        set({ isLoading: true, error: null });
        try {
          if (isSupabaseConfigured() && password) {
            const { data, error } = await signInWithEmail(email, password);
            if (error) {
              set({ error: error.message, isLoading: false });
              return false;
            }
            if (data.user) {
              const profile = await getSupabaseProfile(data.user.id);
              const user: UserProfile = {
                id: data.user.id,
                name: profile?.name || (data.user as any).user_metadata?.full_name || email.split("@")[0],
                email,
                avatarUrl: profile?.avatar_url,
                bannerTheme: profile?.banner_theme || "default",
                joinedDate: new Date().toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                }),
                isDemoUser: false,
              };
              set({ user, isAuthenticated: true, isAuthModalOpen: false, isLoading: false });
              return true;
            }
          }

          // Fallback Local / Demo
          const user: UserProfile = {
            ...DEFAULT_DEMO_USER,
            id: `user-${Date.now()}`,
            name: email.split("@")[0],
            email,
            joinedDate: new Date().toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            }),
            isDemoUser: false,
          };
          set({ user, isAuthenticated: true, isAuthModalOpen: false, isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.message || "Error al iniciar sesión", isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, password?: string) => {
        set({ isLoading: true, error: null });
        try {
          if (isSupabaseConfigured() && password) {
            const { data, error } = await signUpWithEmail(email, password, name);
            if (error) {
              set({ error: error.message, isLoading: false });
              return false;
            }
            if (data.user) {
              const user: UserProfile = {
                id: data.user.id,
                name,
                email,
                joinedDate: new Date().toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                }),
                isDemoUser: false,
              };
              set({ user, isAuthenticated: true, isAuthModalOpen: false, isLoading: false });
              return true;
            }
          }

          // Fallback Local
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
          set({ user, isAuthenticated: true, isAuthModalOpen: false, isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.message || "Error al registrarse", isLoading: false });
          return false;
        }
      },

      loginWithProvider: async (provider: "google" | "linkedin" | "github") => {
        set({ isLoading: true, error: null });
        try {
          if (isSupabaseConfigured()) {
            const { error } = await signInWithOAuth(provider);
            if (error) {
              const providerName = provider === "google" ? "Google" : provider === "github" ? "GitHub" : "LinkedIn";
              set({
                error: `El acceso con ${providerName} aún no está habilitado en tu panel de Supabase (Authentication → Providers). Puedes usar Correo y Contraseña o Modo Invitado.`,
                isLoading: false,
              });
              return;
            }
            return;
          }

          // Simulación local si no está configurado Supabase
          let name = "Joain Matías Monroy";
          let email = "matiasmonroy483@gmail.com";
          let githubUrl = "https://github.com/devSantos8";
          let linkedinUrl = "https://linkedin.com/in/joain-monroy";

          if (provider === "google") {
            name = "Joain Monroy (Google)";
            email = "matiasmonroy483@gmail.com";
          } else if (provider === "github") {
            name = "devSantos8 (GitHub)";
            email = "devsantos8@users.noreply.github.com";
            githubUrl = "https://github.com/devSantos8";
          } else if (provider === "linkedin") {
            name = "Joain Monroy Santos (LinkedIn)";
            email = "jmonroys@linkedin.com";
            linkedinUrl = "https://linkedin.com/in/joain-monroy";
          }

          const user: UserProfile = {
            ...DEFAULT_DEMO_USER,
            id: `user-${provider}-${Date.now()}`,
            name,
            email,
            githubUrl,
            linkedinUrl,
            joinedDate: new Date().toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            }),
            isDemoUser: false,
          };
          set({ user, isAuthenticated: true, isAuthModalOpen: false, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || "Error al conectar con proveedor", isLoading: false });
        }
      },

      loginAsGuest: () => {
        set({
          user: DEFAULT_DEMO_USER,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });
      },

      logout: async () => {
        if (isSupabaseConfigured()) {
          await signOutUser();
        }
        set({
          user: null,
          isAuthenticated: false,
          isAuthModalOpen: true,
          authMode: "login",
        });
      },

      setAuthModalOpen: (open: boolean, mode = "login") => {
        set({ isAuthModalOpen: open, authMode: mode, error: null });
      },

      setSettingsModalOpen: (open: boolean) => {
        set({ isSettingsModalOpen: open });
      },

      updateUserProfile: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));

        if (isSupabaseConfigured() && !currentUser.isDemoUser) {
          try {
            await updateSupabaseProfile(currentUser.id, {
              name: updates.name ?? currentUser.name,
              avatar_url: updates.avatarUrl ?? currentUser.avatarUrl,
              banner_theme: updates.bannerTheme ?? currentUser.bannerTheme,
            });
          } catch (err) {
            console.error("Error al actualizar perfil en Supabase:", err);
          }
        }
      },

      deleteAccount: async () => {
        const currentUser = get().user;
        if (currentUser && isSupabaseConfigured() && !currentUser.isDemoUser) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
          if (isUuid) {
            try {
              const { deleteSupabaseUserAccount } = await import("@/lib/supabase/db");
              await deleteSupabaseUserAccount(currentUser.id);
            } catch (err) {
              console.error("Error al eliminar cuenta en Supabase:", err);
            }
          }
        }

        // Limpiar storage local y stores
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("schemacv-auth-v1");
            localStorage.removeItem("schemacv-storage-v1");
            localStorage.removeItem("schemacv-jobs-storage");
          }
        } catch {}

        set({
          user: null,
          isAuthenticated: false,
          isAuthModalOpen: true,
          authMode: "login",
        });
      },
    }),
    {
      name: "schemacv-auth-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
