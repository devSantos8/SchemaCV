"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useResumeStore } from "@/store/useResumeStore";
import { TemplateId } from "@/types/resume";
import { TEMPLATE_METADATA, TemplateRenderer } from "./TemplateRenderer";
import { SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Terminal,
  Briefcase,
  Layers,
  Sparkles,
  LayoutGrid,
  Check,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  FileCode,
  Sliders,
  BookOpen,
  Cpu,
  GitFork,
  Globe2,
  MapPin,
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

export const TemplateGalleryModal: React.FC = () => {
  const {
    isTemplateGalleryOpen,
    setTemplateGalleryOpen,
    activeTemplate,
    setActiveTemplate,
    resumeData,
    setResumeData,
    paperSize,
    masterProfileData,
  } = useResumeStore();

  // Predeterminado: Datos de Muestra ACTIVOS por defecto
  const [useSampleData, setUseSampleData] = useState(true);
  const [fullscreenTemplate, setFullscreenTemplate] = useState<TemplateId | null>(null);

  const previewData = useSampleData
    ? SAMPLE_RESUME_FULLSTACK
    : (resumeData && resumeData.name ? resumeData : masterProfileData || SAMPLE_RESUME_FULLSTACK);

  const handleSelectTemplate = (templateId: TemplateId, withSampleData = false) => {
    setActiveTemplate(templateId);
    if (withSampleData) {
      setResumeData(SAMPLE_RESUME_FULLSTACK);
    }
    setTemplateGalleryOpen(false);
    setFullscreenTemplate(null);
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const CATEGORY_MAP: Record<string, TemplateId[]> = {
    all: Object.keys(TEMPLATE_METADATA) as TemplateId[],
    chile: ["chile_profesional"],
    tech: ["tech_minimalist", "stanford_clean", "tech_compact"],
    executive: ["harvard", "modern_executive", "executive_serif"],
    one_page: ["compact_swiss", "tech_compact"],
    builder: ["skills_first", "career_changer", "modern_minimal", "academic_international"],
  };

  const CATEGORY_TABS = [
    { id: "all", label: "Todas las Plantillas", count: 12 },
    { id: "chile", label: "🇨🇱 Chile & LatAm", count: 1 },
    { id: "tech", label: "💻 Tech & Silicon Valley", count: 3 },
    { id: "executive", label: "🏛️ Harvard & Corporativo", count: 3 },
    { id: "one_page", label: "🇨🇭 1 Página Estricta", count: 2 },
    { id: "builder", label: "🚀 Proyectos & AI", count: 4 },
  ];

  const filteredKeys = CATEGORY_MAP[selectedCategory] || CATEGORY_MAP.all;

  return (
    <Dialog open={isTemplateGalleryOpen} onOpenChange={setTemplateGalleryOpen}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Encabezado de la Galería */}
        <DialogHeader className="p-4 sm:p-6 border-b border-border/80 bg-zinc-50/70 dark:bg-zinc-900/50 backdrop-blur-md shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-emerald-500" />
                  <span>Catálogo de Plantillas ATS 2026</span>
                </DialogTitle>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  12 Diseños ATS 100%
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground max-w-xl">
                Diseños estructurados en una sola columna con jerarquía semántica y 100% de compatibilidad con filtros ATS (Workday, GetOnBoard, Buk, Greenhouse).
              </DialogDescription>
            </div>

            {/* Alternador de Datos de Muestra (Activo por defecto) vs Datos Actuales */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-200/70 dark:bg-zinc-800/70 p-1 rounded-xl text-xs font-medium border border-border/60">
              <button
                type="button"
                onClick={() => setUseSampleData(true)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  useSampleData
                    ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Datos de Muestra
              </button>
              <button
                type="button"
                onClick={() => setUseSampleData(false)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  !useSampleData
                    ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mis Datos Actuales
              </button>
            </div>
          </div>

          {/* Barra de Filtros por Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === tab.id
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                    : "bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/60 dark:hover:bg-zinc-700/60"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === tab.id
                    ? "bg-zinc-700 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-800"
                    : "bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Modal de Vista en Pantalla Completa si está activo */}
        {fullscreenTemplate ? (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 bg-zinc-100 dark:bg-zinc-950">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFullscreenTemplate(null)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Volver a la Galería</span>
                </Button>
                <h3 className="font-bold text-sm text-foreground">
                  {TEMPLATE_METADATA[fullscreenTemplate].name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectTemplate(fullscreenTemplate, true)}
                  className="h-8 px-3 text-xs font-semibold gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Cargar con Datos de Muestra</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSelectTemplate(fullscreenTemplate, false)}
                  className="h-8 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Aplicar Plantilla</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex justify-center items-start p-2 sm:p-4">
              <div
                className={`bg-white text-zinc-950 shadow-2xl rounded-sm border border-zinc-200 transition-all [color-scheme:light] ${
                  paperSize === "a4" ? "w-[210mm] min-h-[297mm]" : "w-[8.5in] min-h-[11in]"
                }`}
              >
                <TemplateRenderer
                  templateId={fullscreenTemplate}
                  data={previewData}
                  paperSize={paperSize}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Grid de Plantillas */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 scrollbar-thin">
            {filteredKeys.map((tempId) => {
              const meta = TEMPLATE_METADATA[tempId];
              const Icon = TEMPLATE_ICONS[tempId] || Terminal;
              const isSelected = tempId === activeTemplate;

              return (
                <div
                  key={tempId}
                  className={`group rounded-2xl border bg-card flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-xl ${
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {/* Vista Previa Miniaturizada con Render en Vivo Garantizado */}
                  <div className="relative h-64 bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-border/60 overflow-hidden flex justify-center items-center p-2.5">
                    {/* Caja de Hoja de Papel en Miniatura Proporcional */}
                    <div className="w-[192px] h-[248px] overflow-hidden rounded-xs border border-zinc-300 dark:border-zinc-700 shadow-md relative bg-white shrink-0">
                      <div
                        className="w-[816px] min-h-[1056px] bg-white text-zinc-900 pointer-events-none select-none absolute top-0 left-0 [color-scheme:light]"
                        style={{
                          transform: "scale(0.235)",
                          transformOrigin: "top left",
                        }}
                      >
                        <TemplateRenderer
                          templateId={tempId}
                          data={previewData}
                          paperSize="letter"
                        />
                      </div>
                    </div>

                    {/* Overlay al hacer hover */}
                    <div className="absolute inset-0 bg-zinc-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-2xs p-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setFullscreenTemplate(tempId)}
                        className="w-full max-w-[180px] h-8 text-xs font-semibold gap-1.5 shadow-md bg-white text-zinc-950 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Vista Detallada</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectTemplate(tempId, false)}
                        className="w-full max-w-[180px] h-8 text-xs font-semibold gap-1.5 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Aplicar Plantilla</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectTemplate(tempId, true)}
                        className="w-full max-w-[180px] h-7 text-[11px] font-medium gap-1 bg-zinc-900/80 text-white border-zinc-600 hover:bg-zinc-800"
                      >
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>Con Datos Ejemplo</span>
                      </Button>
                    </div>

                    {/* Badge de Selección */}
                    {isSelected && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1 shadow-sm">
                          <Check className="h-3 w-3" />
                          <span>En Uso</span>
                        </Badge>
                      </div>
                    )}

                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
                      <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-[9px] font-mono">
                        {meta.density}
                      </Badge>
                    </div>
                  </div>

                  {/* Metadatos y Descripción */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground">
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-bold text-sm text-foreground">
                            {meta.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>ATS {meta.atsScore}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-snug">
                        {meta.description}
                      </p>

                      <div className="pt-1.5 border-t border-border/50 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                        <div className="font-medium text-foreground text-[10px] uppercase tracking-wider">
                          Ideal para:
                        </div>
                        <div className="text-[10.5px] leading-tight text-muted-foreground">
                          {meta.bestFor}
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="pt-2 flex flex-col gap-1.5">
                      <Button
                        size="sm"
                        variant={isSelected ? "outline" : "default"}
                        onClick={() => handleSelectTemplate(tempId, false)}
                        className={`w-full h-8 text-xs font-semibold rounded-xl ${
                          isSelected
                            ? "border-emerald-600/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                            : "bg-foreground text-background hover:opacity-90"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            <span>Plantilla Seleccionada</span>
                          </>
                        ) : (
                          <>
                            <span>Usar {meta.name}</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
