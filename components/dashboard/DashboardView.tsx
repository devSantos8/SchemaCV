"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  Plus,
  Sparkles,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
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
  ArrowUpRight,
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
  Zap,
  Award,
  Link as LinkIcon,
  Download,
  RefreshCw,
  AlertTriangle,
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

type DashboardSection = "home" | "resumes" | "master_profile" | "templates" | "ai_import" | "settings";

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
    setPaperSize,
  } = useResumeStore();

  const {
    user,
    isAuthenticated,
    logout,
    updateUserProfile,
  } = useAuthStore();

  const [activeSection, setActiveSection] = useState<DashboardSection>("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Estados de exportación
  const [downloadingDocxId, setDownloadingDocxId] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // Estados de Ingesta IA
  const [isUploadingAi, setIsUploadingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados del Perfil Base Maestro
  const [masterFormData, setMasterFormData] = useState<ResumeData>(masterProfileData);
  const [isMasterSaved, setIsMasterSaved] = useState(false);
  const [masterSubSection, setMasterSubSection] = useState<"general" | "social" | "experience" | "skills" | "projects" | "education" | "certifications">("general");

  // Estados de Configuración
  const [settingsSubSection, setSettingsSubSection] = useState<"profile" | "preferences" | "data">("profile");
  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || "Joain Matias Monroy Santos",
    email: user?.email || "matiasmonroy483@gmail.com",
    headline: user?.headline || "Senior Full Stack & Cloud Developer",
    location: user?.location || "Santiago, Chile",
    phone: user?.phone || "+56 9 4900 2793",
    bio: user?.bio || "Ingeniero de Software enfocado en arquitecturas escalables, sistemas cloud y diseño de experiencias web de alto impacto.",
    githubUrl: user?.githubUrl || "https://github.com/devSantos8",
    linkedinUrl: user?.linkedinUrl || "https://linkedin.com/in/jmonroys17",
    websiteUrl: user?.websiteUrl || "https://jmonroys.dev",
  });
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Estados de la Galería de Plantillas
  const [templatePreviewSample, setTemplatePreviewSample] = useState(true);

  // Sincronizar formulario maestro si cambia el store
  useEffect(() => {
    setMasterFormData(JSON.parse(JSON.stringify(masterProfileData)));
  }, [masterProfileData]);

  useEffect(() => {
    if (user) {
      setSettingsForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        headline: user.headline || prev.headline,
        location: user.location || prev.location,
        phone: user.phone || prev.phone,
        bio: user.bio || prev.bio,
        githubUrl: user.githubUrl || prev.githubUrl,
        linkedinUrl: user.linkedinUrl || prev.linkedinUrl,
        websiteUrl: user.websiteUrl || prev.websiteUrl,
      }));
    }
  }, [user]);

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: settingsForm.name,
      email: settingsForm.email,
      headline: settingsForm.headline,
      location: settingsForm.location,
      phone: settingsForm.phone,
      bio: settingsForm.bio,
      githubUrl: settingsForm.githubUrl,
      linkedinUrl: settingsForm.linkedinUrl,
      websiteUrl: settingsForm.websiteUrl,
    });
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 2500);
  };

  // Subida de CV con IA
  const handleProcessAiUpload = async (file?: File) => {
    if (!file) return;
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

  // Exportar Backup Completo JSON
  const handleExportFullBackup = () => {
    const backupData = {
      version: "schemacv-v1",
      exportedAt: new Date().toISOString(),
      profiles,
      masterProfileData,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SchemaCV_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
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
  const masterEduCount = masterProfileData.education?.length || 0;
  const masterCertCount = masterProfileData.certifications?.length || 0;

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const templateKeys = Object.keys(TEMPLATE_METADATA) as TemplateId[];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      {/* 1. SIDEBAR LATERAL DINÁMICO (COLAPSABLE, CENTRADO & ELEGANTE) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col justify-between transition-all duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col p-4 gap-6">
          {/* Header del Sidebar: Logo Centrado y Botón Colapsar */}
          <div className="relative flex items-center justify-center min-h-[40px] pt-1">
            <div
              onClick={() => setActiveSection("home")}
              className="flex items-baseline gap-1 cursor-pointer select-none group"
            >
              {!isSidebarCollapsed ? (
                <>
                  <span className="text-xl font-black tracking-tight text-foreground font-sans group-hover:opacity-90">
                    Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-0.5 inline-block animate-pulse" />
                </>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-sm shadow-sm">
                  S<span className="text-emerald-400">.</span>
                </div>
              )}
            </div>

            {/* Botón de Colapsar Sidebar (Desktop) */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isSidebarCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            {/* Botón Cerrar (Móvil) */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Menú de Navegación por Apartados */}
          <nav className="space-y-4">
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1 font-mono">
                  Principal
                </div>
              )}

              {/* Botón Inicio / Home */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("home");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "home"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title={isSidebarCollapsed ? "Inicio" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="h-4 w-4" />
                  {!isSidebarCollapsed && <span>Inicio</span>}
                </div>
              </button>

              {/* Botón Mis Currículums */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("resumes");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "resumes"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title={isSidebarCollapsed ? "Mis Currículums" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4" />
                  {!isSidebarCollapsed && <span>Mis Currículums</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono px-1.5 py-0 ${
                      activeSection === "resumes" ? "border-background/30 text-background" : "border-border text-muted-foreground"
                    }`}
                  >
                    {profiles.length}
                  </Badge>
                )}
              </button>

              {/* Botón Perfil Base Maestro */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("master_profile");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "master_profile"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title={isSidebarCollapsed ? "Perfil Base Maestro" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-emerald-500" />
                  {!isSidebarCollapsed && <span>Perfil Base Maestro</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Base
                  </span>
                )}
              </button>

              {/* Botón Plantillas ATS */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("templates");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "templates"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title={isSidebarCollapsed ? "Plantillas ATS" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="h-4 w-4 text-amber-500" />
                  {!isSidebarCollapsed && <span>Plantillas ATS</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono opacity-80">6</span>
                )}
              </button>

              {/* Botón Ingesta IA */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("ai_import");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "ai_import"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title={isSidebarCollapsed ? "Ingesta con IA" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  {!isSidebarCollapsed && <span>Ingesta con IA</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge variant="outline" className="text-[9px] font-mono">
                    PDF
                  </Badge>
                )}
              </button>
            </div>

            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1 font-mono">
                  Ajustes
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-semibold transition-all ${
                  activeSection === "settings"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
                title={isSidebarCollapsed ? "Configuración" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4" />
                  {!isSidebarCollapsed && <span>Configuración</span>}
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Footer del Sidebar: Tarjeta de Cuenta con Alta Presencia */}
        <div className="p-3 border-t border-border/80 bg-zinc-50/80 dark:bg-zinc-900/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? "justify-center p-1.5" : "p-2.5 justify-between"
                } rounded-2xl bg-card border border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs transition-all text-left group`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 text-background flex items-center justify-center font-bold text-xs shadow-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "J"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {user?.name || "Joain Monroy"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate font-mono">
                        {user?.email || "devSantos8"}
                      </span>
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border p-1.5 shadow-xl">
              <DropdownMenuLabel className="text-xs">
                <div className="font-bold text-foreground">{user?.name || "Joain Monroy"}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{user?.email || "matiasmonroy483@gmail.com"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setActiveSection("settings")}
                className="text-xs cursor-pointer gap-2 p-2 rounded-lg"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Configuración de Cuenta</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleDarkMode}
                className="text-xs cursor-pointer gap-2 p-2 rounded-lg"
              >
                {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                <span>{isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-xs cursor-pointer gap-2 p-2 rounded-lg text-rose-500 hover:text-rose-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Overlay Móvil */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
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

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground capitalize">
                {activeSection === "home" && "Panel Principal"}
                {activeSection === "resumes" && "Mis Currículums"}
                {activeSection === "master_profile" && "Perfil Base Maestro"}
                {activeSection === "templates" && "Catálogo de Plantillas ATS"}
                {activeSection === "ai_import" && "Ingesta Asistida por IA"}
                {activeSection === "settings" && "Configuración del Sistema"}
              </h1>
              {activeSection === "home" && (
                <Badge variant="secondary" className="text-[10px] font-mono py-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                  Online
                </Badge>
              )}
            </div>
          </div>

          {/* Botones de Acción Primarios Contextuales */}
          <div className="flex items-center gap-2.5">
            {activeSection === "home" && (
              <Button
                size="sm"
                onClick={onOpenWorkspace}
                className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-foreground text-background rounded-xl shadow-xs hover:opacity-90"
              >
                <span>Abrir Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

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
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const count = profiles.length + 1;
                    createProfileFromMaster(`CV Versión ${count}`, masterFormData.headline || "Nuevo Rol");
                    onOpenWorkspace();
                  }}
                  className="h-8 px-3 text-xs font-semibold rounded-xl border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Crear CV desde Base</span>
                </Button>

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
              </div>
            )}

            {activeSection === "settings" && (
              <Button
                size="sm"
                onClick={handleSaveSettings}
                className={`h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5 ${
                  isSettingsSaved ? "bg-emerald-600 text-white" : "bg-foreground text-background"
                }`}
              >
                {isSettingsSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isSettingsSaved ? "Ajustes Guardados" : "Guardar Ajustes"}</span>
              </Button>
            )}
          </div>
        </header>

        {/* CONTENIDO SEGÚN APARTADO ACTIVO */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin">
          {/* APARTADO 0: INICIO / HOME */}
          {activeSection === "home" && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Hola, {user?.name?.split(" ")[0] || "Joain"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Resumen de tu espacio de trabajo y estado de tus versiones de currículum ATS.
                </p>
              </div>

              {/* 4 Métricas Reales y Dinámicas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveSection("resumes")}
                  className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-semibold">Versiones Creadas</span>
                    <FileText className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {profiles.length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Perfiles adaptados
                  </span>
                </div>

                <div
                  onClick={() => setActiveSection("master_profile")}
                  className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-semibold">Empleos en Base</span>
                    <Briefcase className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {masterExpCount}
                  </div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Experiencias laborales
                  </span>
                </div>

                <div
                  onClick={() => setActiveSection("master_profile")}
                  className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-semibold">Skills Técnicas</span>
                    <Layers className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {masterSkillsCount}
                  </div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Habilidades registradas
                  </span>
                </div>

                <div
                  onClick={() => setActiveSection("templates")}
                  className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-semibold">Plantilla Activa</span>
                    <LayoutGrid className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-sm font-extrabold text-foreground truncate pt-1">
                    {TEMPLATE_METADATA[activeTemplate]?.name || "Tech Minimalist"}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono">
                    100% ATS Approved
                  </span>
                </div>
              </div>

              {/* Tarjetas de Accesos Directos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={onOpenWorkspace}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-foreground/30 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        Continuar Editando CV Activo
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">
                      {activeProfile.name} • {TEMPLATE_METADATA[activeProfile.templateId]?.name}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <div
                  onClick={() => setActiveSection("master_profile")}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Database className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        Administrar Perfil Base Maestro
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">
                      Actualiza tus proyectos, logros y competencias completas.
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              {/* Lista de Versiones de CV Recientes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Tus Versiones de CV</h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection("resumes")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <span>Ver todas ({profiles.length})</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profiles.slice(0, 4).map((p) => {
                    const meta = TEMPLATE_METADATA[p.templateId] || TEMPLATE_METADATA.tech_minimalist;
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">{p.name}</h4>
                          <p className="text-[11px] text-muted-foreground truncate">{p.targetRole}</p>
                          <span className="text-[10px] font-mono text-muted-foreground">{meta.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleOpenResume(p.id)}
                            className="h-7 px-2.5 text-xs font-semibold bg-foreground text-background"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* APARTADO 1: MIS CURRÍCULUMS */}
          {activeSection === "resumes" && (
            <div className="max-w-6xl mx-auto space-y-6">
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
                      <div className={`px-4 py-2 flex items-center justify-between border-b ${accent.border} ${accent.bg}`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{meta.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {profile.paperSize || "LETTER"}
                        </span>
                      </div>

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

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenResume(profile.id)}
                            className="flex-1 h-8 text-xs font-semibold rounded-xl bg-foreground text-background hover:opacity-90 gap-1.5"
                          >
                            <span>Abrir en Editor</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>

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

          {/* APARTADO 2: PERFIL BASE MAESTRO (EXPANDIDO & ROBUSTO) */}
          {activeSection === "master_profile" && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Layout Asimétrico 2 Columnas de Alta Productividad */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Columna Izquierda: Navegación de Secciones de la Base (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Tarjeta de Resumen de Carrera */}
                  <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Database className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-foreground truncate">
                          {masterFormData.name || "Nombre"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {masterFormData.headline || "Titular"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Experiencias:</span>
                        <span className="font-bold text-foreground">{masterExpCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Habilidades:</span>
                        <span className="font-bold text-foreground">{masterSkillsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Proyectos:</span>
                        <span className="font-bold text-foreground">{masterProjCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Educación:</span>
                        <span className="font-bold text-foreground">{masterEduCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menú de Subsecciones de la Base */}
                  <div className="p-2 rounded-2xl border border-border bg-card space-y-1">
                    <button
                      type="button"
                      onClick={() => setMasterSubSection("general")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "general"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        <span>Datos Personales</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMasterSubSection("social")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "social"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" />
                        <span>Enlaces & Redes</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80">{masterFormData.social_networks?.length || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMasterSubSection("experience")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "experience"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Historial Laboral</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{masterExpCount}</Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMasterSubSection("skills")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "skills"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" />
                        <span>Habilidades Técnicas</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{masterSkillsCount}</Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMasterSubSection("projects")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "projects"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-3.5 w-3.5" />
                        <span>Proyectos</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{masterProjCount}</Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMasterSubSection("education")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "education"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Educación</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{masterEduCount}</Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMasterSubSection("certifications")}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterSubSection === "certifications"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-3.5 w-3.5" />
                        <span>Certificaciones</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{masterCertCount}</Badge>
                    </button>
                  </div>
                </div>

                {/* Columna Derecha: Formulario Extendido y Espacioso (9 cols) */}
                <div className="lg:col-span-9 p-6 rounded-2xl border border-border bg-card space-y-6">
                  {/* SUBSECCIÓN 1: DATOS PERSONALES */}
                  {masterSubSection === "general" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Datos Personales & Titular</h3>
                        <p className="text-xs text-muted-foreground">Tu información de contacto central.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Nombre Completo</Label>
                          <Input
                            value={masterFormData.name || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, name: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Titular Profesional Principal</Label>
                          <Input
                            value={masterFormData.headline || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, headline: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Correo Electrónico</Label>
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

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Ubicación (Ciudad, País)</Label>
                          <Input
                            value={masterFormData.location || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, location: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Sitio Web Personal / Portafolio</Label>
                          <Input
                            value={masterFormData.website || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, website: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-semibold">Resumen Profesional Maestro (Bio Completa)</Label>
                        <Textarea
                          value={masterFormData.summary || ""}
                          onChange={(e) => setMasterFormData({ ...masterFormData, summary: e.target.value })}
                          placeholder="Escribe tu trayectoria completa, especialidad y principales fortalezas técnicas..."
                          className="text-xs min-h-[120px] leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 2: ENLACES & REDES */}
                  {masterSubSection === "social" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Redes Sociales & Enlaces Profesionales</h3>
                          <p className="text-xs text-muted-foreground">GitHub, LinkedIn, Twitter/X, Portafolios.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newNet = { network: "GitHub", username: "usuario", url: "https://github.com/usuario" };
                            setMasterFormData({
                              ...masterFormData,
                              social_networks: [...(masterFormData.social_networks || []), newNet],
                            });
                          }}
                          className="h-7 text-xs bg-foreground text-background gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Añadir Enlace</span>
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {masterFormData.social_networks?.map((net, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center gap-3">
                            <div className="w-32">
                              <Input
                                value={net.network}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.social_networks || [])];
                                  updated[idx].network = e.target.value;
                                  setMasterFormData({ ...masterFormData, social_networks: updated });
                                }}
                                placeholder="Red (ej: GitHub)"
                                className="h-7 text-xs font-semibold"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                value={net.url}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.social_networks || [])];
                                  updated[idx].url = e.target.value;
                                  setMasterFormData({ ...masterFormData, social_networks: updated });
                                }}
                                placeholder="https://..."
                                className="h-7 text-xs"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = masterFormData.social_networks?.filter((_, i) => i !== idx);
                                setMasterFormData({ ...masterFormData, social_networks: updated });
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 3: HISTORIAL LABORAL */}
                  {masterSubSection === "experience" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Historial Completo de Empleos ({masterExpCount})</h3>
                          <p className="text-xs text-muted-foreground">Toda tu trayectoria laboral con viñetas cuantificadas.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newExp = {
                              id: `exp-${Date.now()}`,
                              company: "Nueva Empresa",
                              position: "Nuevo Cargo",
                              location: "",
                              start_date: "2024",
                              end_date: "Presente",
                              current: true,
                              highlights: ["Diseñé e implementé funcionalidad con métricas medibles."],
                            };
                            setMasterFormData({
                              ...masterFormData,
                              experience: [newExp, ...(masterFormData.experience || [])],
                            });
                          }}
                          className="h-7 text-xs bg-foreground text-background gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Añadir Empleo</span>
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {masterFormData.experience?.map((exp, idx) => (
                          <div key={exp.id} className="p-4 rounded-2xl border border-border bg-card/60 space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-foreground">
                                {exp.position} — <span className="text-muted-foreground font-normal">{exp.company}</span>
                              </span>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                              <Input
                                value={exp.start_date}
                                onChange={(e) => {
                                  const updated = [...masterFormData.experience];
                                  updated[idx].start_date = e.target.value;
                                  setMasterFormData({ ...masterFormData, experience: updated });
                                }}
                                placeholder="Inicio (ej: 2022-03)"
                                className="h-7 text-xs"
                              />
                              <Input
                                value={exp.end_date}
                                onChange={(e) => {
                                  const updated = [...masterFormData.experience];
                                  updated[idx].end_date = e.target.value;
                                  setMasterFormData({ ...masterFormData, experience: updated });
                                }}
                                placeholder="Fin (ej: Presente)"
                                className="h-7 text-xs"
                              />
                            </div>

                            {/* Viñetas / Highlights */}
                            <div className="space-y-1.5 pt-1">
                              <Label className="text-[11px] font-semibold text-muted-foreground">Viñetas de Logros (Framework STAR/XYZ):</Label>
                              {exp.highlights?.map((h, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-1.5">
                                  <span className="text-muted-foreground pt-1.5">•</span>
                                  <Textarea
                                    value={h}
                                    onChange={(e) => {
                                      const updated = [...masterFormData.experience];
                                      updated[idx].highlights[hIdx] = e.target.value;
                                      setMasterFormData({ ...masterFormData, experience: updated });
                                    }}
                                    className="text-xs min-h-[45px] leading-snug"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = [...masterFormData.experience];
                                      updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== hIdx);
                                      setMasterFormData({ ...masterFormData, experience: updated });
                                    }}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = [...masterFormData.experience];
                                  updated[idx].highlights = [...(updated[idx].highlights || []), "Nuevo logro o métrica."];
                                  setMasterFormData({ ...masterFormData, experience: updated });
                                }}
                                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                + Añadir Viñeta
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 4: HABILIDADES */}
                  {masterSubSection === "skills" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Catálogo de Habilidades Técnicas ({masterSkillsCount})</h3>
                        <p className="text-xs text-muted-foreground">Organiza tus tecnologías y competencias por categorías.</p>
                      </div>

                      <div className="space-y-3">
                        {masterFormData.skills?.map((cat, catIdx) => (
                          <div key={cat.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                            <div className="flex justify-between items-center">
                              <Input
                                value={cat.category}
                                onChange={(e) => {
                                  const updated = [...masterFormData.skills];
                                  updated[catIdx].category = e.target.value;
                                  setMasterFormData({ ...masterFormData, skills: updated });
                                }}
                                className="h-7 text-xs font-bold w-60"
                              />
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {cat.skills.length} skills
                              </span>
                            </div>
                            <Input
                              value={cat.skills.join(", ")}
                              onChange={(e) => {
                                const updated = [...masterFormData.skills];
                                updated[catIdx].skills = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                setMasterFormData({ ...masterFormData, skills: updated });
                              }}
                              placeholder="Separadas por comas..."
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 5: PROYECTOS */}
                  {masterSubSection === "projects" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Repositorio de Proyectos ({masterProjCount})</h3>
                        <p className="text-xs text-muted-foreground">Tus desarrollos, productos y arquitecturas destacadas.</p>
                      </div>

                      <div className="space-y-3">
                        {masterFormData.projects?.map((proj, idx) => (
                          <div key={proj.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input
                                value={proj.name}
                                onChange={(e) => {
                                  const updated = [...masterFormData.projects];
                                  updated[idx].name = e.target.value;
                                  setMasterFormData({ ...masterFormData, projects: updated });
                                }}
                                placeholder="Nombre del proyecto"
                                className="h-7 text-xs font-bold"
                              />
                              <Input
                                value={proj.url || ""}
                                onChange={(e) => {
                                  const updated = [...masterFormData.projects];
                                  updated[idx].url = e.target.value;
                                  setMasterFormData({ ...masterFormData, projects: updated });
                                }}
                                placeholder="URL demo / web"
                                className="h-7 text-xs"
                              />
                              <Input
                                value={proj.github_url || ""}
                                onChange={(e) => {
                                  const updated = [...masterFormData.projects];
                                  updated[idx].github_url = e.target.value;
                                  setMasterFormData({ ...masterFormData, projects: updated });
                                }}
                                placeholder="URL GitHub"
                                className="h-7 text-xs"
                              />
                            </div>
                            <Textarea
                              value={proj.description || ""}
                              onChange={(e) => {
                                const updated = [...masterFormData.projects];
                                updated[idx].description = e.target.value;
                                setMasterFormData({ ...masterFormData, projects: updated });
                              }}
                              placeholder="Descripción técnica del proyecto..."
                              className="text-xs min-h-[60px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 6: EDUCACIÓN */}
                  {masterSubSection === "education" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Educación & Títulos ({masterEduCount})</h3>
                      </div>

                      <div className="space-y-3">
                        {masterFormData.education?.map((edu, idx) => (
                          <div key={edu.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={edu.institution}
                                onChange={(e) => {
                                  const updated = [...masterFormData.education];
                                  updated[idx].institution = e.target.value;
                                  setMasterFormData({ ...masterFormData, education: updated });
                                }}
                                placeholder="Institución"
                                className="h-7 text-xs"
                              />
                              <Input
                                value={edu.degree}
                                onChange={(e) => {
                                  const updated = [...masterFormData.education];
                                  updated[idx].degree = e.target.value;
                                  setMasterFormData({ ...masterFormData, education: updated });
                                }}
                                placeholder="Título / Grado"
                                className="h-7 text-xs font-bold"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 7: CERTIFICACIONES */}
                  {masterSubSection === "certifications" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Certificaciones & Licencias ({masterCertCount})</h3>
                      </div>

                      <div className="space-y-3">
                        {masterFormData.certifications?.map((cert, idx) => (
                          <div key={cert.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={cert.name}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.certifications || [])];
                                  updated[idx].name = e.target.value;
                                  setMasterFormData({ ...masterFormData, certifications: updated });
                                }}
                                placeholder="Nombre de Certificación"
                                className="h-7 text-xs font-bold"
                              />
                              <Input
                                value={cert.issuer}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.certifications || [])];
                                  updated[idx].issuer = e.target.value;
                                  setMasterFormData({ ...masterFormData, certifications: updated });
                                }}
                                placeholder="Entidad Emisora (ej: AWS, Google)"
                                className="h-7 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                      <div className="relative h-60 bg-zinc-100 dark:bg-zinc-900 border-b border-border/60 overflow-hidden flex justify-center items-start pt-2">
                        <div className="w-[230px] h-[280px] overflow-hidden rounded-xs border border-zinc-200 shadow-sm relative bg-white shrink-0">
                          <div
                            className="w-[816px] min-h-[1056px] bg-white text-zinc-950 pointer-events-none select-none absolute top-0 left-0"
                            style={{ transform: "scale(0.282)", transformOrigin: "top left" }}
                          >
                            <TemplateRenderer templateId={tempId} data={pData} paperSize="letter" />
                          </div>
                        </div>

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

          {/* APARTADO 5: CONFIGURACIÓN DEL SISTEMA (ROBUSTA & COMPLETA) */}
          {activeSection === "settings" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Navegación de Subpestañas de Configuración */}
              <div className="flex border-b border-border/80 pb-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSettingsSubSection("profile")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubSection === "profile"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Perfil de Usuario & Contacto
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsSubSection("preferences")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubSection === "preferences"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Preferencias del Espacio de Trabajo
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsSubSection("data")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubSection === "data"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Respaldo & Almacenamiento Local
                </button>
              </div>

              {/* CONTENIDO 1: PERFIL DE USUARIO */}
              {settingsSubSection === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-card space-y-4 text-center flex flex-col items-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 text-background flex items-center justify-center font-black text-2xl shadow-md">
                      {settingsForm.name ? settingsForm.name.charAt(0).toUpperCase() : "J"}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-foreground">{settingsForm.name}</h3>
                      <p className="text-xs text-muted-foreground">{settingsForm.headline}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      @devSantos8
                    </Badge>
                  </div>

                  <div className="lg:col-span-8 p-6 rounded-2xl border border-border bg-card space-y-4">
                    <h3 className="font-bold text-sm text-foreground">Información Personal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Nombre Completo</Label>
                        <Input
                          value={settingsForm.name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Correo Electrónico</Label>
                        <Input
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Titular Profesional</Label>
                        <Input
                          value={settingsForm.headline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, headline: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Ubicación</Label>
                        <Input
                          value={settingsForm.location}
                          onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Teléfono</Label>
                        <Input
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Portafolio Web</Label>
                        <Input
                          value={settingsForm.websiteUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <Label className="text-xs font-semibold">Biografía</Label>
                      <Textarea
                        value={settingsForm.bio}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                        className="text-xs min-h-[70px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO 2: PREFERENCIAS DEL WORKSPACE */}
              {settingsSubSection === "preferences" && (
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6 max-w-3xl">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">Preferencias Predeterminadas</h3>
                    <p className="text-xs text-muted-foreground">Configura el comportamiento por defecto de nuevos CVs.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tamaño de Hoja Predeterminado</Label>
                      <select
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value as any)}
                        className="w-full h-8 px-2 text-xs rounded-lg border border-border bg-background"
                      >
                        <option value="letter">US Letter (8.5 × 11 in)</option>
                        <option value="a4">A4 (210 × 297 mm)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Plantilla Predeterminada</Label>
                      <select
                        value={activeTemplate}
                        onChange={(e) => setActiveTemplate(e.target.value as any)}
                        className="w-full h-8 px-2 text-xs rounded-lg border border-border bg-background"
                      >
                        {templateKeys.map((k) => (
                          <option key={k} value={k}>
                            {TEMPLATE_METADATA[k].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Tema Visual</h4>
                      <p className="text-[11px] text-muted-foreground">Alterna entre modo claro y oscuro.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleDarkMode}
                      className="h-8 text-xs gap-1.5"
                    >
                      {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                      <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* CONTENIDO 3: RESPALDO Y ALMACENAMIENTO LOCAL */}
              {settingsSubSection === "data" && (
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6 max-w-3xl">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">Almacenamiento Local (Local-First)</h3>
                    <p className="text-xs text-muted-foreground">
                      SchemaCV almacena todos tus datos de forma privada en tu navegador. Puedes exportar una copia completa en cualquier momento.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Copia de Seguridad Integral</div>
                      <div className="text-[11px] text-muted-foreground">Exporta tus {profiles.length} CVs y tu Perfil Base Maestro en un archivo JSON.</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleExportFullBackup}
                      className="h-8 text-xs font-semibold bg-foreground text-background gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Exportar Backup</span>
                    </Button>
                  </div>
                </div>
              )}
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
