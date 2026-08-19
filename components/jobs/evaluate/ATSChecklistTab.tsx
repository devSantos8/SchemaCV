"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Wrench,
  Sparkles,
} from "lucide-react";
import type { ATSAuditRule, ATSRuleStatus } from "@/types/evaluator";

interface ATSChecklistTabProps {
  rules: ATSAuditRule[];
}

export function ATSChecklistTab({ rules }: ATSChecklistTabProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | ATSRuleStatus>("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRuleId((prev) => (prev === id ? null : id));
  };

  const filteredRules = useMemo(() => {
    if (statusFilter === "all") return rules;
    return rules.filter((r) => r.status === statusFilter);
  }, [rules, statusFilter]);

  const counts = {
    all: rules.length,
    pass: rules.filter((r) => r.status === "pass").length,
    warning: rules.filter((r) => r.status === "warning").length,
    fail: rules.filter((r) => r.status === "fail").length,
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl max-w-fit">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Todas ({counts.all})
        </button>

        <button
          onClick={() => setStatusFilter("fail")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === "fail"
              ? "bg-red-500 text-white shadow-2xs"
              : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          }`}
        >
          <XCircle className="w-3 h-3" /> Fallas ({counts.fail})
        </button>

        <button
          onClick={() => setStatusFilter("warning")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === "warning"
              ? "bg-amber-500 text-white shadow-2xs"
              : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          }`}
        >
          <AlertTriangle className="w-3 h-3" /> Advertencias ({counts.warning})
        </button>

        <button
          onClick={() => setStatusFilter("pass")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === "pass"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" /> Aprobadas ({counts.pass})
        </button>
      </div>

      {/* Lista de Reglas Auditadas */}
      <div className="space-y-2.5">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRuleId === rule.id;

          const statusIcon =
            rule.status === "pass" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : rule.status === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            );

          const statusBadge =
            rule.status === "pass" ? (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-md">
                PASA
              </span>
            ) : rule.status === "warning" ? (
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-md">
                ADVERTENCIA
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-md">
                FALLA
              </span>
            );

          return (
            <div
              key={rule.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs transition-all"
            >
              <div
                onClick={() => toggleExpand(rule.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{statusIcon}</div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rule.name}</p>
                      {statusBadge}
                      {rule.severity === "critical" && (
                        <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900">
                          Crítico
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{rule.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    {rule.scoreEarned} / {rule.scoreWeight} pts
                  </span>
                  <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Panel de Solución / Fix Guide */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                        ¿Por qué le importa al ATS?
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-5 leading-relaxed">
                        {rule.fixGuide.whyItMatters}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <Wrench className="w-3.5 h-3.5 text-violet-500" />
                        ¿Cómo solucionarlo?
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-5 leading-relaxed">
                        {rule.fixGuide.howToFix}
                      </p>
                    </div>

                    {rule.fixGuide.example && (
                      <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        <span className="text-[10px] text-zinc-400 block mb-1">Ejemplo recomendado:</span>
                        {rule.fixGuide.example}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
