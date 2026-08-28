import { createClient, isSupabaseConfigured } from "./client";
import type { ResumeData, ResumeProfile } from "@/types/resume";
import type { JobApplication } from "@/types/jobs";
import type { EvaluationReport } from "@/types/evaluator";

/**
 * Obtiene y valida el ID del usuario actualmente autenticado en Supabase Auth.
 * Previene violaciones de políticas RLS (código 42501) asegurando que cualquier
 * operación de escritura use el auth.uid() real de la sesión activa.
 */
async function getValidatedAuthUserId(requestedUserId?: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    if (requestedUserId && requestedUserId !== session.user.id) {
      console.warn("[Supabase DB] Discrepancia entre userId local y sesión activa de Supabase:", {
        requested: requestedUserId,
        authenticated: session.user.id,
      });
      return session.user.id;
    }
    return session.user.id;
  } catch (err) {
    console.error("[Supabase DB] Error al verificar sesión de autenticación:", err);
    return null;
  }
}

// ─── 1. PERFILES DE USUARIO ───────────────────────────────────────────────────
export async function getSupabaseProfile(userId: string) {
  if (!isSupabaseConfigured() || !userId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Aviso al consultar perfil en Supabase:", error.message || error);
    return null;
  }
  return data;
}

export async function updateSupabaseProfile(userId: string, updates: Record<string, any>) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", authUserId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error al actualizar perfil en Supabase:", error.message || error);
    return null;
  }
  return data;
}

export async function deleteSupabaseUserAccount(userId: string) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return;

  const supabase = createClient();

  // 1. Eliminar datos asociados del usuario en la base de datos
  await supabase.from("resumes").delete().eq("user_id", authUserId);
  await supabase.from("job_applications").delete().eq("user_id", authUserId);
  await supabase.from("ats_evaluations").delete().eq("user_id", authUserId);
  await supabase.from("profiles").delete().eq("id", authUserId);

  // 2. Cerrar sesión en el cliente
  await supabase.auth.signOut();
}

// ─── 2. CURRÍCULUMS & PERFIL BASE ─────────────────────────────────────────────
export async function fetchUserResumes(userId: string) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", authUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar currículums de Supabase:", error.message || error);
    return [];
  }
  return data || [];
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
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return null;

  const supabase = createClient();

  const payload: any = {
    user_id: authUserId,
    name: resume.name || "Mi Currículum",
    target_role: resume.targetRole || null,
    template_id: resume.templateId || "harvard",
    is_master: Boolean(resume.isMaster),
    data: resume.data || {},
    updated_at: new Date().toISOString(),
  };

  // Solo incluir ID si es un UUID válido de Supabase
  const isUuid = resume.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resume.id);
  if (isUuid) {
    payload.id = resume.id;
  }

  const query = payload.id
    ? supabase.from("resumes").upsert(payload, { onConflict: "id" })
    : supabase.from("resumes").insert(payload);

  const { data, error } = await query.select().maybeSingle();

  if (error) {
    console.error("Error al guardar currículum en Supabase:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  return data;
}

export async function upsertMasterResumeToSupabase(userId: string, data: ResumeData) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return null;

  const supabase = createClient();

  // Buscar si ya existe un registro de perfil maestro para este usuario
  const { data: existing } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", authUserId)
    .eq("is_master", true)
    .maybeSingle();

  const payload: any = {
    user_id: authUserId,
    name: "Perfil Base Maestro",
    target_role: data?.headline || "Perfil Base",
    template_id: "harvard",
    is_master: true,
    data: data || {},
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    payload.id = existing.id;
  }

  const query = payload.id
    ? supabase.from("resumes").upsert(payload, { onConflict: "id" })
    : supabase.from("resumes").insert(payload);

  const { data: result, error } = await query.select().maybeSingle();

  if (error) {
    console.error("Error al guardar perfil maestro en Supabase:", error.message || error);
    return null;
  }
  return result;
}

export async function deleteResumeFromSupabase(resumeId: string) {
  if (!isSupabaseConfigured() || !resumeId) return;
  const supabase = createClient();
  await supabase.from("resumes").delete().eq("id", resumeId);
}

// ─── 3. JOB TRACKER POSTULACIONES ─────────────────────────────────────────────
export async function fetchUserJobs(userId: string) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", authUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar postulaciones de Supabase:", error.message || error);
    return [];
  }
  return data || [];
}

export async function upsertJobToSupabase(userId: string, job: JobApplication) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return null;

  const supabase = createClient();

  const payload: any = {
    user_id: authUserId,
    title: job.title,
    company: job.company,
    status: job.status || "bookmarked",
    location: job.location || null,
    salary: job.salary || null,
    url: job.url || null,
    portal: job.portal || null,
    description: job.description || "",
    notes: job.notes || "",
    keywords: job.keywords || [],
    match_analysis: job.matchAnalysis || null,
    activity: job.activity || [],
    updated_at: new Date().toISOString(),
  };

  const isUuid = job.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(job.id);
  if (isUuid) {
    payload.id = job.id;
  }

  const query = payload.id
    ? supabase.from("job_applications").upsert(payload, { onConflict: "id" })
    : supabase.from("job_applications").insert(payload);

  const { data, error } = await query.select().maybeSingle();

  if (error) {
    console.error("Error al guardar postulación en Supabase:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  return data;
}

export async function deleteJobFromSupabase(jobId: string) {
  if (!isSupabaseConfigured() || !jobId) return;
  const supabase = createClient();
  await supabase.from("job_applications").delete().eq("id", jobId);
}

// ─── 4. EVALUACIONES ATS ──────────────────────────────────────────────────────
export async function saveATSEvaluationToSupabase(userId: string, report: EvaluationReport) {
  const authUserId = await getValidatedAuthUserId(userId);
  if (!authUserId) return null;

  const supabase = createClient();

  const isJobUuid = report.jobId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(report.jobId);

  const payload: any = {
    user_id: authUserId,
    job_id: isJobUuid ? report.jobId : null,
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
    .maybeSingle();

  if (error) {
    console.error("Error al guardar evaluación ATS en Supabase:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  return data;
}
