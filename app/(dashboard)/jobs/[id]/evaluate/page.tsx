"use client";

import React, { use, useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  RefreshCw,
  Loader2,
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Layers,
  Heart,
  Send,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  MessageSquare,
  Pencil,
  Terminal,
  GraduationCap,
  Award,
} from "lucide-react";
import { useJobsStore } from "@/store/useJobsStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { EvaluationReport, ATSAuditRule } from "@/types/evaluator";
import type { ApplicationStatus, Keyword } from "@/types/jobs";
import { ScoreProjectorSimulator } from "@/components/jobs/evaluate/ScoreProjectorSimulator";
import { AIChat } from "@/components/jobs/AIChat";
import { runATSEvaluationPipeline } from "@/lib/ats";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface EvaluatePageProps {
  params: Promise<{ id: string }>;
}

// Parser inteligente de descripciones de empleo
function parseJobDescription(text: string) {
  if (!text || !text.trim()) {
    return {
      minimumQualifications: [],
      preferredQualifications: [],
      aboutTheJob: "",
    };
  }

  const minQualRegex = /(?:minimum qualifications|requisitos m[ií]nimos|requirements|requisitos obligatorios|lo que buscamos)[\s:]*([\s\S]*?)(?=(?:preferred qualifications|requisitos deseados|requisitos valorados|deseables|nice to have|plus|about the job|acerca del empleo|responsabilidades|$))/i;
  const prefQualRegex = /(?:preferred qualifications|requisitos deseados|requisitos valorados|deseables|nice to have|plus)[\s:]*([\s\S]*?)(?=(?:about the job|acerca del empleo|acerca de la empresa|responsabilidades|$))/i;
  const aboutRegex = /(?:about the job|acerca del empleo|descripci[oó]n del puesto|acerca de la empresa|overview)[\s:]*([\s\S]*?)(?=(?:minimum qualifications|preferred qualifications|requisitos|$))/i;

  const minMatch = text.match(minQualRegex);
  const prefMatch = text.match(prefQualRegex);
  const aboutMatch = text.match(aboutRegex);

  const cleanBullets = (raw: string) => {
    return raw
      .split(/\n+/)
      .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
      .filter((line) => line.length > 5);
  };

  const fallbackBullets = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => /^[-•*]\s*/.test(l) || (l.length > 20 && l.length < 160))
    .map((l) => l.replace(/^[-•*]\s*/, ""));

  return {
    minimumQualifications: minMatch ? cleanBullets(minMatch[1]) : fallbackBullets.slice(0, 4),
    preferredQualifications: prefMatch ? cleanBullets(prefMatch[1]) : fallbackBullets.slice(4, 8),
    aboutTheJob: aboutMatch ? aboutMatch[1].trim() : text.trim(),
  };
}

export default function EvaluatePage({ params }: EvaluatePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { applications, updateApplication, saveEvaluation, getLatestEvaluation } = useJobsStore();
  const { profiles, resumeData, masterProfileData } = useResumeStore();
  const { enabled: aiEnabled, provider: aiProvider, apiKey: aiApiKey } = useAISettingsStore();

  const application = applications.find((a) => a.id === id);

  // Estados de la evaluación
  const [selectedProfileId, setSelectedProfileId] = useState<string>("active");
  const [customPdfFile, setCustomPdfFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isScrapingDesc, setIsScrapingDesc] = useState(false);
  const [manualDescInput, setManualDescInput] = useState("");
  const [activeTab, setActiveTab] = useState<"checklist" | "match" | "simulation" | "offer_text">("checklist");
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [filterRuleStatus, setFilterRuleStatus] = useState<"all" | "fail" | "warning" | "pass">("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cargar reporte y descripción
  useEffect(() => {
    if (application) {
      const existing = getLatestEvaluation(application.id);
      if (existing) {
        setReport(existing);
      }
      if (application.description) {
        setManualDescInput(application.description);
      }
    }
  }, [application?.id]);

  const currentResumeData = useMemo(() => {
    if (selectedProfileId === "master") return masterProfileData;
    if (selectedProfileId === "active") return resumeData;
    const found = profiles.find((p) => p.id === selectedProfileId);
    return found ? found.data : resumeData;
  }, [selectedProfileId, masterProfileData, resumeData, profiles]);

  const parsedJob = useMemo(() => parseJobDescription(manualDescInput || application?.description || ""), [manualDescInput, application?.description]);

  // Si no hay reporte inicial y hay descripción, ejecutar la primera evaluación
  useEffect(() => {
    if (application && (manualDescInput || application.description) && !report && !isEvaluating) {
      handleRunEvaluation();
    }
  }, [application?.id, manualDescInput, selectedProfileId]);

  if (!application) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-zinc-500 font-medium">Postulación no encontrada.</p>
        <Button
          onClick={() => router.push("/jobs")}
          className="mt-4 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        >
          Volver a postulaciones
        </Button>
      </div>
    );
  }

  const { title, company, status, location, salary, url, portal } = application;
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
    toast.success("Abriendo enlace de la oferta...");
  };

  const handleRunEvaluation = async () => {
    if (!application) return;

    const descToUse = manualDescInput.trim() || application.description;
    if (!descToUse) {
      setEvalError("Ingresa o pega la descripción de la vacante para evaluar.");
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);

    try {
      let resultReport: EvaluationReport;

      if (customPdfFile) {
        const formData = new FormData();
        formData.append("file", customPdfFile);
        formData.append("jobId", application.id);
        formData.append("jobTitle", application.title);
        formData.append("company", application.company);
        formData.append("jobDescription", descToUse);
        formData.append("profileName", customPdfFile.name);

        const response = await fetch("/api/evaluate", {
          method: "POST",
          body: formData,
        });
        const json = await response.json();
        if (!response.ok || json.error) throw new Error(json.error || "Error al evaluar PDF.");
        resultReport = json;
      } else {
        const profileName =
          selectedProfileId === "master"
            ? "Perfil Base"
            : selectedProfileId === "active"
            ? `CV Activo (${resumeData.name || "Sin nombre"})`
            : profiles.find((p) => p.id === selectedProfileId)?.name || "CV";

        resultReport = await runATSEvaluationPipeline({
          jobId: application.id,
          jobTitle: application.title,
          company: application.company,
          jobDescription: descToUse,
          resumeData: currentResumeData,
          sourceType: "schema_profile",
          profileName,
        });
      }

      setReport(resultReport);
      saveEvaluation(application.id, resultReport);

      if (!application.description && descToUse) {
        updateApplication(application.id, { description: descToUse });
      }

      toast.success("Evaluación ATS completada con éxito", {
        description: `Formato ATS: ${resultReport.atsScore}% • Match: ${resultReport.matchScore}%`,
      });
    } catch (err: any) {
      console.error("Error al evaluar:", err);
      setEvalError(err.message || "Error al calcular compatibilidad ATS.");
      toast.error("Error durante la evaluación");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveDescription = () => {
    if (!application) return;
    updateApplication(application.id, { description: manualDescInput });
    setIsEditingDescription(false);
    handleRunEvaluation();
    toast.success("Descripción actualizada y analizada");
  };

  // Filtrar reglas ATS
  const filteredRules = useMemo(() => {
    if (!report?.auditRules) return [];
    if (filterRuleStatus === "all") return report.auditRules;
    return report.auditRules.filter((r) => r.status === filterRuleStatus);
  }, [report?.auditRules, filterRuleStatus]);

  const failedRulesCount = report?.auditRules.filter((r) => r.status === "fail").length || 0;
  const warningRulesCount = report?.auditRules.filter((r) => r.status === "warning").length || 0;
  const passedRulesCount = report?.auditRules.filter((r) => r.status === "pass").length || 0;

  // Visual tokens
  const atsScore = report?.atsScore ?? 0;
  const matchScore = report?.matchScore ?? 0;

  const atsStatusBadge =
    atsScore >= 80 ? { label: "Excelente", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" }
    : atsScore >= 50 ? { label: "Requiere Ajustes", bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" }
    : { label: "Crítico", bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" };

  const matchStatusBadge =
    matchScore >= 70 ? { label: "Alto Match", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" }
    : matchScore >= 40 ? { label: "Match Moderado", bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" }
    : { label: "Bajo Match", bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* ─── 1. ENCABEZADO SUPERIOR TIPO GOOGLE / PROPEL ─── */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-50 font-medium tracking-tight">
            Evaluación ATS del puesto de {title}
          </h1>

          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a postulaciones</span>
          </button>
        </div>

        {/* ─── 2. CONTENEDOR PRINCIPAL: 2 COLUMNAS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════ COLUMNA IZQUIERDA: DETALLES & AUDITORÍA ATS (8 de 12) ═════════ */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header del Puesto con Logo, Nombre y Acciones */}
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

                <Button
                  size="sm"
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="h-9 px-3 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs gap-1.5"
                >
                  {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Re-evaluar</span>
                </Button>
              </div>
            </div>

            {/* Selector de CV a Evaluar */}
            <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    }
                  }}
                  className="h-8 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                >
                  <option value="active">CV Activo en Editor ({resumeData.name || "Sin nombre"})</option>
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
                    if (file) setCustomPdfFile(file);
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
                  onClick={() => setActiveTab("checklist")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "checklist"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Checklist de Normas ATS ({report?.auditRules?.length || 10})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("match")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "match"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Match y Competencias ({report?.requirements?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("simulation")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "simulation"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Así te lee el Robot ATS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("offer_text")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "offer_text"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Texto de la Oferta</span>
                </button>
              </div>

              {/* ─── TAB 1: CHECKLIST DE NORMAS ATS (10 Reglas) ─── */}
              {activeTab === "checklist" && (
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

                  {/* Lista de Reglas ATS con Desplegable */}
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
                                  {rule.severity === "critical" && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40 font-mono">
                                      Crítico
                                    </span>
                                  )}
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
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>
                          </div>

                          {/* Guía de Remediacíon Desplegable */}
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

              {/* ─── TAB 2: MATCH Y COMPETENCIAS ─── */}
              {activeTab === "match" && (
                <div className="space-y-4">
                  {/* Simulador Proyectado */}
                  {report?.missingKeywords && report.missingKeywords.length > 0 && (
                    <ScoreProjectorSimulator
                      currentScore={report.matchScore}
                      missingKeywords={report.missingKeywords}
                    />
                  )}

                  {/* Requisitos Evaluados */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Requisitos Detectados en la Oferta:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report?.requirements.map((req) => (
                        <div
                          key={req.id}
                          className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate mr-2">
                            {req.text}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono shrink-0 ${
                              req.matched
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                            }`}
                          >
                            {req.matched ? "Presente" : "Falta en CV"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: SIMULACIÓN DE LECTURA DEL ROBOT ATS ─── */}
              {activeTab === "simulation" && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500">
                    Así es exactamente como el parser ATS procesa el documento en texto plano secuencial:
                  </p>
                  <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed whitespace-pre-wrap">
                    {report?.simulation.rawExtractedText || "No hay texto plano extraído aún."}
                  </pre>
                </div>
              )}

              {/* ─── TAB 4: TEXTO DE LA OFERTA ─── */}
              {activeTab === "offer_text" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Descripción de la Oferta Laboral:
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingDescription(!isEditingDescription)}
                      className="h-7 text-xs font-semibold gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>{isEditingDescription ? "Cerrar editor" : "Editar texto"}</span>
                    </Button>
                  </div>

                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <textarea
                        value={manualDescInput}
                        onChange={(e) => setManualDescInput(e.target.value)}
                        rows={10}
                        className="w-full p-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 font-mono leading-relaxed"
                        placeholder="Pega la descripción completa del puesto..."
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveDescription}
                        className="h-8 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      >
                        Guardar y Re-evaluar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                      {manualDescInput || application.description || "No hay descripción disponible."}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ═════════ COLUMNA DERECHA: ÍNDICES DE COMPATIBILIDAD & ACCIONES (4 de 12) ═════════ */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Tarjeta de Índices de Evaluación */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Índices de Compatibilidad
              </h3>

              {/* Gauge 1: Compatibilidad de Formato ATS */}
              <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Formato ATS (10 Reglas)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${atsStatusBadge.bg}`}>
                    {atsStatusBadge.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {atsScore}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${atsScore}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      atsScore >= 80 ? "bg-emerald-500" : atsScore >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {/* Gauge 2: Match con la Oferta */}
              <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Match de Habilidades
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${matchStatusBadge.bg}`}>
                    {matchStatusBadge.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {matchScore}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${matchScore}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      matchScore >= 70 ? "bg-emerald-500" : matchScore >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                  />
                </div>

                {/* Desglose de competencias */}
                {report && (
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                    <span className="text-zinc-500">Hard Skills:</span>
                    <span className="font-bold text-right text-zinc-800 dark:text-zinc-200">
                      {report.categoryBreakdown.hardSkills.matched}/{report.categoryBreakdown.hardSkills.total}
                    </span>
                    <span className="text-zinc-500">Tools / Cloud:</span>
                    <span className="font-bold text-right text-zinc-800 dark:text-zinc-200">
                      {report.categoryBreakdown.toolsPlatforms.matched}/{report.categoryBreakdown.toolsPlatforms.total}
                    </span>
                    <span className="text-zinc-500">Soft Skills:</span>
                    <span className="font-bold text-right text-zinc-800 dark:text-zinc-200">
                      {report.categoryBreakdown.softSkills.matched}/{report.categoryBreakdown.softSkills.total}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón Adaptar CV en Editor */}
              <Button
                onClick={() => router.push(selectedProfileId !== "active" && selectedProfileId !== "master" ? `/editor/${selectedProfileId}` : "/editor")}
                className="w-full h-10 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Adaptar CV en el Editor</span>
              </Button>
            </div>

            {/* Chat IA Rápido con la Oferta */}
            {aiEnabled && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Asistente IA de Postulación
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 leading-snug">
                  Hazle preguntas a la IA sobre cómo destacar tu perfil frente a los requisitos de {company}.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(true)}
                  className="w-full h-8 text-xs font-bold rounded-xl gap-1 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Abrir Chat con la Vacante</span>
                </Button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Modal de Chat IA */}
      {showChat && (
        <AIChat
          jobTitle={application.title}
          company={application.company}
          jobDescription={manualDescInput || application.description || ""}
          resumeSummary={currentResumeData.summary || ""}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
