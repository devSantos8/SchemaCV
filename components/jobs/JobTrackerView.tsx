"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Plus, RefreshCw, Loader2, Search, Filter, Wifi, BarChart3, Briefcase } from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { JobApplicationCard } from "./JobApplicationCard";
import { JobDetailPanel } from "./JobDetailPanel";
import { JobDetailFullView } from "./JobDetailFullView";
import { AddJobModal } from "./AddJobModal";
import type { ApplicationStatus, JobApplication } from "@/types/jobs";
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

// Componente Draggable para cada Tarjeta
function DraggableJobCard({
  application,
  isStale,
  isSelected,
  onClick,
  onDelete,
  onDuplicate,
}: {
  application: JobApplication;
  isStale: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application.id,
    data: {
      application,
      status: application.status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`touch-none select-none transition-all duration-150 ${
        isDragging ? "opacity-0 h-0 overflow-hidden m-0 p-0 pointer-events-none" : ""
      }`}
    >
      {!isDragging && (
        <JobApplicationCard
          application={application}
          isStale={isStale}
          isSelected={isSelected}
          onClick={onClick}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      )}
    </div>
  );
}

// Componente Droppable para cada Columna
function DroppableKanbanColumn({
  col,
  count,
  children,
}: {
  col: ApplicationStatus;
  count: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: col,
    data: {
      status: col,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[270px] shrink-0 rounded-2xl border transition-all duration-200 ${
        COLUMN_COLORS[col]
      } ${isOver ? "ring-2 ring-zinc-900/40 dark:ring-white/40 bg-zinc-100/90 dark:bg-zinc-800/90 scale-[1.01]" : ""}`}
    >
      {/* Column header */}
      <div className="px-3.5 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{STATUS_LABELS[col]}</span>
        <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
          {count}
        </span>
      </div>

      {/* Cards container */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-2.5 min-h-[160px]">
        {children}
      </div>
    </div>
  );
}

export function JobTrackerView() {
  const {
    applications,
    selectedId,
    setSelectedId,
    updateApplication,
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
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

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

  // Sensores de DnD Kit: Pointer sensor con constraint de 5px para no anular clics
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const activeDraggingApp = useMemo(
    () => applications.find((a) => a.id === activeDragId),
    [applications, activeDragId]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeAppId = String(active.id);
    const overId = String(over.id);

    // 1. Si se soltó directamente sobre una columna
    if (COLUMNS.includes(overId as ApplicationStatus)) {
      const targetStatus = overId as ApplicationStatus;
      const currentApp = applications.find((a) => a.id === activeAppId);
      if (currentApp && currentApp.status !== targetStatus) {
        updateApplication(activeAppId, { status: targetStatus });
      }
      return;
    }

    // 2. Si se soltó sobre otra tarjeta de la columna
    const overApp = applications.find((a) => a.id === overId);
    if (overApp) {
      const targetStatus = overApp.status;
      const currentApp = applications.find((a) => a.id === activeAppId);
      if (currentApp && currentApp.status !== targetStatus) {
        updateApplication(activeAppId, { status: targetStatus });
      }
    }
  }

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

  // Estadísticas rápidas
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    avgScore: applications.filter((a) => a.matchAnalysis).length > 0
      ? Math.round(applications.filter((a) => a.matchAnalysis).reduce((sum, a) => sum + (a.matchAnalysis?.score ?? 0), 0) / applications.filter((a) => a.matchAnalysis).length)
      : null,
  };

  // Si hay una postulación seleccionada, cambiar toda la vista al detalle completo interactivo
  if (selectedId) {
    return (
      <JobDetailFullView
        applicationId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Job Tracker</h1>
              <p className="text-xs text-zinc-500">
                Gestiona tus postulaciones, analiza el match con tu CV y arrastra las tarjetas entre estados.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Boton check links */}
              <button
                onClick={handleCheckLinks}
                disabled={isCheckingLinks || applications.length === 0}
                title="Verificar si los links de las ofertas siguen activos"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isCheckingLinks ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" />
                )}
                <span>Verificar links</span>
              </button>

              {/* Boton nueva postulacion */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva postulación</span>
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</span> total
            </div>
            <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="font-bold text-blue-600 dark:text-blue-400">{stats.applied}</span> postuladas
            </div>
            <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="font-bold text-violet-600 dark:text-violet-400">{stats.interviewing}</span> en entrevista
            </div>
            {stats.avgScore !== null && (
              <>
                <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className={`font-bold ${stats.avgScore >= 70 ? "text-emerald-600" : stats.avgScore >= 40 ? "text-amber-600" : "text-red-500"}`}>
                    {stats.avgScore}%
                  </span> match prom.
                </div>
              </>
            )}
            {staleIds.size > 0 && (
              <>
                <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                  {staleIds.size} {staleIds.size === 1 ? "requiere seguimiento" : "requieren seguimiento"}
                </span>
              </>
            )}
          </div>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por puesto o empresa..."
              className="w-full h-8 pl-8 pr-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all"
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
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sin postulaciones todavía</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Agrega tu primera oferta pegando la URL o la descripción del puesto.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Agregar primera postulación
                </button>
              </div>
            ) : (
              <LayoutGroup>
                <div className="flex gap-3.5 p-4 h-full min-w-max">
                  {COLUMNS.map((col) => (
                    <DroppableKanbanColumn
                      key={col}
                      col={col}
                      count={byStatus[col]?.length ?? 0}
                    >
                      <AnimatePresence>
                        {byStatus[col]?.map((app) => (
                          <DraggableJobCard
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
                        <div className="h-24 rounded-xl border border-dashed border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center">
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center">
                            Arrastra aquí
                          </p>
                        </div>
                      )}
                    </DroppableKanbanColumn>
                  ))}
                </div>
              </LayoutGroup>
            )}
          </div>

          {/* Panel de detalle */}
          <AnimatePresence>
            {selectedId && (
              <div className="w-[380px] shrink-0 h-full overflow-hidden border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg z-20">
                <JobDetailPanel
                  applicationId={selectedId}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Overlay flotante durante el arrastre con animación de elevación e inclinación */}
        <DragOverlay
          dropAnimation={{
            duration: 160,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {activeDraggingApp ? (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: 2.5 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="w-[260px] cursor-grabbing shadow-2xl ring-2 ring-zinc-900/10 dark:ring-white/20 rounded-2xl pointer-events-none"
            >
              <JobApplicationCard
                application={activeDraggingApp}
                isStale={staleIds.has(activeDraggingApp.id)}
                isSelected={selectedId === activeDraggingApp.id}
                onClick={() => {}}
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            </motion.div>
          ) : null}
        </DragOverlay>

        {/* Modal de agregar */}
        <AnimatePresence>
          {showAddModal && <AddJobModal onClose={() => setShowAddModal(false)} />}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}
