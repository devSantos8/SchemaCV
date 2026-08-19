"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronDown, ChevronUp, Zap, ArrowRight, ShieldAlert } from "lucide-react";
import type { EvaluationReport } from "@/types/evaluator";

interface CriticalPointsBannerProps {
  criticalPoints: EvaluationReport["criticalPoints"];
}

export function CriticalPointsBanner({ criticalPoints }: CriticalPointsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (criticalPoints.length === 0) {
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs">
        <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
        <p className="font-medium">
          ¡Excelente! No se detectaron bloqueos críticos de formato ni requisitos indispensables ausentes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20 overflow-hidden shadow-xs">
      {/* Header del Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-red-100/40 dark:hover:bg-red-900/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-900 dark:text-red-200">
              Puntos Críticos Detectados ({criticalPoints.length})
            </h4>
            <p className="text-[11px] text-red-700 dark:text-red-400">
              Atención prioritaria antes de postular a este empleo
            </p>
          </div>
        </div>

        <button className="text-red-600 dark:text-red-400 p-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Lista de Puntos Críticos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 space-y-2.5 pt-1 border-t border-red-200/60 dark:border-red-900/40"
          >
            {criticalPoints.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5.5">
                  {item.description}
                </p>
                <div className="flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg ml-5.5 border border-red-100 dark:border-red-900/30">
                  <ArrowRight className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>
                    <strong>Acción recomendada:</strong> {item.actionPrompt}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
