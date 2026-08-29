"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { JobTrackerView } from "@/components/jobs/JobTrackerView";
import { AISettingsCard } from "@/components/settings/AISettingsCard";
import { ATSAuditModal } from "@/components/editor/ATSAuditModal";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { AI_PROVIDER_LABELS } from "@/types/jobs";
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
  Pencil,
  X,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Menu,
  Clock,
  Zap,
  Award,
  Link as LinkIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  Bell,
  Lock,
  HelpCircle,
  FileCheck,
  CheckCircle,
  Sliders,
  Key,
  ArrowUp,
  ArrowDown,
  Calendar,
  Tag,
  BookOpen,
  Cpu,
  Minimize2,
  GitFork,
  Globe2,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TemplateId, ResumeProfile, ResumeData } from "@/types/resume";
import { TEMPLATE_METADATA, TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { generateResumeDocx } from "@/lib/exporters/docxExporter";
import { resumeDataToYaml } from "@/lib/exporters/yamlExporter";
import { SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import { upsertMasterResumeToSupabase } from "@/lib/supabase/db";
import { TemplateGalleryModal } from "@/components/templates/TemplateGalleryModal";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/TagInput";
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
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
import { toast } from "sonner";
import { OverviewSkeleton, ResumesGridSkeleton, KanbanSkeleton } from "./DashboardSkeleton";

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

const TEMPLATE_METADATA_CONST: Record<TemplateId, { name: string; tag: string; description: string }> = {
  chile_profesional: {
    name: "Chile & LatAm Profesional",
    tag: "GetOnBoard & Buk Chile",
    description: "Diseño optimizado para el mercado chileno y latinoamericano (titulación, +56 9 y GetOnBoard).",
  },
  harvard: {
    name: "Harvard Classic",
    tag: "Académico & Corporativo",
    description: "Diseño tradicional de 1 columna con jerarquía tipográfica estándar ATS.",
  },
  tech_minimalist: {
    name: "Tech Minimalist",
    tag: "Ingeniería de Software",
    description: "Compacto y denso, ideal para destacar stack tecnológico y métricas cuantificables.",
  },
  modern_executive: {
    name: "Modern Executive",
    tag: "Liderazgo & Gestión",
    description: "Elegante y estructurado para directores, jefes de producto y líderes técnicos.",
  },
  skills_first: {
    name: "Skills Focused",
    tag: "Especialistas & Tech",
    description: "Prioriza competencias técnicas y habilidades clave en la parte superior.",
  },
  stanford_clean: {
    name: "Stanford Modern",
    tag: "Innovación & Startups",
    description: "Limpio, espaciado y moderno para roles en producto, diseño y tecnología.",
  },
  compact_swiss: {
    name: "Compact Swiss Grid",
    tag: "Alta Densidad 1 Página",
    description: "Aprovecha al máximo el espacio vertical para carreras con amplia experiencia.",
  },
  executive_serif: {
    name: "Executive Serif",
    tag: "Finanzas & Legal",
    description: "Tipografía clásica serif con elegancia editorial de alto impacto.",
  },
  tech_compact: {
    name: "Tech Condensed",
    tag: "DevOps & Cloud",
    description: "Optimizado para certificaciones, herramientas cloud y arquitectura de sistemas.",
  },
  modern_minimal: {
    name: "Minimalist Clean",
    tag: "Diseño & General",
    description: "Estructura simplificada y directa sin distracciones visuales.",
  },
  career_changer: {
    name: "Career Transition",
    tag: "Cambio de Carrera",
    description: "Destaca habilidades transferibles y proyectos de impacto.",
  },
  academic_international: {
    name: "Academic CV",
    tag: "Investigación & PhD",
    description: "Formato internacional para publicaciones, docencia y trayectoria académica.",
  },
};

const TEMPLATE_ACCENTS: Record<TemplateId, { bg: string; text: string; border: string }> = {
  chile_profesional: {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
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
  executive_serif: {
    bg: "bg-stone-500/10 dark:bg-stone-400/10",
    text: "text-stone-700 dark:text-stone-300",
    border: "border-stone-300 dark:border-stone-700",
  },
  tech_compact: {
    bg: "bg-teal-500/10 dark:bg-teal-400/10",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-700",
  },
  modern_minimal: {
    bg: "bg-gray-500/10 dark:bg-gray-400/10",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-700",
  },
  career_changer: {
    bg: "bg-violet-500/10 dark:bg-violet-400/10",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-300 dark:border-violet-700",
  },
  academic_international: {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
};

type DashboardSection = "home" | "resumes" | "master_profile" | "templates" | "ai_import" | "job_tracker" | "settings";
type SettingsSubTab = "account" | "security" | "workspace" | "notifications" | "support" | "terms";

interface DashboardViewProps {
  initialSection?: DashboardSection;
  onOpenWorkspace: (profileId?: string) => void;
  onOpenSettings?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialSection = "home",
  onOpenWorkspace,
  onOpenSettings,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const getSectionFromPath = (path: string | null): DashboardSection => {
    if (!path) return initialSection;
    if (path === "/resumes" || path.startsWith("/resumes")) return "resumes";
    if (path === "/master-profile" || path.startsWith("/master-profile")) return "master_profile";
    if (path === "/templates" || path.startsWith("/templates")) return "templates";
    if (path === "/import" || path.startsWith("/import")) return "ai_import";
    if (path === "/jobs" || path.startsWith("/jobs")) return "job_tracker";
    if (path === "/settings" || path.startsWith("/settings")) return "settings";
    return initialSection;
  };

  const [activeSection, setActiveSectionState] = useState<DashboardSection>(() => getSectionFromPath(pathname));

  useEffect(() => {
    if (pathname) {
      setActiveSectionState(getSectionFromPath(pathname));
    }
  }, [pathname]);

  const setActiveSection = (section: DashboardSection) => {
    setActiveSectionState(section);
    const routeMap: Record<DashboardSection, string> = {
      home: "/dashboard",
      resumes: "/resumes",
      master_profile: "/master-profile",
      templates: "/templates",
      ai_import: "/import",
      job_tracker: "/jobs",
      settings: "/settings",
    };
    const target = routeMap[section] || "/dashboard";
    if (pathname !== target) {
      router.push(target);
    }
  };

  const {
    profiles,
    activeProfileId,
    setActiveProfile,
    duplicateProfile,
    deleteProfile,
    updateProfileMeta,
    loadImportedResume,
    masterProfileData,
    updateMasterProfileData,
    createProfileFromMaster,
    setActiveTemplate,
    activeTemplate,
    paperSize,
    setPaperSize,
    setResumeData,
  } = useResumeStore();

  const {
    user,
    isAuthenticated,
    logout,
    updateUserProfile,
  } = useAuthStore();

  const {
    enabled: aiEnabled,
    provider: aiProvider,
    apiKey: aiApiKey,
  } = useAISettingsStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Estados de edición de nombre / rol de CV
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingRole, setEditingRole] = useState("");

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

  // Sincronizar masterFormData cuando masterProfileData cambia
  useEffect(() => {
    setMasterFormData(masterProfileData);
  }, [masterProfileData]);

  // Estados de Configuración Estilo Propel
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>("account");
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ").slice(1).join(" ") : "");
  const [settingsEmail, setSettingsEmail] = useState(user?.email || "");
  const [settingsHeadline, setSettingsHeadline] = useState(user?.headline || "");
  const [settingsPhone, setSettingsPhone] = useState(user?.phone || "");
  const [settingsLocation, setSettingsLocation] = useState(user?.location || "");
  const [settingsBio, setSettingsBio] = useState(user?.bio || "");
  const [settingsGithub, setSettingsGithub] = useState(user?.githubUrl || "");
  const [settingsLinkedin, setSettingsLinkedin] = useState(user?.linkedinUrl || "");
  const [settingsWebsite, setSettingsWebsite] = useState(user?.websiteUrl || "");
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Sincronizar formulario de settings cuando el usuario cambia
  useEffect(() => {
    if (user) {
      setFirstName(user.name ? user.name.split(" ")[0] : "");
      setLastName(user.name ? user.name.split(" ").slice(1).join(" ") : "");
      setSettingsEmail(user.email || "");
      setSettingsHeadline(user.headline || "");
      setSettingsPhone(user.phone || "");
      setSettingsLocation(user.location || "");
      setSettingsBio(user.bio || "");
      setSettingsGithub(user.githubUrl || "");
      setSettingsLinkedin(user.linkedinUrl || "");
      setSettingsWebsite(user.websiteUrl || "");
    }
  }, [user]);

  // Estados de Auditoría ATS
  const [auditResumeData, setAuditResumeData] = useState<ResumeData | null>(null);
  const [auditModalTitle, setAuditModalTitle] = useState<string>("Auditor de Formato ATS");

  // Estados de Contraseña y Seguridad
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Notificaciones & Toggles de Configuración
  const [notif1PageWarning, setNotif1PageWarning] = useState(true);
  const [notifYamlSync, setNotifYamlSync] = useState(true);
  const [notifStarSuggestions, setNotifStarSuggestions] = useState(true);
  const [notifAutoSave, setNotifAutoSave] = useState(true);

  // Búsqueda de soporte
  const [supportSearchQuery, setSupportSearchQuery] = useState("");

  // Estados de la Galería de Plantillas
  const [templatePreviewSample, setTemplatePreviewSample] = useState(true);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>("all");
  const [enlargedTemplateId, setEnlargedTemplateId] = useState<TemplateId | null>(null);

  // Sincronizar formulario maestro si cambia el store
  useEffect(() => {
    setMasterFormData(JSON.parse(JSON.stringify(masterProfileData)));
  }, [masterProfileData]);

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
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

  const moveArrayItem = <T,>(arr: T[], fromIndex: number, direction: "up" | "down"): T[] => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= arr.length) return arr;
    const copy = [...arr];
    const item = copy[fromIndex];
    copy[fromIndex] = copy[toIndex];
    copy[toIndex] = item;
    return copy;
  };

  const handleSaveMasterProfile = async () => {
    updateMasterProfileData(masterFormData);
    if (user?.id) {
      await upsertMasterResumeToSupabase(user.id, masterFormData);
    }
    setIsMasterSaved(true);
    toast.success("Perfil Base Maestro guardado", {
      description: "Tus datos y proyectos se sincronizaron con éxito en la nube.",
    });
    setTimeout(() => setIsMasterSaved(false), 2500);
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateUserProfile({
      name: fullName,
      email: settingsEmail,
      headline: settingsHeadline,
      location: settingsLocation,
      phone: settingsPhone,
      bio: settingsBio,
      githubUrl: settingsGithub,
      linkedinUrl: settingsLinkedin,
      websiteUrl: settingsWebsite,
    });
    setIsSettingsSaved(true);
    toast.success("Ajustes de cuenta actualizados");
    setTimeout(() => setIsSettingsSaved(false), 2500);
  };

  const handleSaveProfileMeta = (profileId: string) => {
    if (!editingName.trim()) {
      toast.error("El nombre del currículum no puede estar vacío");
      return;
    }
    updateProfileMeta(profileId, editingName.trim(), editingRole.trim());
    toast.success("Nombre del currículum actualizado");
    setEditingProfileId(null);
  };

  const handleCancelEditing = () => {
    setEditingProfileId(null);
    setEditingName("");
    setEditingRole("");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden o están vacías.");
      return;
    }
    setIsPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setIsPasswordSaved(false), 2500);
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
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Error exportando DOCX:", err);
      toast.error("No se pudo generar el archivo DOCX.");
    } finally {
      setDownloadingDocxId(null);
    }
  };

  // Exportar PDF
  const handleDownloadPdf = async (profile: ResumeProfile) => {
    try {
      setDownloadingPdfId(profile.id);
      const safeName = (profile.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
      const title = `${safeName}_ATS_${profile.paperSize || "letter"}`;

      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: profile.data,
          templateId: profile.templateId,
          paperSize: profile.paperSize || "letter",
          title,
        }),
      });

      if (!res.ok) {
        toast.error("No se pudo generar el archivo PDF.");
        return;
      }

      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast.success("¡PDF descargado con éxito!");
    } catch (err) {
      console.error("Error exportando PDF:", err);
      toast.error("Error al generar el PDF.");
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
    setTimeout(() => URL.revokeObjectURL(url), 60000);
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
      {/* 1. SIDEBAR LATERAL DINÁMICO */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col justify-between transition-all duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-[68px]" : "w-64"}`}
      >
        <div className={`flex flex-col ${isSidebarCollapsed ? "px-2 py-4 gap-5" : "p-4 gap-6"}`}>
          {/* Header del Sidebar */}
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between min-h-[40px] px-1">
              <div
                onClick={() => setActiveSection("home")}
                className="flex items-baseline gap-1 cursor-pointer select-none group"
              >
                <span className="text-xl font-black tracking-tight text-foreground font-sans group-hover:opacity-90">
                  Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-0.5 inline-block animate-pulse" />
              </div>

              {/* Botón Contraer Sidebar (Desktop) */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Contraer menú lateral"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>

              {/* Botón Cerrar (Móvil) */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[40px]">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-xs shadow-xs hover:opacity-90 transition-all cursor-pointer group"
                title="Expandir menú lateral"
              >
                <span className="group-hover:hidden">S<span className="text-emerald-400">.</span></span>
                <PanelLeftOpen className="h-4 w-4 hidden group-hover:block" />
              </button>
            </div>
          )}

          {/* Menú de Navegación por Apartados */}
          <nav className={isSidebarCollapsed ? "space-y-2 flex flex-col items-center" : "space-y-4"}>
            <div className={`space-y-1 ${isSidebarCollapsed ? "w-full flex flex-col items-center" : ""}`}>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1 font-mono">
                  Principal
                </div>
              )}

              {/* Botón Inicio */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("home");
                  setIsMobileSidebarOpen(false);
                }}
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "home"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "home"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title="Inicio"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="h-4 w-4 shrink-0" />
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
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "resumes"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "resumes"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title={`Mis Currículums (${profiles.length})`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Mis Currículums</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono px-1.5 py-0 ${
                      activeSection === "resumes" ? "border-background/30 text-background bg-background/20" : "border-border text-muted-foreground bg-muted/40"
                    }`}
                  >
                    {profiles.length}
                  </Badge>
                )}
              </button>

              {/* Botón Perfil Base */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("master_profile");
                  setIsMobileSidebarOpen(false);
                }}
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "master_profile"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "master_profile"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title="Perfil Base"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Perfil Base</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono px-1.5 py-0 ${
                      activeSection === "master_profile" ? "border-background/30 text-background bg-background/20" : "border-border text-muted-foreground bg-muted/40"
                    }`}
                  >
                    Base
                  </Badge>
                )}
              </button>

              {/* Botón Plantillas ATS */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("templates");
                  setIsMobileSidebarOpen(false);
                }}
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "templates"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "templates"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title="Catálogo de Plantillas ATS"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Plantillas ATS</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono px-1.5 py-0 ${
                      activeSection === "templates" ? "border-background/30 text-background bg-background/20" : "border-border text-muted-foreground bg-muted/40"
                    }`}
                  >
                    11
                  </Badge>
                )}
              </button>

              {/* Botón Importar CV */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("ai_import");
                  setIsMobileSidebarOpen(false);
                }}
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "ai_import"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "ai_import"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title="Importar CV desde PDF o Texto"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Importar CV</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono px-1.5 py-0 ${
                      activeSection === "ai_import" ? "border-background/30 text-background bg-background/20" : "border-border text-muted-foreground bg-muted/40"
                    }`}
                  >
                    IA
                  </Badge>
                )}
              </button>

              {/* Botón Job Tracker */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("job_tracker");
                  setIsMobileSidebarOpen(false);
                }}
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "job_tracker"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "job_tracker"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title="Job Tracker & Match Analyzer"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Job Tracker</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono px-1.5 py-0 ${
                      activeSection === "job_tracker" ? "border-background/30 text-background bg-background/20" : "border-border text-muted-foreground bg-muted/40"
                    }`}
                  >
                    Nuevo
                  </Badge>
                )}
              </button>
            </div>

            <div className={`space-y-1 ${isSidebarCollapsed ? "w-full flex flex-col items-center pt-2 border-t border-border/40" : ""}`}>
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
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        activeSection === "settings"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeSection === "settings"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`
                }`}
                title="Configuración"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Configuración</span>}
                </div>
              </button>

              {/* Boton Acceso Rapido Motor IA */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("settings");
                  setSettingsSubTab("account");
                  setIsMobileSidebarOpen(false);
                }}
                className={`transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? `h-10 w-10 rounded-xl flex items-center justify-center ${
                        aiEnabled && aiApiKey
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      }`
                    : `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        aiEnabled && aiApiKey
                          ? "bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 hover:bg-violet-500/15"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
                      }`
                }`}
                title={
                  aiEnabled && aiApiKey
                    ? `Motor IA Conectado: ${AI_PROVIDER_LABELS[aiProvider]}`
                    : "Configurar Motor IA (Google Gemini, OpenAI, Claude)"
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Cpu className="h-4 w-4 shrink-0 text-violet-500" />
                  {!isSidebarCollapsed && <span>Motor IA</span>}
                </div>
                {!isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono px-1.5 py-0 ${
                      aiEnabled && aiApiKey
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold"
                        : "border-border text-muted-foreground bg-muted/40"
                    }`}
                  >
                    {aiEnabled && aiApiKey
                      ? (aiProvider === "google" ? "Gemini" : aiProvider === "openai" ? "GPT-4o" : "Claude")
                      : "Inactivo"}
                  </Badge>
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Footer del Sidebar: Tarjeta de Cuenta */}
        <div className={`border-t border-border/80 bg-zinc-50/80 dark:bg-zinc-900/60 ${isSidebarCollapsed ? "p-2 flex justify-center" : "p-3"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center transition-all cursor-pointer group ${
                  isSidebarCollapsed
                    ? "h-10 w-10 rounded-xl justify-center hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 relative"
                    : "w-full p-2.5 justify-between rounded-2xl bg-card border border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs text-left"
                }`}
                title={isSidebarCollapsed ? `${user?.name || "Usuario"} (${user?.email || "usuario@schemacv.dev"})` : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 text-background flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {user?.name || "Usuario"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate font-mono">
                        {user?.email || "usuario@schemacv.dev"}
                      </span>
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSidebarCollapsed ? "center" : "end"} side={isSidebarCollapsed ? "right" : "top"} className="w-56 bg-card border-border p-1.5 shadow-xl">
              <DropdownMenuLabel className="text-xs">
                <div className="font-bold text-foreground">{user?.name || "Usuario"}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{user?.email || "usuario@schemacv.dev"}</div>
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
                {activeSection === "master_profile" && "Perfil Base"}
                {activeSection === "templates" && "Catálogo de Plantillas ATS"}
                {activeSection === "ai_import" && "Importar CV con IA"}
                {activeSection === "job_tracker" && "Job Tracker & Match Analyzer"}
                {activeSection === "settings" && "Configuración"}
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
                onClick={() => onOpenWorkspace()}
                className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-foreground text-background rounded-xl shadow-xs hover:opacity-90"
              >
                <span>Abrir Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {activeSection === "resumes" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const activeProf = profiles.find((p) => p.id === activeProfileId) || profiles[0];
                    if (activeProf) {
                      setAuditResumeData(activeProf.data);
                      setAuditModalTitle(`Auditor ATS — ${activeProf.name}`);
                    }
                  }}
                  className="h-8 px-3 text-xs font-semibold rounded-xl border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Auditar Formato ATS</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsWizardOpen(true)}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 bg-foreground text-background rounded-xl shadow-xs hover:opacity-90 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nuevo Currículum</span>
                </Button>
              </div>
            )}

            {activeSection === "master_profile" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAuditResumeData(masterFormData);
                    setAuditModalTitle("Auditor ATS — Perfil Base");
                  }}
                  className="h-8 px-3 text-xs font-semibold rounded-xl border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Auditar Formato ATS</span>
                </Button>

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

              {/* 4 Métricas Reales */}
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
                  onClick={activeProfile ? () => onOpenWorkspace() : () => setIsWizardOpen(true)}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-foreground/30 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        {activeProfile ? "Continuar Editando CV Activo" : "Crear Mi Primer Currículum"}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">
                      {activeProfile
                        ? `${activeProfile.name} • ${TEMPLATE_METADATA[activeProfile.templateId]?.name || "Plantilla"}`
                        : "Comienza a diseñar tu CV optimizado para ATS"}
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
                  {profiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveSection("resumes")}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver todas ({profiles.length})</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {profiles.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-3">
                    <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">Aún no tienes currículums creados</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Crea tu primera versión de currículum con nuestro asistente inteligente optimizado para ATS.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsWizardOpen(true)}
                      className="h-8.5 px-4 text-xs font-semibold gap-1.5 bg-foreground text-background rounded-xl shadow-xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Crear mi primer CV</span>
                    </Button>
                  </div>
                ) : (
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
                )}
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
                        {editingProfileId === profile.id ? (
                          <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/80 p-2.5 rounded-xl border border-border">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Nombre de la versión</label>
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveProfileMeta(profile.id);
                                  if (e.key === "Escape") handleCancelEditing();
                                }}
                                autoFocus
                                placeholder="Ej. CV Software Engineer"
                                className="h-7 text-xs rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Puesto / Rol Objetivo</label>
                              <Input
                                value={editingRole}
                                onChange={(e) => setEditingRole(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveProfileMeta(profile.id);
                                  if (e.key === "Escape") handleCancelEditing();
                                }}
                                placeholder="Ej. Full Stack Engineer"
                                className="h-7 text-xs rounded-lg"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEditing}
                                className="h-6 px-2 text-[11px]"
                              >
                                <X className="h-3 w-3 mr-1" />
                                <span>Cancelar</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveProfileMeta(profile.id)}
                                className="h-6 px-2.5 text-[11px] bg-foreground text-background"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span>Guardar</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between group/title">
                              <h3 className="font-bold text-sm text-foreground truncate flex-1">
                                {profile.name}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProfileId(profile.id);
                                  setEditingName(profile.name);
                                  setEditingRole(profile.targetRole || "");
                                }}
                                className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-muted-foreground hover:text-foreground transition-all ml-1 cursor-pointer shrink-0"
                                title="Editar nombre y rol del currículum"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            </div>
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
                        )}

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
                            <DropdownMenuContent align="end" className="w-52 text-xs">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProfileId(profile.id);
                                  setEditingName(profile.name);
                                  setEditingRole(profile.targetRole || "");
                                }}
                                className="cursor-pointer gap-2"
                              >
                                <Pencil className="h-3.5 w-3.5 text-amber-500" />
                                <span>Cambiar Nombre & Rol</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDownloadPdf(profile)}
                                className="cursor-pointer gap-2"
                              >
                                <FileDown className="h-3.5 w-3.5 text-rose-500" />
                                <span>Exportar PDF Vectorial</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setAuditResumeData(profile.data);
                                  setAuditModalTitle(`Auditor ATS — ${profile.name}`);
                                }}
                                className="cursor-pointer gap-2"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Auditar Formato ATS</span>
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
                                onClick={() => {
                                  duplicateProfile(profile.id);
                                  toast.info(`Versión "${profile.name}" duplicada`);
                                }}
                                className="cursor-pointer gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Duplicar Versión</span>
                              </DropdownMenuItem>
                              {profiles.length > 1 && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    deleteProfile(profile.id);
                                    toast.error(`Versión "${profile.name}" eliminada`);
                                  }}
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

          {/* APARTADO 2: PERFIL BASE MAESTRO (12 COLS - ROBUSTO Y REORDENABLE) */}
          {activeSection === "master_profile" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Panel de Navegación Lateral (3 cols) */}
                <div className="lg:col-span-3 space-y-4 sticky top-0 self-start">
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
                      <div className="flex justify-between">
                        <span>Certificaciones:</span>
                        <span className="font-bold text-foreground">{masterCertCount}</span>
                      </div>
                    </div>
                  </div>

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

                  {/* Acciones del Perfil Maestro */}
                  <div className="p-3 rounded-2xl border border-border bg-card space-y-2">
                    <Button
                      onClick={handleSaveMasterProfile}
                      className="w-full h-8.5 text-xs font-bold rounded-xl bg-foreground text-background hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      {isMasterSaved ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>¡Guardado con Éxito!</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span>Guardar Perfil Maestro</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        createProfileFromMaster("Versión desde Maestro", masterFormData.headline || "Full Stack Developer");
                        setActiveSection("resumes");
                      }}
                      className="w-full h-8 text-xs font-semibold rounded-xl border-border hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Generar CV desde Maestro</span>
                    </Button>
                  </div>
                </div>

                {/* Formulario Principal (9 cols) */}
                <div className="lg:col-span-9 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
                  {/* SUBSECCIÓN 1: DATOS PERSONALES */}
                  {masterSubSection === "general" && (
                    <div className="space-y-5">
                      <div className="pb-3 border-b border-border/80">
                        <h3 className="text-base font-bold text-foreground">Datos Personales & Titular Principal</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Tu información central y resumen ejecutivo de carrera.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold flex items-center gap-1">
                            <span>Nombre Completo</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </Label>
                          <Input
                            value={masterFormData.name || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, name: e.target.value })}
                            placeholder="ej: Carlos Mendoza Rivera"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold flex items-center gap-1">
                            <span>Titular Profesional Principal</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </Label>
                          <Input
                            value={masterFormData.headline || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, headline: e.target.value })}
                            placeholder="ej: Senior Full Stack Developer & Cloud Architect"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold flex items-center gap-1">
                            <span>Correo Electrónico</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </Label>
                          <Input
                            type="email"
                            value={masterFormData.email || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, email: e.target.value })}
                            placeholder="ej: carlos.mendoza@example.com"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold flex items-center gap-1">
                            <span>Teléfono</span>
                            <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                          </Label>
                          <Input
                            value={masterFormData.phone || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, phone: e.target.value })}
                            placeholder="ej: +1 (555) 382-9102"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold flex items-center gap-1">
                            <span>Ubicación (Ciudad, País)</span>
                            <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                          </Label>
                          <Input
                            value={masterFormData.location || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, location: e.target.value })}
                            placeholder="ej: San Francisco, CA (Remoto)"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold flex items-center gap-1">
                            <span>Sitio Web / Portafolio</span>
                            <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                          </Label>
                          <Input
                            value={masterFormData.website || ""}
                            onChange={(e) => setMasterFormData({ ...masterFormData, website: e.target.value })}
                            placeholder="ej: https://carlosmendoza.dev"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-bold flex items-center gap-1">
                          <span>Resumen Profesional Maestro (Bio Completa)</span>
                          <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                        </Label>
                        <Textarea
                          value={masterFormData.summary || ""}
                          onChange={(e) => setMasterFormData({ ...masterFormData, summary: e.target.value })}
                          placeholder="Escribe tu trayectoria completa, especialidades técnicas, visión de arquitectura y valor profesional que aportas..."
                          className="text-xs min-h-[140px] rounded-xl bg-background leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 2: ENLACES & REDES SOCIALES */}
                  {masterSubSection === "social" && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Redes Sociales & Enlaces Profesionales</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">GitHub, LinkedIn, Twitter/X, Portafolios y perfiles técnicos.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newNet = { network: "", username: "", url: "" };
                            setMasterFormData({
                              ...masterFormData,
                              social_networks: [...(masterFormData.social_networks || []), newNet],
                            });
                          }}
                          className="h-8 px-3 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Enlace</span>
                        </Button>
                      </div>

                      {(!masterFormData.social_networks || masterFormData.social_networks.length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                          <Globe className="h-8 w-8 mx-auto text-muted-foreground/60" />
                          <p className="text-xs font-bold text-foreground">Sin redes ni enlaces registrados</p>
                          <p className="text-[11px] text-muted-foreground">Haz clic en &quot;Añadir Enlace&quot; para agregar GitHub, LinkedIn u otros perfiles.</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {masterFormData.social_networks?.map((net, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="w-full sm:w-36 space-y-1">
                              <Label className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                                <span>Red</span>
                                <span className="text-rose-500">*</span>
                              </Label>
                              <Input
                                value={net.network}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.social_networks || [])];
                                  updated[idx].network = e.target.value;
                                  setMasterFormData({ ...masterFormData, social_networks: updated });
                                }}
                                placeholder="ej: GitHub, LinkedIn"
                                className="h-8 text-xs font-bold rounded-xl"
                              />
                            </div>
                            <div className="w-full sm:w-36 space-y-1">
                              <Label className="text-[10px] font-bold text-muted-foreground">Usuario</Label>
                              <Input
                                value={net.username || ""}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.social_networks || [])];
                                  updated[idx].username = e.target.value;
                                  setMasterFormData({ ...masterFormData, social_networks: updated });
                                }}
                                placeholder="ej: cmendoza-dev"
                                className="h-8 text-xs rounded-xl font-mono"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                                <span>URL Completa</span>
                                <span className="text-rose-500">*</span>
                              </Label>
                              <Input
                                value={net.url}
                                onChange={(e) => {
                                  const updated = [...(masterFormData.social_networks || [])];
                                  updated[idx].url = e.target.value;
                                  setMasterFormData({ ...masterFormData, social_networks: updated });
                                }}
                                placeholder="https://github.com/cmendoza-tech"
                                className="h-8 text-xs rounded-xl"
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-end pb-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={idx === 0}
                                onClick={() => {
                                  const reordered = moveArrayItem(masterFormData.social_networks || [], idx, "up");
                                  setMasterFormData({ ...masterFormData, social_networks: reordered });
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Mover arriba"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={idx === (masterFormData.social_networks?.length || 0) - 1}
                                onClick={() => {
                                  const reordered = moveArrayItem(masterFormData.social_networks || [], idx, "down");
                                  setMasterFormData({ ...masterFormData, social_networks: reordered });
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Mover abajo"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = masterFormData.social_networks?.filter((_, i) => i !== idx);
                                  setMasterFormData({ ...masterFormData, social_networks: updated });
                                }}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                title="Eliminar enlace"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 3: HISTORIAL LABORAL / EXPERIENCIA */}
                  {masterSubSection === "experience" && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Historial Completo de Empleos ({masterExpCount})</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Toda tu trayectoria laboral con viñetas cuantificadas con el framework STAR/XYZ.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newExp = {
                              id: `exp-${Date.now()}`,
                              company: "",
                              position: "",
                              location: "",
                              start_date: "",
                              end_date: "",
                              current: false,
                              summary: "",
                              highlights: [],
                            };
                            setMasterFormData({
                              ...masterFormData,
                              experience: [newExp, ...(masterFormData.experience || [])],
                            });
                          }}
                          className="h-8 px-3 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Empleo</span>
                        </Button>
                      </div>

                      {(!masterFormData.experience || masterFormData.experience.length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                          <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/60" />
                          <p className="text-xs font-bold text-foreground">Sin empleos registrados</p>
                          <p className="text-[11px] text-muted-foreground">Haz clic en &quot;Añadir Empleo&quot; para registrar tus cargos y logros laborales.</p>
                        </div>
                      )}

                      <div className="space-y-5">
                        {masterFormData.experience?.map((exp, idx) => (
                          <div key={exp.id} className="p-5 rounded-2xl border border-border bg-card/60 space-y-4 text-xs">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
                              <span className="font-bold text-sm text-foreground truncate">
                                {exp.position || "Nuevo Cargo"} — <span className="text-muted-foreground font-normal">{exp.company || "Empresa"}</span>
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.experience, idx, "up");
                                    setMasterFormData({ ...masterFormData, experience: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Subir empleo"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === masterFormData.experience.length - 1}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.experience, idx, "down");
                                    setMasterFormData({ ...masterFormData, experience: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Bajar empleo"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = masterFormData.experience.filter((_, i) => i !== idx);
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                  title="Eliminar empleo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Empresa</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].company = e.target.value;
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  placeholder="ej: Mercado Libre, Google, Startup X"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Cargo / Rol</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].position = e.target.value;
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  placeholder="ej: Senior Frontend Engineer"
                                  className="h-8 text-xs rounded-xl font-bold"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Ubicación / Modalidad</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={exp.location || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].location = e.target.value;
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  placeholder="ej: Santiago, Chile (Remoto)"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Fecha Inicio</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={exp.start_date}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].start_date = e.target.value;
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  placeholder="ej: 2022-03 o Mar 2022"
                                  className="h-8 text-xs rounded-xl font-mono"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Fecha Fin</span>
                                  <span className="text-[9px] font-normal">(Opcional si es actual)</span>
                                </Label>
                                <Input
                                  value={exp.end_date || ""}
                                  disabled={exp.current}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].end_date = e.target.value;
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  placeholder={exp.current ? "Presente" : "ej: 2024-01 o Presente"}
                                  className="h-8 text-xs rounded-xl font-mono"
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-6">
                                <input
                                  type="checkbox"
                                  id={`current-job-${exp.id}`}
                                  checked={exp.current || false}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].current = e.target.checked;
                                    if (e.target.checked) updated[idx].end_date = "Presente";
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  className="h-4 w-4 rounded accent-foreground cursor-pointer"
                                />
                                <Label htmlFor={`current-job-${exp.id}`} className="text-xs font-semibold cursor-pointer">
                                  Trabajo Actual
                                </Label>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                <span>Resumen del Rol</span>
                                <span className="text-[9px] font-normal">(Opcional)</span>
                              </Label>
                              <Input
                                value={exp.summary || ""}
                                onChange={(e) => {
                                  const updated = [...masterFormData.experience];
                                  updated[idx].summary = e.target.value;
                                  setMasterFormData({ ...masterFormData, experience: updated });
                                }}
                                placeholder="ej: Liderazgo del equipo de interfaces y arquitectura frontend..."
                                className="h-8 text-xs rounded-xl"
                              />
                            </div>

                            {/* Viñetas STAR/XYZ */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                  <span>Viñetas de Logros (Framework STAR/XYZ)</span>
                                  <span className="text-[10px] font-normal text-muted-foreground">(Recomendado)</span>
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...masterFormData.experience];
                                    updated[idx].highlights = [
                                      ...(updated[idx].highlights || []),
                                      "",
                                    ];
                                    setMasterFormData({ ...masterFormData, experience: updated });
                                  }}
                                  className="h-6 text-[11px] font-semibold rounded-lg gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Añadir Viñeta</span>
                                </Button>
                              </div>

                              {(!exp.highlights || exp.highlights.length === 0) && (
                                <p className="text-[11px] text-muted-foreground/75 italic">
                                  No hay viñetas añadidas. Haz clic en &quot;+ Añadir Viñeta&quot; para agregar logros con impacto medible.
                                </p>
                              )}

                              <div className="space-y-2">
                                {exp.highlights?.map((h, hIdx) => (
                                  <div key={hIdx} className="flex items-start gap-2 bg-background/50 p-2 rounded-xl border border-border/50">
                                    <span className="text-muted-foreground pt-1.5 font-mono text-xs">•</span>
                                    <Textarea
                                      value={h}
                                      onChange={(e) => {
                                        const updated = [...masterFormData.experience];
                                        updated[idx].highlights[hIdx] = e.target.value;
                                        setMasterFormData({ ...masterFormData, experience: updated });
                                      }}
                                      className="text-xs min-h-[44px] leading-snug rounded-lg flex-1"
                                      placeholder="ej: Diseñé e implementé una optimización que aumentó la conversión en un 28%..."
                                    />
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={hIdx === 0}
                                        onClick={() => {
                                          const reordered = moveArrayItem(exp.highlights, hIdx, "up");
                                          const updated = [...masterFormData.experience];
                                          updated[idx].highlights = reordered;
                                          setMasterFormData({ ...masterFormData, experience: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        title="Subir viñeta"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={hIdx === exp.highlights.length - 1}
                                        onClick={() => {
                                          const reordered = moveArrayItem(exp.highlights, hIdx, "down");
                                          const updated = [...masterFormData.experience];
                                          updated[idx].highlights = reordered;
                                          setMasterFormData({ ...masterFormData, experience: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        title="Bajar viñeta"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = [...masterFormData.experience];
                                          updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== hIdx);
                                          setMasterFormData({ ...masterFormData, experience: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-rose-500"
                                        title="Eliminar viñeta"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 4: HABILIDADES TÉCNICAS */}
                  {masterSubSection === "skills" && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Catálogo de Habilidades Técnicas ({masterSkillsCount})</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Organiza tus lenguajes, frameworks, librerías y herramientas por categorías.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newCat = {
                              id: `skill-${Date.now()}`,
                              category: "",
                              skills: [],
                            };
                            setMasterFormData({
                              ...masterFormData,
                              skills: [...(masterFormData.skills || []), newCat],
                            });
                          }}
                          className="h-8 px-3 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Categoría</span>
                        </Button>
                      </div>

                      {(!masterFormData.skills || masterFormData.skills.length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                          <Layers className="h-8 w-8 mx-auto text-muted-foreground/60" />
                          <p className="text-xs font-bold text-foreground">Sin categorías de habilidades registradas</p>
                          <p className="text-[11px] text-muted-foreground">Haz clic en &quot;Añadir Categoría&quot; para clasificar tus tecnologías.</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {masterFormData.skills?.map((cat, catIdx) => (
                          <div key={cat.id} className="p-5 rounded-2xl border border-border bg-card/60 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 max-w-sm space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Nombre de la Categoría</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={cat.category}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.skills];
                                    updated[catIdx].category = e.target.value;
                                    setMasterFormData({ ...masterFormData, skills: updated });
                                  }}
                                  placeholder="ej: Lenguajes, Frontend, Cloud & DevOps"
                                  className="h-8 text-xs font-bold rounded-xl"
                                />
                              </div>

                              <div className="flex items-center gap-1 shrink-0 self-end pb-0.5">
                                <span className="text-[11px] font-mono text-muted-foreground mr-1">
                                  {cat.skills.length} skills
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={catIdx === 0}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.skills, catIdx, "up");
                                    setMasterFormData({ ...masterFormData, skills: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Subir categoría"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={catIdx === masterFormData.skills.length - 1}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.skills, catIdx, "down");
                                    setMasterFormData({ ...masterFormData, skills: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Bajar categoría"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = masterFormData.skills.filter((_, i) => i !== catIdx);
                                    setMasterFormData({ ...masterFormData, skills: updated });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                  title="Eliminar categoría"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Tags e Input Interactivo de Habilidades */}
                            <div className="pt-1">
                              <TagInput
                                value={cat.skills || []}
                                onChange={(newSkills) => {
                                  const updated = [...masterFormData.skills];
                                  updated[catIdx].skills = newSkills;
                                  setMasterFormData({ ...masterFormData, skills: updated });
                                }}
                                placeholder="ej: Python, Django, FastAPI, PostgreSQL..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 5: REPOSITORIO DE PROYECTOS */}
                  {masterSubSection === "projects" && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Repositorio de Proyectos ({masterProjCount})</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Tus desarrollos, productos, arquitecturas y herramientas de código abierto.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newProj = {
                              id: `proj-${Date.now()}`,
                              name: "",
                              description: "",
                              technologies: [],
                              url: "",
                              github_url: "",
                              start_date: "",
                              end_date: "",
                              highlights: [],
                            };
                            setMasterFormData({
                              ...masterFormData,
                              projects: [newProj, ...(masterFormData.projects || [])],
                            });
                          }}
                          className="h-8 px-3 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Proyecto</span>
                        </Button>
                      </div>

                      {(!masterFormData.projects || masterFormData.projects.length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                          <FolderGit2 className="h-8 w-8 mx-auto text-muted-foreground/60" />
                          <p className="text-xs font-bold text-foreground">Sin proyectos registrados</p>
                          <p className="text-[11px] text-muted-foreground">Haz clic en &quot;Añadir Proyecto&quot; para documentar tus aplicaciones y arquitecturas.</p>
                        </div>
                      )}

                      <div className="space-y-5">
                        {masterFormData.projects?.map((proj, idx) => (
                          <div key={proj.id} className="p-5 rounded-2xl border border-border bg-card/60 space-y-4 text-xs">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
                              <span className="font-bold text-sm text-foreground truncate">
                                {proj.name || "Nuevo Proyecto"}
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.projects, idx, "up");
                                    setMasterFormData({ ...masterFormData, projects: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Subir proyecto"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === masterFormData.projects.length - 1}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.projects, idx, "down");
                                    setMasterFormData({ ...masterFormData, projects: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Bajar proyecto"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = masterFormData.projects.filter((_, i) => i !== idx);
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                  title="Eliminar proyecto"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Nombre del Proyecto</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={proj.name}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].name = e.target.value;
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  placeholder="ej: SchemaCV, CloudPlatform, FinTech Engine"
                                  className="h-8 text-xs font-bold rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>URL Demo / En Vivo</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={proj.url || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].url = e.target.value;
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  placeholder="ej: https://schemacv.vercel.app"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>URL Repositorio GitHub</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={proj.github_url || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].github_url = e.target.value;
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  placeholder="ej: https://github.com/usuario/mi-proyecto"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Fecha Inicio</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={proj.start_date || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].start_date = e.target.value;
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  placeholder="ej: 2024"
                                  className="h-8 text-xs rounded-xl font-mono"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Fecha Fin</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={proj.end_date || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].end_date = e.target.value;
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  placeholder="ej: 2024 o Presente"
                                  className="h-8 text-xs rounded-xl font-mono"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Tecnologías del Proyecto</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <TagInput
                                  value={proj.technologies || []}
                                  onChange={(newTechs) => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].technologies = newTechs;
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  placeholder="ej: Next.js, React, Tailwind CSS, Turbopack..."
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                <span>Descripción Técnica del Proyecto</span>
                                <span className="text-[9px] font-normal">(Opcional)</span>
                              </Label>
                              <Textarea
                                value={proj.description || ""}
                                onChange={(e) => {
                                  const updated = [...masterFormData.projects];
                                  updated[idx].description = e.target.value;
                                  setMasterFormData({ ...masterFormData, projects: updated });
                                }}
                                placeholder="ej: Editor y renderizador de CVs optimizados para ATS con sincronización bidireccional YAML/Visual..."
                                className="text-xs min-h-[60px] rounded-xl leading-relaxed"
                              />
                            </div>

                            {/* Viñetas de Logros del Proyecto */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                  <span>Métricas y Logros Clave del Proyecto</span>
                                  <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...masterFormData.projects];
                                    updated[idx].highlights = [
                                      ...(updated[idx].highlights || []),
                                      "",
                                    ];
                                    setMasterFormData({ ...masterFormData, projects: updated });
                                  }}
                                  className="h-6 text-[11px] font-semibold rounded-lg gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Añadir Métrica</span>
                                </Button>
                              </div>

                              {(!proj.highlights || proj.highlights.length === 0) && (
                                <p className="text-[11px] text-muted-foreground/75 italic">
                                  No hay métricas añadidas. Haz clic en &quot;+ Añadir Métrica&quot; para cuantificar el impacto del proyecto.
                                </p>
                              )}

                              <div className="space-y-2">
                                {proj.highlights?.map((h, hIdx) => (
                                  <div key={hIdx} className="flex items-start gap-2 bg-background/50 p-2 rounded-xl border border-border/50">
                                    <span className="text-muted-foreground pt-1.5 font-mono text-xs">•</span>
                                    <Textarea
                                      value={h}
                                      onChange={(e) => {
                                        const updated = [...masterFormData.projects];
                                        updated[idx].highlights[hIdx] = e.target.value;
                                        setMasterFormData({ ...masterFormData, projects: updated });
                                      }}
                                      className="text-xs min-h-[44px] leading-snug rounded-lg flex-1"
                                      placeholder="ej: Alcanzó 10,000+ usuarios activos mensuales con un tiempo de carga inferior a 1.2s..."
                                    />
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={hIdx === 0}
                                        onClick={() => {
                                          const reordered = moveArrayItem(proj.highlights, hIdx, "up");
                                          const updated = [...masterFormData.projects];
                                          updated[idx].highlights = reordered;
                                          setMasterFormData({ ...masterFormData, projects: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        title="Subir viñeta"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={hIdx === proj.highlights.length - 1}
                                        onClick={() => {
                                          const reordered = moveArrayItem(proj.highlights, hIdx, "down");
                                          const updated = [...masterFormData.projects];
                                          updated[idx].highlights = reordered;
                                          setMasterFormData({ ...masterFormData, projects: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        title="Bajar viñeta"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = [...masterFormData.projects];
                                          updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== hIdx);
                                          setMasterFormData({ ...masterFormData, projects: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-rose-500"
                                        title="Eliminar viñeta"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 6: EDUCACIÓN & FORMACIÓN ACADÉMICA */}
                  {masterSubSection === "education" && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Educación, Títulos & Honores ({masterEduCount})</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Títulos universitarios, facultades, fechas, promedios (GPA) y reconocimientos académicos.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newEdu = {
                              id: `edu-${Date.now()}`,
                              institution: "",
                              degree: "",
                              area: "",
                              location: "",
                              start_date: "",
                              end_date: "",
                              current: false,
                              gpa: "",
                              highlights: [],
                            };
                            setMasterFormData({
                              ...masterFormData,
                              education: [newEdu, ...(masterFormData.education || [])],
                            });
                          }}
                          className="h-8 px-3 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Educación</span>
                        </Button>
                      </div>

                      {(!masterFormData.education || masterFormData.education.length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                          <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground/60" />
                          <p className="text-xs font-bold text-foreground">Sin formación académica registrada</p>
                          <p className="text-[11px] text-muted-foreground">Haz clic en &quot;Añadir Educación&quot; para registrar títulos universitarios o técnicos.</p>
                        </div>
                      )}

                      <div className="space-y-5">
                        {masterFormData.education?.map((edu, idx) => (
                          <div key={edu.id} className="p-5 rounded-2xl border border-border bg-card/60 space-y-4 text-xs">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
                              <span className="font-bold text-sm text-foreground truncate">
                                {edu.degree || "Título Académico"} — <span className="text-muted-foreground font-normal">{edu.institution || "Universidad / Institución"}</span>
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.education, idx, "up");
                                    setMasterFormData({ ...masterFormData, education: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Subir educación"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === masterFormData.education.length - 1}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.education, idx, "down");
                                    setMasterFormData({ ...masterFormData, education: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Bajar educación"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = masterFormData.education.filter((_, i) => i !== idx);
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                  title="Eliminar educación"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Institución / Universidad</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].institution = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder="ej: Universidad de Chile, MIT, Platzi"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Título / Grado Académico</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].degree = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder="ej: Ingeniería Civil en Informática"
                                  className="h-8 text-xs font-bold rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Especialidad / Área</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={edu.area || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].area = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder="ej: Especialidad en Arquitectura de Software e IA"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Ubicación</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={edu.location || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].location = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder="ej: Santiago, Chile"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Fecha Inicio</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={edu.start_date || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].start_date = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder="ej: 2018"
                                  className="h-8 text-xs font-mono rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Fecha Fin / Graduación</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={edu.end_date || ""}
                                  disabled={edu.current}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].end_date = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder={edu.current ? "En curso" : "ej: 2023 o En curso"}
                                  className="h-8 text-xs font-mono rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Promedio / Honores (GPA)</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={edu.gpa || ""}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].gpa = e.target.value;
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  placeholder="ej: Distinción Máxima, Cum Laude o GPA 3.9/4.0"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-6">
                                <input
                                  type="checkbox"
                                  id={`current-edu-${edu.id}`}
                                  checked={edu.current || false}
                                  onChange={(e) => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].current = e.target.checked;
                                    if (e.target.checked) updated[idx].end_date = "En curso";
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  className="h-4 w-4 rounded accent-foreground cursor-pointer"
                                />
                                <Label htmlFor={`current-edu-${edu.id}`} className="text-xs font-semibold cursor-pointer">
                                  Actualmente Estudiando
                                </Label>
                              </div>
                            </div>

                            {/* Viñetas de Logros Académicos */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                  <span>Honores Académicos, Tesis o Logros</span>
                                  <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...masterFormData.education];
                                    updated[idx].highlights = [
                                      ...(updated[idx].highlights || []),
                                      "",
                                    ];
                                    setMasterFormData({ ...masterFormData, education: updated });
                                  }}
                                  className="h-6 text-[11px] font-semibold rounded-lg gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Añadir Logro</span>
                                </Button>
                              </div>

                              {(!edu.highlights || edu.highlights.length === 0) && (
                                <p className="text-[11px] text-muted-foreground/75 italic">
                                  No hay menciones añadidas. Haz clic en &quot;+ Añadir Logro&quot; para agregar tesis, distinciones o proyectos universitarios.
                                </p>
                              )}

                              <div className="space-y-2">
                                {edu.highlights?.map((h, hIdx) => (
                                  <div key={hIdx} className="flex items-start gap-2 bg-background/50 p-2 rounded-xl border border-border/50">
                                    <span className="text-muted-foreground pt-1.5 font-mono text-xs">•</span>
                                    <Textarea
                                      value={h}
                                      onChange={(e) => {
                                        const updated = [...masterFormData.education];
                                        updated[idx].highlights[hIdx] = e.target.value;
                                        setMasterFormData({ ...masterFormData, education: updated });
                                      }}
                                      className="text-xs min-h-[44px] leading-snug rounded-lg flex-1"
                                      placeholder="ej: Tesis de titulación con máxima distinción: Optimización de sistemas distribuidos..."
                                    />
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={hIdx === 0}
                                        onClick={() => {
                                          const reordered = moveArrayItem(edu.highlights, hIdx, "up");
                                          const updated = [...masterFormData.education];
                                          updated[idx].highlights = reordered;
                                          setMasterFormData({ ...masterFormData, education: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        title="Subir logro"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={hIdx === edu.highlights.length - 1}
                                        onClick={() => {
                                          const reordered = moveArrayItem(edu.highlights, hIdx, "down");
                                          const updated = [...masterFormData.education];
                                          updated[idx].highlights = reordered;
                                          setMasterFormData({ ...masterFormData, education: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        title="Bajar logro"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = [...masterFormData.education];
                                          updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== hIdx);
                                          setMasterFormData({ ...masterFormData, education: updated });
                                        }}
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-rose-500"
                                        title="Eliminar logro"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBSECCIÓN 7: CERTIFICACIONES & LICENCIAS */}
                  {masterSubSection === "certifications" && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Certificaciones & Licencias Oficiales ({masterCertCount})</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Certificados profesionales, diplomados y acreditaciones de la industria (AWS, Google, Microsoft, etc.).</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const newCert = {
                              id: `cert-${Date.now()}`,
                              name: "",
                              issuer: "",
                              date: "",
                              url: "",
                              summary: "",
                            };
                            setMasterFormData({
                              ...masterFormData,
                              certifications: [newCert, ...(masterFormData.certifications || [])],
                            });
                          }}
                          className="h-8 px-3 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Certificación</span>
                        </Button>
                      </div>

                      {(!masterFormData.certifications || masterFormData.certifications.length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                          <Award className="h-8 w-8 mx-auto text-muted-foreground/60" />
                          <p className="text-xs font-bold text-foreground">Sin certificaciones registradas</p>
                          <p className="text-[11px] text-muted-foreground">Haz clic en &quot;Añadir Certificación&quot; para registrar credenciales de AWS, Google, Microsoft, etc.</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {masterFormData.certifications?.map((cert, idx) => (
                          <div key={cert.id} className="p-5 rounded-2xl border border-border bg-card/60 space-y-3 text-xs">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
                              <span className="font-bold text-sm text-foreground truncate">
                                {cert.name || "Nueva Certificación"} — <span className="text-muted-foreground font-normal">{cert.issuer || "Entidad Emisora"}</span>
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.certifications || [], idx, "up");
                                    setMasterFormData({ ...masterFormData, certifications: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Subir certificación"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={idx === (masterFormData.certifications?.length || 0) - 1}
                                  onClick={() => {
                                    const reordered = moveArrayItem(masterFormData.certifications || [], idx, "down");
                                    setMasterFormData({ ...masterFormData, certifications: reordered });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Bajar certificación"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = masterFormData.certifications?.filter((_, i) => i !== idx);
                                    setMasterFormData({ ...masterFormData, certifications: updated });
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                  title="Eliminar certificación"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Nombre de la Certificación</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => {
                                    const updated = [...(masterFormData.certifications || [])];
                                    updated[idx].name = e.target.value;
                                    setMasterFormData({ ...masterFormData, certifications: updated });
                                  }}
                                  placeholder="ej: AWS Certified Solutions Architect - Associate"
                                  className="h-8 text-xs font-bold rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold flex items-center gap-0.5">
                                  <span>Entidad Emisora</span>
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => {
                                    const updated = [...(masterFormData.certifications || [])];
                                    updated[idx].issuer = e.target.value;
                                    setMasterFormData({ ...masterFormData, certifications: updated });
                                  }}
                                  placeholder="ej: Amazon Web Services, Google Cloud, Microsoft"
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>Fecha de Emisión</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={cert.date || ""}
                                  onChange={(e) => {
                                    const updated = [...(masterFormData.certifications || [])];
                                    updated[idx].date = e.target.value;
                                    setMasterFormData({ ...masterFormData, certifications: updated });
                                  }}
                                  placeholder="ej: 2024-05 o May 2024"
                                  className="h-8 text-xs font-mono rounded-xl"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>URL de Verificación / Credencial Digital</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={cert.url || ""}
                                  onChange={(e) => {
                                    const updated = [...(masterFormData.certifications || [])];
                                    updated[idx].url = e.target.value;
                                    setMasterFormData({ ...masterFormData, certifications: updated });
                                  }}
                                  placeholder="ej: https://www.credly.com/badges/..."
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <span>ID de Credencial o Resumen de Competencias</span>
                                  <span className="text-[9px] font-normal">(Opcional)</span>
                                </Label>
                                <Input
                                  value={cert.summary || ""}
                                  onChange={(e) => {
                                    const updated = [...(masterFormData.certifications || [])];
                                    updated[idx].summary = e.target.value;
                                    setMasterFormData({ ...masterFormData, certifications: updated });
                                  }}
                                  placeholder="ej: ID: AWS-849204 o Validación en arquitecturas cloud..."
                                  className="h-8 text-xs rounded-xl"
                                />
                              </div>
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
                  <h2 className="text-base font-bold text-foreground">Catálogo de 12 Plantillas ATS</h2>
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

              {/* Barra de Filtros por Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: "all", label: "Todas las Plantillas", count: 12 },
                  { id: "chile", label: "🇨🇱 Chile & LatAm", count: 1 },
                  { id: "tech", label: "💻 Tech & Silicon Valley", count: 3 },
                  { id: "executive", label: "🏛️ Harvard & Corporativo", count: 3 },
                  { id: "one_page", label: "🇨🇭 1 Página Estricta", count: 2 },
                  { id: "builder", label: "🚀 Proyectos & AI", count: 4 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTemplateCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedTemplateCategory === tab.id
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                        : "bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/60 dark:hover:bg-zinc-700/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedTemplateCategory === tab.id
                          ? "bg-zinc-700 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-800"
                          : "bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Grid de Plantillas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(
                  (selectedTemplateCategory === "chile"
                    ? ["chile_profesional"]
                    : selectedTemplateCategory === "tech"
                    ? ["tech_minimalist", "stanford_clean", "tech_compact"]
                    : selectedTemplateCategory === "executive"
                    ? ["harvard", "modern_executive", "executive_serif"]
                    : selectedTemplateCategory === "one_page"
                    ? ["compact_swiss", "tech_compact"]
                    : selectedTemplateCategory === "builder"
                    ? ["skills_first", "career_changer", "modern_minimal", "academic_international"]
                    : templateKeys) as TemplateId[]
                ).map((tempId: TemplateId) => {
                  const meta = TEMPLATE_METADATA[tempId];
                  const Icon = TEMPLATE_ICONS[tempId] || Terminal;
                  const isSelected = tempId === activeTemplate;
                  const pData = templatePreviewSample ? SAMPLE_RESUME_FULLSTACK : masterProfileData;

                  return (
                    <div
                      key={tempId}
                      onClick={() => setEnlargedTemplateId(tempId)}
                      className={`group rounded-2xl border bg-card flex flex-col justify-between overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 ${
                        isSelected ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md" : "border-border/80"
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

                        {/* Indicador de Hover para Ver Vista Previa */}
                        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-2xs p-3">
                          <div className="px-3.5 py-1.5 rounded-full bg-white/95 text-zinc-900 dark:bg-zinc-900/95 dark:text-zinc-100 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-transform group-hover:scale-105">
                            <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Ver Vista Previa Ampliada</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <Badge className="bg-emerald-600 text-white font-bold text-[9px] gap-1 shadow-sm">
                              <Check className="h-3 w-3" />
                              <span>En Uso</span>
                            </Badge>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setEnlargedTemplateId(tempId);
                          }}
                          className="w-full h-8 text-xs font-semibold rounded-xl gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Ver Vista Previa</span>
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

          {/* APARTADO: JOB TRACKER */}
          {activeSection === "job_tracker" && (
            <div className="h-full -m-6">
              <JobTrackerView />
            </div>
          )}

          {/* APARTADO 5: CONFIGURACIÓN EN ESPAÑOL ESTILO PROPEL CON STICKY SIDEBAR */}
          {activeSection === "settings" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Título Principal */}
              <div className="pb-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Configuración</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Administra tu información personal, preferencias del espacio de trabajo, cuenta de Gmail y seguridad.
                </p>
              </div>


              {/* Layout 2 Columnas Estilo Propel con Sticky Sidebar en la Izquierda */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Columna Izquierda: Menú Vertical Sticky (3 cols) */}
                <div className="lg:col-span-3 space-y-1 sticky top-0 self-start">
                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("account")}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      settingsSubTab === "account"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>Información de la Cuenta</span>
                    {settingsSubTab === "account" && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("security")}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      settingsSubTab === "security"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>Seguridad & Gmail</span>
                    {settingsSubTab === "security" && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("workspace")}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      settingsSubTab === "workspace"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>Espacio de Trabajo & Formato</span>
                    {settingsSubTab === "workspace" && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("notifications")}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      settingsSubTab === "notifications"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>Notificaciones & Alertas ATS</span>
                    {settingsSubTab === "notifications" && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("support")}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      settingsSubTab === "support"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>Centro de Ayuda & Guías ATS</span>
                    {settingsSubTab === "support" && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("terms")}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      settingsSubTab === "terms"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span>Términos & Privacidad Local</span>
                    {settingsSubTab === "terms" && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Columna Derecha: Formulario Extendido (9 cols) */}
                <div className="lg:col-span-9 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs space-y-6">
                  {/* TAB 1: INFORMACIÓN DE LA CUENTA */}
                  {settingsSubTab === "account" && (
                    <div className="space-y-6">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Información de la Cuenta</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Actualiza tu fotografía y tus datos personales principales.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (user?.name) {
                                const parts = user.name.split(" ");
                                setFirstName(parts[0] || "");
                                setLastName(parts.slice(1).join(" ") || "");
                              }
                            }}
                            className="h-8 text-xs"
                          >
                            Cancelar
                          </Button>

                          <Button
                            type="submit"
                            size="sm"
                            className={`h-8 px-4 text-xs font-semibold rounded-xl gap-1.5 ${
                              isSettingsSaved
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-foreground text-background hover:opacity-90"
                            }`}
                          >
                            {isSettingsSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                            <span>{isSettingsSaved ? "Guardado" : "Guardar Cambios"}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Fila 1: Foto de Perfil */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
                        <div className="md:col-span-4 space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">Tu fotografía</Label>
                          <p className="text-[11px] text-muted-foreground">
                            Se mostrará en tu espacio de trabajo y perfil público.
                          </p>
                        </div>

                        <div className="md:col-span-8 flex flex-col sm:flex-row items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 text-background flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                            {firstName ? firstName.charAt(0).toUpperCase() : "J"}
                          </div>

                          <div className="flex-1 w-full p-4 rounded-2xl border-2 border-dashed border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground mb-1" />
                            <span className="text-xs font-semibold text-foreground">
                              Haz clic para subir <span className="font-normal text-muted-foreground">o arrastra un archivo</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              SVG, PNG, JPG o WebP (máx. 800×800px)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/60" />

                      {/* Fila 2: Nombre */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-1">
                        <div className="md:col-span-4">
                          <Label className="text-xs font-bold text-foreground">Nombre y Apellidos</Label>
                        </div>
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Input
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Nombre"
                              className="h-8.5 text-xs rounded-xl bg-background"
                            />
                          </div>
                          <div>
                            <Input
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Apellidos"
                              className="h-8.5 text-xs rounded-xl bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/60" />

                      {/* Fila 3: Correo Electrónico & Cuenta de Google */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-1">
                        <div className="md:col-span-4 space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">Correo Gmail Principal</Label>
                          <p className="text-[10px] text-muted-foreground">Cuenta vinculada a tu perfil.</p>
                        </div>
                        <div className="md:col-span-8 space-y-1.5">
                          <div className="relative">
                            <Mail className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={settingsEmail}
                              onChange={(e) => setSettingsEmail(e.target.value)}
                              placeholder="correo@gmail.com"
                              className="h-8.5 text-xs pl-8.5 rounded-xl bg-background"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Gmail vinculado & Almacenamiento Local Activo</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Google OAuth</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/60" />

                      {/* Fila 4: Teléfono */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-1">
                        <div className="md:col-span-4">
                          <Label className="text-xs font-bold text-foreground">Teléfono de Contacto</Label>
                        </div>
                        <div className="md:col-span-8">
                          <div className="relative">
                            <Phone className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={settingsPhone}
                              onChange={(e) => setSettingsPhone(e.target.value)}
                              placeholder="+56 9 1234 5678"
                              className="h-8.5 text-xs pl-8.5 rounded-xl bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/60" />

                      {/* Fila 5: Ubicación */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-1">
                        <div className="md:col-span-4">
                          <Label className="text-xs font-bold text-foreground">Ciudad y País</Label>
                        </div>
                        <div className="md:col-span-8">
                          <div className="relative">
                            <MapPin className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={settingsLocation}
                              onChange={(e) => setSettingsLocation(e.target.value)}
                              placeholder="Santiago, Chile"
                              className="h-8.5 text-xs pl-8.5 rounded-xl bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/60" />

                      {/* Fila 6: Titular y Biografía */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-1">
                        <div className="md:col-span-4 space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">Titular y Biografía</Label>
                          <p className="text-[11px] text-muted-foreground">
                            Resumen ejecutivo de tu perfil profesional.
                          </p>
                        </div>
                        <div className="md:col-span-8 space-y-2">
                          <Input
                            value={settingsHeadline}
                            onChange={(e) => setSettingsHeadline(e.target.value)}
                            placeholder="Senior Software Engineer & Cloud Architect"
                            className="h-8.5 text-xs rounded-xl bg-background"
                          />
                          <Textarea
                            value={settingsBio}
                            onChange={(e) => setSettingsBio(e.target.value)}
                            placeholder="Escribe un breve resumen sobre tus áreas de enfoque..."
                            className="text-xs min-h-[80px] rounded-xl bg-background leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="border-t border-border/60" />

                      {/* Fila 7: Enlaces Profesionales */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-1">
                        <div className="md:col-span-4">
                          <Label className="text-xs font-bold text-foreground">Enlaces Profesionales</Label>
                        </div>
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            value={settingsGithub}
                            onChange={(e) => setSettingsGithub(e.target.value)}
                            placeholder="URL GitHub"
                            className="h-8 text-xs rounded-xl bg-background"
                          />
                          <Input
                            value={settingsLinkedin}
                            onChange={(e) => setSettingsLinkedin(e.target.value)}
                            placeholder="URL LinkedIn"
                            className="h-8 text-xs rounded-xl bg-background"
                          />
                          <Input
                            value={settingsWebsite}
                            onChange={(e) => setSettingsWebsite(e.target.value)}
                            placeholder="URL Portafolio"
                            className="h-8 text-xs rounded-xl bg-background"
                          />
                        </div>
                      </div>
                    </form>

                    {/* Integracion IA — BYOK */}
                    <div className="mt-6">
                      <div className="pb-4 border-b border-border/80 mb-4">
                        <h3 className="text-base font-bold text-foreground">Integracion IA</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Conecta tu propia API key para analizar ofertas con IA en el Job Tracker.
                        </p>
                      </div>
                      <AISettingsCard />
                    </div>
                    </div>
                  )}

                  {/* TAB 2: SEGURIDAD, CONTRASEÑA & GMAIL */}
                  {settingsSubTab === "security" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-border/80">
                        <h3 className="text-base font-bold text-foreground">Seguridad, Contraseña & Cuenta Gmail</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Administra tu contraseña de acceso y el estado de vinculación de tu cuenta de Google.
                        </p>
                      </div>

                      {/* Estado de Cuenta de Google / Gmail */}
                      <div className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">Cuenta Gmail Conectada</span>
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                                Conectado
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{settingsEmail}</p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => alert(`Tu sesión está vinculada de forma segura con ${settingsEmail}`)}
                          className="h-8 text-xs rounded-xl"
                        >
                          Gestionar Cuenta de Google
                        </Button>
                      </div>

                      {/* Formulario de Cambio de Contraseña */}
                      <form onSubmit={handleUpdatePassword} className="p-5 rounded-2xl border border-border bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Key className="h-3.5 w-3.5 text-amber-500" />
                              <span>Cambiar Contraseña</span>
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Actualiza tu contraseña para mayor seguridad.
                            </p>
                          </div>

                          <Button
                            type="submit"
                            size="sm"
                            className={`h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5 ${
                              isPasswordSaved ? "bg-emerald-600 text-white" : "bg-foreground text-background"
                            }`}
                          >
                            {isPasswordSaved ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            <span>{isPasswordSaved ? "¡Contraseña Actualizada!" : "Actualizar Contraseña"}</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Contraseña Actual</Label>
                            <Input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                              className="h-8 text-xs rounded-xl bg-background"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Nueva Contraseña</Label>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mínimo 8 caracteres"
                              className="h-8 text-xs rounded-xl bg-background"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Confirmar Contraseña</Label>
                            <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repite la nueva contraseña"
                              className="h-8 text-xs rounded-xl bg-background"
                            />
                          </div>
                        </div>
                      </form>

                      {/* Autenticación en Dos Pasos (2FA) */}
                      <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                          <span className="font-bold text-xs text-foreground">Autenticación en Dos Pasos (2FA)</span>
                          <p className="text-[11px] text-muted-foreground">
                            Añade una capa de seguridad adicional mediante código de verificación.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={is2FAEnabled}
                          onChange={(e) => setIs2FAEnabled(e.target.checked)}
                          className="h-4 w-4 rounded accent-foreground cursor-pointer"
                        />
                      </div>

                      {/* Respaldo JSON Integral */}
                      <div className="p-5 rounded-2xl border border-border bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-foreground">Exportar Copia de Seguridad JSON</div>
                          <p className="text-[11px] text-muted-foreground max-w-md">
                            Descarga un archivo JSON portable con todos tus {profiles.length} CVs y la base maestra.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleExportFullBackup}
                          className="h-8 px-4 text-xs font-semibold bg-foreground text-background rounded-xl gap-1.5 shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Descargar Respaldo</span>
                        </Button>
                      </div>

                      {/* Zona de Peligro: Eliminar Cuenta */}
                      <div className="p-5 rounded-2xl border border-red-200/80 dark:border-red-950/80 bg-red-50/30 dark:bg-red-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <Trash2 className="h-4 w-4" />
                            <span>Zona de Peligro — Eliminar Cuenta</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground max-w-md">
                            Elimina permanentemente tu cuenta, tus currículums guardados, perfil base y postulaciones. Esta acción no se puede deshacer.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="h-8 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-100/50 dark:hover:bg-red-950/40 shrink-0 cursor-pointer"
                        >
                          Eliminar Cuenta...
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ESPACIO DE TRABAJO & FORMATO */}
                  {settingsSubTab === "workspace" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-border/80">
                        <h3 className="text-base font-bold text-foreground">Preferencias del Espacio de Trabajo</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Configura los estándares predeterminados de renderizado e impresión para nuevos currículums.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Tamaño de Hoja Predeterminado</Label>
                          <select
                            value={paperSize}
                            onChange={(e) => setPaperSize(e.target.value as any)}
                            className="w-full h-8.5 px-3 text-xs rounded-xl border border-border bg-background"
                          >
                            <option value="letter">US Letter (8.5 × 11 in) — Estándar Norteamérica</option>
                            <option value="a4">A4 (210 × 297 mm) — Estándar Internacional</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Plantilla ATS Predeterminada</Label>
                          <select
                            value={activeTemplate}
                            onChange={(e) => setActiveTemplate(e.target.value as any)}
                            className="w-full h-8.5 px-3 text-xs rounded-xl border border-border bg-background"
                          >
                            {templateKeys.map((k) => (
                              <option key={k} value={k}>
                                {TEMPLATE_METADATA[k].name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-border bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-foreground">Modo Visual del Tema</h4>
                          <p className="text-[11px] text-muted-foreground">Alterna entre tema claro y oscuro de alto contraste.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleDarkMode}
                          className="h-8 text-xs gap-1.5 rounded-xl border-border"
                        >
                          {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                          <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: NOTIFICACIONES & ALERTAS */}
                  {settingsSubTab === "notifications" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-border/80">
                        <h3 className="text-base font-bold text-foreground">Notificaciones & Asistencia de Redacción</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Controla las guías y advertencias automatizadas durante la edición de tu CV.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
                          <div className="space-y-0.5 pr-4">
                            <span className="font-bold text-xs text-foreground">Alertas de Desbordamiento de 1 Hoja</span>
                            <p className="text-[11px] text-muted-foreground">
                              Muestra la línea de corte en tiempo real cuando el texto pase a la página 2.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notif1PageWarning}
                            onChange={(e) => setNotif1PageWarning(e.target.checked)}
                            className="h-4 w-4 rounded accent-foreground cursor-pointer"
                          />
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
                          <div className="space-y-0.5 pr-4">
                            <span className="font-bold text-xs text-foreground">Validación de Sintaxis YAML en Tiempo Real</span>
                            <p className="text-[11px] text-muted-foreground">
                              Resalta errores de indentación y formato en el editor de código CodeMirror.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifYamlSync}
                            onChange={(e) => setNotifYamlSync(e.target.checked)}
                            className="h-4 w-4 rounded accent-foreground cursor-pointer"
                          />
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
                          <div className="space-y-0.5 pr-4">
                            <span className="font-bold text-xs text-foreground">Recomendaciones del Framework STAR / XYZ</span>
                            <p className="text-[11px] text-muted-foreground">
                              Sugiere verbos de acción y estructuras cuantificables para tus logros.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifStarSuggestions}
                            onChange={(e) => setNotifStarSuggestions(e.target.checked)}
                            className="h-4 w-4 rounded accent-foreground cursor-pointer"
                          />
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
                          <div className="space-y-0.5 pr-4">
                            <span className="font-bold text-xs text-foreground">Auto-Guardado Local Continuo (Local-First)</span>
                            <p className="text-[11px] text-muted-foreground">
                              Sincroniza cada cambio automáticamente en el almacenamiento local del navegador.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifAutoSave}
                            onChange={(e) => setNotifAutoSave(e.target.checked)}
                            className="h-4 w-4 rounded accent-foreground cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: CENTRO DE AYUDA & GUÍAS ATS */}
                  {settingsSubTab === "support" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-border/80">
                        <h3 className="text-base font-bold text-foreground">Centro de Ayuda & Guías ATS</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Documentación, mejores prácticas algorítmicas y estándares de ingeniería de currículum.
                        </p>
                      </div>

                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={supportSearchQuery}
                          onChange={(e) => setSupportSearchQuery(e.target.value)}
                          placeholder="Buscar guías ATS, estándares tipográficos, reglas de parseo..."
                          className="h-9 text-xs pl-9 rounded-xl bg-background border-border/80"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <div className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Guía de Compatibilidad ATS (Workday, Taleo, Greenhouse, Lever)</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Por qué una estructura plana de 1 columna evita el 98% de descartes automáticos.
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <FileCheck className="h-3.5 w-3.5 text-blue-500" />
                              <span>Estrategias para condensar tu CV a 1 página estricta</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Técnicas de densidad tipográfica y síntesis de viñetas para mantener el impacto en 1 hoja.
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              <span>Framework STAR / XYZ para viñetas cuantificadas</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Estructura: Acción + Contexto + Métrica de Resultado (ej. "Redujo latencia en 38%").
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <FileCode className="h-3.5 w-3.5 text-purple-500" />
                              <span>Exportación Vectorial (PDF) vs Semántica (Word DOCX)</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Diferencias entre motores de renderizado y cuándo conviene postular en DOCX o PDF.
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: TÉRMINOS & PRIVACIDAD LOCAL */}
                  {settingsSubTab === "terms" && (
                    <div className="space-y-4">
                      <div className="pb-3 border-b border-border/80">
                        <h3 className="text-base font-bold text-foreground">Términos del Servicio & Privacidad Local</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SchemaCV está diseñado bajo principios estrictos de privacidad Local-First.
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                        <p>
                          1. <strong>Arquitectura Local-First:</strong> Todos tus currículums, perfiles y datos de carrera se guardan directamente en el LocalStorage de tu navegador. Ningún dato sensible es almacenado en servidores externos sin tu consentimiento explícito.
                        </p>
                        <p>
                          2. <strong>Extracción con IA:</strong> Al utilizar el importador de PDF con IA, los archivos se procesan temporalmente de forma cifrada mediante microservicios y se eliminan inmediatamente tras extraer la estructura.
                        </p>
                        <p>
                          3. <strong>Estándares Abiertos:</strong> Tu código de currículum es 100% compatible con esquemas abiertos YAML (especificación RenderCV), lo que te permite versionar tu carrera en Git de forma libre e independiente.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Auditoría de Formato ATS */}
      {auditResumeData && (
        <ATSAuditModal
          isOpen={Boolean(auditResumeData)}
          onClose={() => setAuditResumeData(null)}
          resumeData={auditResumeData}
          title={auditModalTitle}
        />
      )}

      {/* Asistente de Creación de CV */}
      <CreateResumeWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={onOpenWorkspace}
      />
      <AuthModal />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Modal de Vista Previa Ampliada de Plantilla ATS */}
      <TemplatePreviewModal
        open={Boolean(enlargedTemplateId)}
        onOpenChange={(open) => {
          if (!open) setEnlargedTemplateId(null);
        }}
        templateId={enlargedTemplateId}
        onApplyTemplate={(tempId, withSample) => {
          setActiveTemplate(tempId);
          if (withSample) {
            setResumeData(SAMPLE_RESUME_FULLSTACK);
          }
          setEnlargedTemplateId(null);
          onOpenWorkspace();
        }}
        userResumeData={masterProfileData}
        initialPaperSize={paperSize}
      />
    </div>
  );
};
