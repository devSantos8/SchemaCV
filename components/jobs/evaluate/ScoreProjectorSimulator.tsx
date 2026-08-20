"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Check, Plus, ArrowUpRight } from "lucide-react";
import type { MissingKeywordItem } from "@/types/evaluator";
import { calculateProjectedScore } from "@/lib/ats";

interface ScoreProjectorSimulatorProps {
  currentScore: number;
  missingKeywords: MissingKeywordItem[];
}

export function ScoreProjectorSimulator({
  currentScore,
  missingKeywords,
}: ScoreProjectorSimulatorProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const toggleKeyword = (text: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(text) ? prev.filter((t) => t !== text) : [...prev, text]
    );
  };

  const selectAll = () => {
    setSelectedKeywords(missingKeywords.map((k) => k.text));
  };

  const clearAll = () => {
    setSelectedKeywords([]);
  };

  const projectedScore = calculateProjectedScore(currentScore, selectedKeywords, missingKeywords);
  const scoreDiff = projectedScore - currentScore;

  if (missingKeywords.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-3 shadow-2xs">
      {/* Header del Simulador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Simulador de Score Proyectado
            </h4>
            <p className="text-[11px] text-zinc-500">
              Marca las palabras clave que podrías incluir en tu CV para estimar tu nuevo puntaje
            </p>
          </div>
        </div>

        {/* Display del Score Proyectado */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-2 px-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block">Match Proyectado</span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-xs text-zinc-400 line-through">{currentScore}%</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {projectedScore}%
              </span>
            </div>
          </div>
          {scoreDiff > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
              +{scoreDiff}%
            </span>
          )}
        </div>
      </div>

      {/* Acciones de selección rápida */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] text-zinc-400">
          {selectedKeywords.length} de {missingKeywords.length} seleccionadas
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline cursor-pointer"
          >
            Seleccionar todas
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:underline cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Grid de Keywords seleccionables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {missingKeywords.map((kw) => {
          const isSelected = selectedKeywords.includes(kw.text);

          return (
            <button
              key={kw.text}
              type="button"
              onClick={() => toggleKeyword(kw.text)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs font-semibold"
                  : "border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                    isSelected
                      ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white font-bold"
                      : "border border-zinc-300 dark:border-zinc-700 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-xs truncate">{kw.text}</span>
              </div>

              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                  isSelected
                    ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900 font-bold"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                +{kw.estimatedScoreGain}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
