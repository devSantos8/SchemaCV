"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Target,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Clock,
} from "lucide-react";
import type { EvaluationReport } from "@/types/evaluator";

interface ScoreCardsProps {
  report: EvaluationReport;
}

export function ScoreCards({ report }: ScoreCardsProps) {
  const { atsScore, matchScore, auditRules, categoryBreakdown } = report;

  // Estadísticas de reglas ATS
  const passedRules = auditRules.filter((r) => r.status === "pass").length;
  const warningRules = auditRules.filter((r) => r.status === "warning").length;
  const failedRules = auditRules.filter((r) => r.status === "fail").length;

  const atsColor =
    atsScore >= 80 ? "text-emerald-500" : atsScore >= 60 ? "text-amber-500" : "text-red-500";
  const atsBg =
    atsScore >= 80
      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
      : atsScore >= 60
      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50";

  const matchColor =
    matchScore >= 75 ? "text-emerald-500" : matchScore >= 50 ? "text-amber-500" : "text-red-500";
  const matchBg =
    matchScore >= 75
      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
      : matchScore >= 50
      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ─── Card 1: Compatibilidad ATS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Compatibilidad ATS</h3>
                <p className="text-xs text-zinc-500">Auditoría de formato y 10 reglas de oro</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${atsBg} ${atsColor}`}
            >
              {atsScore >= 80 ? "Excelente" : atsScore >= 60 ? "Atención" : "Crítico"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-4">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-black tracking-tight ${atsColor}`}
            >
              {atsScore}%
            </motion.span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Índice de Aprobación de Formato</span>
          </div>

          {/* Barra de progreso animada */}
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${atsScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                atsScore >= 80 ? "bg-emerald-500" : atsScore >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Breakdown de reglas */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
          <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {passedRules}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Aprobadas</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {warningRules}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Advertencias</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> {failedRules}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Fallas</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Card 2: Match con la Oferta ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Match con la Oferta</h3>
                <p className="text-xs text-zinc-500">Coincidencia técnica y semántica</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${matchBg} ${matchColor}`}
            >
              {matchScore >= 75 ? "Alto Match" : matchScore >= 50 ? "Match Medio" : "Bajo Match"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-4">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-black tracking-tight ${matchColor}`}
            >
              {matchScore}%
            </motion.span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Afinidad de Requisitos</span>
          </div>

          {/* Barra de progreso animada */}
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                matchScore >= 75 ? "bg-emerald-500" : matchScore >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Breakdown de Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
          <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              {categoryBreakdown.hardSkills.matched}/{categoryBreakdown.hardSkills.total}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Hard Skills</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              {categoryBreakdown.toolsPlatforms.matched}/{categoryBreakdown.toolsPlatforms.total}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Cloud & Tools</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              {categoryBreakdown.softSkills.matched}/{categoryBreakdown.softSkills.total}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Soft Skills</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <p className={`text-xs font-bold flex items-center justify-center gap-1 ${
              categoryBreakdown.experienceYears.meets ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {categoryBreakdown.experienceYears.candidateYears} / {categoryBreakdown.experienceYears.requiredYears ?? "—"}a
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {categoryBreakdown.experienceYears.meets ? "Cumple exp" : "Brecha exp"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
