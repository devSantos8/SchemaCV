"use client";

import React, { useState, useEffect, useRef } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { DockToolbar } from "@/components/ui/dock-toolbar";
import {
  CheckCircle2,
  AlertTriangle,
  Scissors,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const ResumePreview: React.FC = () => {
  const { resumeData, activeTemplate, paperSize, zoom, setActiveTemplate } = useResumeStore();
  const docRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [pageMetrics, setPageMetrics] = useState({
    occupancyPercent: 100,
    isOverflowing: false,
    estimatedPages: 1,
    pageCount: 1,
  });

  const [showTips, setShowTips] = useState(false);

  const isA4 = paperSize === "a4";

  // Medición dinámica en tiempo real del tamaño de hoja y desbordamiento
  useEffect(() => {
    const measureDocument = () => {
      const target = contentRef.current || docRef.current;
      if (!target) return;

      // Dimensiones de 1 página a 96 DPI: Letter = 11in = 1056px | A4 = 297mm ≈ 1122.52px
      const singlePageHeightPx = isA4 ? (297 * 96) / 25.4 : 11 * 96;
      
      // Medir la altura real del contenido del template
      const actualHeight = Math.max(target.scrollHeight, target.offsetHeight);

      // Tolerancia prudente de 16px para subpixel rendering y bordes
      const isOver = actualHeight > singlePageHeightPx + 16;
      const percent = Math.min(200, Math.max(10, Math.round((actualHeight / singlePageHeightPx) * 100)));
      const estimated = (actualHeight / singlePageHeightPx).toFixed(1);
      const count = isOver ? Math.max(2, Math.ceil((actualHeight - 16) / singlePageHeightPx)) : 1;

      setPageMetrics({
        occupancyPercent: percent,
        isOverflowing: isOver,
        estimatedPages: parseFloat(estimated),
        pageCount: count,
      });
    };

    measureDocument();

    // ResizeObserver para detectar cualquier cambio de texto, lista, tipografía o zoom
    const observer = new ResizeObserver(() => {
      measureDocument();
    });

    if (contentRef.current) {
      observer.observe(contentRef.current);
    } else if (docRef.current) {
      observer.observe(docRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [resumeData, activeTemplate, paperSize, isA4]);

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden flex flex-col bg-zinc-100 dark:bg-zinc-950 print:bg-white print:overflow-visible print:h-auto print:block">
      {/* 1. BARRA SUPERIOR MINIMALISTA DE FORMATO & PÁGINAS (SHADCN STYLE) */}
      <div className="print:hidden shrink-0 z-20">
        <div className="px-3 py-1.5 h-10 border-b border-border/60 bg-muted/20 backdrop-blur-xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            {pageMetrics.isOverflowing ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Excede 1 hoja ({pageMetrics.estimatedPages} págs · {pageMetrics.occupancyPercent}%)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span>1 Hoja Óptima</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/40">
                  {pageMetrics.occupancyPercent}%
                </span>
              </div>
            )}

            {pageMetrics.isOverflowing && (
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
              >
                <span>Consejos</span>
                {showTips ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Aprobado para ATS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden md:inline" />
          </div>
        </div>

        {/* Panel desplegable de Consejos para mantener el CV en 1 sola hoja */}
        {showTips && pageMetrics.isOverflowing && (
          <div className="p-3 bg-card border-b border-border/60 text-xs text-foreground shadow-sm animate-in slide-in-from-top-1 duration-150 space-y-2">
            <div className="font-semibold flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>¿Cómo ajustar tu contenido a una sola hoja?</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-muted-foreground list-disc list-inside pl-1">
              <li>
                <strong className="text-foreground">Viñetas:</strong> Limita a 3-4 viñetas de alto impacto (STAR/XYZ) por empleo.
              </li>
              <li>
                <strong className="text-foreground">Plantilla compacta:</strong> Prueba{" "}
                <button
                  type="button"
                  onClick={() => setActiveTemplate("compact_swiss")}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 underline hover:opacity-80"
                >
                  Compact Swiss
                </button>{" "}
                o{" "}
                <button
                  type="button"
                  onClick={() => setActiveTemplate("tech_minimalist")}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 underline hover:opacity-80"
                >
                  Tech Minimalist
                </button>.
              </li>
              <li>
                <strong className="text-foreground">Resumen:</strong> Mantén el perfil profesional en 2-3 líneas concisas.
              </li>
              <li>
                <strong className="text-foreground">Habilidades:</strong> Agrupa tecnologías en categorías consolidadas.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 2. ÁREA CON SCROLL INDEPENDIENTE PARA EL DOCUMENTO */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 pb-28 sm:pb-32 flex justify-center items-start print:p-0 print:m-0 print:overflow-visible print:block scrollbar-thin">
        {/* Contenedor de Zoom interactivo */}
        <div
          id="cv-zoom-container"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="flex justify-center print:!transform-none print:m-0 print:w-full print:block relative"
        >
          {/* Hoja de papel simulada con proporciones A4 o Letter */}
          <div
            id="cv-printable-document"
            ref={docRef}
            className={`relative bg-white text-zinc-950 shadow-2xl rounded-sm transition-all border border-zinc-200/80 dark:border-zinc-800/80 print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:m-0 print:p-0 ${
              isA4
                ? "w-[210mm] min-h-[297mm]"
                : "w-[8.5in] min-h-[11in]"
            }`}
          >
            {/* LÍNEA DE CORTE VISUAL PARA PÁGINA 1 (print:hidden) */}
            {pageMetrics.isOverflowing && (
              <>
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none print:hidden flex items-center"
                  style={{ top: isA4 ? "297mm" : "11in" }}
                >
                  <div className="w-full border-b-2 border-dashed border-rose-500/90 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-600 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 whitespace-nowrap pointer-events-auto border border-white/20">
                      <Scissors className="h-3 w-3" />
                      <span>Fin de Página 1 ({isA4 ? "297mm" : "11in"}) • El contenido posterior pasa a Página 2</span>
                    </div>
                  </div>
                </div>

                {/* Badge lateral flotante indicador de Página 2 */}
                <div
                  className="absolute -right-3 sm:-right-8 z-30 pointer-events-none print:hidden"
                  style={{ top: isA4 ? "calc(297mm + 12px)" : "calc(11in + 12px)" }}
                >
                  <div className="bg-amber-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                    Pág. 2
                  </div>
                </div>
              </>
            )}

            {/* Renderizado de la plantilla activa */}
            <div ref={contentRef} id="cv-template-content" className="w-full h-auto">
              <TemplateRenderer
                templateId={activeTemplate}
                data={resumeData}
                paperSize={paperSize}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CÁPSULA / BARRA DE HERRAMIENTAS FLOTANTE FIJA */}
      <DockToolbar
        isOverflowing={pageMetrics.isOverflowing}
        pageCount={pageMetrics.pageCount}
        occupancyPercent={pageMetrics.occupancyPercent}
      />
    </div>
  );
};
