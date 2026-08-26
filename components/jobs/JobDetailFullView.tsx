"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Target,
  Terminal,
  Upload,
  Zap,
  Activity,
  Search,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { ApplicationStatus, Keyword } from "@/types/jobs";
import { STATUS_LABELS } from "@/types/jobs";
import type { EvaluationReport, ATSAuditRule } from "@/types/evaluator";
import { AIChat } from "@/components/jobs/AIChat";
import { buildResumeContext } from "@/lib/ai/prompts";
import { ScoreProjectorSimulator } from "@/components/jobs/evaluate/ScoreProjectorSimulator";
import { MatchKeywordsTab } from "@/components/jobs/evaluate/MatchKeywordsTab";
import { runATSEvaluationPipeline } from "@/lib/ats";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobDetailFullViewProps {
  applicationId: string;
  onBack: () => void;
}

// Parser inteligente de descripciones de empleo
interface ParsedJobDetails {
  companyDescription?: string;
  aboutTheJob: string;
  responsibilities: string[];
  minimumQualifications: string[];
  preferredQualifications: string[];
  benefits: string[];
}

function parseJobDescription(rawText: string): ParsedJobDetails {
  if (!rawText || !rawText.trim()) {
    return {
      aboutTheJob: "",
      responsibilities: [],
      minimumQualifications: [],
      preferredQualifications: [],
      benefits: [],
    };
  }

  let text = rawText.replace(/\r\n/g, "\n").trim();

  // Insertar marcadores de sección unívocos
  text = text.replace(/(?:Company Description|Descripción de la empresa|Sobre la empresa|Sobre nosotros|About the company)[\s:]+/gi, "\n__SECTION_COMPANY__\n");
  text = text.replace(/(?:Job Description|Descripción del empleo|Descripción del puesto|Acerca del empleo|About the job|Resumen del puesto)[\s:]+/gi, "\n__SECTION_ABOUT__\n");
  text = text.replace(/(?:¿Qué harás\??|What you will do|What you'll do|Responsabilidades|Responsibilities|Funciones|Tus funciones|Tus responsabilidades|Tus desafíos|Principales tareas|Lo que harás)[\s:]+/gi, "\n__SECTION_RESP__\n");
  text = text.replace(/(?:Requisitos mínimos|Minimum qualifications|Requirements|Requisitos obligatorios|Requisitos|Perfil requerido|Lo que buscamos|Requerimientos)[\s:]+/gi, "\n__SECTION_MIN_REQ__\n");
  text = text.replace(/(?:Requisitos deseados|Requisitos valorados|Preferred qualifications|Deseables|Nice to have|Plus|Valoramos|Deseable)[\s:]+/gi, "\n__SECTION_PREF_REQ__\n");
  text = text.replace(/(?:Beneficios|Benefits|Lo que ofrecemos|What we offer|Te ofrecemos)[\s:]+/gi, "\n__SECTION_BENEFITS__\n");

  const extractBullets = (block: string): string[] => {
    if (!block || !block.trim()) return [];
    
    let lines = block
      .split(/\n+/)
      .map((l) => l.trim().replace(/^[-•*–—]\s*/, "").replace(/^\d+[\.\)]\s*/, ""))
      .filter((l) => l.length > 3);

    // Si todo vino en una sola línea corrida sin saltos de línea, dividir por verbos de acción y palabras clave
    if (lines.length <= 1 && block.length > 40) {
      const verbSplitter = /(?=(?:Desarrollar|Programar|Participar|Colaborar|Aprender|Diseñar|Construir|Gestionar|Liderar|Crear|Optimizar|Investigar|Mantener|Implementar|Definir|Analizar|Asegurar|Coordinar|Soportar|Evaluar|Estudiante|Conocimientos|Inglés|Experiencia|Manejo|Dominio|Interés|Capacidad|Habilidad|Título|Carrera|Formación)\b)/g;
      const splitItems = block.split(verbSplitter).map((s) => s.trim().replace(/^[-•*–—]\s*/, "")).filter((s) => s.length > 5);
      if (splitItems.length > 1) {
        lines = splitItems;
      }
    }

    return lines;
  };

  let companyDescription = "";
  let aboutTheJob = "";
  let responsibilities: string[] = [];
  let minimumQualifications: string[] = [];
  let preferredQualifications: string[] = [];
  let benefits: string[] = [];

  const sections = text.split(/(?=__SECTION_[A-Z_]+__)/);

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (trimmed.startsWith("__SECTION_COMPANY__")) {
      companyDescription = trimmed.replace("__SECTION_COMPANY__", "").trim();
    } else if (trimmed.startsWith("__SECTION_ABOUT__")) {
      aboutTheJob = trimmed.replace("__SECTION_ABOUT__", "").trim();
    } else if (trimmed.startsWith("__SECTION_RESP__")) {
      responsibilities = extractBullets(trimmed.replace("__SECTION_RESP__", "").trim());
    } else if (trimmed.startsWith("__SECTION_MIN_REQ__")) {
      minimumQualifications = extractBullets(trimmed.replace("__SECTION_MIN_REQ__", "").trim());
    } else if (trimmed.startsWith("__SECTION_PREF_REQ__")) {
      preferredQualifications = extractBullets(trimmed.replace("__SECTION_PREF_REQ__", "").trim());
    } else if (trimmed.startsWith("__SECTION_BENEFITS__")) {
      benefits = extractBullets(trimmed.replace("__SECTION_BENEFITS__", "").trim());
    } else if (!aboutTheJob && trimmed) {
      aboutTheJob = trimmed;
    }
  }

  if (responsibilities.length === 0 && minimumQualifications.length === 0 && !aboutTheJob) {
    aboutTheJob = rawText.trim();
  }

  return {
    companyDescription,
    aboutTheJob,
    responsibilities,
    minimumQualifications,
    preferredQualifications,
    benefits,
  };
}

export function JobDetailFullView({ applicationId, onBack }: JobDetailFullViewProps) {
  const {
    applications,
    updateApplication,
    saveEvaluation,
    getLatestEvaluation,
  } = useJobsStore();

  const { profiles, resumeData, masterProfileData } = useResumeStore();
  const { user } = useAuthStore();
  const { enabled: aiEnabled } = useAISettingsStore();

  const application = applications.find((a) => a.id === applicationId);

  // Modo de visualización: Información de la vacante vs Evaluación ATS
  const [viewMode, setViewMode] = useState<"job_info" | "ats_evaluation">("job_info");
  const [activePrepSection, setActivePrepSection] = useState<"tailor" | "interview" | "cover_letter">("tailor");
  const [activeAtsTab, setActiveAtsTab] = useState<"match" | "checklist" | "simulation">("match");
  const [showChat, setShowChat] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("active");
  const [customPdfFile, setCustomPdfFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalProgressStep, setEvalProgressStep] = useState(0);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [descInput, setDescInput] = useState(application?.description || "");
  const [filterRuleStatus, setFilterRuleStatus] = useState<"all" | "fail" | "warning" | "pass">("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Atajo de teclado Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showChat) {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, showChat]);

  // Cargar último reporte guardado o autoevaluar si hay descripción
  useEffect(() => {
    if (application) {
      const existing = getLatestEvaluation(application.id);
      if (existing) {
        setReport(existing);
      }
      setDescInput(application.description || "");
    }
  }, [application?.id]);

  const currentResumeData = useMemo(() => {
    if (selectedProfileId === "master") return masterProfileData;
    if (selectedProfileId === "active") return resumeData;
    const found = profiles.find((p) => p.id === selectedProfileId);
    return found ? found.data : resumeData;
  }, [selectedProfileId, masterProfileData, resumeData, profiles]);

  const parsedJob = useMemo(() => parseJobDescription(descInput), [descInput]);

  // Generador de Carta de Presentación
  const generatedCoverLetter = useMemo(() => {
    const companyName = application?.company || "la empresa";
    const jobTitle = application?.title || "la posición";
    const candidateName = currentResumeData.name || user?.name || "Candidato";
    const candidateRole = currentResumeData.headline || "Profesional";
    const candidateEmail = currentResumeData.email || user?.email || "";
    const candidatePhone = currentResumeData.phone || "";

    return `Estimado equipo de selección de ${companyName},\n\nLe escribo para presentar formalmente mi postulación al cargo de ${jobTitle}. Con mi experiencia como ${candidateRole} y mis competencias en desarrollo de soluciones tecnológicas, considero que mi perfil se ajusta estrechamente a los requerimientos de ${companyName}.\n\nRevisando el perfil solicitado, poseo experiencia práctica en las tecnologías clave requeridas para este rol. Me he caracterizado por entregar proyectos de alto impacto, optimizar procesos de ingeniería y colaborar eficazmente en equipos multidisciplinarios.\n\nMe entusiasma la oportunidad de aportar valor en ${companyName} y estaré encantado de conversar más a fondo sobre cómo mi experiencia puede contribuir al éxito del equipo.\n\nQuedo a su entera disposición.\n\nAtentamente,\n${candidateName}\n${candidateEmail} | ${candidatePhone}`;
  }, [application?.company, application?.title, currentResumeData, user]);

  // Filtrado de reglas ATS
  const filteredRules = useMemo(() => {
    if (!report?.auditRules) return [];
    if (filterRuleStatus === "all") return report.auditRules;
    return report.auditRules.filter((r) => r.status === filterRuleStatus);
  }, [report?.auditRules, filterRuleStatus]);

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

  const { title, company, status, location, salary, url } = application;
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

  // Pipeline de Evaluación con transición animada y etapas de progreso
  async function handleRunEvaluation(targetMode: "job_info" | "ats_evaluation" = "ats_evaluation") {
    if (!application || !descInput.trim()) return;
    
    setIsEvaluating(true);
    setEvalProgressStep(1);

    const stepTimer1 = setTimeout(() => setEvalProgressStep(2), 600);
    const stepTimer2 = setTimeout(() => setEvalProgressStep(3), 1200);

    try {
      let newReport: EvaluationReport;

      if (customPdfFile) {
        const formData = new FormData();
        formData.append("file", customPdfFile);
        formData.append("jobId", application.id);
        formData.append("jobTitle", application.title);
        formData.append("company", application.company);
        formData.append("jobDescription", descInput);
        formData.append("profileName", customPdfFile.name);

        const res = await fetch("/api/evaluate", { method: "POST", body: formData });
        newReport = await res.json();
      } else {
        newReport = await runATSEvaluationPipeline({
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
              ? `CV Activo (${resumeData.name || user?.name || "Sin nombre"})`
              : profiles.find((p) => p.id === selectedProfileId)?.name || "CV",
        });
      }

      await new Promise((r) => setTimeout(r, 600));

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

      setViewMode(targetMode);

      toast.success("Evaluación ATS completada", {
        description: `Formato ATS: ${newReport.atsScore}% • Afinidad: ${newReport.matchScore}%`,
      });
    } catch (err) {
      console.error("Error al evaluar:", err);
      toast.error("Error al ejecutar la evaluación ATS");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsEvaluating(false);
      setEvalProgressStep(0);
    }
  }

  function handleSaveDescription() {
    if (!application) return;
    updateApplication(application.id, { description: descInput });
    setIsEditingDescription(false);
    handleRunEvaluation("job_info");
    toast.success("Descripción actualizada y analizada");
  }

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
    },
    {
      question: `Cuéntame sobre un desafío técnico complejo relacionado con ${parsedJob.minimumQualifications[0] || "desarrollo de software"} y cómo lo resolviste.`,
      tip: "Utiliza la metodología STAR (Situación, Tarea, Acción, Resultado) cuantificando el impacto.",
    },
    {
      question: "¿Cómo manejas la priorización y el trabajo bajo metodologías ágiles en entornos de alta exigencia?",
      tip: "Menciona comunicación proactiva con el equipo y enfoque iterativo.",
    },
  ];

  // Visual tokens de puntuación
  const atsScore = report?.atsScore ?? 0;
  const matchScore = report?.matchScore ?? (application.matchAnalysis?.score ?? 0);

  const failedRulesCount = report?.auditRules.filter((r) => r.status === "fail").length || 0;
  const warningRulesCount = report?.auditRules.filter((r) => r.status === "warning").length || 0;
  const passedRulesCount = report?.auditRules.filter((r) => r.status === "pass").length || 0;

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* ─── 1. ENCABEZADO SUPERIOR CON SELECTOR MINIMALISTA Y COMPACTO ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <motion.h1
              key={viewMode}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-50 font-medium tracking-tight"
            >
              {viewMode === "job_info" ? `Información del puesto de ${title}` : `Evaluación ATS de ${title}`}
            </motion.h1>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver a postulaciones</span>
            </button>
          </div>

          {/* Selector de Modo Segmentado Profesional & Limpio */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("job_info")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "job_info"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Información</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!report) {
                  handleRunEvaluation("ats_evaluation");
                } else {
                  setViewMode("ats_evaluation");
                  setActiveAtsTab("match");
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "ats_evaluation"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Comparativa CV & Evaluación ATS</span>
              {report && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${
                  viewMode === "ats_evaluation" 
                    ? "bg-emerald-700/60 text-white" 
                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                }`}>
                  {matchScore}% Match
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── 2. CONTENEDOR PRINCIPAL: 2 COLUMNAS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════ COLUMNA IZQUIERDA: CONTENIDO DE LA OFERTA / EVALUACIÓN (8 de 12) ═════════ */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
            
            {/* Header de la Empresa */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
              <div className="flex items-start gap-4">
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

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={handleSendApplication}
                  className="h-9 px-4 text-xs font-bold rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-xs gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar solicitud</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleRunEvaluation(viewMode)}
                  disabled={isEvaluating}
                  className="h-9 px-3 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs gap-1.5 cursor-pointer"
                >
                  {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Re-evaluar</span>
                </Button>
              </div>
            </div>

            {/* ─── PANTALLA DE CARGA Y RADAR ANIMADO ─── */}
            <AnimatePresence mode="wait">
              {isEvaluating ? (
                <motion.div
                  key="evaluating-skeleton"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-6 my-4"
                >
                  <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-emerald-500/40 animate-pulse" />
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <Sparkles className="h-5 w-5 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Analizando compatibilidad ATS con tu CV
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Verificando 10 reglas de oro y calculando afinidad de competencias...
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-1.5 text-left text-xs font-medium">
                    <div className={`flex items-center gap-2 transition-colors ${evalProgressStep >= 1 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                      {evalProgressStep >= 2 ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>1. Extracción y parseo de texto plano</span>
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${evalProgressStep >= 2 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                      {evalProgressStep >= 3 ? <Check className="h-3.5 w-3.5" /> : evalProgressStep === 2 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700" />}
                      <span>2. Auditoría de 10 reglas de formato ATS</span>
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${evalProgressStep >= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                      {evalProgressStep === 3 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700" />}
                      <span>3. Cálculo de match de competencias</span>
                    </div>
                  </div>
                </motion.div>
              ) : viewMode === "job_info" ? (
                /* ─── VISTA 1: INFORMACIÓN DEL PUESTO ─── */
                <motion.div
                  key="job_info_view"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Badges de Metadatos */}
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
                      Nivel inicial / Práctica
                    </span>

                    {salary && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                        <DollarSign className="h-3 w-3" />
                        {salary}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsEditingDescription(!isEditingDescription)}
                      className="ml-auto text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>{isEditingDescription ? "Cerrar editor" : "Editar texto"}</span>
                    </button>
                  </div>

                  {/* ─── BANNER RESUMEN DE COMPARATIVA CON TU CV ─── */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-500/20">
                        {report ? `${report.matchScore}%` : <Target className="w-5 h-5" />}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span>Afinidad con tu CV ({currentResumeData.name || "CV Activo"})</span>
                          {report && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                              {report.atsScore >= 90 ? "100% ATS Pass" : `${report.atsScore}% ATS`}
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          {report
                            ? `${report.requirements.filter((r) => r.matched).length} de ${report.requirements.length} requisitos respaldados en tu perfil.`
                            : "Calcula el % de match, detecta palabras clave faltantes y verifica normas ATS."}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        if (!report) {
                          handleRunEvaluation("ats_evaluation");
                        } else {
                          setViewMode("ats_evaluation");
                          setActiveAtsTab("match");
                        }
                      }}
                      className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer shadow-xs gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ver Comparativa y Sugerencias</span>
                    </Button>
                  </div>

                  {/* Modo Edición o Contenido Estructurado */}
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
                    <div className="space-y-6 pt-2 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">
                      {/* Acerca del empleo / Empresa */}
                      {(parsedJob.aboutTheJob || parsedJob.companyDescription) && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Acerca del empleo:
                          </h3>
                          <div className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed whitespace-pre-line">
                            {parsedJob.companyDescription && (
                              <p className="font-medium text-zinc-800 dark:text-zinc-200">
                                {parsedJob.companyDescription}
                              </p>
                            )}
                            {parsedJob.aboutTheJob && (
                              <p>{parsedJob.aboutTheJob}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ¿Qué harás? / Responsabilidades */}
                      {parsedJob.responsibilities.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            ¿Qué harás en este rol?
                          </h3>
                          <ul className="space-y-2 pl-1">
                            {parsedJob.responsibilities.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300">
                                <span className="text-emerald-600 dark:text-emerald-400 mt-1 font-bold">•</span>
                                <span className="leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Requisitos Mínimos / Perfil */}
                      {parsedJob.minimumQualifications.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Requisitos del puesto:
                          </h3>
                          <ul className="space-y-2 pl-1">
                            {parsedJob.minimumQualifications.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300">
                                <span className="text-blue-600 dark:text-blue-400 mt-1 font-bold">•</span>
                                <span className="leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Requisitos Valorados / Deseables */}
                      {parsedJob.preferredQualifications.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Requisitos valorados (deseables):
                          </h3>
                          <ul className="space-y-2 pl-1">
                            {parsedJob.preferredQualifications.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300">
                                <span className="text-amber-500 mt-1 font-bold">•</span>
                                <span className="leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Beneficios */}
                      {parsedJob.benefits.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Beneficios y lo que ofrecemos:
                          </h3>
                          <ul className="space-y-2 pl-1">
                            {parsedJob.benefits.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300">
                                <span className="text-violet-500 mt-1 font-bold">•</span>
                                <span className="leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Banner CTA para ver análisis ATS */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          ¿Quieres verificar si tu CV supera los filtros ATS de esta vacante?
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          Audita 10 reglas de oro de formato, detecta palabras clave faltantes y simula la lectura del robot.
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRunEvaluation("ats_evaluation")}
                      className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      <span>Ver Análisis ATS Completo</span>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* ─── VISTA 2: EVALUACIÓN ATS ─── */
                <motion.div
                  key="ats_evaluation_view"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Selector de CV a Evaluar */}
                  <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        CV evaluado contra esta vacante:
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={customPdfFile ? "uploaded" : selectedProfileId}
                        onChange={(e) => {
                          if (e.target.value === "uploaded") {
                            fileInputRef.current?.click();
                          } else {
                            setCustomPdfFile(null);
                            setSelectedProfileId(e.target.value);
                            handleRunEvaluation("ats_evaluation");
                          }
                        }}
                        className="h-8 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                      >
                        <option value="active">CV Activo en Editor ({resumeData.name || user?.name || "Sin nombre"})</option>
                        <option value="master">Perfil Base Maestro</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.targetRole || "Perfil"})
                          </option>
                        ))}
                        <option value="uploaded">Subir archivo PDF externo...</option>
                      </select>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCustomPdfFile(file);
                            handleRunEvaluation("ats_evaluation");
                          }
                        }}
                      />

                      {customPdfFile && (
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Upload className="w-3 h-3" /> {customPdfFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pestañas de la Auditoría ATS */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 w-fit flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveAtsTab("match")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAtsTab === "match"
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Comparativa y Fit Técnico ({report?.requirements?.length || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAtsTab("checklist")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAtsTab === "checklist"
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Normas ATS ({report?.auditRules?.length || 10})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAtsTab("simulation")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAtsTab === "simulation"
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        <Terminal className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Lectura del Robot ATS</span>
                      </button>
                    </div>

                    {/* ─── TAB 1: CHECKLIST DE NORMAS ATS (10 Reglas) ─── */}
                    {activeAtsTab === "checklist" && (
                      <div className="space-y-4">
                        {/* Filtros por estado */}
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setFilterRuleStatus("all")}
                            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              filterRuleStatus === "all"
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            Todas ({report?.auditRules?.length || 10})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilterRuleStatus("fail")}
                            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              filterRuleStatus === "fail"
                                ? "bg-red-600 text-white shadow-2xs"
                                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                            }`}
                          >
                            Fallas ({failedRulesCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilterRuleStatus("warning")}
                            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              filterRuleStatus === "warning"
                                ? "bg-amber-600 text-white shadow-2xs"
                                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                            }`}
                          >
                            Advertencias ({warningRulesCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilterRuleStatus("pass")}
                            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              filterRuleStatus === "pass"
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                            }`}
                          >
                            Aprobadas ({passedRulesCount})
                          </button>
                        </div>

                        {/* Lista de Reglas ATS */}
                        <div className="space-y-3">
                          {filteredRules.map((rule) => {
                            const isPass = rule.status === "pass";
                            const isFail = rule.status === "fail";
                            const isWarning = rule.status === "warning";
                            const isExpanded = expandedRuleId === rule.id;

                            return (
                              <div
                                key={rule.id}
                                className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/30 p-4 transition-all space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="mt-0.5 shrink-0">
                                      {isPass && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                                      {isFail && <XCircle className="h-4 w-4 text-red-500" />}
                                      {isWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                    </div>

                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                          {rule.name}
                                        </h4>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.2 rounded-md font-mono ${
                                            isPass
                                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                              : isFail
                                              ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                          }`}
                                        >
                                          {isPass ? "PASA" : isFail ? "FALLA" : "ADVERTENCIA"}
                                        </span>
                                      </div>
                                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                                        {rule.message}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-mono font-bold text-zinc-500">
                                      {rule.scoreEarned} / {rule.scoreWeight} pts
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    >
                                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    </button>
                                  </div>
                                </div>

                                {isExpanded && rule.fixGuide && (
                                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 text-xs space-y-2 bg-white dark:bg-zinc-900 p-3 rounded-xl">
                                    <div>
                                      <span className="font-bold text-zinc-800 dark:text-zinc-200">¿Por qué importa? </span>
                                      <span className="text-zinc-600 dark:text-zinc-400">{rule.fixGuide.whyItMatters}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Cómo solucionarlo: </span>
                                      <span className="text-zinc-600 dark:text-zinc-400">{rule.fixGuide.howToFix}</span>
                                    </div>
                                    {rule.fixGuide.example && (
                                      <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800">
                                        Ejemplo: {rule.fixGuide.example}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ─── TAB 1: COMPARATIVA Y FIT TÉCNICO (MATCH) ─── */}
                    {activeAtsTab === "match" && report && (
                      <MatchKeywordsTab report={report} />
                    )}

                    {/* ─── TAB 3: SIMULACIÓN DE LECTURA DEL ROBOT ATS ─── */}
                    {activeAtsTab === "simulation" && (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-500">
                          Así es exactamente como el parser ATS procesa el documento en texto plano secuencial:
                        </p>
                        <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed whitespace-pre-wrap">
                          {report?.simulation.rawExtractedText || "No hay texto plano extraído aún. Haz clic en 'Re-evaluar'."}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* ═════════ COLUMNA DERECHA: PREPÁRATE PARA ESTE EMPLEO (4 de 12) ═════════ */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Prepárate para este empleo
            </h3>

            {/* ─── ACORDEÓN 1: ADAPTAR TU CURRÍCULUM ─── */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setActivePrepSection(activePrepSection === "tailor" ? ("" as any) : "tailor")}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Adaptar tu Currículum
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
                      Alineación perfecta con la vacante.
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                      Adapta tu currículum a esta oferta y maximiza tu puntuación ATS en segundos.
                    </p>
                  </div>

                  {/* Tarjeta Visual del CV Adaptado */}
                  <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-50/70 to-amber-100/40 dark:from-zinc-900 dark:to-zinc-800/80 border border-amber-200/70 dark:border-amber-900/30 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {currentResumeData.name ? currentResumeData.name.charAt(0) : user?.name ? user.name.charAt(0) : "C"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {currentResumeData.name || user?.name || "Tu Currículum"}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{title} en {company}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-900/50 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        ¡Optimización completada!
                      </span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        {matchScore}% Afinidad
                      </span>
                    </div>
                  </div>

                  {/* Botón Principal Adaptar mi Currículum */}
                  <Button
                    onClick={() => handleRunEvaluation("ats_evaluation")}
                    disabled={isEvaluating}
                    className="w-full h-9 rounded-xl font-bold text-xs bg-[#b45309] hover:bg-[#92400e] text-white shadow-2xs gap-1.5 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                    )}
                    <span>Adaptar mi Currículum</span>
                  </Button>
                </div>
              )}
            </div>

            {/* ─── ACORDEÓN 2: PRACTICAR LA ENTREVISTA DE TRABAJO ─── */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setActivePrepSection(activePrepSection === "interview" ? ("" as any) : "interview")}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
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
                          💡 <span className="font-semibold text-zinc-700 dark:text-zinc-300">Consejo:</span> {q.tip}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChat(true)}
                    className="w-full h-8 text-xs font-bold rounded-xl gap-1 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/40 cursor-pointer"
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
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
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
                    className="w-full h-8 text-xs font-bold rounded-xl gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs cursor-pointer"
                  >
                    {copiedCoverLetter ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCoverLetter ? "¡Copiada!" : "Copiar carta de presentación"}</span>
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
          resumeSummary={buildResumeContext(currentResumeData)}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
