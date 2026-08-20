import { createClient, isSupabaseConfigured } from "./client";
import type { ResumeData, ResumeProfile } from "@/types/resume";
import type { JobApplication } from "@/types/jobs";
import type { EvaluationReport } from "@/types/evaluator";

// ─── 1. PERFILES DE USUARIO ───────────────────────────────────────────────────
export async function getSupabaseProfile(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateSupabaseProfile(userId: string, updates: Record<string, any>) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── 2. CURRÍCULUMS & PERFIL BASE ─────────────────────────────────────────────
export async function fetchUserResumes(userId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar currículums de Supabase:", error);
    return [];
  }
  return data;
}

export async function upsertResumeToSupabase(
  userId: string,
  resume: {
    id?: string;
    name: string;
    targetRole?: string;
    templateId: string;
    isMaster: boolean;
    data: ResumeData;
  }
) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const payload: any = {
    user_id: userId,
    name: resume.name,
    target_role: resume.targetRole,
    template_id: resume.templateId,
    is_master: resume.isMaster,
    data: resume.data,
    updated_at: new Date().toISOString(),
  };

  if (resume.id && !resume.id.startsWith("local-") && !resume.id.startsWith("prof-")) {
    payload.id = resume.id;
  }

  const { data, error } = await supabase
    .from("resumes")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error al guardar currículum en Supabase:", error);
    return null;
  }
  return data;
}

export async function deleteResumeFromSupabase(resumeId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  await supabase.from("resumes").delete().eq("id", resumeId);
}

// ─── 3. JOB TRACKER POSTULACIONES ─────────────────────────────────────────────
export async function fetchUserJobs(userId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar postulaciones de Supabase:", error);
    return [];
  }
  return data;
}

export async function upsertJobToSupabase(userId: string, job: JobApplication) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const payload: any = {
    user_id: userId,
    title: job.title,
    company: job.company,
    status: job.status,
    location: job.location,
    salary: job.salary,
    url: job.url,
    portal: job.portal,
    description: job.description,
    notes: job.notes,
    keywords: job.keywords,
    match_analysis: job.matchAnalysis,
    activity: job.activity,
    updated_at: new Date().toISOString(),
  };

  if (job.id && !job.id.startsWith("job-")) {
    payload.id = job.id;
  }

  const { data, error } = await supabase
    .from("job_applications")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error al guardar postulación en Supabase:", error);
    return null;
  }
  return data;
}

export async function deleteJobFromSupabase(jobId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  await supabase.from("job_applications").delete().eq("id", jobId);
}

// ─── 4. EVALUACIONES ATS ──────────────────────────────────────────────────────
export async function saveATSEvaluationToSupabase(userId: string, report: EvaluationReport) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const payload: any = {
    user_id: userId,
    job_id: report.jobId && !report.jobId.startsWith("job-") ? report.jobId : null,
    job_title: report.jobTitle,
    company: report.company,
    ats_score: report.atsScore,
    match_score: report.matchScore,
    report_data: report,
    created_at: report.createdAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("ats_evaluations")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error al guardar evaluación ATS en Supabase:", error);
    return null;
  }
  return data;
}
