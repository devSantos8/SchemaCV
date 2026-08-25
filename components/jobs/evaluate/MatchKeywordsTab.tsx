"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Cpu,
  Layers,
  Award,
  Filter,
  Check,
  ShieldCheck,
  Target,
  Clock,
  GraduationCap,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Info,
} from "lucide-react";
import type { EvaluationReport, RequirementImportance } from "@/types/evaluator";
import { ScoreProjectorSimulator } from "./ScoreProjectorSimulator";

interface MatchKeywordsTabProps {
  report: EvaluationReport;
}

export function MatchKeywordsTab({ report }: MatchKeywordsTabProps) {
  const {
    requirements = [],
    missingKeywords = [],
    matchScore = 0,
    atsScore = 0,
    summaryText,
    aiEnhanced,
    categoryBreakdown,
    criticalPoints = [],
  } = report;

  const [importanceFilter, setImportanceFilter] = useState<"all" | RequirementImportance>("all");

  const filteredRequirements = requirements.filter((r) => {
    if (importanceFilter === "all") return true;
    return r.importance === importanceFilter;
  });

  const matchedCount = requirements.filter((r) => r.matched).length;
  const matchedKeywordsList = requirements.filter((r) => r.matched).map((r) => r.text);

  // Colores y niveles según score
  const matchLevel =
    matchScore >= 80 ? "Excelente Fit" : matchScore >= 60 ? "Buen Fit Técnico" : "Requiere Optimización";
  const matchBadgeColor =
    matchScore >= 80
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      : matchScore >= 60
      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";

  return (
    <div className="space-y-6">
      {/* ─── 1. HERO CARDS: COMPARATIVA Y DOBLE SCORE ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Match con la Oferta */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              Match con la Vacante
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${matchBadgeColor}`}>
              {matchLevel}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {matchScore}%
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              ({matchedCount} de {requirements.length} requisitos)
            </span>
          </div>

          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                matchScore >= 80 ? "bg-emerald-500" : matchScore >= 60 ? "bg-blue-500" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, matchScore))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Nivel ATS Verdadero */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Filtro ATS Parser
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {atsScore >= 90 ? "100% Parseable" : "Requiere Ajustes"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {atsScore}%
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Aprobación de Formato
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 line-clamp-1 pt-0.5">
            Estructura semántica de 1 sola columna y texto 100% vectorial.
          </p>
        </div>

        {/* Card 3: Experiencia & Formación */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-500" />
              Alineación de Perfil
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Verificado
            </span>
          </div>

          <div className="space-y-1 pt-1 text-xs">
            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500">Años de Exp.:</span>
              <span className="font-bold">
                {categoryBreakdown?.experienceYears?.meets
                  ? "Cumple requisito de antigüedad"
                  : `${categoryBreakdown?.experienceYears?.candidateYears ?? "3+"} años registrados`}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500">Formación:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Compatible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. PUNTOS CRÍTICOS Y RECOMENDACIONES DESTACADAS ─── */}
      {criticalPoints && criticalPoints.length > 0 && (
        <div className="space-y-2.5">
          {criticalPoints.map((cp) => (
            <div
              key={cp.id}
              className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-200">{cp.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                    Atención recomendada
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-snug">{cp.description}</p>
                {cp.actionPrompt && (
                  <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 pt-0.5">
                    💡 Acción sugerida: {cp.actionPrompt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── 3. RESUMEN EJECUTIVO / DIAGNÓSTICO IA O LOCAL ─── */}
      {summaryText && (
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Diagnóstico de Compatibilidad Semántica
            </h5>
            {aiEnhanced && (
              <span className="text-[10px] font-mono font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Generado con IA
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {summaryText}
          </p>
        </div>
      )}

      {/* ─── 4. PALABRAS CLAVE: COINCIDENTES VS FALTANTES ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Keywords Presentes */}
        <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Competencias Validadas en tu CV ({matchedKeywordsList.length})
            </h4>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
              Respaldadas
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {matchedKeywordsList.length > 0 ? (
              matchedKeywordsList.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                >
                  <Check className="w-3 h-3 text-emerald-500" />
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">No se detectaron coincidencias aún.</span>
            )}
          </div>
        </div>

        {/* Keywords Faltantes */}
        <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              Palabras Clave Faltantes en tu CV ({missingKeywords.length})
            </h4>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
              Oportunidades
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs"
                >
                  <span>{kw.text}</span>
                  {kw.estimatedScoreGain > 0 && (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{kw.estimatedScoreGain}%
                    </span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ¡Tu CV cubre el 100% de las palabras clave de la oferta!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. SIMULADOR DE SCORE PROYECTADO ─── */}
      {missingKeywords.length > 0 && (
        <ScoreProjectorSimulator
          currentScore={matchScore}
          missingKeywords={missingKeywords}
        />
      )}

      {/* ─── 6. COMPARATIVA DETALLADA DE REQUISITOS (MUST HAVE VS NICE TO HAVE) ─── */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Desglose Punto por Punto de la Oferta ({matchedCount} de {requirements.length} cumplidos)
            </h4>
            <p className="text-[11px] text-zinc-500">
              Clasificación automática de requisitos excluyentes vs deseables
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setImportanceFilter("all")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                importanceFilter === "all"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Todos ({requirements.length})
            </button>
            <button
              onClick={() => setImportanceFilter("must_have")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                importanceFilter === "must_have"
                  ? "bg-red-500 text-white shadow-2xs font-bold"
                  : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              }`}
            >
              Excluyentes ({requirements.filter((r) => r.importance === "must_have").length})
            </button>
            <button
              onClick={() => setImportanceFilter("nice_to_have")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                importanceFilter === "nice_to_have"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Deseables ({requirements.filter((r) => r.importance === "nice_to_have").length})
            </button>
          </div>
        </div>

        {/* Grid de Requisitos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredRequirements.map((req) => (
            <div
              key={req.id}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 text-xs transition-all ${
                req.matched
                  ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/40"
                  : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {req.matched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0 mt-0.5" />
                  )}
                  <span className={`font-semibold ${req.matched ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {req.text}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    req.importance === "must_have"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {req.importance === "must_have" ? "Excluyente" : "Deseable"}
                </span>
              </div>

              {req.matched && req.matchedTextInCV && (
                <div className="pl-6 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono truncate">
                  ↳ Respaldado en: &quot;{req.matchedTextInCV}&quot;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
