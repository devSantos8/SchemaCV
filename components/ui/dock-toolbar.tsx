"use client";

import React from "react";
import { ZoomIn, ZoomOut, Maximize2, Printer, FileText } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";

export const DockToolbar: React.FC = () => {
  const { zoom, setZoom, paperSize, setPaperSize } = useResumeStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 px-3 rounded-full bg-zinc-900/90 dark:bg-zinc-800/90 text-zinc-100 shadow-2xl backdrop-blur-md border border-zinc-700/50 print:hidden transition-all hover:scale-105">
      {/* Zoom Out */}
      <button
        type="button"
        onClick={() => setZoom(zoom - 10)}
        disabled={zoom <= 50}
        className="p-1.5 rounded-full hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Reducir zoom"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      {/* Indicador / Reset Zoom */}
      <button
        type="button"
        onClick={() => setZoom(100)}
        className="text-[11px] font-mono font-medium px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors"
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
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-zinc-700 mx-1" />

      {/* Selector Tamaño Papel */}
      <button
        type="button"
        onClick={() => setPaperSize(paperSize === "letter" ? "a4" : "letter")}
        className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors uppercase"
        title={`Cambiar a ${paperSize === "letter" ? "A4" : "Letter"}`}
      >
        {paperSize}
      </button>

      <div className="h-4 w-[1px] bg-zinc-700 mx-1" />

      {/* Imprimir Directo / PDF */}
      <button
        type="button"
        onClick={handlePrint}
        className="p-1.5 rounded-full hover:bg-zinc-700 text-emerald-400 transition-colors"
        title="Imprimir / Guardar como PDF"
      >
        <Printer className="h-4 w-4" />
      </button>
    </div>
  );
};
