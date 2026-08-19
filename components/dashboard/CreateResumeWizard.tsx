"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeData, TemplateId, ResumeProfile } from "@/types/resume";
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
  FileCode2,
} from "lucide-react";

interface CreateResumeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type StartMethod = "ai_upload" | "ai_text" | "preset_fullstack" | "preset_backend" | "blank";

const PRESET_ROLES = [
  {
    id: "preset_fullstack",
    title: "Full Stack & DevOps Engineer",
    description: "Stack React, Next.js, Node.js, TypeScript, Docker y CI/CD pipelines.",
    roleName: "Senior Full Stack & Cloud Developer",
    template: "tech_minimalist" as TemplateId,
  },
  {
    id: "preset_backend",
    title: "Backend & Systems Architect",
    description: "APIs de alta concurrencia, PostgreSQL, microservicios y arquitectura cloud.",
    roleName: "Backend Engineer & Systems Architect",
    template: "harvard" as TemplateId,
  },
  {
    id: "preset_lead",
    title: "Tech Lead & Engineering Manager",
    description: "Liderazgo técnico, metodologías ágiles, arquitectura limpia y métricas de negocio.",
    roleName: "Tech Lead / Engineering Manager",
    template: "modern_executive" as TemplateId,
  },
];

const TEMPLATE_ICONS: Record<TemplateId, React.ElementType> = {
  harvard: GraduationCap,
  tech_minimalist: Terminal,
  modern_executive: Briefcase,
  skills_first: Layers,
};

export const CreateResumeWizard: React.FC<CreateResumeWizardProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const { createProfile, setActiveProfile, loadImportedResume, setActiveTemplate } =
    useResumeStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [startMethod, setStartMethod] = useState<StartMethod>("preset_fullstack");

  // Datos del Paso 2
  const [profileName, setProfileName] = useState("Mi Currículum Profesional");
  const [targetRole, setTargetRole] = useState("Desarrollador Full Stack & DevOps");
  const [candidateName, setCandidateName] = useState("Joain Matias Monroy");
  const [candidateEmail, setCandidateEmail] = useState("matiasmonroy483@gmail.com");
  const [candidatePhone, setCandidatePhone] = useState("+56 9 4900 2793");
  const [candidateLocation, setCandidateLocation] = useState("Santiago, Chile");

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

  const handleNextFromStep1 = () => {
    if (startMethod === "ai_upload" || startMethod === "ai_text") {
      handleProcessAi();
    } else if (startMethod === "blank") {
      setProfileName("Nuevo CV en Blanco");
      setTargetRole("Ingeniero de Software");
      setStep(2);
    } else {
      // Presets
      const preset = PRESET_ROLES.find((p) => p.id === startMethod);
      if (preset) {
        setProfileName(`Perfil ${preset.title}`);
        setTargetRole(preset.roleName);
        setSelectedTemplate(preset.template);
      }
      setStep(2);
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
              "Desarrollé funcionalidades clave utilizando [tecnología], logrando [métrica cuantificable].",
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
    } else {
      // Usar datos base enriquecidos
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
      <DialogContent className="max-w-2xl bg-card border-border p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold">
                Asistente de Creación de Currículum ATS
              </DialogTitle>
            </div>
            <span className="text-xs font-mono font-semibold text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              Paso {step} de 3
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 1 && "Elige cómo deseas iniciar la estructura de tu nuevo currículum."}
            {step === 2 && "Personaliza tu identidad profesional y el rol objetivo."}
            {step === 3 && "Selecciona la plantilla ATS nativa que mejor represente tu perfil."}
          </DialogDescription>
        </DialogHeader>

        {/* PASO 1: PUNTO DE PARTIDA */}
        {step === 1 && (
          <div className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Opción IA: Subir PDF */}
              <div
                onClick={() => setStartMethod("ai_upload")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  startMethod === "ai_upload"
                    ? "border-foreground bg-zinc-50 dark:bg-zinc-900/80 ring-1 ring-foreground"
                    : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    Importar PDF con IA
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Extrae experiencia, proyectos y clasifica habilidades automáticamente.
                </p>
              </div>

              {/* Opción IA: Pegar Texto / LinkedIn */}
              <div
                onClick={() => setStartMethod("ai_text")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  startMethod === "ai_text"
                    ? "border-foreground bg-zinc-50 dark:bg-zinc-900/80 ring-1 ring-foreground"
                    : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    Pegar Texto / LinkedIn
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Pega texto de tu perfil y la IA lo estructurará bajo el formato ATS.
                </p>
              </div>
            </div>

            {/* Sub-formulario si se selecciona archivo PDF */}
            {startMethod === "ai_upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border p-4 rounded-lg text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                {file ? (
                  <p className="text-xs font-semibold text-foreground">{file.name}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Haz clic para seleccionar tu archivo PDF o TXT
                  </p>
                )}
              </div>
            )}

            {/* Sub-formulario si se selecciona pegar texto */}
            {startMethod === "ai_text" && (
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Pega aquí el contenido de tu CV o perfil de LinkedIn..."
                className="text-xs min-h-[110px]"
              />
            )}

            {/* Separador de Plantillas Pre-configuradas */}
            <div className="pt-2 border-t border-border">
              <Label className="text-xs font-semibold text-foreground mb-2 block">
                O empezar con una base profesional recomendada:
              </Label>
              <div className="space-y-2">
                {PRESET_ROLES.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setStartMethod(preset.id as StartMethod)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                      startMethod === preset.id
                        ? "border-foreground bg-zinc-50 dark:bg-zinc-900/80 ring-1 ring-foreground"
                        : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">{preset.title}</div>
                      <div className="text-[11px] text-muted-foreground">{preset.description}</div>
                    </div>
                    {startMethod === preset.id && (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                ))}

                {/* En blanco */}
                <div
                  onClick={() => setStartMethod("blank")}
                  className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    startMethod === "blank"
                      ? "border-foreground bg-zinc-50 dark:bg-zinc-900/80 ring-1 ring-foreground"
                      : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-foreground">Lienzo en Blanco</div>
                    <div className="text-[11px] text-muted-foreground">
                      Empieza desde cero con la estructura limpia y validada.
                    </div>
                  </div>
                  {startMethod === "blank" && (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {aiError && (
              <div className="flex items-center gap-2 p-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>
        )}

        {/* PASO 2: DATOS DE IDENTIDAD & ROL OBJETIVO */}
        {step === 2 && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre del Perfil de CV</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="ej. Perfil Backend & Cloud"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Rol / Cargo Objetivo *</Label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="ej. Senior Full Stack Engineer"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nombre Completo *</Label>
                <Input
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Correo Electrónico</Label>
                <Input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ubicación (Ciudad, País)</Label>
                <Input
                  value={candidateLocation}
                  onChange={(e) => setCandidateLocation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: ELECCIÓN DE PLANTILLA ATS */}
        {step === 3 && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(TEMPLATE_METADATA) as TemplateId[]).map((tempId) => {
                const meta = TEMPLATE_METADATA[tempId];
                const Icon = TEMPLATE_ICONS[tempId] || Terminal;
                const isSelected = selectedTemplate === tempId;

                return (
                  <div
                    key={tempId}
                    onClick={() => setSelectedTemplate(tempId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? "border-foreground bg-zinc-50 dark:bg-zinc-900/80 ring-1 ring-foreground"
                        : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-foreground">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{meta.name}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {meta.description}
                    </p>
                    <div className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded">
                      Ideal para: {meta.bestFor}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botones de Navegación del Wizard */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="h-8 text-xs gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Atrás</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>

            {step < 3 ? (
              <Button
                size="sm"
                onClick={handleNextFromStep1}
                disabled={isLoadingAi || (startMethod === "ai_upload" && !file) || (startMethod === "ai_text" && !pastedText.trim())}
                className="h-8 text-xs gap-1 font-semibold"
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Extrayendo datos...</span>
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
                className="h-8 text-xs gap-1 font-semibold bg-foreground text-background"
              >
                <span>Crear y Abrir en Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
