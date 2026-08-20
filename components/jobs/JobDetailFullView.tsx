"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
  Trash2,
  Copy,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Award,
  Heart,
  Briefcase,
  Globe,
  FileText,
  Send,
  HelpCircle,
  Pencil,
  Bot,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { ApplicationStatus, Keyword } from "@/types/jobs";
import { STATUS_LABELS } from "@/types/jobs";
import type { EvaluationReport } from "@/types/evaluator";
import { AIChat } from "@/components/jobs/AIChat";
import { ScoreProjectorSimulator } from "@/components/jobs/evaluate/ScoreProjectorSimulator";
import { runATSEvaluationPipeline } from "@/lib/ats";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobDetailFullViewProps {
  applicationId: string;
  onBack: () => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  "bookmarked",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "closed",
];

const STATUS_ACTIVE_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs",
  applied: "bg-blue-600 text-white shadow-xs ring-1 ring-blue-500/50",
  interviewing: "bg-violet-600 text-white shadow-xs ring-1 ring-violet-500/50",
  offer: "bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500/50",
  rejected: "bg-red-600 text-white shadow-xs ring-1 ring-red-500/50",
  closed: "bg-zinc-600 text-white shadow-xs ring-1 ring-zinc-500/50",
};

// Parser inteligente de descripciones de empleo
function parseJobDescription(text: string) {
  if (!text || !text.trim()) {
    return {
      minimumQualifications: [],
      preferredQualifications: [],
      aboutTheJob: "",
      hasStructure: false,
    };
  }

  const minQualRegex = /(?:minimum qualifications|requisitos m[ií]nimos|requirements|requisitos obligatorios|lo que buscamos|perfil requerido)[\s:]*([\s\S]*?)(?=(?:preferred qualifications|requisitos deseados|requisitos valorados|deseables|nice to have|plus|about the job|acerca del empleo|responsabilidades|responsibilities|funciones|$))/i;
  const prefQualRegex = /(?:preferred qualifications|requisitos deseados|requisitos valorados|deseables|nice to have|plus|valoramos)[\s:]*([\s\S]*?)(?=(?:about the job|acerca del empleo|acerca de la empresa|responsabilidades|responsibilities|funciones|$))/i;
  const aboutRegex = /(?:about the job|acerca del empleo|descripci[oó]n del puesto|acerca de la empresa|overview|resumen del rol)[\s:]*([\s\S]*?)(?=(?:minimum qualifications|preferred qualifications|requisitos|$))/i;

  const minMatch = text.match(minQualRegex);
  const prefMatch = text.match(prefQualRegex);
  const aboutMatch = text.match(aboutRegex);

  const cleanBullets = (raw: string) => {
    return raw
      .split(/\n+/)
      .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
      .filter((line) => line.length > 5);
  };

  const hasStructure = Boolean(minMatch || prefMatch);

  // Si no hay encabezados explícitos, extraer bullets genéricos
  const fallbackBullets = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => /^[-•*]\s*/.test(l) || (l.length > 20 && l.length < 160))
    .map((l) => l.replace(/^[-•*]\s*/, ""));

  return {
    minimumQualifications: minMatch
      ? cleanBullets(minMatch[1])
      : fallbackBullets.slice(0, 4),
    preferredQualifications: prefMatch
      ? cleanBullets(prefMatch[1])
      : fallbackBullets.slice(4, 8),
    aboutTheJob: aboutMatch
      ? aboutMatch[1].trim()
      : text.trim(),
    hasStructure,
  };
}

export function JobDetailFullView({ applicationId, onBack }: JobDetailFullViewProps) {
  const {
    applications,
    updateApplication,
    deleteApplication,
    duplicateApplication,
    saveEvaluation,
    getLatestEvaluation,
  } = useJobsStore();

  const { profiles, resumeData, masterProfileData, createProfileFromMaster } = useResumeStore();
  const { enabled: aiEnabled } = useAISettingsStore();

  const application = applications.find((a) => a.id === applicationId);

  const [activePrepSection, setActivePrepSection] = useState<"tailor" | "interview" | "cover_letter">("tailor");
  const [showAdvancedAts, setShowAdvancedAts] = useState(false);
  const [activeAtsTab, setActiveAtsTab] = useState<"requirements" | "ats" | "simulation" | "raw_text">("requirements");
  const [showChat, setShowChat] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("active");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isScrapingDesc, setIsScrapingDesc] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [notesInput, setNotesInput] = useState(application?.notes || "");
  const [descInput, setDescInput] = useState(application?.description || "");
  const [filterImportance, setFilterImportance] = useState<"all" | "must_have" | "nice_to_have">("all");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [expandedInterviewQuestion, setExpandedInterviewQuestion] = useState<number | null>(0);

  // Keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showChat) {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, showChat]);

  // Cargar último reporte guardado
  useEffect(() => {
    if (application) {
      const existing = getLatestEvaluation(application.id);
      if (existing) {
        setReport(existing);
      }
      setNotesInput(application.notes || "");
      setDescInput(application.description || "");
    }
  }, [application?.id]);

  const currentResumeData = useMemo(() => {
    if (selectedProfileId === "master") return masterProfileData;
    if (selectedProfileId === "active") return resumeData;
    const found = profiles.find((p) => p.id === selectedProfileId);
    return found ? found.data : resumeData;
  }, [selectedProfileId, masterProfileData, resumeData, profiles]);

  // Parsear la descripción en secciones
  const parsedJob = useMemo(() => parseJobDescription(descInput), [descInput]);

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-sm text-zinc-500">Postulación no encontrada.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl cursor-pointer"
        >
          Volver al tablero
        </button>
      </div>
    );
  }

  const { title, company, status, location, salary, url, portal, activity } = application;

  const isSaved = status === "bookmarked";

  const handleToggleSave = () => {
    const nextStatus: ApplicationStatus = isSaved ? "applied" : "bookmarked";
    updateApplication(application.id, { status: nextStatus });
    toast.success(isSaved ? "Movido a Postuladas" : "Guardado en Favoritos");
  };

  const handleSendApplication = () => {
    if (url) {
      window.open(url, "_blank");
    }
    if (status === "bookmarked") {
      updateApplication(application.id, { status: "applied" });
    }
    toast.success("Abriendo portal de postulación...");
  };

  async function handleRunEvaluation() {
    if (!application || !descInput.trim()) return;
    setIsEvaluating(true);
    try {
      const newReport = await runATSEvaluationPipeline({
        jobId: application.id,
        jobTitle: application.title,
        company: application.company,
        jobDescription: descInput,
        resumeData: currentResumeData,
        sourceType: "schema_profile",
        profileName:
          selectedProfileId === "master"
            ? "Perfil Base"
            : selectedProfileId === "active"
            ? "CV Activo"
            : profiles.find((p) => p.id === selectedProfileId)?.name || "CV",
      });

      setReport(newReport);
      saveEvaluation(application.id, newReport);

      const matchedKeywords: Keyword[] = newReport.requirements
        .filter((r) => r.matched)
        .map((r) => ({
          text: r.text,
          frequency: 1,
          matched: true,
          source: "local",
        }));

      const missingKeywords: Keyword[] = newReport.missingKeywords.map((k) => ({
        text: k.text,
        frequency: k.frequency || 1,
        matched: false,
        source: "local",
      }));

      updateApplication(application.id, {
        keywords: [...matchedKeywords, ...missingKeywords],
        matchAnalysis: {
          score: newReport.matchScore,
          matched: matchedKeywords,
          missing: missingKeywords,
          suggestions: [],
          generatedBy: "local",
          generatedAt: new Date().toISOString(),
        },
      });
      toast.success("Evaluación ATS completada", {
        description: `Puntuación de match: ${newReport.matchScore}%`,
      });
    } catch (err) {
      console.error("Error al evaluar:", err);
      toast.error("Error al ejecutar la evaluación ATS");
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleSaveDescription() {
    if (!application) return;
    updateApplication(application.id, { description: descInput });
    setIsEditingDescription(false);
    handleRunEvaluation();
    toast.success("Descripción actualizada y analizada");
  }

  // Generador de Carta de Presentación
  const generatedCoverLetter = useMemo(() => {
    const candidateName = currentResumeData.name || "Candidato";
    const candidateRole = currentResumeData.headline || "Profesional";
    const candidateEmail = currentResumeData.email || "";
    const candidatePhone = currentResumeData.phone || "";

    return `Estimado equipo de contratación de ${company},\n\nLe escribo con gran entusiasmo para presentar mi candidatura al puesto de ${title}. Con mi sólida trayectoria como ${candidateRole} y mi experiencia comprobada en el desarrollo de soluciones escalables, considero que mi perfil se alinea estrechamente con las necesidades de ${company}.\n\nRevisando los requisitos del puesto, cuento con experiencia directa en las tecnologías clave requeridas para este rol. A lo largo de mi carrera me he caracterizado por entregar proyectos de alto impacto, optimizar procesos de ingeniería y colaborar eficazmente en equipos multidisciplinarios.\n\nMe entusiasma la posibilidad de aportar valor a ${company} y me encantaría tener la oportunidad de conversar más a fondo sobre cómo mi experiencia puede contribuir al éxito del equipo.\n\nQuedo a su entera disposición.\n\nAtentamente,\n${candidateName}\n${candidateEmail} | ${candidatePhone}`;
  }, [company, title, currentResumeData]);

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
    setCopiedCoverLetter(true);
    toast.success("Carta de presentación copiada al portapapeles");
    setTimeout(() => setCopiedCoverLetter(false), 2500);
  };

  // Preguntas de entrevista simuladas
  const interviewQuestions = [
    {
      question: `¿Por qué te interesa unirte a ${company} como ${title}?`,
      tip: "Enfócate en la misión de la empresa, su impacto tecnológico y cómo tu experiencia previa resuelve sus retos actuales.",
      starExample: "Situación: En mi rol anterior... Tarea: Debíamos escalar... Acción: Lideré la migración... Resultado: Redujimos la latencia un 40%.",
    },
    {
      question: `Cuéntame sobre un desafío técnico complejo relacionado con ${parsedJob.minimumQualifications[0] || "desarrollo full stack"} y cómo lo resolviste.`,
      tip: "Utiliza la metodología STAR (Situación, Tarea, Acción, Resultado) cuantificando el impacto.",
      starExample: "Situación: Tuvimos un cuello de botella... Tarea: Optimizar la base de datos... Acción: Implementé índices y caché Redis... Resultado: 99.9% uptime.",
    },
    {
      question: "¿Cómo manejas la priorización y el trabajo bajo metodologías ágiles en entornos de alta exigencia?",
      tip: "Menciona comunicación proactiva con stakeholders y enfoque iterativo.",
      starExample: "Situación: Requerimientos cambiantes... Tarea: Entregar sprint crítico... Acción: Repriorizamos el backlog... Resultado: Entrega a tiempo con cero bugs críticos.",
    },
  ];

  // Visual tokens de puntuación
  const matchScore = report?.matchScore ?? (application.matchAnalysis?.score ?? 85);
  const matchColor = matchScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : matchScore >= 40 ? "text-amber-600" : "text-red-500";
  const matchBg = matchScore >= 70 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* ─── 1. ENCABEZADO SUPERIOR TIPO GOOGLE / PROPEL ─── */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-50 font-medium tracking-tight">
            Información del puesto de {title}
          </h1>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a postulaciones</span>
          </button>
        </div>

        {/* ─── 2. CONTENEDOR PRINCIPAL 2 COLUMNAS (Exacto a la imagen) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════ COLUMNA IZQUIERDA: DETALLES DE LA OFERTA (8 de 12) ═════════ */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header del Puesto con Logo, Nombre y Botones de Acción */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
              <div className="flex items-start gap-4">
                {/* Logo de Empresa (Google o Avatar personalizado) */}
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs">
                  {company.toLowerCase().includes("google") ? (
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  ) : (
                    <span className="text-base font-black text-zinc-800 dark:text-zinc-200">
                      {company.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    {company}
                  </p>
                </div>
              </div>

              {/* Botones Guardar & Enviar Solicitud */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSave}
                  className={`h-9 px-3.5 text-xs font-semibold rounded-xl gap-1.5 transition-all ${
                    isSaved
                      ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{isSaved ? "Guardado" : "Save Job"}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSendApplication}
                  className="h-9 px-4 text-xs font-bold rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-xs gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar solicitud</span>
                </Button>
              </div>
            </div>

            {/* Fila de Metadatos / Badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600 dark:text-zinc-400 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                <MapPin className="h-3 w-3 text-zinc-400" />
                {location || "Remoto"}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                <Clock className="h-3 w-3 text-zinc-400" />
                Hace 1 día
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                <Clock className="h-3 w-3 text-zinc-400" />
                A tiempo completo
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                <Building2 className="h-3 w-3 text-zinc-400" />
                Presencial
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                <Briefcase className="h-3 w-3 text-zinc-400" />
                Nivel básico
              </span>

              {salary && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                  <DollarSign className="h-3 w-3" />
                  {salary}
                </span>
              )}

              {/* Botón para editar texto crudo */}
              <button
                type="button"
                onClick={() => setIsEditingDescription(!isEditingDescription)}
                className="ml-auto text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                <span>{isEditingDescription ? "Cerrar editor" : "Editar texto"}</span>
              </button>
            </div>

            {/* Modo Edición de Texto de la Oferta */}
            {isEditingDescription ? (
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Pega o edita la descripción completa de la vacante:
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveDescription}
                    className="h-7 text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  >
                    Guardar y Actualizar
                  </Button>
                </div>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={10}
                  className="w-full p-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 font-mono leading-relaxed resize-y"
                  placeholder="Pega la descripción completa del puesto..."
                />
              </div>
            ) : (
              /* ─── CONTENIDO ESTRUCTURADO (Minimum qualifications / Preferred / About) ─── */
              <div className="space-y-6 pt-2 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">
                
                {/* 1. Minimum Qualifications */}
                {parsedJob.minimumQualifications.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Minimum qualifications:
                    </h3>
                    <ul className="space-y-2 pl-1">
                      {parsedJob.minimumQualifications.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300">
                          <span className="text-zinc-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2. Preferred Qualifications */}
                {parsedJob.preferredQualifications.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Preferred qualifications:
                    </h3>
                    <ul className="space-y-2 pl-1">
                      {parsedJob.preferredQualifications.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300">
                          <span className="text-zinc-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. About the job */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    About the job:
                  </h3>
                  <div className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 space-y-3 leading-relaxed whitespace-pre-line">
                    {parsedJob.aboutTheJob || "No se ha proporcionado una descripción detallada aún. Haz clic en 'Editar texto' para pegarla."}
                  </div>
                </div>
              </div>
            )}

            {/* Toggle para ver análisis ATS avanzado */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvancedAts(!showAdvancedAts)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{showAdvancedAts ? "Ocultar Motor ATS Avanzado" : "Ver Análisis de Compatibilidad ATS Completo (10 Reglas)"}</span>
              </button>

              {aiEnabled && (
                <button
                  type="button"
                  onClick={() => setShowChat(true)}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat IA con Oferta</span>
                </button>
              )}
            </div>

            {/* Sección Desplegable del Motor ATS Avanzado */}
            {showAdvancedAts && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Simulador & Puntuación ATS
                  </span>
                  <Button
                    size="sm"
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="h-7 text-xs font-bold gap-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  >
                    {isEvaluating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-amber-400" />}
                    <span>Re-evaluar CV</span>
                  </Button>
                </div>

                {report?.missingKeywords && report.missingKeywords.length > 0 && (
                  <ScoreProjectorSimulator
                    currentScore={report.matchScore}
                    missingKeywords={report.missingKeywords}
                  />
                )}
              </div>
            )}
          </div>

          {/* ═════════ COLUMNA DERECHA: PREPÁRATE PARA ESTE EMPLEO (4 de 12) ═════════ */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Prepárate para este empleo
            </h3>

            {/* ─── ACORDEÓN 1: TAILOR YOUR RESUME ─── */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setActivePrepSection(activePrepSection === "tailor" ? ("" as any) : "tailor")}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Tailor Your Resume
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    activePrepSection === "tailor" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activePrepSection === "tailor" && (
                <div className="p-4 pt-1 space-y-3.5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#b45309] dark:text-amber-400">
                      Be the perfect match.
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                      Have your resume tailored to this job post in seconds.
                    </p>
                  </div>

                  {/* Ilustración Visual de la Tarjeta del CV Adaptado */}
                  <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-50/70 to-amber-100/40 dark:from-zinc-900 dark:to-zinc-800/80 border border-amber-200/70 dark:border-amber-900/30 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {currentResumeData.name ? currentResumeData.name.charAt(0) : "C"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {currentResumeData.name || "Tu Currículum"}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{title} at {company}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-900/50 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tailoring completed!
                      </span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        {matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Botón Principal Tailor Your Resume */}
                  <Button
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="w-full h-9 rounded-xl font-bold text-xs bg-[#b45309] hover:bg-[#92400e] text-white shadow-2xs gap-1.5 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                    )}
                    <span>Tailor Your Resume</span>
                  </Button>
                </div>
              )}
            </div>

            {/* ─── ACORDEÓN 2: PRACTICAR LA ENTREVISTA DE TRABAJO ─── */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setActivePrepSection(activePrepSection === "interview" ? ("" as any) : "interview")}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Practicar la entrevista de trabajo
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    activePrepSection === "interview" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activePrepSection === "interview" && (
                <div className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                    Preguntas clave generadas para el puesto de <strong className="text-zinc-800 dark:text-zinc-200">{title}</strong> en <strong className="text-zinc-800 dark:text-zinc-200">{company}</strong>:
                  </p>

                  <div className="space-y-2">
                    {interviewQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                      >
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {idx + 1}. {q.question}
                        </p>
                        <p className="text-[11px] text-zinc-500 leading-tight">
                          💡 <span className="font-semibold text-zinc-700 dark:text-zinc-300">Tip:</span> {q.tip}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChat(true)}
                    className="w-full h-8 text-xs font-bold rounded-xl gap-1 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Simular entrevista con IA</span>
                  </Button>
                </div>
              )}
            </div>

            {/* ─── ACORDEÓN 3: ESCRIBIR UNA CARTA DE PRESENTACIÓN ─── */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setActivePrepSection(activePrepSection === "cover_letter" ? ("" as any) : "cover_letter")}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Escribir una carta de presentación
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    activePrepSection === "cover_letter" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activePrepSection === "cover_letter" && (
                <div className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                    Carta personalizada generada con tus datos y los requisitos del puesto:
                  </p>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                    {generatedCoverLetter}
                  </div>

                  <Button
                    size="sm"
                    onClick={handleCopyCoverLetter}
                    className="w-full h-8 text-xs font-bold rounded-xl gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs"
                  >
                    {copiedCoverLetter ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCoverLetter ? "¡Copiada!" : "Copiar Carta de Presentación"}</span>
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Modal de Chat IA para Entrevistas y Asesoría */}
      {showChat && (
        <AIChat
          jobTitle={application.title}
          company={application.company}
          jobDescription={descInput}
          resumeSummary={currentResumeData.summary || ""}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
