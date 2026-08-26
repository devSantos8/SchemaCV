import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatMessage } from "@/types/jobs";

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: number; // Timestamp en ms
}

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos de inactividad

interface AIChatState {
  sessions: ChatSession[];
  currentSessionId: string;
  isOpen: boolean;

  // Acciones
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  getCurrentSession: () => ChatSession;
  createSession: (initialTitle?: string) => string;
  switchSession: (sessionId: string) => void;
  addMessage: (message: ChatMessage) => void;
  clearCurrentSession: () => void;
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  touchActivity: () => void;
  checkInactivity: () => boolean; // Devuelve true si la sesión expiró por inactividad
}

function createDefaultSession(): ChatSession {
  return {
    id: `session-${Date.now()}`,
    title: "Nueva conversación",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivityAt: Date.now(),
  };
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      sessions: [createDefaultSession()],
      currentSessionId: "",
      isOpen: false,

      setIsOpen(open: boolean) {
        set({ isOpen: open });
        if (open) {
          get().touchActivity();
        }
      },

      toggleOpen() {
        const next = !get().isOpen;
        set({ isOpen: next });
        if (next) {
          get().touchActivity();
        }
      },

      getCurrentSession() {
        const state = get();
        let current = state.sessions.find((s) => s.id === state.currentSessionId);
        if (!current) {
          if (state.sessions.length > 0) {
            current = state.sessions[0];
            set({ currentSessionId: current.id });
          } else {
            const newSession = createDefaultSession();
            set({ sessions: [newSession], currentSessionId: newSession.id });
            return newSession;
          }
        }
        return current;
      },

      createSession(initialTitle?: string) {
        const newSession: ChatSession = {
          id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: initialTitle || "Nueva conversación",
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivityAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));

        return newSession.id;
      },

      switchSession(sessionId: string) {
        set({ currentSessionId: sessionId });
        get().touchActivity();
      },

      addMessage(message: ChatMessage) {
        const state = get();
        const current = state.getCurrentSession();
        const now = Date.now();

        // Evitar duplicados exactos por ID
        if (current.messages.some((m) => m.id === message.id)) {
          return;
        }

        // Si es el primer mensaje de usuario, usarlo como título de la sesión
        let newTitle = current.title;
        if (message.role === "user" && current.messages.filter((m) => m.role === "user").length === 0) {
          newTitle = message.content.slice(0, 36) + (message.content.length > 36 ? "..." : "");
        }

        const updatedSession: ChatSession = {
          ...current,
          title: newTitle,
          messages: [...current.messages, message],
          updatedAt: new Date().toISOString(),
          lastActivityAt: now,
        };

        set((s) => ({
          sessions: s.sessions.map((sess) => (sess.id === current.id ? updatedSession : sess)),
          currentSessionId: current.id,
        }));
      },

      clearCurrentSession() {
        const state = get();
        const current = state.getCurrentSession();
        const resetSession: ChatSession = {
          ...current,
          title: "Nueva conversación",
          messages: [],
          updatedAt: new Date().toISOString(),
          lastActivityAt: Date.now(),
        };

        set((s) => ({
          sessions: s.sessions.map((sess) => (sess.id === current.id ? resetSession : sess)),
        }));
      },

      deleteSession(sessionId: string) {
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== sessionId);
          if (remaining.length === 0) {
            const fallback = createDefaultSession();
            return { sessions: [fallback], currentSessionId: fallback.id };
          }
          const nextCurrentId =
            state.currentSessionId === sessionId ? remaining[0].id : state.currentSessionId;
          return { sessions: remaining, currentSessionId: nextCurrentId };
        });
      },

      clearAllSessions() {
        const freshSession = createDefaultSession();
        set({
          sessions: [freshSession],
          currentSessionId: freshSession.id,
        });
      },

      touchActivity() {
        const state = get();
        const current = state.getCurrentSession();
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === current.id ? { ...sess, lastActivityAt: Date.now() } : sess
          ),
        }));
      },

      checkInactivity() {
        const state = get();
        const current = state.getCurrentSession();
        if (!current || current.messages.length === 0) return false;

        const timeSinceActivity = Date.now() - current.lastActivityAt;
        if (timeSinceActivity > INACTIVITY_TIMEOUT_MS) {
          // Inactividad superada: crear una nueva sesión limpia
          get().createSession("Nueva conversación");
          return true;
        }
        return false;
      },
    }),
    {
      name: "schemacv-ai-chat-sessions",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
