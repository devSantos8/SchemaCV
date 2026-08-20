"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, FileText, Loader2, AlertCircle, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { toast } from "sonner";
import type { ScrapeResult } from "@/types/jobs";

interface AddJobModalProps {
  onClose: () => void;
}

type Step = "input" | "confirm";
type InputMode = "url" | "manual";

export function AddJobModal({ onClose }: AddJobModalProps) {
  const { addApplication, analyzeKeywords } = useJobsStore();
  const { resumeData } = useResumeStore();
  const { enabled } = useAISettingsStore();

  const [step, setStep] = useState<Step>("input");
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [scraped, setScraped] = useState<ScrapeResult | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function handleScrape() {
    if (!url.trim()) return;
    setIsScraping(true);
    setScrapeError(null);
    try {
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json() as ScrapeResult & { error?: string };
      if (data.error) {
        setScrapeError(data.error);
        setMode("manual");
      } else {
        setScraped(data);
        setManualTitle(data.title);
        setManualCompany(data.company);
        setManualDesc(data.description);
        setStep("confirm");
      }
    } catch {
      setScrapeError("No se pudo conectar al servidor. Pega la descripcion manualmente.");
      setMode("manual");
    } finally {
      setIsScraping(false);
    }
  }

  async function handleAdd() {
    const title = manualTitle.trim() || scraped?.title || "Sin titulo";
    const company = manualCompany.trim() || scraped?.company || "Sin empresa";
    const description = manualDesc.trim() || scraped?.description || "";

    setIsAdding(true);
    const app = addApplication({
      title,
      company,
      url: url.trim() || undefined,
      description,
      location: scraped?.location,
      salary: scraped?.salary,
      portal: scraped?.portal,
      status: "bookmarked",
    });

    // Analisis automatico de keywords
    if (description) {
      analyzeKeywords(app.id, resumeData);
    }

    toast.success("Postulación agregada al tablero", {
      description: `${title} en ${company}`,
    });

    setIsAdding(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Agregar postulacion</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {step === "input" ? "Paso 1 de 2 — Fuente de la oferta" : "Paso 2 de 2 — Confirmar datos"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.div
              key="step-input"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-5 space-y-4"
            >
              {/* Tabs de modo */}
              <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                {[
                  { id: "url" as InputMode, label: "Pegar URL", icon: LinkIcon },
                  { id: "manual" as InputMode, label: "Descripcion manual", icon: FileText },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      mode === id
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {mode === "url" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">URL de la oferta</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setScrapeError(null); }}
                      placeholder="https://linkedin.com/jobs/..."
                      className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                    />
                  </div>
                  {scrapeError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">{scrapeError}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Titulo del puesto</label>
                      <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Senior Developer" className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Empresa</label>
                      <input value={manualCompany} onChange={(e) => setManualCompany(e.target.value)} placeholder="Acme Corp" className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Descripcion de la oferta</label>
                    <textarea value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} placeholder="Pega aqui el texto completo de la oferta..." rows={6} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                {mode === "url" ? (
                  <button
                    onClick={handleScrape}
                    disabled={!url.trim() || isScraping}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isScraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    {isScraping ? "Extrayendo..." : "Extraer datos"}
                    {!isScraping && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep("confirm")}
                    disabled={!manualTitle.trim() && !manualCompany.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Continuar <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-5 space-y-4"
            >
              {/* Preview de datos extraidos */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Titulo</label>
                    <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Empresa</label>
                    <input value={manualCompany} onChange={(e) => setManualCompany(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Descripcion ({manualDesc.length} caracteres)</label>
                  <textarea value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none" />
                </div>
              </div>

              {/* Nota de analisis automatico */}
              {manualDesc && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900">
                  {enabled ? <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />}
                  <p className="text-xs text-violet-700 dark:text-violet-300">
                    {enabled ? "Se analizaran las keywords con IA automaticamente al guardar." : "Se analizaran las keywords localmente al guardar."}
                  </p>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-1">
                <button onClick={() => setStep("input")} className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  Atras
                </button>
                <button
                  onClick={handleAdd}
                  disabled={(!manualTitle && !scraped?.title) || isAdding}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Guardar postulacion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
