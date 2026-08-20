"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Zap, CheckCircle2, XCircle, Loader2, Lock, ExternalLink, Trash2 } from "lucide-react";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { AI_PROVIDER_LABELS } from "@/types/jobs";
import type { AIProvider } from "@/types/jobs";

const STATUS_CONFIG = {
  idle: { color: "text-zinc-400", label: "Sin configurar", icon: null },
  testing: { color: "text-blue-500", label: "Probando...", icon: Loader2 },
  ok: { color: "text-emerald-500", label: "Conectado", icon: CheckCircle2 },
  error: { color: "text-red-500", label: "Error", icon: XCircle },
};

export function AISettingsCard() {
  const {
    provider, apiKey, enabled, connectionStatus, lastError, testedModel,
    setProvider, setApiKey, setEnabled, testConnection, clearKey,
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

  const docsUrl = provider === "openai"
    ? "https://platform.openai.com/api-keys"
    : "https://console.anthropic.com/keys";

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Integracion IA</p>
            <p className="text-xs text-zinc-500">Bring Your Own Key (BYOK)</p>
          </div>
        </div>

        {/* Switch */}
        <button
          onClick={() => setEnabled(!enabled)}
          disabled={!apiKey}
          title={!apiKey ? "Agrega una API key primero" : ""}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed ${
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
        {/* Proveedor */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Proveedor</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(AI_PROVIDER_LABELS) as AIProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  provider === p
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {AI_PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">API Key</label>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 hover:underline"
            >
              Obtener key <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`${provider === "openai" ? "sk-..." : "sk-ant-..."}`}
              className="w-full h-9 pl-3 pr-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowKey(!showKey)}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              {apiKey && (
                <button
                  onClick={clearKey}
                  className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Boton probar + estado */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={!apiKey || isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isTesting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Zap className="w-3 h-3" />
            )}
            Probar conexion
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={connectionStatus}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-1 text-xs font-medium ${statusConf.color}`}
            >
              {StatusIcon && (
                <StatusIcon className={`w-3.5 h-3.5 ${connectionStatus === "testing" ? "animate-spin" : ""}`} />
              )}
              <span>{testedModel ? `${statusConf.label} · ${testedModel}` : statusConf.label}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {lastError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-500 dark:text-red-400"
          >
            {lastError}
          </motion.p>
        )}

        {/* Nota de privacidad */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Tu API key se guarda <strong>solo en tu navegador</strong> (localStorage). Nunca se envia a servidores propios de forma permanente. Viaja directamente a {provider === "openai" ? "OpenAI" : "Anthropic"} en cada solicitud.
          </p>
        </div>
      </div>
    </div>
  );
}
