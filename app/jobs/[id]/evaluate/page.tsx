"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  RefreshCw,
  Loader2,
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { EvaluationReport } from "@/types/evaluator";
import { ScoreCards } from "@/components/jobs/evaluate/ScoreCards";
import { CriticalPointsBanner } from "@/components/jobs/evaluate/CriticalPointsBanner";
import { ATSSimulationTab } from "@/components/jobs/evaluate/ATSSimulationTab";
import { ATSChecklistTab } from "@/components/jobs/evaluate/ATSChecklistTab";
import { MatchKeywordsTab } from "@/components/jobs/evaluate/MatchKeywordsTab";

interface EvaluatePageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluatePage({ params }: EvaluatePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { applications, updateApplication, saveEvaluation, getLatestEvaluation } = useJobsStore();
  const { profiles, resumeData, masterProfileData } = useResumeStore();
  const { enabled: aiEnabled, provider: aiProvider, apiKey: aiApiKey } = useAISettingsStore();

  const application = applications.find((a) => a.id === id);

  // Estados de la evaluación
  const [selectedProfileId, setSelectedProfileId] = useState<string>("active");
  const [customPdfFile, setCustomPdfFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isScrapingDesc, setIsScrapingDesc] = useState(false);
  const [manualDescInput, setManualDescInput] = useState("");
  const [activeTab, setActiveTab] = useState<"simulation" | "checklist" | "match">("checklist");
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cargar último reporte guardado si existe
  useEffect(() => {
    if (application) {
      const existing = getLatestEvaluation(application.id);
      if (existing) {
        setReport(existing);
      }
      if (application.description) {
        setManualDescInput(application.description);
      }
    }
  }, [application?.id]);

  // Si la oferta no tiene descripción y tiene URL, intentar scrape automático
  useEffect(() => {
    if (application && !application.description && application.url && !isScrapingDesc) {
      handleAutoScrape(application.url);
    }
  }, [application?.id, application?.description, application?.url]);

  const handleAutoScrape = async (url: string) => {
    setIsScrapingDesc(true);
    try {
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.description) {
        updateApplication(id, { description: data.description });
        setManualDescInput(data.description);
      }
    } catch {
      // Si falla, el usuario podrá pegar la descripción
    } finally {
      setIsScrapingDesc(false);
    }
  };

  const handleRunEvaluation = async () => {
    if (!application) return;

    const descToUse = manualDescInput.trim() || application.description;
    if (!descToUse) {
      setEvalError("Ingresa o extrae la descripción de la oferta primero.");
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);

    try {
      let response: Response;

      // Configurar headers para IA si está habilitado
      const headers: Record<string, string> = {};
      if (aiEnabled && aiApiKey) {
        headers["X-AI-Key"] = aiApiKey;
        headers["X-AI-Provider"] = aiProvider;
      }

      if (customPdfFile) {
        // Enviar archivo PDF subido vía FormData
        const formData = new FormData();
        formData.append("file", customPdfFile);
        formData.append("jobId", application.id);
        formData.append("jobTitle", application.title);
        formData.append("company", application.company);
        formData.append("jobDescription", descToUse);
        formData.append("profileName", customPdfFile.name);

        response = await fetch("/api/evaluate", {
          method: "POST",
          headers,
          body: formData,
        });
      } else {
        // Enviar ResumeData estructurado
        let dataToEvaluate = resumeData;
        let profileName = "CV Activo";

        if (selectedProfileId === "master") {
          dataToEvaluate = masterProfileData;
          profileName = "Perfil Base";
        } else if (selectedProfileId !== "active") {
          const found = profiles.find((p) => p.id === selectedProfileId);
          if (found) {
            dataToEvaluate = found.data;
            profileName = found.name;
          }
        }

        response = await fetch("/api/evaluate", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: application.id,
            jobTitle: application.title,
            company: application.company,
            jobDescription: descToUse,
            resumeData: dataToEvaluate,
            profileName,
            sourceType: "schema_profile",
          }),
        });
      }

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Error al ejecutar la evaluación ATS.");
      }

      setReport(result);
      saveEvaluation(application.id, result);

      // Si la descripción se pegó manualmente, persistirla en la postulación
      if (!application.description && descToUse) {
        updateApplication(application.id, { description: descToUse });
      }
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : "Error inesperado durante la evaluación.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Postulación no encontrada</h2>
          <p className="text-xs text-zinc-500">
            La postulación que intentas evaluar no existe o ha sido eliminada.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasDescription = Boolean(manualDescInput.trim() || application.description);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-16">
      {/* ─── Top Header Fijo / Barra de Navegación ─── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Volver al Job Tracker"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {application.title}
                </h1>
                {application.portal && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700">
                    {application.portal}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
                <Building2 className="w-3 h-3 shrink-0" />
                <span>{application.company}</span>
                {application.url && (
                  <>
                    <span>•</span>
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                      Ver oferta <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botón de Acción Primario */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating || !hasDescription}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              {isEvaluating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>{report ? "Re-evaluar CV" : "Ejecutar evaluación"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Contenedor Principal ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Barra de Configuración de Evaluación: Selección de CV & Oferta */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Selecciona el CV a evaluar contra esta oferta:
              </span>
            </div>

            {/* Selector de perfil o subida de PDF */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={customPdfFile ? "uploaded" : selectedProfileId}
                onChange={(e) => {
                  if (e.target.value === "uploaded") {
                    fileInputRef.current?.click();
                  } else {
                    setCustomPdfFile(null);
                    setSelectedProfileId(e.target.value);
                  }
                }}
                className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option value="active">CV Activo en Editor ({resumeData.name || "Sin nombre"})</option>
                <option value="master">Perfil Base</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.targetRole || "CV"})
                  </option>
                ))}
                <option value="uploaded">Subir archivo PDF externo...</option>
              </select>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCustomPdfFile(file);
                  }
                }}
              />

              {customPdfFile && (
                <span className="text-[11px] font-mono text-violet-600 bg-violet-50 dark:bg-violet-950/30 px-2 py-1 rounded-md border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                  <Upload className="w-3 h-3" /> {customPdfFile.name}
                </span>
              )}
            </div>
          </div>

          {/* Si falta la descripción de la oferta */}
          {!hasDescription && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Se requiere la descripción del puesto para calcular el match semántico
              </div>
              <textarea
                value={manualDescInput}
                onChange={(e) => setManualDescInput(e.target.value)}
                placeholder="Pega aquí la descripción completa de la vacante..."
                rows={4}
                className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300/60 dark:border-amber-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          )}

          {evalError && (
            <p className="text-xs text-red-500 font-medium pl-1">{evalError}</p>
          )}
        </div>

        {/* ─── Visualización del Reporte de Evaluación ─── */}
        {isEvaluating ? (
          <div className="p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Ejecutando Batería de Auditoría ATS...
              </h3>
              <p className="text-xs text-zinc-500">
                Simulando extracción secuencial, comprobando 10 reglas de formato y calculando match ponderado.
              </p>
            </div>
          </div>
        ) : report ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Banner de Puntos Críticos (Siempre visible en el tope) */}
            <CriticalPointsBanner criticalPoints={report.criticalPoints} />

            {/* Dos Cards Grandes de Score */}
            <ScoreCards report={report} />

            {/* Pestañas de Navegación del Reporte */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === "checklist"
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Checklist de Normas ATS ({report.auditRules.length})
                  </span>
                  {activeTab === "checklist" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full"
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("match")}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === "match"
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Match y Competencias ({report.requirements.length})
                  </span>
                  {activeTab === "match" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full"
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("simulation")}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === "simulation"
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Así te lee el ATS
                  </span>
                  {activeTab === "simulation" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full"
                    />
                  )}
                </button>
              </div>

              {/* Contenido de la pestaña activa */}
              <AnimatePresence mode="wait">
                {activeTab === "checklist" && (
                  <motion.div
                    key="tab-checklist"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ATSChecklistTab rules={report.auditRules} />
                  </motion.div>
                )}

                {activeTab === "match" && (
                  <motion.div
                    key="tab-match"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MatchKeywordsTab report={report} />
                  </motion.div>
                )}

                {activeTab === "simulation" && (
                  <motion.div
                    key="tab-simulation"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ATSSimulationTab simulation={report.simulation} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* Estado Inicial: Invitación a Evaluar */
          <div className="p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Auditoría ATS para {application.title}
              </h3>
              <p className="text-xs text-zinc-500">
                Ejecuta la batería de evaluación para verificar que tu currículum no sea descartado por los filtros automáticos y analizar tu afinidad con la vacante.
              </p>
            </div>
            <button
              onClick={handleRunEvaluation}
              disabled={!hasDescription}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs transition-colors disabled:opacity-40"
            >
              Ejecutar Evaluación Ahora
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
