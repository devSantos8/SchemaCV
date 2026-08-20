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
} from "lucide-react";
import type { EvaluationReport, RequirementImportance } from "@/types/evaluator";
import { ScoreProjectorSimulator } from "./ScoreProjectorSimulator";

interface MatchKeywordsTabProps {
  report: EvaluationReport;
}

export function MatchKeywordsTab({ report }: MatchKeywordsTabProps) {
  const { requirements, missingKeywords, matchScore, summaryText, aiEnhanced } = report;
  const [importanceFilter, setImportanceFilter] = useState<"all" | RequirementImportance>("all");

  const filteredRequirements = requirements.filter((r) => {
    if (importanceFilter === "all") return true;
    return r.importance === importanceFilter;
  });

  const matchedCount = requirements.filter((r) => r.matched).length;

  return (
    <div className="space-y-6">
      {/* Resumen Inteligente */}
      {summaryText && (
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Diagnóstico de Compatibilidad Semántica
            </h5>
            {aiEnhanced && (
              <span className="text-[10px] font-mono font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Generado con IA
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {summaryText}
          </p>
        </div>
      )}

      {/* Simulador Interactivo de Score Proyectado */}
      <ScoreProjectorSimulator
        currentScore={matchScore}
        missingKeywords={missingKeywords}
      />

      {/* Lista de Requisitos Extraídos de la Oferta */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Requisitos y Competencias Detectadas ({matchedCount}/{requirements.length})
            </h4>
            <p className="text-[11px] text-zinc-500">
              Clasificación automática según severidad del requerimiento
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setImportanceFilter("all")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                importanceFilter === "all"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Todos ({requirements.length})
            </button>
            <button
              onClick={() => setImportanceFilter("must_have")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                importanceFilter === "must_have"
                  ? "bg-red-500 text-white shadow-2xs"
                  : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              }`}
            >
              Excluyentes ({requirements.filter((r) => r.importance === "must_have").length})
            </button>
            <button
              onClick={() => setImportanceFilter("nice_to_have")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                importanceFilter === "nice_to_have"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Deseables ({requirements.filter((r) => r.importance === "nice_to_have").length})
            </button>
          </div>
        </div>

        {/* Grid de Requisitos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredRequirements.map((req) => (
            <div
              key={req.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                req.matched
                  ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/40"
                  : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {req.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0" />
                )}
                <span className={`font-semibold truncate ${req.matched ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"}`}>
                  {req.text}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    req.importance === "must_have"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {req.importance === "must_have" ? "Excluyente" : "Deseable"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
