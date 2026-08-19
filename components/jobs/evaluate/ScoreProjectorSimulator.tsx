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
    <div className="p-5 rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 space-y-4">
      {/* Header del Simulador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-violet-200/60 dark:border-violet-900/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Simulador de Score Proyectado
            </h4>
            <p className="text-[11px] text-zinc-500">
              Marca las competencias que podrías incorporar en tu CV para previsualizar el aumento de match
            </p>
          </div>
        </div>

        {/* Display del Score Proyectado */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 px-3 rounded-xl border border-violet-200/80 dark:border-violet-900 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Score Proyectado:</span>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm text-violet-600 dark:text-violet-400">
              <span>{currentScore}%</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
              <motion.span
                key={projectedScore}
                initial={{ scale: 1.2, color: "#8b5cf6" }}
                animate={{ scale: 1 }}
                className="text-base text-zinc-900 dark:text-zinc-100"
              >
                {projectedScore}%
              </motion.span>
            </div>
          </div>
          {scoreDiff > 0 && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2 py-1 rounded-lg">
              +{scoreDiff}%
            </span>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-zinc-500 text-[11px]">
          {selectedKeywords.length} de {missingKeywords.length} seleccionadas
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-medium"
          >
            Seleccionar todas
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <button
            onClick={clearAll}
            className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Grid de Checkboxes de Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {missingKeywords.map((kw) => {
          const isSelected = selectedKeywords.includes(kw.text);

          return (
            <button
              key={kw.text}
              type="button"
              onClick={() => toggleKeyword(kw.text)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                isSelected
                  ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-white text-violet-600 border-white"
                      : "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="font-semibold truncate">{kw.text}</span>
              </div>

              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-1 shrink-0 ${
                  isSelected
                    ? "bg-violet-700/60 text-white"
                    : kw.importance === "must_have"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
