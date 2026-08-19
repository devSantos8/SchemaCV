"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeData, TemplateId } from "@/types/resume";
import { SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import { TEMPLATE_METADATA } from "@/components/templates/TemplateRenderer";
import {
  Sparkles,
  Upload,
  FileText,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  GraduationCap,
  Terminal,
  Briefcase,
  Loader2,
  FileUp,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Code2,
  Server,
  FileCode2,
  LayoutGrid,
  Database,
  X,
  BookOpen,
  Cpu,
  Minimize2,
  GitFork,
  Globe2,
} from "lucide-react";

interface CreateResumeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type StartMethod = "master_base" | "ai_upload" | "ai_text" | "preset_fullstack" | "preset_backend" | "preset_lead" | "blank";

const PRESET_ROLES = [
  {
    id: "master_base",
    title: "Mi Perfil Base (Información Completa)",
    description: "Carga toda tu trayectoria base para seleccionarla y condensarla en una sola hoja.",
    roleName: "Perfil Personalizado desde Base",
    template: "tech_minimalist" as TemplateId,
    icon: Database,
  },
  {
    id: "preset_fullstack",
    title: "Full Stack & Cloud Engineer",
    description: "React, Next.js, Node.js, TypeScript, Docker y CI/CD.",
    roleName: "Senior Full Stack & Cloud Developer",
    template: "tech_minimalist" as TemplateId,
    icon: Code2,
  },
  {
    id: "preset_backend",
    title: "Backend & Systems Architect",
    description: "APIs de alta concurrencia, PostgreSQL y microservicios.",
    roleName: "Backend Engineer & Systems Architect",
    template: "harvard" as TemplateId,
    icon: Server,
  },
  {
    id: "preset_lead",
    title: "Tech Lead & Engineering Manager",
    description: "Liderazgo técnico, metodologías ágiles y arquitectura.",
    roleName: "Tech Lead / Engineering Manager",
    template: "modern_executive" as TemplateId,
    icon: Briefcase,
  },
  {
    id: "blank",
    title: "Lienzo en Blanco Optimizado",
    description: "Estructura limpia para redactar desde cero.",
    roleName: "Ingeniero de Software",
    template: "tech_minimalist" as TemplateId,
    icon: FileCode2,
  },
];

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

const STEPS = [
  {
    num: 1,
    title: "Punto de Partida",
    desc: "IA, plantillas o lienzo",
  },
  {
    num: 2,
    title: "Identidad & Rol",
    desc: "Nombre, cargo y contacto",
  },
  {
    num: 3,
    title: "Plantilla ATS",
    desc: "4 formatos aprobados",
  },
];

export const CreateResumeWizard: React.FC<CreateResumeWizardProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const { createProfile, loadImportedResume, setActiveTemplate, masterProfileData } = useResumeStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [startMethod, setStartMethod] = useState<StartMethod>("master_base");

  // Datos del Paso 2
  const [profileName, setProfileName] = useState("CV desde Perfil Base");
  const [targetRole, setTargetRole] = useState(masterProfileData?.headline || "Senior Full Stack & Cloud Developer");
  const [candidateName, setCandidateName] = useState(masterProfileData?.name || "Carlos Mendoza Rivera");
  const [candidateEmail, setCandidateEmail] = useState(masterProfileData?.email || "carlos.mendoza.dev@example.com");
  const [candidatePhone, setCandidatePhone] = useState(masterProfileData?.phone || "+1 (555) 382-9102");
  const [candidateLocation, setCandidateLocation] = useState(masterProfileData?.location || "San Francisco, CA (Remoto)");

  // Ingesta con IA
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [parsedAiData, setParsedAiData] = useState<ResumeData | null>(null);

  // Datos del Paso 3
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("tech_minimalist");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manejador de subida de archivo para el paso 1
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAiError(null);
    }
  };

  // Procesar Ingesta con IA en el Paso 1
  const handleProcessAi = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      let response;
      if (startMethod === "ai_upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch("/api/parse-cv", { method: "POST", body: formData });
      } else if (startMethod === "ai_text" && pastedText.trim()) {
        response = await fetch("/api/parse-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText }),
        });
      } else {
        throw new Error("Por favor proporciona un archivo o texto para extraer.");
      }

      const res = await response.json();
      if (!response.ok || !res.success || !res.data) {
        throw new Error(res.error || "No se pudo extraer la información del documento.");
      }

      setParsedAiData(res.data);
      if (res.data.name) setCandidateName(res.data.name);
      if (res.data.headline) {
        setTargetRole(res.data.headline);
        setProfileName(`Perfil ${res.data.headline}`);
      }
      if (res.data.email) setCandidateEmail(res.data.email);
      if (res.data.phone) setCandidatePhone(res.data.phone);
      if (res.data.location) setCandidateLocation(res.data.location);

      setStep(2);
    } catch (err: any) {
      setAiError(err.message || "Error al procesar el CV.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (startMethod === "ai_upload" || startMethod === "ai_text") {
        handleProcessAi();
      } else if (startMethod === "blank") {
        setProfileName("Nuevo CV en Blanco");
        setTargetRole("Ingeniero de Software");
        setStep(2);
      } else {
        const preset = PRESET_ROLES.find((p) => p.id === startMethod);
        if (preset) {
          setProfileName(`Perfil ${preset.title}`);
          setTargetRole(preset.roleName);
          setSelectedTemplate(preset.template);
        }
        setStep(2);
      }
    } else if (step === 2) {
      if (!candidateName.trim()) {
        setCandidateName("Candidato Profesional");
      }
      if (!targetRole.trim()) {
        setTargetRole("Ingeniero de Software");
      }
      setStep(3);
    }
  };

  const handleFinish = () => {
    let finalResumeData: ResumeData;

    if (parsedAiData) {
      finalResumeData = {
        ...parsedAiData,
        name: candidateName,
        headline: targetRole,
        email: candidateEmail || parsedAiData.email,
        phone: candidatePhone || parsedAiData.phone,
        location: candidateLocation || parsedAiData.location,
      };
    } else if (startMethod === "blank") {
      finalResumeData = {
        name: candidateName,
        headline: targetRole,
        summary: "Resumen profesional enfocado en el logro de resultados técnicos y métricas de impacto.",
        email: candidateEmail,
        phone: candidatePhone,
        location: candidateLocation,
        social_networks: [],
        skills: [
          {
            id: "skills-core",
            category: "Languages & Core",
            skills: ["TypeScript", "Python", "SQL"],
          },
        ],
        experience: [
          {
            id: `exp-${Date.now()}-1`,
            company: "Empresa Tecnológica",
            position: targetRole,
            location: candidateLocation,
            start_date: "2024",
            end_date: "Presente",
            current: true,
            highlights: [
              "Desarrollé funcionalidades clave utilizando tecnologías modernas, logrando optimizaciones medibles.",
            ],
            summary: "",
          },
        ],
        projects: [],
        education: [
          {
            id: `edu-${Date.now()}-1`,
            institution: "Universidad / Instituto",
            degree: "Ingeniería en Informática",
            area: "Desarrollo de Software",
            location: candidateLocation,
            start_date: "2020",
            end_date: "2024",
            current: false,
            highlights: [],
          },
        ],
        certifications: [],
        custom_sections: [],
        section_order: ["summary", "skills", "experience", "projects", "education", "certifications"],
      };
    } else if (startMethod === "master_base") {
      finalResumeData = {
        ...masterProfileData,
        name: candidateName,
        headline: targetRole,
        email: candidateEmail || masterProfileData.email,
        phone: candidatePhone || masterProfileData.phone,
        location: candidateLocation || masterProfileData.location,
      };
    } else {
      finalResumeData = {
        ...SAMPLE_RESUME_FULLSTACK,
        name: candidateName,
        headline: targetRole,
        email: candidateEmail,
        phone: candidatePhone,
        location: candidateLocation,
      };
    }

    createProfile(profileName, targetRole, false);
    loadImportedResume(finalResumeData);
    setActiveTemplate(selectedTemplate);

    onOpenChange(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[880px] p-0 overflow-hidden bg-card border-border/80 shadow-2xl rounded-2xl flex flex-col md:flex-row max-h-[88vh] outline-none">
        {/* SIDEBAR LATERAL: PASOS Y ESTADO (Columna Izquierda) */}
        <div className="w-full md:w-64 bg-zinc-50/80 dark:bg-zinc-900/60 p-6 border-b md:border-b-0 md:border-r border-border/60 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Header Sidebar */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground tracking-tight">
                  SchemaCV Wizard
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  Asistente de Creación ATS
                </p>
              </div>
            </div>

            {/* Lista de Pasos */}
            <div className="space-y-2">
              {STEPS.map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;

                return (
                  <div
                    key={s.num}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-zinc-800/90 shadow-2xs border border-border/60"
                        : "opacity-60"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors duration-200 ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950"
                          : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground leading-none">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tip ATS en el pie del Sidebar */}
          <div className="hidden md:flex items-center gap-2 p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/40 border border-border/40 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Optimizador de compatibilidad 100% con filtros ATS.</span>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL DEL ASISTENTE (Columna Derecha) */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 overflow-y-auto max-h-[75vh] md:max-h-[85vh]">
          <div className="space-y-5">
            {/* Header del paso actual */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {step === 1 && "Selecciona el punto de partida de tu CV"}
                  {step === 2 && "Completa tu información profesional"}
                  {step === 3 && "Elige tu plantilla ATS predeterminada"}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
                  Paso {step} de 3
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {step === 1 && "Puedes importar un currículum existente con inteligencia artificial o elegir una base técnica estructurada."}
                {step === 2 && "Define el nombre de esta versión y tu cargo objetivo para enfocar el análisis."}
                {step === 3 && "Todas nuestras plantillas están garantizadas para pasar los filtros de selección de Workday, Taleo y Greenhouse."}
              </p>
            </div>

            {/* PASO 1: PUNTO DE PARTIDA */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                {/* 1.1 Ingesta con IA (2 Tarjetas Destacadas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Opción IA: Subir PDF */}
                  <div
                    onClick={() => setStartMethod("ai_upload")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative group ${
                      startMethod === "ai_upload"
                        ? "border-foreground bg-zinc-50 dark:bg-zinc-900 shadow-sm ring-1 ring-foreground"
                        : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Upload className="h-4 w-4" />
                      </div>
                      {startMethod === "ai_upload" && (
                        <Check className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-foreground mb-0.5">
                      Importar PDF con IA
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Extrae experiencia, proyectos y clasifica habilidades técnicas automáticamente.
                    </p>
                  </div>

                  {/* Opción IA: Pegar Texto / LinkedIn */}
                  <div
                    onClick={() => setStartMethod("ai_text")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative group ${
                      startMethod === "ai_text"
                        ? "border-foreground bg-zinc-50 dark:bg-zinc-900 shadow-sm ring-1 ring-foreground"
                        : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      {startMethod === "ai_text" && (
                        <Check className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-foreground mb-0.5">
                      Pegar Texto o LinkedIn
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Pega el texto de tu perfil y la IA lo estructurará bajo el esquema ATS.
                    </p>
                  </div>
                </div>

                {/* Sub-interfaz si se elige Subir PDF */}
                {startMethod === "ai_upload" && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-foreground/60 p-4 rounded-xl text-center cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-200 animate-in fade-in-50 duration-200"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <FileUp className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground" />
                    {file ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">{file.name}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Archivo listo para procesar ({(file.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Haz clic aquí para seleccionar tu archivo <strong className="text-foreground">PDF</strong> o <strong className="text-foreground">TXT</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Sub-interfaz si se elige Pegar Texto */}
                {startMethod === "ai_text" && (
                  <div className="animate-in fade-in-50 duration-200">
                    <Textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Pega aquí el contenido de tu currículum o perfil de LinkedIn..."
                      className="text-xs min-h-[100px] bg-background"
                    />
                  </div>
                )}

                {/* 1.2 Bases Técnicas Recomendadas (Grid 2x2 Amplio) */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold text-foreground">
                    O selecciona una base técnica prediseñada:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRESET_ROLES.map((preset) => {
                      const PresetIcon = preset.icon;
                      const isSelected = startMethod === preset.id;

                      return (
                        <div
                          key={preset.id}
                          onClick={() => setStartMethod(preset.id as StartMethod)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-2.5 ${
                            isSelected
                              ? "border-foreground bg-zinc-50 dark:bg-zinc-900 shadow-2xs ring-1 ring-foreground"
                              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-foreground mt-0.5 shrink-0">
                            <PresetIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">
                                {preset.title}
                              </span>
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-foreground shrink-0 ml-1" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {aiError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2: DATOS DE IDENTIDAD & ROL OBJETIVO */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre del Perfil de CV</Label>
                    <div className="relative">
                      <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="ej. Perfil Full Stack & Cloud"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Cargo / Rol Objetivo *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="ej. Senior Full Stack Engineer"
                        className="h-8 text-xs pl-8 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Nombre Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="ej. Carlos Mendoza Rivera"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="tu.correo@ejemplo.com"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Teléfono de Contacto</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Ubicación (Ciudad, País)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={candidateLocation}
                        onChange={(e) => setCandidateLocation(e.target.value)}
                        placeholder="Santiago, Chile"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: ELECCIÓN DE PLANTILLA ATS */}
            {step === 3 && (
              <div className="space-y-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(TEMPLATE_METADATA) as TemplateId[]).map((tempId) => {
                    const meta = TEMPLATE_METADATA[tempId];
                    const Icon = TEMPLATE_ICONS[tempId] || Terminal;
                    const isSelected = selectedTemplate === tempId;

                    return (
                      <div
                        key={tempId}
                        onClick={() => setSelectedTemplate(tempId)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? "border-foreground bg-zinc-50 dark:bg-zinc-900 shadow-sm ring-1 ring-foreground"
                            : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-foreground">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                {meta.name}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-foreground shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {meta.description}
                          </p>
                        </div>
                        <div className="text-[9px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
                          Recomendado: {meta.bestFor}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BARRA INFERIOR DE ACCIONES */}
          <div className="flex items-center justify-between pt-5 border-t border-border/60 mt-4">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="h-8 text-xs gap-1.5 rounded-lg"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Paso Anterior</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
            )}

            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground"
                >
                  Cerrar
                </Button>
              )}

              {step < 3 ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={
                    isLoadingAi ||
                    (step === 1 && (
                      (startMethod === "ai_upload" && !file) ||
                      (startMethod === "ai_text" && !pastedText.trim())
                    ))
                  }
                  className="h-8 px-4 text-xs gap-1.5 font-semibold rounded-lg bg-foreground text-background shadow-sm hover:opacity-90 transition-all"
                >
                  {isLoadingAi ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Extrayendo con IA...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  className="h-8 px-4 text-xs gap-1.5 font-semibold rounded-lg bg-foreground text-background shadow-sm hover:opacity-90 transition-all"
                >
                  <span>Crear y Abrir en Editor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
