"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Download,
  Upload,
  UserCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Moon,
  Sun,
  Printer,
  FileDown,
  Check,
  GraduationCap,
  Terminal,
  Briefcase,
  Layers,
  FileCode,
  Undo2,
  Redo2,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { ATSAuditModal } from "@/components/editor/ATSAuditModal";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TemplateId, PaperSize } from "@/types/resume";
import { TEMPLATE_METADATA } from "@/components/templates/TemplateRenderer";
import { generateResumeDocx } from "@/lib/exporters/docxExporter";
import { resumeDataToYaml } from "@/lib/exporters/yamlExporter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LayoutGrid, Database, BookOpen, Cpu, Minimize2, GitFork, Globe2 } from "lucide-react";

const TEMPLATE_ICONS: Record<TemplateId, React.ElementType> = {
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

interface HeaderProps {
  onBackToDashboard?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBackToDashboard, onOpenSettings }) => {
  const {
    profiles,
    activeProfileId,
    resumeData,
    activeTemplate,
    paperSize,
    canUndo,
    canRedo,
    undo,
    redo,
    setActiveProfile,
    setActiveTemplate,
    setPaperSize,
    setImportModalOpen,
    setProfileModalOpen,
    setTemplateGalleryOpen,
    setMasterProfileModalOpen,
  } = useResumeStore();

  const { user, isAuthenticated, setSettingsModalOpen } = useAuthStore();

  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAtsAuditOpen, setIsAtsAuditOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      root.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  // Exportar Word .docx
  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateResumeDocx(resumeData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (resumeData.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeName}_ATS_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar DOCX:", error);
      alert("Hubo un problema al generar el archivo DOCX.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Exportar YAML
  const handleExportYaml = () => {
    const yamlString = resumeDataToYaml(resumeData);
    const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (resumeData.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `${safeName}_SchemaCV.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exportar JSON
  const handleExportJson = () => {
    const jsonString = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (resumeData.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `${safeName}_SchemaCV.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exportar PDF Vectorial
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const printDoc = document.getElementById("cv-printable-document");
      if (!printDoc) {
        window.print();
        return;
      }

      const htmlContent = printDoc.outerHTML;

      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlContent, paperSize }),
      });

      if (!res.ok) {
        window.print();
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (resumeData.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeName}_ATS_${paperSize}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Fallo al compilar con Puppeteer, usando impresión de navegador:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const TemplateActiveIcon = TEMPLATE_ICONS[activeTemplate] || Terminal;

  return (
    <header className="h-14 border-b border-border/60 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 print:hidden transition-all">
      {/* 1. ZONA IZQUIERDA: LOGOTIPO & SELECTOR DE PERFIL / WORKSPACE */}
      <div className="flex items-center gap-3">
        {/* LOGOTIPO TIPOGRÁFICO MINIMALISTA (Clic lleva a Mis CVs / Dashboard) */}
        <div
          onClick={onBackToDashboard}
          className="flex items-baseline gap-1 select-none cursor-pointer group py-1"
          title="Volver a Mis CVs (Dashboard)"
        >
          <span className="text-lg font-extrabold tracking-tight text-foreground font-sans group-hover:text-primary transition-colors">
            Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-0.5 inline-block group-hover:scale-125 transition-transform" />
        </div>

        <div className="h-4 w-[1px] bg-border/80 hidden sm:block" />

        {/* Selector de Perfil estilo Workspace */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                    <FileCode2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-foreground max-w-[140px] sm:max-w-[190px] truncate">
                      {activeProfile.name}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <span className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block max-w-[150px] truncate">
                    {activeProfile.targetRole || "Rol no definido"}
                  </span>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-card/95 backdrop-blur-md border-border">
            {onBackToDashboard && (
              <>
                <DropdownMenuItem
                  onClick={onBackToDashboard}
                  className="text-xs font-semibold text-foreground cursor-pointer gap-2 py-2"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Ir al Dashboard (Mis CVs)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Versiones de CV</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {profiles.length} perfiles
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profiles.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => setActiveProfile(p.id)}
                className="flex items-center justify-between text-xs py-2 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.targetRole}</div>
                </div>
                {p.id === activeProfileId && (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setMasterProfileModalOpen(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer gap-2"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Base de Información Completa...</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setProfileModalOpen(true)}
              className="text-xs font-semibold text-foreground cursor-pointer gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Gestionar Perfiles...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. ZONA CENTRAL: CÁPSULA FLOTANTE DE PLANTILLA, TAMAÑO & HISTORIAL */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="flex items-center bg-zinc-100/90 dark:bg-zinc-900/90 p-1 rounded-full border border-border/60 shadow-2xs backdrop-blur-md">
          {/* Selector de Plantilla ATS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xs transition-all"
              >
                <TemplateActiveIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{TEMPLATE_METADATA[activeTemplate].name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-80 bg-card/95 backdrop-blur-md border-border max-h-[80vh] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60">
                <span className="text-xs font-semibold text-muted-foreground">
                  Catálogo de 11 Plantillas ATS
                </span>
                <button
                  type="button"
                  onClick={() => setTemplateGalleryOpen(true)}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span>Ver Galería</span>
                </button>
              </div>
              <DropdownMenuSeparator />
              {(Object.keys(TEMPLATE_METADATA) as TemplateId[]).map((tempId) => {
                const meta = TEMPLATE_METADATA[tempId];
                const Icon = TEMPLATE_ICONS[tempId] || Terminal;
                const isSelected = tempId === activeTemplate;

                return (
                  <DropdownMenuItem
                    key={tempId}
                    onClick={() => setActiveTemplate(tempId)}
                    className="flex items-start gap-2.5 p-2.5 text-xs cursor-pointer rounded-lg"
                  >
                    <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-foreground mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{meta.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {meta.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTemplateGalleryOpen(true)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer gap-2 p-2"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Explorar Galería con Previews...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-3.5 w-[1px] bg-border mx-1" />

          {/* Formato de Papel */}
          <div className="flex items-center text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setPaperSize("letter")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                paperSize === "letter"
                  ? "bg-white dark:bg-zinc-800 font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Letter
            </button>
            <button
              type="button"
              onClick={() => setPaperSize("a4")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                paperSize === "a4"
                  ? "bg-white dark:bg-zinc-800 font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A4
            </button>
          </div>

          <div className="h-3.5 w-[1px] bg-border mx-1" />

          {/* Botones Deshacer / Rehacer */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-25 transition-all"
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-25 transition-all"
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ZONA DERECHA: ACCIONES PRINCIPALES & EXPORTACIÓN */}
      <div className="flex items-center gap-2">
        {/* Auditor de Formato ATS */}
        <button
          type="button"
          onClick={() => setIsAtsAuditOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-border/60 transition-all cursor-pointer"
          title="Auditar cumplimiento de formato ATS para este CV"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Auditor ATS</span>
        </button>

        {/* Ingesta con IA */}
        <button
          type="button"
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-border/60 transition-all"
          title="Importar CV o contenido con IA"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Importar CV</span>
        </button>

        {/* Dropdown de Exportación */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 bg-foreground text-background font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-card/95 backdrop-blur-md border-border p-1.5">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              Formatos de Descarga ATS
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="text-xs cursor-pointer gap-2.5 p-2 rounded-md"
            >
              <div className="p-1.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <FileDown className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>PDF Vectorial</span>
                  <span className="text-[9px] font-mono text-muted-foreground">.pdf</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Impresión y renderizado ({paperSize.toUpperCase()})
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="text-xs cursor-pointer gap-2.5 p-2 rounded-md"
            >
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>Word DOCX</span>
                  <span className="text-[9px] font-mono text-muted-foreground">.docx</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Estructura semántica para ATS
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleExportYaml}
              className="text-xs cursor-pointer gap-2.5 p-2 rounded-md"
            >
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCode className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>Esquema YAML</span>
                  <span className="text-[9px] font-mono text-muted-foreground">.yaml</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Compatible con RenderCV
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleExportJson}
              className="text-xs cursor-pointer gap-2.5 p-2 rounded-md"
            >
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileCode className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>Datos JSON</span>
                  <span className="text-[9px] font-mono text-muted-foreground">.json</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Estructura normalizada</div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => window.print()}
              className="text-xs cursor-pointer gap-2 p-2 rounded-md text-muted-foreground hover:text-foreground"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir Navegador</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-[1px] bg-border/80 mx-0.5" />

        {/* Modo Oscuro */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Alternar tema claro/oscuro"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Modal de Auditoría ATS */}
      <ATSAuditModal
        isOpen={isAtsAuditOpen}
        onClose={() => setIsAtsAuditOpen(false)}
        resumeData={resumeData}
      />
    </header>
  );
};
