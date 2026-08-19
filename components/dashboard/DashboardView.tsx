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
  ArrowRight,
  Check,
  LayoutGrid,
  Database,
  FolderGit2,
  Search,
  SlidersHorizontal,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TemplateId, ResumeProfile, ResumeData } from "@/types/resume";
import { TEMPLATE_METADATA, TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { generateResumeDocx } from "@/lib/exporters/docxExporter";
import { resumeDataToYaml } from "@/lib/exporters/yamlExporter";
import { SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

type DashboardSection = "resumes" | "master_profile" | "templates" | "ai_import" | "settings";

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
    masterProfileData,
    updateMasterProfileData,
    createProfileFromMaster,
    setActiveTemplate,
    activeTemplate,
    paperSize,
  } = useResumeStore();

  const {
    user,
    isAuthenticated,
    logout,
    updateUserProfile,
  } = useAuthStore();

  const [activeSection, setActiveSection] = useState<DashboardSection>("resumes");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Estados de exportación
  const [downloadingDocxId, setDownloadingDocxId] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // Estados de Ingesta IA
  const [isUploadingAi, setIsUploadingAi] = useState(false);
  const [pastedCvText, setPastedCvText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados del Perfil Base Maestro
  const [masterFormData, setMasterFormData] = useState<ResumeData>(masterProfileData);
  const [isMasterSaved, setIsMasterSaved] = useState(false);
  const [masterTab, setMasterTab] = useState<"general" | "experience" | "skills" | "projects" | "education">("general");

  // Estados de la Galería de Plantillas
  const [templatePreviewSample, setTemplatePreviewSample] = useState(true);
  const [inspectTemplateId, setInspectTemplateId] = useState<TemplateId | null>(null);

  // Sincronizar formulario maestro si cambia el store
  React.useEffect(() => {
    setMasterFormData(JSON.parse(JSON.stringify(masterProfileData)));
  }, [masterProfileData]);

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

  const handleSaveMasterProfile = () => {
    updateMasterProfileData(masterFormData);
    setIsMasterSaved(true);
    setTimeout(() => setIsMasterSaved(false), 2500);
  };

  // Subida de CV con IA
  const handleProcessAiUpload = async (file?: File, text?: string) => {
    try {
      setIsUploadingAi(true);
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else if (text) {
        formData.append("text", text);
      } else {
        return;
      }

      const res = await fetch("/api/parse-cv", { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        loadImportedResume(result.data);
        onOpenWorkspace();
      } else {
        alert(result.error || "No se pudo procesar el currículum.");
      }
    } catch (err) {
      console.error("Error en Ingesta IA:", err);
      alert("Hubo un problema al procesar el archivo.");
    } finally {
      setIsUploadingAi(false);
    }
  };

  // Exportar Word
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

  // Exportar PDF
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

  // Exportar YAML
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

  // Exportar JSON
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

  // Filtrado de perfiles
  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.targetRole && p.targetRole.toLowerCase().includes(q))
    );
  });

  const masterExpCount = masterProfileData.experience?.length || 0;
  const masterSkillsCount = masterProfileData.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0;
  const masterProjCount = masterProfileData.projects?.length || 0;

  const templateKeys = Object.keys(TEMPLATE_METADATA) as TemplateId[];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      {/* 1. SIDEBAR LATERAL ESTRUCTURADO (Estilo Linear / Vercel / Google) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 p-5">
          {/* Logo & Marca */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1 select-none">
              <span className="text-xl font-black tracking-tight text-foreground font-sans">
                Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-0.5 inline-block" />
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Menú de Navegación por Apartados Específicos */}
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1.5 font-mono">
                Espacio de Trabajo
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSection("resumes");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "resumes"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4" />
                  <span>Mis Currículums</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-1.5 py-0 ${
                    activeSection === "resumes" ? "border-background/30 text-background" : "border-border text-muted-foreground"
                  }`}
                >
                  {profiles.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection("master_profile");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "master_profile"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span>Perfil Base Maestro</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Base
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection("templates");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "templates"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="h-4 w-4 text-amber-500" />
                  <span>Plantillas ATS</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">6</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection("ai_import");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "ai_import"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  <span>Ingesta con IA</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono">
                  PDF
                </Badge>
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1.5 font-mono">
                Ajustes
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "settings"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4" />
                  <span>Configuración de Perfil</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer del Sidebar: Perfil de Usuario & Modo Oscuro */}
        <div className="p-4 border-t border-border/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {user?.name || "Usuario"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email || "Sin correo"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Alternar tema"
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay Móvil */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL DINÁMICA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/40">
        {/* TOPBAR MINIMALISTA */}
        <header className="h-14 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-sm font-bold text-foreground capitalize">
                {activeSection === "resumes" && "Mis Currículums"}
                {activeSection === "master_profile" && "Perfil Base de Carrera"}
                {activeSection === "templates" && "Catálogo de Plantillas ATS"}
                {activeSection === "ai_import" && "Ingesta Asistida por IA"}
                {activeSection === "settings" && "Configuración de Perfil"}
              </h1>
            </div>
          </div>

          {/* Acción contextual según apartado */}
          <div className="flex items-center gap-2.5">
            {activeSection === "resumes" && (
              <Button
                size="sm"
                onClick={() => setIsWizardOpen(true)}
                className="h-8 px-3 text-xs font-semibold gap-1.5 bg-foreground text-background rounded-xl shadow-xs hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nuevo Currículum</span>
              </Button>
            )}

            {activeSection === "master_profile" && (
              <Button
                size="sm"
                onClick={handleSaveMasterProfile}
                className={`h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5 ${
                  isMasterSaved ? "bg-emerald-600 text-white" : "bg-foreground text-background"
                }`}
              >
                {isMasterSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isMasterSaved ? "Guardado en Base" : "Guardar en Base"}</span>
              </Button>
            )}
          </div>
        </header>

        {/* CONTENIDO SEGÚN APARTADO ACTIVO */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin">
          {/* APARTADO 1: MIS CURRÍCULUMS */}
          {activeSection === "resumes" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Barra de Filtro & Búsqueda */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar versión de CV por nombre o rol..."
                    className="h-8 text-xs pl-8.5 rounded-xl border-border/80 bg-card"
                  />
                </div>

                <div className="text-xs text-muted-foreground font-mono">
                  {filteredProfiles.length} {filteredProfiles.length === 1 ? "versión disponible" : "versiones disponibles"}
                </div>
              </div>

              {/* Grid de Tarjetas de Currículum */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProfiles.map((profile) => {
                  const isActive = profile.id === activeProfileId;
                  const meta = TEMPLATE_METADATA[profile.templateId] || TEMPLATE_METADATA.tech_minimalist;
                  const Icon = TEMPLATE_ICONS[profile.templateId] || Terminal;
                  const accent = TEMPLATE_ACCENTS[profile.templateId] || TEMPLATE_ACCENTS.tech_minimalist;

                  return (
                    <div
                      key={profile.id}
                      className={`rounded-2xl border bg-card flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md ${
                        isActive
                          ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 shadow-sm"
                          : "border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div className={`px-4 py-2 flex items-center justify-between border-b ${accent.border} ${accent.bg}`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{meta.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {profile.paperSize || "LETTER"}
                        </span>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {profile.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.targetRole || "Rol no definido"}
                          </p>

                          <div className="pt-2 flex flex-wrap gap-1">
                            {profile.data.skills?.[0]?.skills.slice(0, 3).map((sk, i) => (
                              <Badge key={i} variant="secondary" className="text-[9px] font-mono py-0 px-1.5">
                                {sk}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Acciones de la Tarjeta */}
                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenResume(profile.id)}
                            className="flex-1 h-8 text-xs font-semibold rounded-xl bg-foreground text-background hover:opacity-90 gap-1.5"
                          >
                            <span>Abrir en Editor</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>

                          {/* Menú de Opciones */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-xl border-border/80 text-muted-foreground"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                              <DropdownMenuItem
                                onClick={() => handleDownloadPdf(profile)}
                                className="cursor-pointer gap-2"
                              >
                                <FileDown className="h-3.5 w-3.5 text-rose-500" />
                                <span>Exportar PDF Vectorial</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadDocx(profile)}
                                className="cursor-pointer gap-2"
                              >
                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                <span>Exportar Word DOCX</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadYaml(profile)}
                                className="cursor-pointer gap-2"
                              >
                                <FileCode className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Exportar YAML</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => duplicateProfile(profile.id)}
                                className="cursor-pointer gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Duplicar Versión</span>
                              </DropdownMenuItem>
                              {profiles.length > 1 && (
                                <DropdownMenuItem
                                  onClick={() => deleteProfile(profile.id)}
                                  className="cursor-pointer gap-2 text-rose-500 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Eliminar Versión</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Tarjeta para Crear Nueva Versión */}
                <div
                  onClick={() => setIsWizardOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 bg-card/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-card min-h-[190px] group"
                >
                  <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground">Crear Otra Versión</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Personaliza tu experiencia para otra postulación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* APARTADO 2: PERFIL BASE MAESTRO (INFORMACIÓN COMPLETA) */}
          {activeSection === "master_profile" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-500" />
                      <span>Base de Datos de Carrera Completa</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Tu repositorio maestro con todos tus empleos, proyectos y skills sin límite de páginas.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      const count = profiles.length + 1;
                      createProfileFromMaster(`CV Versión ${count}`, masterFormData.headline || "Nuevo Rol");
                      onOpenWorkspace();
                    }}
                    className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Crear CV desde esta Base</span>
                  </Button>
                </div>

                {/* Pestañas de Edición del Perfil Base */}
                <Tabs value={masterTab} onValueChange={(v) => setMasterTab(v as any)} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full max-w-xl h-8 bg-zinc-100 dark:bg-zinc-800 text-xs mb-4">
                    <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                    <TabsTrigger value="experience" className="text-xs">Experiencia</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                    <TabsTrigger value="projects" className="text-xs">Proyectos</TabsTrigger>
                    <TabsTrigger value="education" className="text-xs">Educación</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Nombre Completo</Label>
                        <Input
                          value={masterFormData.name || ""}
                          onChange={(e) => setMasterFormData({ ...masterFormData, name: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Titular Profesional</Label>
                        <Input
                          value={masterFormData.headline || ""}
                          onChange={(e) => setMasterFormData({ ...masterFormData, headline: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Email</Label>
                        <Input
                          value={masterFormData.email || ""}
                          onChange={(e) => setMasterFormData({ ...masterFormData, email: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Teléfono</Label>
                        <Input
                          value={masterFormData.phone || ""}
                          onChange={(e) => setMasterFormData({ ...masterFormData, phone: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <Label className="text-xs font-semibold">Resumen Profesional Completo</Label>
                      <Textarea
                        value={masterFormData.summary || ""}
                        onChange={(e) => setMasterFormData({ ...masterFormData, summary: e.target.value })}
                        className="text-xs min-h-[90px] leading-relaxed"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-3 m-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {masterFormData.experience?.length || 0} Empleos registrados
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const newEntry = {
                            id: `exp-${Date.now()}`,
                            company: "Nueva Empresa",
                            position: "Cargo",
                            start_date: "2024",
                            end_date: "Presente",
                            current: true,
                            highlights: ["Responsabilidad o logro medible."],
                          };
                          setMasterFormData({
                            ...masterFormData,
                            experience: [newEntry, ...(masterFormData.experience || [])],
                          });
                        }}
                        className="h-7 text-xs bg-foreground text-background"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span>Añadir Empleo</span>
                      </Button>
                    </div>

                    <div className="space-y-2.5">
                      {masterFormData.experience?.map((exp, idx) => (
                        <div key={exp.id} className="p-3 rounded-xl border border-border bg-card/60 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{exp.position} – {exp.company}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = masterFormData.experience.filter((_, i) => i !== idx);
                                setMasterFormData({ ...masterFormData, experience: updated });
                              }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const updated = [...masterFormData.experience];
                                updated[idx].company = e.target.value;
                                setMasterFormData({ ...masterFormData, experience: updated });
                              }}
                              placeholder="Empresa"
                              className="h-7 text-xs"
                            />
                            <Input
                              value={exp.position}
                              onChange={(e) => {
                                const updated = [...masterFormData.experience];
                                updated[idx].position = e.target.value;
                                setMasterFormData({ ...masterFormData, experience: updated });
                              }}
                              placeholder="Cargo"
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-3 m-0">
                    <div className="space-y-2.5">
                      {masterFormData.skills?.map((cat, catIdx) => (
                        <div key={cat.id} className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5">
                          <span className="font-bold text-xs font-mono">{cat.category}</span>
                          <Input
                            value={cat.skills.join(", ")}
                            onChange={(e) => {
                              const updated = [...masterFormData.skills];
                              updated[catIdx].skills = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                              setMasterFormData({ ...masterFormData, skills: updated });
                            }}
                            className="h-7 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-3 m-0">
                    <div className="space-y-2.5">
                      {masterFormData.projects?.map((proj, idx) => (
                        <div key={proj.id} className="p-3 rounded-xl border border-border bg-card/60 space-y-1 text-xs">
                          <span className="font-bold text-foreground">{proj.name}</span>
                          <Textarea
                            value={proj.description || ""}
                            onChange={(e) => {
                              const updated = [...masterFormData.projects];
                              updated[idx].description = e.target.value;
                              setMasterFormData({ ...masterFormData, projects: updated });
                            }}
                            className="text-xs min-h-[50px]"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-2.5 m-0">
                    {masterFormData.education?.map((edu) => (
                      <div key={edu.id} className="p-3 rounded-xl border border-border bg-card/60 text-xs">
                        <div className="font-bold text-foreground">{edu.degree}</div>
                        <div className="text-muted-foreground">{edu.institution}</div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* APARTADO 3: PLANTILLAS ATS */}
          {activeSection === "templates" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-base font-bold text-foreground">Catálogo de 6 Plantillas ATS</h2>
                  <p className="text-xs text-muted-foreground">
                    Diseños estructurados en 1 sola columna aprobados para superar filtros automatizados.
                  </p>
                </div>

                <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/70 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setTemplatePreviewSample(true)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      templatePreviewSample ? "bg-white dark:bg-zinc-950 font-bold shadow-xs text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Datos de Muestra
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplatePreviewSample(false)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      !templatePreviewSample ? "bg-white dark:bg-zinc-950 font-bold shadow-xs text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Mis Datos
                  </button>
                </div>
              </div>

              {/* Grid de Plantillas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templateKeys.map((tempId) => {
                  const meta = TEMPLATE_METADATA[tempId];
                  const Icon = TEMPLATE_ICONS[tempId] || Terminal;
                  const isSelected = tempId === activeTemplate;
                  const pData = templatePreviewSample ? SAMPLE_RESUME_FULLSTACK : masterProfileData;

                  return (
                    <div
                      key={tempId}
                      className={`group rounded-2xl border bg-card flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-lg ${
                        isSelected ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-border/80"
                      }`}
                    >
                      {/* Miniatura renderizada */}
                      <div className="relative h-60 bg-zinc-100 dark:bg-zinc-900 border-b border-border/60 overflow-hidden flex justify-center items-start pt-2">
                        <div className="w-[230px] h-[280px] overflow-hidden rounded-xs border border-zinc-200 shadow-sm relative bg-white shrink-0">
                          <div
                            className="w-[816px] min-h-[1056px] bg-white text-zinc-950 pointer-events-none select-none absolute top-0 left-0"
                            style={{ transform: "scale(0.282)", transformOrigin: "top left" }}
                          >
                            <TemplateRenderer templateId={tempId} data={pData} paperSize="letter" />
                          </div>
                        </div>

                        {/* Overlay hover */}
                        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-2xs p-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveTemplate(tempId);
                              onOpenWorkspace();
                            }}
                            className="w-full max-w-[160px] h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Usar Plantilla</span>
                          </Button>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <Badge className="bg-emerald-600 text-white font-bold text-[9px]">En Uso</Badge>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                              <Icon className="h-3.5 w-3.5" />
                              <span>{meta.name}</span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              ATS 100%
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                            {meta.description}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveTemplate(tempId);
                            onOpenWorkspace();
                          }}
                          className="w-full h-7 text-xs font-semibold rounded-lg"
                        >
                          <span>Abrir en Editor</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APARTADO 4: INGESTA CON IA */}
          {activeSection === "ai_import" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-3xl border border-border bg-card space-y-5 text-center">
                <div className="space-y-1">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    Extractor Inteligente de Currículums
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Sube tu currículum en PDF existente para extraer automáticamente tu historial hacia SchemaCV.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessAiUpload(e.target.files[0]);
                    }
                  }}
                  accept=".pdf"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                >
                  {isUploadingAi ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-500 my-2" />
                      <span className="text-xs font-bold text-foreground">Extrayendo datos estructurados...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-xs font-bold text-foreground">Arrastra o haz clic para subir tu PDF</span>
                      <span className="text-[10px] text-muted-foreground">Formato PDF hasta 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* APARTADO 5: CONFIGURACIÓN */}
          {activeSection === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
                <h2 className="text-base font-bold text-foreground">Configuración de Usuario</h2>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Nombre de Usuario</Label>
                    <Input value={user?.name || ""} disabled className="h-8 text-xs bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Correo Electrónico</Label>
                    <Input value={user?.email || ""} disabled className="h-8 text-xs bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Rol Profesional</Label>
                    <Input value={user?.headline || ""} disabled className="h-8 text-xs bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Asistente de Creación de CV */}
      <CreateResumeWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={onOpenWorkspace}
      />
      <AuthModal />
    </div>
  );
};
