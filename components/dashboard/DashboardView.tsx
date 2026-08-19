"use client";

import React, { useState, useRef } from "react";
import {
  FileCode2,
  Plus,
  Sparkles,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  FileDown,
  FileCode,
  Layers,
  GraduationCap,
  Terminal,
  Briefcase,
  MoreVertical,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Upload,
  CheckCircle2,
  Settings,
  Cpu,
  Zap,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TemplateId, ResumeProfile } from "@/types/resume";
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
import { CreateResumeWizard } from "./CreateResumeWizard";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ProfileSettingsModal } from "./ProfileSettingsModal";

const TEMPLATE_ICONS: Record<TemplateId, React.ElementType> = {
  harvard: GraduationCap,
  tech_minimalist: Terminal,
  modern_executive: Briefcase,
  skills_first: Layers,
};

interface DashboardViewProps {
  onOpenWorkspace: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenWorkspace }) => {
  const {
    profiles,
    activeProfileId,
    setActiveProfile,
    duplicateProfile,
    deleteProfile,
    loadImportedResume,
  } = useResumeStore();

  const {
    user,
    isAuthenticated,
    logout,
    setAuthModalOpen,
    setSettingsModalOpen,
  } = useAuthStore();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [downloadingDocxId, setDownloadingDocxId] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [isUploadingAi, setIsUploadingAi] = useState(false);

  const quickFileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleOpenResume = (profileId: string) => {
    setActiveProfile(profileId);
    onOpenWorkspace();
  };

  // Subida rápida de CV desde el Bento Widget
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploadingAi(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-cv", { method: "POST", body: formData });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          loadImportedResume(result.data);
          onOpenWorkspace();
        } else {
          alert(result.error || "No se pudo extraer el currículum.");
        }
      } catch (err) {
        console.error("Error en subida rápida:", err);
        alert("Hubo un problema al procesar el archivo.");
      } finally {
        setIsUploadingAi(false);
      }
    }
  };

  // Descarga directa de Word (.docx)
  const handleDownloadDocx = async (profile: ResumeProfile) => {
    try {
      setDownloadingDocxId(profile.id);
      const blob = await generateResumeDocx(profile.data);
      const docxBlob = new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (profile.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeName}_ATS.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exportando DOCX:", err);
      alert("No se pudo generar el archivo DOCX.");
    } finally {
      setDownloadingDocxId(null);
    }
  };

  // Descarga directa de PDF Vectorial (.pdf)
  const handleDownloadPdf = async (profile: ResumeProfile) => {
    try {
      setDownloadingPdfId(profile.id);
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: profile.data,
          templateId: profile.templateId,
          paperSize: profile.paperSize || "letter",
        }),
      });

      if (!res.ok) {
        handleOpenResume(profile.id);
        return;
      }

      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (profile.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeName}_ATS_${profile.paperSize || "letter"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exportando PDF:", err);
      handleOpenResume(profile.id);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Descarga de YAML
  const handleDownloadYaml = (profile: ResumeProfile) => {
    const yamlString = resumeDataToYaml(profile.data);
    const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (profile.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `${safeName}_SchemaCV.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Descarga de JSON
  const handleDownloadJson = (profile: ResumeProfile) => {
    const jsonString = JSON.stringify(profile.data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (profile.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `${safeName}_SchemaCV.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-foreground flex flex-col transition-colors duration-300">
      {/* 1. HEADER MODERNO */}
      <header className="h-14 border-b border-border/60 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-sm">
            <FileCode2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-foreground">
                SchemaCV
              </span>
              <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-muted-foreground px-1.5 py-0.2 rounded border border-border/60">
                Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Botón Crear Nuevo CV */}
          <Button
            size="sm"
            onClick={() => setIsWizardOpen(true)}
            className="h-8 px-3 text-xs gap-1.5 font-semibold bg-foreground text-background rounded-lg shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nuevo Currículum</span>
          </Button>

          {/* Menú de Usuario / Configuración */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors text-left"
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate font-medium text-xs text-foreground hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-md border-border p-1.5">
                <DropdownMenuLabel className="text-xs">
                  <div className="font-semibold text-foreground">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSettingsModalOpen(true)}
                  className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Configuración de Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsWizardOpen(true)}
                  className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Asistente de Nuevo CV</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-xs cursor-pointer gap-2 p-2 rounded-md text-rose-500 hover:text-rose-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthModalOpen(true, "login")}
              className="h-8 text-xs gap-1.5"
            >
              <UserCircle className="h-3.5 w-3.5" />
              <span>Iniciar Sesión</span>
            </Button>
          )}

          <div className="h-4 w-[1px] bg-border/80 mx-0.5" />

          {/* Modo Oscuro */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Alternar tema"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL: BENTO GRID DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* SECCIÓN SUPERIOR: BENTO HERO (Tarjeta de Perfil + Widgets Inteligentes) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Columna Izquierda: Tarjeta de Perfil Hero con Banner y Avatar (4 cols) */}
          <div className="lg:col-span-4 flex justify-center">
            <ProfileHeroCard onOpenWorkspace={onOpenWorkspace} />
          </div>

          {/* Columna Derecha: Bento Widgets de Ingesta & ATS Health (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 flex flex-col justify-between">
            {/* Bento 1: Centro de Ingesta & Creación con IA */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    AI Powered
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-foreground pt-1">
                  Ingesta Inteligente de CV
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sube tu currículum en PDF o pega tu perfil de LinkedIn para estructurarlo bajo los estándares ATS automáticamente.
                </p>
              </div>

              {/* Zona de Arrastre / Acción Rápida */}
              <div className="space-y-2">
                <input
                  ref={quickFileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleQuickUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => quickFileInputRef.current?.click()}
                  disabled={isUploadingAi}
                  className="w-full p-3 rounded-xl border border-dashed border-border/90 hover:border-foreground/60 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  {isUploadingAi ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                      <span>Extrayendo con IA...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span>Subir PDF y abrir editor</span>
                    </>
                  )}
                </button>

                <Button
                  size="sm"
                  onClick={() => setIsWizardOpen(true)}
                  className="w-full h-8 text-xs font-semibold rounded-xl bg-foreground text-background"
                >
                  <span>Iniciar Asistente Guiado</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>

            {/* Bento 2: Métricas de Optimización ATS & Cumplimiento */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>98 / 100</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground pt-1">
                  Salud ATS de tus Versiones
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tus currículums cumplen con los algoritmos de filtrado de los principales portales de empleo.
                </p>
              </div>

              {/* Barras de cumplimiento ATS */}
              <div className="space-y-2 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estructura sin tablas complejas</span>
                    <span className="font-bold text-foreground">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fórmula de logros STAR/XYZ</span>
                    <span className="font-bold text-foreground">95%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[95%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxonomía y jerarquía técnica</span>
                    <span className="font-bold text-foreground">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: TUS VERSIONES DE CURRÍCULUM */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Tus Versiones de Currículum
              </h2>
              <p className="text-xs text-muted-foreground">
                Selecciona cualquier perfil para editarlo en el espacio de trabajo o expórtalo directamente en PDF o Word.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWizardOpen(true)}
              className="h-8 text-xs gap-1 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Perfil</span>
            </Button>
          </div>

          {/* Grid de Tarjetas de Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const templateMeta =
                TEMPLATE_METADATA[profile.templateId] || TEMPLATE_METADATA.tech_minimalist;
              const TemplateIcon = TEMPLATE_ICONS[profile.templateId] || Terminal;

              const experienceCount = profile.data.experience?.length || 0;
              const skillsCount =
                profile.data.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0;
              const projectsCount = profile.data.projects?.length || 0;

              const isDownloadingPdf = downloadingPdfId === profile.id;
              const isDownloadingDocx = downloadingDocxId === profile.id;

              return (
                <div
                  key={profile.id}
                  className={`p-5 rounded-2xl border bg-card flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900/10 dark:ring-zinc-100/10 shadow-sm"
                      : "border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header de la Tarjeta */}
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3
                            className="text-sm font-bold text-foreground truncate"
                            title={profile.name}
                          >
                            {profile.name}
                          </h3>
                          {isActive && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 font-mono shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            >
                              Activo
                            </Badge>
                          )}
                        </div>
                        <p
                          className="text-xs text-muted-foreground flex items-center gap-1 font-medium min-w-0"
                          title={profile.targetRole}
                        >
                          <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {profile.targetRole || "Rol no definido"}
                          </span>
                        </p>
                      </div>

                      {/* Menú de opciones */}
                      <div className="shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 bg-card/95 backdrop-blur-md border-border p-1.5"
                          >
                            <DropdownMenuItem
                              onClick={() => handleOpenResume(profile.id)}
                              className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>Abrir en Editor</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => duplicateProfile(profile.id)}
                              className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>Duplicar Versión</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDownloadPdf(profile)}
                              disabled={isDownloadingPdf}
                              className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                            >
                              <FileDown className="h-3.5 w-3.5 text-rose-500" />
                              <span>Descargar PDF Vectorial</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDownloadDocx(profile)}
                              disabled={isDownloadingDocx}
                              className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                              <span>Descargar Word (.docx)</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDownloadYaml(profile)}
                              className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                            >
                              <FileCode className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Descargar YAML (.yaml)</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDownloadJson(profile)}
                              className="text-xs cursor-pointer gap-2 p-2 rounded-md"
                            >
                              <FileCode className="h-3.5 w-3.5 text-amber-500" />
                              <span>Descargar JSON (.json)</span>
                            </DropdownMenuItem>

                            {profiles.length > 1 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteProfile(profile.id)}
                                  className="text-xs cursor-pointer gap-2 p-2 rounded-md text-rose-500 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Eliminar Perfil</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Resumen de contenido */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center">
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {experienceCount}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Trabajos</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {skillsCount}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Skills</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {projectsCount}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Proyectos</div>
                      </div>
                    </div>

                    {/* Plantilla Asignada */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <TemplateIcon className="h-3.5 w-3.5 text-foreground" />
                      <span>Plantilla: </span>
                      <span className="font-semibold text-foreground">
                        {templateMeta.name}
                      </span>
                    </div>
                  </div>

                  {/* Acciones principales de la tarjeta con soporte PDF y Word */}
                  <div className="pt-4 flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleOpenResume(profile.id)}
                      className="flex-1 h-8 text-xs font-semibold rounded-xl"
                    >
                      <span>Abrir Editor</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>

                    {/* Botón Descarga Directa PDF */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDownloadingPdf}
                      onClick={() => handleDownloadPdf(profile)}
                      className="h-8 px-2.5 text-xs gap-1 rounded-xl hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Descargar PDF Vectorial directo"
                    >
                      {isDownloadingPdf ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <FileDown className="h-3.5 w-3.5 text-rose-500" />
                          <span className="text-[11px] font-medium">PDF</span>
                        </>
                      )}
                    </Button>

                    {/* Botón Descarga Directa Word */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDownloadingDocx}
                      onClick={() => handleDownloadDocx(profile)}
                      className="h-8 px-2.5 text-xs gap-1 rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Descargar Word DOCX directo"
                    >
                      {isDownloadingDocx ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[11px] font-medium">Word</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Tarjeta de Añadir Nuevo */}
            <div
              onClick={() => setIsWizardOpen(true)}
              className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 min-h-[220px]"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-foreground mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-foreground">
                Crear Otra Versión de CV
              </h3>
              <p className="text-[11px] text-muted-foreground max-w-[200px] mt-1">
                Adapta tu experiencia para postulaciones específicas.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Modales del Dashboard */}
      <CreateResumeWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={onOpenWorkspace}
      />
      <ProfileSettingsModal />
      <AuthModal />
    </div>
  );
};
