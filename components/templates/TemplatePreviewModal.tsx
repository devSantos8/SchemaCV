"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplateId, PaperSize, ResumeData } from "@/types/resume";
import { TEMPLATE_METADATA, TemplateRenderer } from "./TemplateRenderer";
import { SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import {
  GraduationCap,
  Terminal,
  Briefcase,
  Layers,
  Sparkles,
  LayoutGrid,
  Check,
  Minimize2,
  Maximize2,
  ShieldCheck,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Cpu,
  GitFork,
  Globe2,
  MapPin,
  FileText,
  Printer,
  Sparkle,
} from "lucide-react";

const TEMPLATE_ICONS: Record<TemplateId, React.ElementType> = {
  chile_profesional: MapPin,
  harvard: GraduationCap,
  tech_minimalist: Terminal,
  modern_executive: Briefcase,
  skills_first: Layers,
  stanford_clean: Sparkles,
  compact_swiss: LayoutGrid,
  executive_serif: BookOpen,
  tech_compact: Cpu,
  modern_minimal: Minimize2,
  career_changer: GitFork,
  academic_international: Globe2,
};

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: TemplateId | null;
  onApplyTemplate: (templateId: TemplateId, withSampleData?: boolean) => void;
  userResumeData?: ResumeData;
  initialPaperSize?: PaperSize;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  open,
  onOpenChange,
  templateId,
  onApplyTemplate,
  userResumeData,
  initialPaperSize = "letter",
}) => {
  const [useSampleData, setUseSampleData] = useState(true);
  const [paperSize, setPaperSize] = useState<PaperSize>(initialPaperSize);
  const [zoom, setZoom] = useState<number>(0.85);

  useEffect(() => {
    if (open) {
      setZoom(0.85);
    }
  }, [open, templateId]);

  if (!templateId) return null;

  const meta = TEMPLATE_METADATA[templateId];
  if (!meta) return null;

  const Icon = TEMPLATE_ICONS[templateId] || Terminal;

  const hasUserData = Boolean(userResumeData && userResumeData.name);
  const previewData = useSampleData || !hasUserData
    ? SAMPLE_RESUME_FULLSTACK
    : (userResumeData || SAMPLE_RESUME_FULLSTACK);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.3, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(0.85);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] h-[92vh] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* ENCABEZADO SUPERIOR */}
        <DialogHeader className="p-3.5 sm:p-5 border-b border-border bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Icon className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>{meta.name}</span>
                </DialogTitle>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>ATS {meta.atsScore}%</span>
                </Badge>
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                  {meta.density}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                {meta.description}
              </DialogDescription>
            </div>

            {/* CONTROLES RÁPIDOS: MUESTRA/DATOS & TAMAÑO & ZOOM */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Selector Datos Muestra vs Mis Datos */}
              <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/70 p-0.5 rounded-xl text-xs font-medium border border-border/60">
                <button
                  type="button"
                  onClick={() => setUseSampleData(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                    useSampleData
                      ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Datos Muestra
                </button>
                <button
                  type="button"
                  onClick={() => setUseSampleData(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                    !useSampleData
                      ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mis Datos
                </button>
              </div>

              {/* Selector de Papel */}
              <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/70 p-0.5 rounded-xl text-xs font-medium border border-border/60">
                <button
                  type="button"
                  onClick={() => setPaperSize("letter")}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    paperSize === "letter"
                      ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Formato Carta (Letter 8.5 x 11 in)"
                >
                  Letter
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize("a4")}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    paperSize === "a4"
                      ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Formato Internacional A4 (210 x 297 mm)"
                >
                  A4
                </button>
              </div>

              {/* Controles de Zoom */}
              <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800/70 p-0.5 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1.5 text-[11px] font-mono font-medium text-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50 rounded-sm"
                  title="Restablecer zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* LIENZO PRINCIPAL DE VISTA PREVIA */}
        <div className="flex-1 overflow-auto bg-zinc-200/60 dark:bg-zinc-950 p-4 sm:p-8 flex justify-center items-start scrollbar-thin">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1)",
            }}
            className="my-2"
          >
            <div
              className={`bg-white text-zinc-950 shadow-2xl rounded-xs border border-zinc-300 dark:border-zinc-700 [color-scheme:light] ${
                paperSize === "a4" ? "w-[210mm] min-h-[297mm]" : "w-[8.5in] min-h-[11in]"
              }`}
            >
              <TemplateRenderer
                templateId={templateId}
                data={previewData}
                paperSize={paperSize}
              />
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR DE ACCIONES */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Ideal para:</span>
            <span className="truncate max-w-md">{meta.bestFor}</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8.5 text-xs font-semibold rounded-xl"
            >
              Volver al Catálogo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onApplyTemplate(templateId, true)}
              className="h-8.5 text-xs font-semibold rounded-xl gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Usar con Datos Muestra</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onApplyTemplate(templateId, false)}
              className="h-8.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm hover:shadow transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Usar esta Plantilla</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
