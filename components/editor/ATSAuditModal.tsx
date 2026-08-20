"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ResumeData } from "@/types/resume";
import { simulateATSParsing, auditATSFormat } from "@/lib/ats";
import type { ATSRuleStatus } from "@/types/evaluator";

interface ATSAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  title?: string;
}

export function ATSAuditModal({
  isOpen,
  onClose,
  resumeData,
  title = "Auditor de Formato ATS",
}: ATSAuditModalProps) {
  const [activeTab, setActiveTab] = useState<"checklist" | "simulation">("checklist");
  const [statusFilter, setStatusFilter] = useState<"all" | ATSRuleStatus>("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // Ejecutar simulación y auditoría determinista
  const { simulation, rules, atsScore } = useMemo(() => {
    const sim = simulateATSParsing({
      resumeData,
      sourceType: "schema_profile",
    });
    const { rules: auditRules, atsScore: score } = auditATSFormat({
      resumeData,
      simulation: sim,
      sourceType: "schema_profile",
    });
    return { simulation: sim, rules: auditRules, atsScore: score };
  }, [resumeData]);

  const passedRules = rules.filter((r) => r.status === "pass").length;
  const warningRules = rules.filter((r) => r.status === "warning").length;
  const failedRules = rules.filter((r) => r.status === "fail").length;

  const scoreColor =
    atsScore >= 80 ? "text-emerald-500" : atsScore >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg =
    atsScore >= 80
      ? "bg-emerald-500"
      : atsScore >= 60
      ? "bg-amber-500"
      : "bg-red-500";

  const criticalIssues = rules.filter((r) => r.status === "fail" || (r.status === "warning" && r.severity === "critical"));

  const filteredRules = rules.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={true}
        className="max-w-3xl p-0 overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-50 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </DialogTitle>
              <p className="text-[11px] text-zinc-500">
                Comprobación de las 10 Reglas de Oro ATS para tu CV
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body scrolleable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Score y Resumen */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
                  Índice de Compatibilidad ATS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black tracking-tight ${scoreColor}`}>
                    {atsScore}%
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    {atsScore >= 90
                      ? "Excelente — Formato 100% ATS Friendly"
                      : atsScore >= 70
                      ? "Bueno — Requiere algunos ajustes menores"
                      : "Crítico — Requiere corregir bloqueos de formato"}
                  </span>
                </div>
              </div>

              {/* Breakdown de estado */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900 text-center">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{passedRules}</span>
                  <span className="text-[9px] text-zinc-500">Pasan</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900 text-center">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">{warningRules}</span>
                  <span className="text-[9px] text-zinc-500">Alertas</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900 text-center">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 block">{failedRules}</span>
                  <span className="text-[9px] text-zinc-500">Fallas</span>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${atsScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${scoreBg}`}
              />
            </div>
          </div>

          {/* Puntos Críticos / Puntos a Mejorar Directos */}
          {criticalIssues.length > 0 && (
            <div className="p-4 rounded-2xl border border-red-200/80 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-900 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                Puntos Prioritarios a Mejorar en tu CV ({criticalIssues.length})
              </div>

              <div className="space-y-2">
                {criticalIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/40 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{issue.name}</span>
                      <span className="text-[9px] font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.2 rounded border border-red-200 dark:border-red-900">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {issue.message}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-red-700 dark:text-red-400 font-medium pt-0.5">
                      <ArrowRight className="w-3 h-3 shrink-0" />
                      <span><strong>Solución:</strong> {issue.fixGuide.howToFix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("checklist")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "checklist"
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Checklist de 10 Normas ATS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("simulation")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "simulation"
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Así te lee el ATS
                </button>
              </div>

              {activeTab === "checklist" && (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-2 py-1 text-[11px] rounded-lg cursor-pointer ${
                      statusFilter === "all" ? "font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800" : "text-zinc-400"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("fail")}
                    className={`px-2 py-1 text-[11px] rounded-lg cursor-pointer ${
                      statusFilter === "fail" ? "font-bold text-red-600 bg-red-50 dark:bg-red-950/30" : "text-zinc-400"
                    }`}
                  >
                    Fallas ({failedRules})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("pass")}
                    className={`px-2 py-1 text-[11px] rounded-lg cursor-pointer ${
                      statusFilter === "pass" ? "font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-zinc-400"
                    }`}
                  >
                    Pasan ({passedRules})
                  </button>
                </div>
              )}
            </div>

            {activeTab === "checklist" ? (
              <div className="space-y-2.5">
                {filteredRules.map((rule) => {
                  const isExpanded = expandedRuleId === rule.id;

                  return (
                    <div
                      key={rule.id}
                      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs"
                    >
                      <div
                        onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
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
            ) : (
              /* Simulación ATS */
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                    Datos de Contacto Extraídos
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">Nombre</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                        {simulation.detectedContact.name || "No detectado"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">Email</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                        {simulation.detectedContact.email || "No detectado"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">Teléfono</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                        {simulation.detectedContact.phone || "No detectado"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">En Cuerpo</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                        {simulation.detectedContact.isInBody ? "Correcto ✓" : "En Header ✗"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-300 font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto">
                  <span className="text-[10px] text-zinc-500 block">Texto plano leído por el parser:</span>
                  <pre className="whitespace-pre-wrap leading-relaxed select-all">
                    {simulation.rawExtractedText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
          >
            Cerrar Auditor
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
