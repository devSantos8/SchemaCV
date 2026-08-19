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
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Compatibilidad ATS</h3>
                <p className="text-xs text-zinc-500">Auditoría de formato y reglas de oro</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${atsBg} ${atsColor}`}
            >
              {atsScore >= 80 ? "Excelente" : atsScore >= 60 ? "Atención" : "Crítico"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-4">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-black tracking-tight ${atsColor}`}
            >
              {atsScore}%
            </motion.span>
            <span className="text-xs text-zinc-400 font-medium">Índice de Aprobación de Formato</span>
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
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
          <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {passedRules}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Aprobadas</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {warningRules}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Advertencias</p>
          </div>
          <div className="p-2 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3" /> {failedRules}
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
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Target className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Match con la Oferta</h3>
                <p className="text-xs text-zinc-500">Coincidencia técnica y semántica</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${matchBg} ${matchColor}`}
            >
              {matchScore >= 75 ? "Alta Afinidad" : matchScore >= 50 ? "Afinidad Media" : "Baja Afinidad"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-4">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-black tracking-tight ${matchColor}`}
            >
              {matchScore}%
            </motion.span>
            <span className="text-xs text-zinc-400 font-medium">Requisitos y Competencias</span>
          </div>

          {/* Barra de progreso animada */}
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className={`h-full rounded-full ${
                matchScore >= 75 ? "bg-emerald-500" : matchScore >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Desglose por categoría */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
              <Cpu className="w-3 h-3" /> Hard Skills
            </div>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
              {categoryBreakdown.hardSkills.matched}/{categoryBreakdown.hardSkills.total} ({categoryBreakdown.hardSkills.score}%)
            </p>
          </div>

          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
              <Layers className="w-3 h-3" /> Herramientas
            </div>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
              {categoryBreakdown.toolsPlatforms.matched}/{categoryBreakdown.toolsPlatforms.total} ({categoryBreakdown.toolsPlatforms.score}%)
            </p>
          </div>

          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
              <Sparkles className="w-3 h-3" /> Soft Skills
            </div>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
              {categoryBreakdown.softSkills.matched}/{categoryBreakdown.softSkills.total} ({categoryBreakdown.softSkills.score}%)
            </p>
          </div>

          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
              <Clock className="w-3 h-3" /> Años Exp.
            </div>
            <p className={`font-bold text-xs ${categoryBreakdown.experienceYears.meets ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {categoryBreakdown.experienceYears.candidateYears} / {categoryBreakdown.experienceYears.requiredYears ?? "—"} años
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
