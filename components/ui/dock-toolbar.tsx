"use client";

import React from "react";
import { ZoomIn, ZoomOut, Printer, LayoutGrid, CheckCircle2, AlertTriangle, Globe } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

interface DockToolbarProps {
  isOverflowing?: boolean;
  pageCount?: number;
  occupancyPercent?: number;
}

export const DockToolbar: React.FC<DockToolbarProps> = ({
  isOverflowing = false,
  pageCount = 1,
  occupancyPercent = 100,
}) => {
  const {
    zoom,
    setZoom,
    paperSize,
    setPaperSize,
    setTemplateGalleryOpen,
    resumeData,
    setResumeData,
  } = useResumeStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 px-3 rounded-full bg-zinc-900/90 dark:bg-zinc-800/90 text-zinc-100 shadow-2xl backdrop-blur-md border border-zinc-700/50 print:hidden transition-all hover:scale-105">
      {/* Botón Explorador de Plantillas */}
      <button
        type="button"
        onClick={() => setTemplateGalleryOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all"
        title="Abrir Catálogo de Plantillas ATS"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Plantillas</span>
      </button>

      <div className="h-4 w-[1px] bg-zinc-700 mx-0.5" />

      {/* Indicador de Páginas ATS */}
      <div
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
          isOverflowing
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
        }`}
        title={
          isOverflowing
            ? `Excede 1 hoja (${pageCount} páginas generadas). Se recomienda condensar.`
            : `1 Página óptima (${occupancyPercent}% ocupada)`
        }
      >
        {isOverflowing ? (
          <>
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span>{pageCount} Págs ⚠️</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>1 Pág ✓</span>
          </>
        )}
      </div>

      <div className="h-4 w-[1px] bg-zinc-700 mx-0.5" />

      {/* Zoom Out */}
      <button
        type="button"
        onClick={() => setZoom(zoom - 10)}
        disabled={zoom <= 50}
        className="p-1.5 rounded-full hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Reducir zoom"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>

      {/* Indicador / Reset Zoom */}
      <button
        type="button"
        onClick={() => setZoom(100)}
        className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded hover:bg-zinc-700 transition-colors"
        title="Restablecer zoom al 100%"
      >
        {zoom}%
      </button>

      {/* Zoom In */}
      <button
        type="button"
        onClick={() => setZoom(zoom + 10)}
        disabled={zoom >= 150}
        className="p-1.5 rounded-full hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Aumentar zoom"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-[1px] bg-zinc-700 mx-0.5" />

      {/* Selector Tamaño Papel */}
      <button
        type="button"
        onClick={() => setPaperSize(paperSize === "letter" ? "a4" : "letter")}
        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors uppercase"
        title={`Cambiar a ${paperSize === "letter" ? "A4" : "Letter"}`}
      >
        {paperSize}
      </button>

      <div className="h-4 w-[1px] bg-zinc-700 mx-0.5" />

      {/* Selector Idioma Plantilla (ES / EN) */}
      <button
        type="button"
        onClick={() => {
          const nextLang = (resumeData.language || "es") === "es" ? "en" : "es";
          setResumeData({ language: nextLang });
        }}
        className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors uppercase"
        title={`Idioma de plantilla: ${(resumeData.language || "es").toUpperCase()}. Clic para cambiar a ${(resumeData.language || "es") === "es" ? "EN" : "ES"}`}
      >
        <Globe className="h-3 w-3 text-emerald-400" />
        <span>{(resumeData.language || "es").toUpperCase()}</span>
      </button>

      <div className="h-4 w-[1px] bg-zinc-700 mx-0.5" />

      {/* Imprimir Directo / PDF */}
      <button
        type="button"
        onClick={handlePrint}
        className="p-1.5 rounded-full hover:bg-zinc-700 text-emerald-400 transition-colors"
        title="Imprimir / Guardar como PDF"
      >
        <Printer className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
