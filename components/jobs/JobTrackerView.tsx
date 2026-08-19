"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, RefreshCw, Loader2, Search, Filter, Wifi, BarChart3, Briefcase } from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { JobApplicationCard } from "./JobApplicationCard";
import { JobDetailPanel } from "./JobDetailPanel";
import { AddJobModal } from "./AddJobModal";
import type { ApplicationStatus } from "@/types/jobs";
import { STATUS_LABELS } from "@/types/jobs";

const COLUMNS: ApplicationStatus[] = ["bookmarked", "applied", "interviewing", "offer", "rejected"];

const COLUMN_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
  applied: "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/60 dark:border-blue-900/40",
  interviewing: "bg-violet-50/50 dark:bg-violet-950/10 border-violet-200/60 dark:border-violet-900/40",
  offer: "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40",
  rejected: "bg-red-50/30 dark:bg-red-950/10 border-red-200/40 dark:border-red-900/30",
  closed: "bg-zinc-50/30 dark:bg-zinc-900/30 border-zinc-200/40 dark:border-zinc-800/30",
};

export function JobTrackerView() {
  const {
    applications,
    selectedId,
    setSelectedId,
    deleteApplication,
    duplicateApplication,
    getStaleApplications,
    setIsCheckingLinks,
    setLinkCheck,
    isCheckingLinks,
  } = useJobsStore();
  const { enabled } = useAISettingsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const staleIds = useMemo(() => new Set(getStaleApplications().map((a) => a.id)), [applications]);

  const filtered = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter(
      (a) => a.title.toLowerCase().includes(q) || a.company.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const byStatus = useMemo(() => {
    const map = {} as Record<ApplicationStatus, typeof applications>;
    for (const col of COLUMNS) {
      map[col] = filtered.filter((a) => a.status === col);
    }
    return map;
  }, [filtered]);

  async function handleCheckLinks() {
    const urls = applications
      .filter((a) => a.url)
      .map((a) => ({ id: a.id, url: a.url! }));
    if (!urls.length) return;
    setIsCheckingLinks(true);
    try {
      const res = await fetch("/api/jobs/check-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urls.map((u) => u.url) }),
      });
      const results = await res.json() as { url: string; status: number | null; ok: boolean; checkedAt: string }[];
      const resultMap = new Map(results.map((r) => [r.url, r]));
      for (const { id, url } of urls) {
        const r = resultMap.get(url);
        if (r) {
          setLinkCheck(id, r);
        }
      }
    } catch {
      // silencioso
    } finally {
      setIsCheckingLinks(false);
    }
  }

  // Estadisticas rapidas
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    avgScore: applications.filter((a) => a.matchAnalysis).length > 0
      ? Math.round(applications.filter((a) => a.matchAnalysis).reduce((sum, a) => sum + (a.matchAnalysis?.score ?? 0), 0) / applications.filter((a) => a.matchAnalysis).length)
      : null,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Job Tracker</h1>
              <p className="text-xs text-zinc-500">{applications.length} postulaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Estadisticas rapidas */}
            {stats.total > 0 && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <BarChart3 className="w-3 h-3" />
                  {stats.applied} postuladas
                </span>
                {stats.avgScore !== null && (
                  <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                    ~{stats.avgScore}% match
                  </span>
                )}
              </div>
            )}

            {/* Verificar links */}
            <button
              onClick={handleCheckLinks}
              disabled={isCheckingLinks || applications.filter((a) => a.url).length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingLinks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              {isCheckingLinks ? "Verificando..." : "Verificar links"}
            </button>

            {/* Agregar */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>
        </div>

        {/* Busqueda */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por puesto o empresa..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Kanban */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sin postulaciones todavia</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Agrega tu primera oferta pegando la URL o la descripcion del puesto.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar primera postulacion
              </button>
            </div>
          ) : (
            <LayoutGroup>
              <div className="flex gap-3 p-4 h-full min-w-max">
                {COLUMNS.map((col) => (
                  <div
                    key={col}
                    className={`flex flex-col w-[260px] shrink-0 rounded-xl border ${COLUMN_COLORS[col]}`}
                  >
                    {/* Column header */}
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{STATUS_LABELS[col]}</span>
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                        {byStatus[col]?.length ?? 0}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                      <AnimatePresence>
                        {byStatus[col]?.map((app) => (
                          <JobApplicationCard
                            key={app.id}
                            application={app}
                            isStale={staleIds.has(app.id)}
                            isSelected={selectedId === app.id}
                            onClick={() => setSelectedId(selectedId === app.id ? null : app.id)}
                            onDelete={() => deleteApplication(app.id)}
                            onDuplicate={() => duplicateApplication(app.id)}
                          />
                        ))}
                      </AnimatePresence>
                      {byStatus[col]?.length === 0 && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center py-4">
                          Sin postulaciones
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </LayoutGroup>
          )}
        </div>

        {/* Panel de detalle */}
        <AnimatePresence>
          {selectedId && (
            <div className="w-[340px] shrink-0 h-full overflow-y-auto">
              <JobDetailPanel
                applicationId={selectedId}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de agregar */}
      <AnimatePresence>
        {showAddModal && <AddJobModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
