"use client";

import React, { useState, useRef } from "react";
import {
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
  ArrowRight,
  Code2,
  Check,
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
import { TemplateGalleryModal } from "@/components/templates/TemplateGalleryModal";
import { MasterProfileModal } from "./MasterProfileModal";
import { LayoutGrid, Database, FolderGit2 } from "lucide-react";

const TEMPLATE_ICONS: Record<TemplateId, React.ElementType> = {
  harvard: GraduationCap,
  tech_minimalist: Terminal,
  modern_executive: Briefcase,
  skills_first: Layers,
  stanford_clean: Sparkles,
  compact_swiss: LayoutGrid,
};

const TEMPLATE_ACCENTS: Record<TemplateId, { bg: string; text: string; border: string }> = {
  harvard: {
    bg: "bg-slate-500/10 dark:bg-slate-400/10",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
  },
  tech_minimalist: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-700",
  },
  modern_executive: {
    bg: "bg-indigo-500/10 dark:bg-indigo-400/10",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-700",
  },
  skills_first: {
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
  },
  stanford_clean: {
    bg: "bg-cyan-500/10 dark:bg-cyan-400/10",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-300 dark:border-cyan-700",
  },
  compact_swiss: {
    bg: "bg-zinc-500/10 dark:bg-zinc-400/10",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-300 dark:border-zinc-700",
  },
};

interface DashboardViewProps {
  onOpenWorkspace: () => void;
  onOpenSettings?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenWorkspace,
  onOpenSettings,
}) => {
  const {
    profiles,
    activeProfileId,
    setActiveProfile,
    duplicateProfile,
    deleteProfile,
    loadImportedResume,
    setTemplateGalleryOpen,
    masterProfileData,
    setMasterProfileModalOpen,
    createProfileFromMaster,
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

  // Totalizadores de Métricas Globales
  const totalExperience = profiles.reduce((acc, p) => acc + (p.data.experience?.length || 0), 0);
  const totalSkills = profiles.reduce(
    (acc, p) => acc + (p.data.skills?.reduce((sAcc, cat) => sAcc + cat.skills.length, 0) || 0),
    0
  );
  const totalProjects = profiles.reduce((acc, p) => acc + (p.data.projects?.length || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-foreground flex flex-col transition-colors duration-300">
      {/* 1. TOPBAR CON TIPOGRAFÍA PURA Y ELEGANTE */}
      <header className="h-14 border-b border-border/60 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
        {/* LOGOTIPO TIPOGRÁFICO MINIMALISTA (SIN ICONO DE IA) */}
        <div className="flex items-baseline gap-1 select-none">
          <span className="text-xl font-extrabold tracking-tight text-foreground font-sans">
            Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-0.5 inline-block" />
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
                  onClick={onOpenSettings || (() => setSettingsModalOpen(true))}
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

      {/* 2. CONTENIDO PRINCIPAL CON JERARQUÍA Y VALOR REAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* HERO COMMAND HUB: BIENVENIDA & ESTADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Bienvenido, {user?.name ? user.name.split(" ")[0] : "Usuario"}
              </h1>
              <Badge variant="secondary" className="text-[10px] font-mono py-0.5 bg-zinc-100 dark:bg-zinc-800 border-border">
                {profiles.length} Perfiles Activos
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Panel de ingeniería de currículums ATS, sincronización bidireccional YAML y exportación multiformato.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateGalleryOpen(true)}
              className="h-8 px-3 text-xs gap-1.5 rounded-xl border-border/80 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Plantillas ATS</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="h-8 px-3 text-xs gap-1.5 rounded-xl border-border/80 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Configuración</span>
            </Button>

            <Button
              size="sm"
              onClick={onOpenWorkspace}
              className="h-8 px-3.5 text-xs gap-1.5 font-semibold bg-foreground text-background rounded-xl shadow-sm hover:opacity-90 transition-all"
            >
              <span>Abrir Editor Dual</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* TARJETA DESTACADA: REPOSITORIO BASE DE CARRERA (PERFIL MAESTRO) */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/30 to-zinc-900/10 border border-emerald-500/30 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Database className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                Tu Base de Información Completa (Perfil Maestro)
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                {masterProfileData.name || "Tu Nombre Profesional"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl mt-0.5 leading-relaxed">
                Este es tu repositorio maestro con todo tu historial laboral, proyectos y competencias. Puedes crear y adaptar versiones de CV personalizadas a partir de esta base.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                {masterProfileData.experience?.length || 0} Empleos
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Layers className="h-3.5 w-3.5 text-emerald-500" />
                {masterProfileData.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0} Skills
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <FolderGit2 className="h-3.5 w-3.5 text-amber-500" />
                {masterProfileData.projects?.length || 0} Proyectos
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMasterProfileModalOpen(true)}
              className="w-full sm:w-auto h-8 px-3.5 text-xs font-semibold rounded-xl border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Gestionar Base Completa</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                const count = profiles.length + 1;
                createProfileFromMaster(`CV Versión ${count}`, masterProfileData.headline || "Nuevo Rol");
                onOpenWorkspace();
              }}
              className="w-full sm:w-auto h-8 px-3.5 text-xs font-semibold rounded-xl bg-foreground text-background shadow-sm hover:opacity-90 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo CV desde mi Base</span>
            </Button>
          </div>
        </div>

        {/* SECCIÓN BENTO ASIMÉTRICA DE ALTO VALOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* PANEL PRINCIPAL 1: ATS ENGINE & HEALTH METRICS (8 COLS) */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Calificación ATS Óptima</span>
                </div>
                <h2 className="text-base font-bold text-foreground pt-1">
                  Compatibilidad y Rendimiento de Algoritmos
                </h2>
                <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                  Tus perfiles están estructurados bajo estándares semánticos aprobados para filtros de selección en Workday, Taleo y Greenhouse.
                </p>
              </div>

              {/* Indicador Numérico de Alto Impacto */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border/60 text-center shrink-0 min-w-[130px]">
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  98<span className="text-sm font-semibold text-muted-foreground">/100</span>
                </div>
                <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  ATS Score Estimado
                </div>
              </div>
            </div>

            {/* Checklist de Estándares Verificados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Estructura plana y limpia sin tablas complejas</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Viñetas optimizadas con métricas STAR/XYZ</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Sincronización en vivo Formulario ⟷ YAML</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Exportación vectorial dual (PDF & DOCX Word)</span>
              </div>
            </div>

            {/* Ribbon de Métricas Globales Acumuladas */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-border/50 text-center text-xs">
              <div>
                <span className="font-extrabold text-foreground">{totalExperience}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">Experiencias</span>
              </div>
              <div className="border-x border-border/60">
                <span className="font-extrabold text-foreground">{totalSkills}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">Skills Indexadas</span>
              </div>
              <div>
                <span className="font-extrabold text-foreground">{totalProjects}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">Proyectos</span>
              </div>
            </div>
          </div>

          {/* PANEL PRINCIPAL 2: INGESTA INTELIGENTE & DROPZONE (4 COLS) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="text-[9px] font-mono uppercase">
                  Extractor IA
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-foreground pt-1">
                Ingesta de Documentos
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Importa un CV existente en PDF o texto para autocompletar tus secciones en segundos.
              </p>
            </div>

            {/* Dropzone interactivo */}
            <div className="space-y-2.5">
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
                className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center gap-1.5 text-center transition-all group cursor-pointer"
              >
                {isUploadingAi ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500 my-1" />
                    <span className="text-xs font-semibold text-foreground">Extrayendo datos con IA...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 transition-all" />
                    <span className="text-xs font-semibold text-foreground">Subir CV en PDF</span>
                    <span className="text-[10px] text-muted-foreground">o haz clic para explorar</span>
                  </>
                )}
              </button>

              <Button
                size="sm"
                onClick={() => setIsWizardOpen(true)}
                className="w-full h-8 text-xs font-semibold rounded-xl bg-foreground text-background"
              >
                <span>Crear con Asistente Guiado</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
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
                Cada versión cuenta con su propio enfoque de rol, plantilla ATS y exportación directa.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWizardOpen(true)}
              className="h-8 text-xs gap-1.5 rounded-xl border-border/80"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Perfil</span>
            </Button>
          </div>

          {/* Grid de Tarjetas de Perfil con Personalidad y Jerarquía */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const templateMeta =
                TEMPLATE_METADATA[profile.templateId] || TEMPLATE_METADATA.tech_minimalist;
              const TemplateIcon = TEMPLATE_ICONS[profile.templateId] || Terminal;
              const accent = TEMPLATE_ACCENTS[profile.templateId] || TEMPLATE_ACCENTS.tech_minimalist;

              const experienceCount = profile.data.experience?.length || 0;
              const skillsCount =
                profile.data.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0;
              const projectsCount = profile.data.projects?.length || 0;

              const isDownloadingPdf = downloadingPdfId === profile.id;
              const isDownloadingDocx = downloadingDocxId === profile.id;

              // Obtener primeras 3 skills para preview de tags
              const topSkills = profile.data.skills?.[0]?.skills.slice(0, 3) || [];

              return (
                <div
                  key={profile.id}
                  className={`rounded-2xl border bg-card flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/15 dark:ring-zinc-100/15 shadow-md"
                      : "border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md"
                  }`}
                >
                  {/* Banner de plantilla sutil */}
                  <div className={`px-4 py-2 flex items-center justify-between border-b ${accent.border} ${accent.bg}`}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <TemplateIcon className="h-3.5 w-3.5" />
                      <span>{templateMeta.name}</span>
                    </div>

                    {isActive ? (
                      <Badge className="text-[9px] py-0 px-2 font-mono bg-emerald-600 text-white font-bold">
                        Activo en Editor
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {profile.paperSize?.toUpperCase() || "LETTER"}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Header de la Tarjeta */}
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3
                          className="text-sm font-extrabold text-foreground truncate"
                          title={profile.name}
                        >
                          {profile.name}
                        </h3>
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
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
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

                    {/* Chips de Skills destacadas */}
                    {topSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {topSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-[10px] font-mono text-muted-foreground border border-border/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

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

                    {/* Acciones principales de la tarjeta */}
                    <div className="pt-1 flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleOpenResume(profile.id)}
                        className="flex-1 h-8 text-xs font-semibold rounded-xl"
                      >
                        <span>Abrir en Editor</span>
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
                </div>
              );
            })}

            {/* Tarjeta de Añadir Nuevo */}
            <div
              onClick={() => setIsWizardOpen(true)}
              className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 min-h-[220px] group"
            >
              <div className="h-10 w-10 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-foreground mb-2 group-hover:scale-105 transition-transform">
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
      <MasterProfileModal />
      <TemplateGalleryModal />
      <AuthModal />
    </div>
  );
};
