import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AIProvider } from "@/types/jobs";

type ConnectionStatus = "idle" | "testing" | "ok" | "error";

interface AISettingsState {
  // Configuracion
  provider: AIProvider;
  apiKey: string;
  enabled: boolean;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  testedModel: string | null;

  // Acciones
  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setEnabled: (enabled: boolean) => void;
  testConnection: () => Promise<void>;
  clearKey: () => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set, get) => ({
      provider: "openai",
      apiKey: "",
      enabled: false,
      connectionStatus: "idle",
      lastError: null,
      testedModel: null,

      setProvider(provider) {
        set({ provider, connectionStatus: "idle", lastError: null, testedModel: null });
      },

      setApiKey(key) {
        set({ apiKey: key, connectionStatus: "idle", lastError: null, testedModel: null });
      },

      setEnabled(enabled) {
        if (enabled && !get().apiKey) {
          set({ enabled: false });
          return;
        }
        set({ enabled });
      },

      async testConnection() {
        const { provider, apiKey } = get();
        if (!apiKey) {
          set({ connectionStatus: "error", lastError: "Ingresa tu API key primero." });
          return;
        }
        set({ connectionStatus: "testing", lastError: null });
        try {
          const res = await fetch("/api/ai/test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-AI-Key": apiKey,
              "X-AI-Provider": provider,
            },
          });
          const data = await res.json() as { ok: boolean; model?: string; error?: string };
          if (data.ok) {
            set({ connectionStatus: "ok", lastError: null, testedModel: data.model ?? null, enabled: true });
          } else {
            set({ connectionStatus: "error", lastError: data.error ?? "Error desconocido." });
          }
        } catch (err) {
          set({
            connectionStatus: "error",
            lastError: err instanceof Error ? err.message : "Error de red.",
          });
        }
      },

      clearKey() {
        set({ apiKey: "", enabled: false, connectionStatus: "idle", lastError: null, testedModel: null });
      },
    }),
    {
      name: "schemacv-ai-settings",
      storage: createJSONStorage(() => localStorage),
      // PRIVACIDAD: la key se persiste solo en localStorage del usuario.
      // Nunca se envia a servidores propios de forma permanente.
    }
  )
);
