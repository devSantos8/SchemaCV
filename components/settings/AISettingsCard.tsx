"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  ExternalLink,
  Trash2,
  Sparkles,
  Bot,
  Cpu,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_DOCS,
  AI_PROVIDER_PLACEHOLDERS,
} from "@/types/jobs";
import type { AIProvider } from "@/types/jobs";

const STATUS_CONFIG = {
  idle: { color: "text-zinc-400 dark:text-zinc-500", label: "Sin configurar", icon: null },
  testing: { color: "text-blue-500 dark:text-blue-400", label: "Probando conexion...", icon: Loader2 },
  ok: { color: "text-emerald-600 dark:text-emerald-400", label: "Conectado", icon: CheckCircle2 },
  error: { color: "text-red-500 dark:text-red-400", label: "Error de conexion", icon: XCircle },
};

const PROVIDER_METAS: Record<
  AIProvider,
  { name: string; modelInfo: string; icon: React.ElementType }
> = {
  google: {
    name: "Google (Gemini)",
    modelInfo: "Gemini 2.0 Flash / Pro",
    icon: Sparkles,
  },
  openai: {
    name: "OpenAI (GPT-4o)",
    modelInfo: "GPT-4o / GPT-4o-mini",
    icon: Cpu,
  },
  anthropic: {
    name: "Anthropic (Claude)",
    modelInfo: "Claude 3.5 Haiku / Sonnet",
    icon: Layers,
  },
};

export function AISettingsCard() {
  const {
    provider,
    apiKey,
    enabled,
    connectionStatus,
    lastError,
    testedModel,
    setProvider,
    setApiKey,
    setEnabled,
    testConnection,
    clearKey,
  } = useAISettingsStore();

  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const statusConf = STATUS_CONFIG[connectionStatus];
  const StatusIcon = statusConf.icon;

  async function handleTest() {
    setIsTesting(true);
    await testConnection();
    setIsTesting(false);
  }

  const docsUrl = AI_PROVIDER_DOCS[provider] || "https://aistudio.google.com/app/apikey";
  const placeholder = AI_PROVIDER_PLACEHOLDERS[provider] || "AIzaSy...";

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Integracion y Motor IA
            </p>
            <p className="text-xs text-zinc-500">
              Bring Your Own Key (BYOK) · Razonamiento y analisis de ofertas
            </p>
          </div>
        </div>

        {/* Switch */}
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          disabled={!apiKey}
          title={!apiKey ? "Ingresa una API key primero" : ""}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            enabled ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          <motion.span
            animate={{ x: enabled ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Selector de Proveedor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Proveedor de IA
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">
              Modelo: {PROVIDER_METAS[provider].modelInfo}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(AI_PROVIDER_LABELS) as AIProvider[]).map((p) => {
              const meta = PROVIDER_METAS[p];
              const Icon = meta.icon;
              const isSelected = provider === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 text-violet-900 dark:text-violet-200 shadow-2xs"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isSelected
                            ? "text-violet-600 dark:text-violet-400"
                            : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      />
                      <span className="text-xs font-semibold">{meta.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {meta.modelInfo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Clave de API ({AI_PROVIDER_LABELS[provider]})
            </label>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Obtener clave en {provider === "google" ? "Google AI Studio" : provider === "openai" ? "OpenAI Platform" : "Anthropic Console"}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={placeholder}
              className="w-full h-9 pl-3 pr-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                title={showKey ? "Ocultar clave" : "Mostrar clave"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={clearKey}
                  className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Eliminar clave"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Boton Probar Conexion + Estado */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleTest}
            disabled={!apiKey || isTesting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Probando...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Probar conexion</span>
              </>
            )}
          </button>

          <AnimatePresence mode="wait">
            {!isTesting && connectionStatus === "ok" && (
              <motion.div
                key="status-ok"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Conectado{testedModel ? ` · ${testedModel}` : ""}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mensaje de error único */}
        {!isTesting && lastError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2"
          >
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{lastError}</div>
          </motion.div>
        )}

        {/* Nota de privacidad y seguridad */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Tu clave se almacena <strong>unicamente en tu navegador</strong> (localStorage). No se guarda de forma permanente en servidores externos y se envia de forma segura y directa a {provider === "google" ? "Google Gemini" : provider === "openai" ? "OpenAI" : "Anthropic"} en cada peticion.
          </p>
        </div>
      </div>
    </div>
  );
}
