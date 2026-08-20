"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
  Trash2,
  Copy,
  MessageSquare,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { ApplicationStatus, JobApplication, Keyword } from "@/types/jobs";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/jobs";
import type { EvaluationReport } from "@/types/evaluator";
import { ScoreCards } from "@/components/jobs/evaluate/ScoreCards";
import { CriticalPointsBanner } from "@/components/jobs/evaluate/CriticalPointsBanner";
import { ATSChecklistTab } from "@/components/jobs/evaluate/ATSChecklistTab";
import { ATSSimulationTab } from "@/components/jobs/evaluate/ATSSimulationTab";
import { MatchKeywordsTab } from "@/components/jobs/evaluate/MatchKeywordsTab";
import { AIChat } from "@/components/jobs/AIChat";
import { runATSEvaluationPipeline } from "@/lib/ats";

interface JobDetailFullViewProps {
  applicationId: string;
  onBack: () => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  "bookmarked",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "closed",
];

export function JobDetailFullView({ applicationId, onBack }: JobDetailFullViewProps) {
  const {
    applications,
    updateApplication,
    deleteApplication,
    duplicateApplication,
    saveEvaluation,
    getLatestEvaluation,
  } = useJobsStore();

  const { profiles, resumeData, masterProfileData } = useResumeStore();
  const { enabled: aiEnabled } = useAISettingsStore();

  const application = applications.find((a) => a.id === applicationId);

  // Estados de navegación interna
  const [activeTab, setActiveTab] = useState<"evaluate" | "checklist" | "simulation" | "notes">(
    "evaluate"
  );
  const [showChat, setShowChat] = useState(false);

  // Estados del selector de CV y evaluación
  const [selectedProfileId, setSelectedProfileId] = useState<string>("active");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isScrapingDesc, setIsScrapingDesc] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [notesInput, setNotesInput] = useState(application?.notes || "");
  const [descInput, setDescInput] = useState(application?.description || "");

  // Keyboard shortcut Esc para volver al tablero
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showChat) {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, showChat]);

  // Cargar último reporte guardado
  useEffect(() => {
    if (application) {
      const existing = getLatestEvaluation(application.id);
      if (existing) {
        setReport(existing);
      }
      setNotesInput(application.notes || "");
      setDescInput(application.description || "");
    }
  }, [application?.id]);

  // Obtener datos del CV según el selector
  const currentResumeData = useMemo(() => {
    if (selectedProfileId === "master") return masterProfileData;
    if (selectedProfileId === "active") return resumeData;
    const found = profiles.find((p) => p.id === selectedProfileId);
    return found ? found.data : resumeData;
  }, [selectedProfileId, masterProfileData, resumeData, profiles]);

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-sm text-zinc-500">Postulación no encontrada.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl cursor-pointer"
        >
          Volver al tablero
        </button>
      </div>
    );
  }

  const { title, company, status, location, salary, url, portal, activity } = application;

  // Ejecutar evaluación
  async function handleRunEvaluation() {
    if (!application || !descInput.trim()) return;
    setIsEvaluating(true);
    try {
      const newReport = await runATSEvaluationPipeline({
        jobId: application.id,
        jobTitle: application.title,
        company: application.company,
        jobDescription: descInput,
        resumeData: currentResumeData,
        sourceType: "schema_profile",
        profileName:
          selectedProfileId === "master"
            ? "Perfil Base"
            : selectedProfileId === "active"
            ? "CV Activo"
            : profiles.find((p) => p.id === selectedProfileId)?.name || "CV",
      });

      setReport(newReport);
      saveEvaluation(application.id, newReport);

      // Sincronizar keywords en el modelo de la postulación
      const matchedKeywords: Keyword[] = newReport.requirements
        .filter((r) => r.matched)
        .map((r) => ({
          text: r.text,
          frequency: 1,
          matched: true,
          source: "local",
        }));

      const missingKeywords: Keyword[] = newReport.missingKeywords.map((k) => ({
        text: k.text,
        frequency: k.frequency || 1,
        matched: false,
        source: "local",
      }));

      const allKeywords: Keyword[] = [...matchedKeywords, ...missingKeywords];

      updateApplication(application.id, {
        keywords: allKeywords,
        matchAnalysis: {
          score: newReport.matchScore,
          matched: matchedKeywords,
          missing: missingKeywords,
          suggestions: [],
          generatedBy: "local",
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Error al evaluar postulación:", err);
    } finally {
      setIsEvaluating(false);
    }
  }

  // Auto-scrape de oferta si tiene URL
  async function handleScrape() {
    if (!url || !application) return;
    setIsScrapingDesc(true);
    try {
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as { description?: string };
      if (data.description) {
        setDescInput(data.description);
        updateApplication(application.id, { description: data.description });
      }
    } catch {
      // Silencioso
    } finally {
      setIsScrapingDesc(false);
    }
  }

  // Guardar notas con debounce o blur
  function handleSaveNotes(val: string) {
    if (!application) return;
    setNotesInput(val);
    updateApplication(application.id, { notes: val });
  }

  // Guardar descripción
  function handleSaveDescription() {
    if (!application) return;
    updateApplication(application.id, { description: descInput });
    handleRunEvaluation();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950 overflow-hidden"
    >
      {/* ─── 1. TOP BAR DE NAVEGACIÓN Y ACCIONES ─── */}
      <div className="px-6 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver al tablero</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              Esc
            </span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Selector de CV a comparar */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium hidden md:inline">Comparar con:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => {
                setSelectedProfileId(e.target.value);
              }}
              className="h-8 pl-2.5 pr-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 cursor-pointer"
            >
              <option value="active">CV Activo en Editor ({resumeData.name || "Principal"})</option>
              <option value="master">Perfil Base Maestro</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.targetRole || "Perfil"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2">
          {aiEnabled && (
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span className="hidden sm:inline">Chat IA</span>
            </button>
          )}

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating || !descInput}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            {isEvaluating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Re-evaluar Match</span>
          </button>

          <button
            onClick={() => {
              duplicateApplication(application.id);
              onBack();
            }}
            title="Duplicar postulación"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              deleteApplication(application.id);
              onBack();
            }}
            title="Eliminar postulación"
            className="p-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 2. CONTENIDO PRINCIPAL SCROLLEABLE ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner de Identidad del Puesto */}
        <div className="p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {title}
                </h1>
                {portal && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {portal}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  {company}
                </span>
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {location}
                  </span>
                )}
                {salary && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    {salary}
                  </span>
                )}
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver oferta original
                  </a>
                )}
              </div>
            </div>

            {/* Selector de Estado en Segmentos */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 shrink-0 flex-wrap">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateApplication(application.id, { status: s })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    status === s
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 3. BENTO GRID DE EVALUACIÓN (SCORE CARDS & PUNTOS CRÍTICOS) ─── */}
        {report ? (
          <div className="space-y-6">
            {/* Puntos Críticos Banner */}
            <CriticalPointsBanner criticalPoints={report.criticalPoints} />

            {/* Score Cards (Compatibilidad ATS + Match Oferta) */}
            <ScoreCards report={report} />

            {/* ─── 4. TABS INTERACTIVAS DE PROFUNDIZACIÓN ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2 flex-wrap gap-3">
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                  <button
                    onClick={() => setActiveTab("evaluate")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "evaluate"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Match y Simulador de Keywords
                  </button>
                  <button
                    onClick={() => setActiveTab("checklist")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "checklist"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Checklist de 10 Normas ATS
                  </button>
                  <button
                    onClick={() => setActiveTab("simulation")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "simulation"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Así te lee el ATS
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "notes"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Descripción y Notas
                  </button>
                </div>

                <span className="text-[11px] font-mono text-zinc-400">
                  Evaluado: {new Date(report.createdAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Contenido según Tab */}
              {activeTab === "evaluate" && (
                <MatchKeywordsTab report={report} />
              )}

              {activeTab === "checklist" && (
                <ATSChecklistTab rules={report.auditRules} />
              )}

              {activeTab === "simulation" && (
                <ATSSimulationTab simulation={report.simulation} />
              )}

              {activeTab === "notes" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Notas personales */}
                  <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                        Notas y Bitácora Personal
                      </h3>
                      <span className="text-[10px] text-zinc-400">Guardado automático</span>
                    </div>
                    <textarea
                      value={notesInput}
                      onChange={(e) => handleSaveNotes(e.target.value)}
                      placeholder="Escribe notas sobre la entrevista, salario conversado, contactos de RRHH..."
                      rows={8}
                      className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 resize-none leading-relaxed"
                    />

                    {/* Timeline de actividad */}
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                        Historial de Movimientos
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {activity.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{act.description}</span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {new Date(act.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Descripción de la oferta */}
                  <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                        Descripción de la Oferta de Empleo
                      </h3>
                      {url && (
                        <button
                          onClick={handleScrape}
                          disabled={isScrapingDesc}
                          className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-40 cursor-pointer font-medium"
                        >
                          {isScrapingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          Re-scrapear oferta
                        </button>
                      )}
                    </div>

                    <textarea
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="Pega la descripción completa del puesto aquí para analizarla..."
                      rows={12}
                      className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 resize-none leading-relaxed font-sans"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveDescription}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
                      >
                        Actualizar y Re-evaluar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Estado vacío si no hay descripción o está evaluando */
          <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {isEvaluating ? "Analizando compatibilidad ATS y match..." : "Evalúa esta postulación con tu CV"}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {isEvaluating
                  ? "Auditando las 10 reglas de formato, parseo de texto y requisitos obligatorios..."
                  : "Presiona el botón de evaluación para comparar las competencias de la oferta contra tu currículum."}
              </p>
            </div>

            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating || !descInput}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
              <span>Evaluar postulación ahora</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Chat IA */}
      {showChat && (
        <AIChat
          jobTitle={application.title}
          company={application.company}
          jobDescription={descInput}
          resumeSummary={currentResumeData.summary || ""}
          onClose={() => setShowChat(false)}
        />
      )}
    </motion.div>
  );
}
