"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Download,
  Upload,
  UserCircle,
  FileText,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
  Printer,
  FileDown,
  RotateCcw,
  Check,
  GraduationCap,
  Terminal,
  Briefcase,
  Layers,
  FileCode,
  Undo2,
  Redo2,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TemplateId, PaperSize } from "@/types/resume";
import { TEMPLATE_METADATA } from "@/components/templates/TemplateRenderer";
import { generateResumeDocx } from "@/lib/exporters/docxExporter";
import { resumeDataToYaml } from "@/lib/exporters/yamlExporter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TEMPLATE_ICONS: Record<TemplateId, React.ElementType> = {
  harvard: GraduationCap,
  tech_minimalist: Terminal,
  modern_executive: Briefcase,
  skills_first: Layers,
};

interface HeaderProps {
  onBackToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBackToDashboard }) => {
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
  } = useResumeStore();

  const { user, isAuthenticated, logout } = useAuthStore();

  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Alternar tema oscuro/claro
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

  // Exportar PDF Vectorial con Puppeteer
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

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0 print:hidden">
      {/* 1. BOTÓN VOLVER AL DASHBOARD & LOGO */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onBackToDashboard && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToDashboard}
            className="h-8 text-xs gap-1.5 px-2 text-muted-foreground hover:text-foreground font-medium"
            title="Volver a la vista del Dashboard"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        )}

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-sm">
            <FileCode2 className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold tracking-tight text-foreground">
              SchemaCV
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-border mx-0.5 hidden md:block" />

        {/* 2. SELECTOR DE PERFILES */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 max-w-[160px] sm:max-w-[200px] justify-between font-normal bg-background"
            >
              <div className="flex items-center gap-1.5 truncate">
                <UserCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{activeProfile.name}</span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-card border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Perfiles de CV Guardados
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
              onClick={() => setProfileModalOpen(true)}
              className="text-xs font-semibold text-foreground cursor-pointer gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Administrar Perfiles...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 3. BOTONES DESHACER / REHACER (UNDO / REDO) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-md border border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Deshacer cambio (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Rehacer cambio (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 4. SELECTOR DE PLANTILLAS Y TAMAÑO DE PAPEL */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Selector de Plantilla ATS */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 bg-background font-normal"
            >
              {(() => {
                const Icon = TEMPLATE_ICONS[activeTemplate] || Terminal;
                return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
              })()}
              <span className="font-medium">{TEMPLATE_METADATA[activeTemplate].name}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-72 bg-card border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Catálogo de 4 Plantillas ATS Nativas
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(TEMPLATE_METADATA) as TemplateId[]).map((tempId) => {
              const meta = TEMPLATE_METADATA[tempId];
              const Icon = TEMPLATE_ICONS[tempId] || Terminal;
              const isSelected = tempId === activeTemplate;

              return (
                <DropdownMenuItem
                  key={tempId}
                  onClick={() => setActiveTemplate(tempId)}
                  className="flex items-start gap-2.5 p-2 text-xs cursor-pointer"
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Formato de Papel (Letter vs A4) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-md text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setPaperSize("letter")}
            className={`px-2 py-1 rounded transition-colors ${
              paperSize === "letter"
                ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Letter
          </button>
          <button
            type="button"
            onClick={() => setPaperSize("a4")}
            className={`px-2 py-1 rounded transition-colors ${
              paperSize === "a4"
                ? "bg-white dark:bg-zinc-950 font-bold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            A4
          </button>
        </div>
      </div>

      {/* 5. ACCIONES DE IMPORTACIÓN, EXPORTACIÓN Y TEMA */}
      <div className="flex items-center gap-1.5">
        {/* Importar con IA */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportModalOpen(true)}
          className="h-8 text-xs gap-1.5 bg-background hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Ingesta IA</span>
        </Button>

        {/* Dropdown de Exportación */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-foreground text-background font-semibold">
              <Download className="h-3.5 w-3.5" />
              <span>Exportar</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Formatos de Exportación
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="text-xs cursor-pointer gap-2 py-2"
            >
              <FileDown className="h-4 w-4 text-rose-500" />
              <div>
                <div className="font-semibold text-foreground">PDF Vectorial ATS</div>
                <div className="text-[10px] text-muted-foreground">
                  Renderizado de alta precisión ({paperSize.toUpperCase()})
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="text-xs cursor-pointer gap-2 py-2"
            >
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-semibold text-foreground">Word (.docx ATS Nativo)</div>
                <div className="text-[10px] text-muted-foreground">
                  Semántico para Workday, Taleo, Greenhouse
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleExportYaml}
              className="text-xs cursor-pointer gap-2 py-2"
            >
              <FileCode className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="font-semibold text-foreground">Esquema YAML (.yaml)</div>
                <div className="text-[10px] text-muted-foreground">
                  Compatible 100% con RenderCV
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleExportJson}
              className="text-xs cursor-pointer gap-2 py-2"
            >
              <FileCode className="h-4 w-4 text-amber-500" />
              <div>
                <div className="font-semibold text-foreground">Datos JSON (.json)</div>
                <div className="text-[10px] text-muted-foreground">Estructura normalizada</div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => window.print()}
              className="text-xs cursor-pointer gap-2"
            >
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>Imprimir Navegador</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-[1px] bg-border mx-0.5" />

        {/* Modo Oscuro */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Alternar tema claro/oscuro"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};
