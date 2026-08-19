"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Plus,
  Sparkles,
  FileText,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  CheckCircle2,
  TrendingUp,
  FileDown,
  Layers,
  GraduationCap,
  Terminal,
  Briefcase,
  MoreVertical,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TemplateId, ResumeProfile } from "@/types/resume";
import { TEMPLATE_METADATA } from "@/components/templates/TemplateRenderer";
import { generateResumeDocx } from "@/lib/exporters/docxExporter";
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
  } = useResumeStore();

  const { user, isAuthenticated, logout, setAuthModalOpen } = useAuthStore();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [downloadingDocxId, setDownloadingDocxId] = useState<string | null>(null);

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

  const handleDownloadDocx = async (profile: ResumeProfile) => {
    try {
      setDownloadingDocxId(profile.id);
      const blob = await generateResumeDocx(profile.data);
      const url = URL.createObjectURL(blob);
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Header del Dashboard Moderno */}
      <header className="h-14 border-b border-border/60 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
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
                Dashboard
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block">
              Gestión de Currículums Optimizados para ATS
            </p>
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

          {/* Menú de Usuario / Autenticación */}
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

      {/* 2. Contenido Principal del Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner de Bienvenida y Resumen */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-900/60 dark:to-zinc-950 p-6 rounded-2xl border border-border shadow-sm">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Bienvenido{user ? `, ${user.name}` : ""} a SchemaCV
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Crea y personaliza versiones de tu currículum optimizadas para los filtros de
              selección ATS (Workday, Taleo, Greenhouse) con sincronización YAML y exportación multiformato.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setIsWizardOpen(true)}
              className="h-9 text-xs gap-1.5 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Crear con Asistente</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenWorkspace}
              className="h-9 text-xs gap-1.5"
            >
              <span>Abrir Editor Dual</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Currículums Activos</span>
            <div className="text-2xl font-extrabold text-foreground">{profiles.length}</div>
            <div className="text-[10px] text-muted-foreground">Versiones listas para postulación</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Puntuación ATS Estimada</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>98 / 100</span>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-[10px] text-emerald-600/80">Estructura semántica sin tablas</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Plantillas Disponibles</span>
            <div className="text-2xl font-extrabold text-foreground">4 Nativas</div>
            <div className="text-[10px] text-muted-foreground">Harvard, Tech, Executive, Builder</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Formatos de Exportación</span>
            <div className="text-2xl font-extrabold text-foreground">PDF & DOCX</div>
            <div className="text-[10px] text-muted-foreground">Vectorial y Word nativo</div>
          </div>
        </div>

        {/* Listado de Perfiles de CV */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Tus Versiones de Currículum</h2>
              <p className="text-xs text-muted-foreground">
                Selecciona cualquier perfil para editarlo en el espacio de trabajo o expórtalo directamente.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWizardOpen(true)}
              className="h-8 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Perfil</span>
            </Button>
          </div>

          {/* Grid de Tarjetas de Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const templateMeta = TEMPLATE_METADATA[profile.templateId] || TEMPLATE_METADATA.tech_minimalist;
              const TemplateIcon = TEMPLATE_ICONS[profile.templateId] || Terminal;

              const experienceCount = profile.data.experience?.length || 0;
              const skillsCount = profile.data.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0;
              const projectsCount = profile.data.projects?.length || 0;

              return (
                <div
                  key={profile.id}
                  className={`p-5 rounded-xl border bg-card flex flex-col justify-between transition-all hover:shadow-md ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900/10 dark:ring-zinc-100/10"
                      : "border-border hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header de la Tarjeta */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-foreground line-clamp-1">
                            {profile.name}
                          </h3>
                          {isActive && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Activo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{profile.targetRole || "Rol no definido"}</span>
                        </p>
                      </div>

                      {/* Menú de opciones */}
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
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => handleOpenResume(profile.id)}
                            className="text-xs cursor-pointer gap-2"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Abrir en Editor</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateProfile(profile.id)}
                            className="text-xs cursor-pointer gap-2"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Duplicar Versión</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadDocx(profile)}
                            className="text-xs cursor-pointer gap-2"
                          >
                            <FileDown className="h-3.5 w-3.5 text-blue-500" />
                            <span>Descargar Word (.docx)</span>
                          </DropdownMenuItem>
                          {profiles.length > 1 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteProfile(profile.id)}
                                className="text-xs cursor-pointer gap-2 text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Resumen de contenido */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center">
                      <div>
                        <div className="text-xs font-bold text-foreground">{experienceCount}</div>
                        <div className="text-[10px] text-muted-foreground">Trabajos</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{skillsCount}</div>
                        <div className="text-[10px] text-muted-foreground">Skills</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{projectsCount}</div>
                        <div className="text-[10px] text-muted-foreground">Proyectos</div>
                      </div>
                    </div>

                    {/* Plantilla Asignada */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <TemplateIcon className="h-3.5 w-3.5 text-foreground" />
                      <span>Plantilla: </span>
                      <span className="font-semibold text-foreground">{templateMeta.name}</span>
                    </div>
                  </div>

                  {/* Acciones principales de la tarjeta */}
                  <div className="pt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenResume(profile.id)}
                      className="flex-1 h-8 text-xs font-semibold"
                    >
                      <span>Abrir en Editor</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={downloadingDocxId === profile.id}
                      onClick={() => handleDownloadDocx(profile)}
                      className="h-8 text-xs px-2.5"
                      title="Descargar Word DOCX directo"
                    >
                      <FileDown className="h-3.5 w-3.5 text-blue-500" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Tarjeta de Añadir Nuevo */}
            <div
              onClick={() => setIsWizardOpen(true)}
              className="p-6 rounded-xl border-2 border-dashed border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 min-h-[220px]"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-foreground mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-foreground">Crear Otra Versión de CV</h3>
              <p className="text-[11px] text-muted-foreground max-w-[200px] mt-1">
                Adapta tu experiencia para postulaciones específicas.
              </p>
            </div>
          </div>
        </div>

        {/* Guía Rápida de Optimización ATS */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">
              Guía de Optimización ATS de SchemaCV
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-lg border border-border bg-card space-y-1">
              <span className="text-xs font-bold text-foreground">Fórmula STAR / XYZ</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Describe tus logros con métricas: "Logré [X] medido por [Y]% haciendo [Z]". Evita listas pasivas de tareas.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-1">
              <span className="text-xs font-bold text-foreground">Jerarquía Semántica</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Nuestras plantillas utilizan encabezados directos y tabuladores limpios, evitando tablas complejas que bloquean los parsers.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-1">
              <span className="text-xs font-bold text-foreground">Sincronización YAML</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mantén tu CV versionado como código, garantizando consistencia absoluta en exportaciones PDF y Word.
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
      <AuthModal />
    </div>
  );
};
