"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { ApplicationStatus, Keyword } from "@/types/jobs";
import { STATUS_LABELS } from "@/types/jobs";
import type { EvaluationReport } from "@/types/evaluator";
import { AIChat } from "@/components/jobs/AIChat";
import { ScoreProjectorSimulator } from "@/components/jobs/evaluate/ScoreProjectorSimulator";
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

  const [activeTab, setActiveTab] = useState<"requirements" | "ats" | "simulation" | "offer_text">("requirements");
  const [showChat, setShowChat] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("active");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isScrapingDesc, setIsScrapingDesc] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [notesInput, setNotesInput] = useState(application?.notes || "");
  const [descInput, setDescInput] = useState(application?.description || "");
  const [filterImportance, setFilterImportance] = useState<"all" | "must_have" | "nice_to_have">("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // Keyboard shortcut Esc
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

      updateApplication(application.id, {
        keywords: [...matchedKeywords, ...missingKeywords],
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
      console.error("Error al evaluar:", err);
    } finally {
      setIsEvaluating(false);
    }
  }

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

  function handleSaveNotes(val: string) {
    if (!application) return;
    setNotesInput(val);
    updateApplication(application.id, { notes: val });
  }

  function handleSaveDescription() {
    if (!application) return;
    updateApplication(application.id, { description: descInput });
    handleRunEvaluation();
  }

  const filteredRequirements = useMemo(() => {
    if (!report?.requirements) return [];
    if (filterImportance === "all") return report.requirements;
    return report.requirements.filter((r) => r.importance === filterImportance);
  }, [report?.requirements, filterImportance]);

  const matchedCount = report?.requirements.filter((r) => r.matched).length || 0;
  const totalCount = report?.requirements.length || 0;

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* ─── 1. TOP BAR COMPACTO ─── */}
      <div className="px-6 py-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              Esc
            </span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800 hidden sm:block" />

          {/* Breadcrumb minimalista */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
            <span className="text-zinc-400">Postulaciones</span>
            <span>/</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{company}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {aiEnabled && (
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              <span>Chat IA</span>
            </button>
          )}

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating || !descInput}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            {isEvaluating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Re-evaluar</span>
          </button>

          <button
            onClick={() => {
              duplicateApplication(application.id);
              onBack();
            }}
            title="Duplicar"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              deleteApplication(application.id);
              onBack();
            }}
            title="Eliminar"
            className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 2. CONTENEDOR PRINCIPAL: 2 COLUMNAS ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ════ COLUMNA IZQUIERDA: DETALLE & REQUISITOS (7 de 12) ════ */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header del Puesto */}
            <div className="p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {title}
                    </h1>
                    {portal && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700">
                        {portal}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
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
                        className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver oferta
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Selector de estado segmentado */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex-wrap">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateApplication(application.id, { status: s })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

            {/* Pestañas de Contenido */}
            <div className="space-y-4">
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("requirements")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === "requirements"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Requisitos & Competencias {totalCount > 0 && `(${matchedCount}/${totalCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ats")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === "ats"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Auditoría ATS (10 Reglas)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("simulation")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === "simulation"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Lectura del Robot ATS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("offer_text")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === "offer_text"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Texto de la Oferta
                </button>
              </div>

              {/* ─── TAB 1: REQUISITOS Y COMPETENCIAS ─── */}
              {activeTab === "requirements" && (
                <div className="space-y-4">
                  {/* Simulador Proyectado */}
                  {report?.missingKeywords && report.missingKeywords.length > 0 && (
                    <ScoreProjectorSimulator
                      currentScore={report.matchScore}
                      missingKeywords={report.missingKeywords}
                    />
                  )}

                  {/* Filtro de Importancia */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFilterImportance("all")}
                        className={`px-2 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                          filterImportance === "all"
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        Todos ({report?.requirements.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterImportance("must_have")}
                        className={`px-2 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                          filterImportance === "must_have"
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        Excluyentes ({report?.requirements.filter((r) => r.importance === "must_have").length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterImportance("nice_to_have")}
                        className={`px-2 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                          filterImportance === "nice_to_have"
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        Deseables ({report?.requirements.filter((r) => r.importance === "nice_to_have").length || 0})
                      </button>
                    </div>

                    <span className="text-[11px] text-zinc-400">
                      {matchedCount} de {totalCount} cumplidos en tu CV
                    </span>
                  </div>

                  {/* Lista de Requisitos Estilo Matriz Limpia */}
                  <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredRequirements.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0">
                            {req.matched ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3 h-3" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {req.text}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-medium ${
                                  req.importance === "must_have"
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-200/60 dark:border-zinc-800"
                                }`}
                              >
                                {req.importance === "must_have" ? "Excluyente" : "Deseable"}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {req.matched
                                ? req.matchedTextInCV ? `Coincide en tu CV con "${req.matchedTextInCV}"` : "Presente en tu CV"
                                : "No detectado en tu CV actual — considera incluirlo en tus habilidades o logros."}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-mono shrink-0 font-semibold ${
                            req.matched
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {req.matched ? "Cumple ✓" : "Pendiente"}
                        </span>
                      </div>
                    ))}

                    {filteredRequirements.length === 0 && (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        No hay requisitos en esta categoría.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── TAB 2: AUDITORÍA ATS (10 REGLAS) ─── */}
              {activeTab === "ats" && (
                <div className="space-y-2.5">
                  {report?.auditRules.map((rule) => {
                    const isExpanded = expandedRuleId === rule.id;

                    return (
                      <div
                        key={rule.id}
                        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs"
                      >
                        <div
                          onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5">
                              {rule.status === "pass" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : rule.status === "warning" ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rule.name}</p>
                              <p className="text-[11px] text-zinc-500 leading-relaxed truncate">{rule.message}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-bold text-zinc-400">
                              {rule.scoreEarned}/{rule.scoreWeight} pts
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                          </div>
                        </div>

                        {/* Detalle expandible */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs space-y-2">
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                              <strong>Por qué importa:</strong> {rule.fixGuide.whyItMatters}
                            </p>
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              <strong>Cómo solucionarlo:</strong> {rule.fixGuide.howToFix}
                            </p>
                            {rule.fixGuide.example && (
                              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                                {rule.fixGuide.example}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ─── TAB 3: SIMULACIÓN DE LECTURA DEL ROBOT ─── */}
              {activeTab === "simulation" && report && (
                <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-300 font-mono text-[11px] space-y-2 max-h-96 overflow-y-auto">
                  <span className="text-[10px] text-zinc-500 block">Texto plano leído por el parser ATS:</span>
                  <pre className="whitespace-pre-wrap leading-relaxed select-all">
                    {report.simulation.rawExtractedText}
                  </pre>
                </div>
              )}

              {/* ─── TAB 4: TEXTO DE LA OFERTA ─── */}
              {activeTab === "offer_text" && (
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Descripción de la Oferta de Empleo
                    </h3>
                    {url && (
                      <button
                        type="button"
                        onClick={handleScrape}
                        disabled={isScrapingDesc}
                        className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline disabled:opacity-40 cursor-pointer font-medium"
                      >
                        {isScrapingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Re-scrapear oferta
                      </button>
                    )}
                  </div>

                  <textarea
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Pega la descripción completa de la oferta aquí..."
                    rows={12}
                    className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 resize-none leading-relaxed font-sans"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDescription}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
                    >
                      Guardar y Re-evaluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ════ COLUMNA DERECHA: SCORES, NOTAS & CONTEXTO (5 de 12) ════ */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget Unificado de Puntuación */}
            {report && (
              <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                  Índices de Evaluación
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Match Score */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] text-zinc-500 block font-medium">Match con Oferta</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {report.matchScore}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-1">
                      <div
                        style={{ width: `${report.matchScore}%` }}
                        className={`h-full rounded-full ${
                          report.matchScore >= 70 ? "bg-emerald-500" : report.matchScore >= 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* ATS Format Score */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] text-zinc-500 block font-medium">Formato ATS</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {report.atsScore}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-1">
                      <div
                        style={{ width: `${report.atsScore}%` }}
                        className={`h-full rounded-full ${
                          report.atsScore >= 80 ? "bg-emerald-500" : report.atsScore >= 60 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Desglose compacto de competencias */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-zinc-50/80 dark:bg-zinc-800/30 flex items-center justify-between">
                    <span className="text-zinc-500">Hard Skills:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {report.categoryBreakdown.hardSkills.matched}/{report.categoryBreakdown.hardSkills.total}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50/80 dark:bg-zinc-800/30 flex items-center justify-between">
                    <span className="text-zinc-500">Tools / Cloud:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {report.categoryBreakdown.toolsPlatforms.matched}/{report.categoryBreakdown.toolsPlatforms.total}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50/80 dark:bg-zinc-800/30 flex items-center justify-between">
                    <span className="text-zinc-500">Soft Skills:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {report.categoryBreakdown.softSkills.matched}/{report.categoryBreakdown.softSkills.total}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50/80 dark:bg-zinc-800/30 flex items-center justify-between">
                    <span className="text-zinc-500">Años Exp:</span>
                    <span className={`font-bold ${report.categoryBreakdown.experienceYears.meets ? "text-emerald-600" : "text-amber-600"}`}>
                      {report.categoryBreakdown.experienceYears.candidateYears}/{report.categoryBreakdown.experienceYears.requiredYears ?? "—"}a
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Selector de CV a Comparar */}
            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                CV a Comparar
              </span>
              <select
                value={selectedProfileId}
                onChange={(e) => {
                  setSelectedProfileId(e.target.value);
                }}
                className="w-full h-8 pl-2.5 pr-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 cursor-pointer"
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

            {/* Notas Personales */}
            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                  Notas Privadas
                </span>
                <span className="text-[10px] text-zinc-400">Autoguardado</span>
              </div>
              <textarea
                value={notesInput}
                onChange={(e) => handleSaveNotes(e.target.value)}
                placeholder="Anota detalles de contactos, fechas de seguimiento, dudas para la entrevista..."
                rows={5}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 resize-none leading-relaxed"
              />
            </div>

            {/* Historial de la Postulación */}
            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                Historial de Actividad
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {activity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 truncate mr-2">{act.description}</span>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}
