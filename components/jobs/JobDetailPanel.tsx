"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp, MessageSquare,
  CheckCircle2, XCircle, ExternalLink, Clock, MapPin, DollarSign, Lightbulb,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { AIChat } from "./AIChat";
import { STATUS_LABELS, STATUS_COLORS, type ApplicationStatus } from "@/types/jobs";

const STATUSES: ApplicationStatus[] = ["bookmarked", "applied", "interviewing", "offer", "rejected", "closed"];

interface JobDetailPanelProps {
  applicationId: string;
  onClose: () => void;
}

export function JobDetailPanel({ applicationId, onClose }: JobDetailPanelProps) {
  const { applications, updateApplication, analyzeKeywords, setMatchAnalysis, setSelectedId } = useJobsStore();
  const { resumeData } = useResumeStore();
  const { enabled, provider, apiKey } = useAISettingsStore();
  const [showChat, setShowChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showMissing, setShowMissing] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "activity">("overview");

  const app = applications.find((a) => a.id === applicationId);
  if (!app) return null;

  const { title, company, status, description, matchAnalysis, keywords, url, notes, activity, location, salary, portal } = app;
  const score = matchAnalysis?.score;

  const scoreColor =
    score === undefined ? "text-zinc-400" :
    score >= 70 ? "text-emerald-500" :
    score >= 40 ? "text-amber-500" :
    "text-red-500";

  const scoreBg =
    score === undefined ? "bg-zinc-100 dark:bg-zinc-800" :
    score >= 70 ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900" :
    score >= 40 ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900" :
    "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";

  async function handleAnalyze() {
    setIsAnalyzing(true);
    if (enabled && apiKey) {
      try {
        const res = await fetch("/api/ai/keywords", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AI-Key": apiKey,
            "X-AI-Provider": provider,
          },
          body: JSON.stringify({ description }),
        });
        const data = await res.json() as { keywords: typeof keywords };
        if (data.keywords) {
          const { computeMatchScore } = await import("@/lib/ai/localAnalyzer");
          const analysis = computeMatchScore(data.keywords, resumeData);
          setMatchAnalysis(applicationId, { ...analysis, suggestions: [], keywords: data.keywords } as never);
        }
      } catch {
        analyzeKeywords(applicationId, resumeData);
      }
    } else {
      analyzeKeywords(applicationId, resumeData);
    }
    setIsAnalyzing(false);
  }

  async function handleExplain() {
    if (!matchAnalysis || !enabled || !apiKey) return;
    setIsExplaining(true);
    try {
      const res = await fetch("/api/ai/explain-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Key": apiKey,
          "X-AI-Provider": provider,
        },
        body: JSON.stringify({ matchAnalysis, jobDescription: description, resumeData }),
      });
      const data = await res.json() as { explanation?: string };
      if (data.explanation) {
        updateApplication(applicationId, {
          matchAnalysis: { ...matchAnalysis, explanation: data.explanation },
        });
      }
    } catch {
      // silencioso
    } finally {
      setIsExplaining(false);
    }
  }

  async function handleSuggest() {
    if (!matchAnalysis?.missing.length || !enabled || !apiKey) return;
    setIsSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Key": apiKey,
          "X-AI-Provider": provider,
        },
        body: JSON.stringify({ missingKeywords: matchAnalysis.missing.slice(0, 8), resumeData }),
      });
      const data = await res.json() as { suggestions?: string[] };
      if (data.suggestions) {
        updateApplication(applicationId, {
          matchAnalysis: { ...matchAnalysis, suggestions: data.suggestions },
        });
      }
    } catch {
      // silencioso
    } finally {
      setIsSuggesting(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">{title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{company}</span>
                {portal && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200/60 dark:border-zinc-700">
                    {portal}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-zinc-500">
                {location && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400"><MapPin className="w-3 h-3" />{location}</span>
                )}
                {salary && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400"><DollarSign className="w-3 h-3" />{salary}</span>
                )}
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Ver oferta
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {enabled && (
                <button
                  onClick={() => setShowChat(true)}
                  title="Chat con IA"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status selector */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block mb-1.5">
              Estado de la postulación
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateApplication(applicationId, { status: s })}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold transition-all text-center truncate ${
                    status === s
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200/80 dark:border-zinc-800 shrink-0 px-2">
          {[
            { id: "overview" as const, label: "Resumen" },
            { id: "keywords" as const, label: `Keywords ${keywords.length > 0 ? `(${keywords.length})` : ""}` },
            { id: "activity" as const, label: "Historial" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-all relative ${
                activeTab === tab.id
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="p-4 space-y-4">
              {/* Botón Principal: Evaluar Postulación con mi CV */}
              <a
                href={`/jobs/${applicationId}/evaluate`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs transition-all text-center group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Evaluar postulación con mi CV</span>
              </a>

              {/* Match score */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Match con tu CV</p>
                    <p className="text-[11px] text-zinc-500">Afinidad según competencias de la oferta</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {matchAnalysis && enabled && !matchAnalysis.explanation && (
                      <button onClick={handleExplain} disabled={isExplaining}
                        className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-40 font-medium">
                        {isExplaining ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                        Explicar
                      </button>
                    )}
                    <button onClick={handleAnalyze} disabled={isAnalyzing || !description}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-40 font-medium">
                      {isAnalyzing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
                      Analizar
                    </button>
                  </div>
                </div>

                {score !== undefined ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${scoreColor}`}>{score}%</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {matchAnalysis?.matched.length} de {keywords.length} keywords
                      </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                    {matchAnalysis?.generatedBy === "ai" && (
                      <span className="flex items-center gap-1 text-[10px] text-violet-500 font-medium pt-1">
                        <Sparkles className="w-2.5 h-2.5" /> Analizado con IA
                      </span>
                    )}
                    {/* Explicacion IA */}
                    {matchAnalysis?.explanation && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                        {matchAnalysis.explanation}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-zinc-500">
                    {description ? "Haz clic en Analizar para calcular el puntaje de coincidencia." : "Agrega la descripción de la oferta para analizar."}
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => updateApplication(applicationId, { notes: e.target.value })}
                  placeholder="Agrega notas sobre esta postulacion..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "keywords" && (
            <div className="p-4 space-y-4">
              {keywords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">No hay keywords todavia.</p>
                  <button onClick={handleAnalyze} disabled={!description || isAnalyzing}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mx-auto disabled:opacity-40">
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Analizar ahora
                  </button>
                </div>
              ) : (
                <>
                  {/* Keywords encontradas */}
                  {matchAnalysis && matchAnalysis.matched.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Presentes en tu CV ({matchAnalysis.matched.length})</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchAnalysis.matched.map((kw) => (
                          <span key={kw.text} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-200 dark:border-emerald-900">
                            {kw.source === "ai" && <Sparkles className="w-2.5 h-2.5" />}
                            {kw.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords faltantes */}
                  {matchAnalysis && matchAnalysis.missing.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowMissing(!showMissing)}
                        className="flex items-center gap-1.5 mb-2 w-full"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Faltantes ({matchAnalysis.missing.length})</p>
                        {showMissing ? <ChevronUp className="w-3 h-3 text-zinc-400 ml-auto" /> : <ChevronDown className="w-3 h-3 text-zinc-400 ml-auto" />}
                      </button>
                      {showMissing && (
                        <div className="flex flex-wrap gap-1.5">
                          {matchAnalysis.missing.map((kw) => (
                            <span key={kw.text} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[11px] font-medium border border-red-200 dark:border-red-900">
                              {kw.source === "ai" && <Sparkles className="w-2.5 h-2.5" />}
                              {kw.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sugerencias IA */}
                  {enabled && matchAnalysis?.missing && matchAnalysis.missing.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-violet-500" />
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Sugerencias IA</p>
                        </div>
                        {!matchAnalysis.suggestions?.length && (
                          <button onClick={handleSuggest} disabled={isSuggesting}
                            className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-40">
                            {isSuggesting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                            Generar
                          </button>
                        )}
                      </div>
                      {matchAnalysis.suggestions && matchAnalysis.suggestions.length > 0 && (
                        <ul className="space-y-2">
                          {matchAnalysis.suggestions.map((sug, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900">
                              <Sparkles className="w-3 h-3 text-violet-500 shrink-0 mt-0.5" />
                              {sug}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="p-4">
              {activity.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Sin actividad aun.</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-700 dark:text-zinc-300">{entry.description}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(entry.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Panel de chat flotante */}
      <AnimatePresence>
        {showChat && (
          <AIChat
            jobTitle={title}
            company={company}
            jobDescription={description}
            resumeSummary={resumeData.summary ?? ""}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
