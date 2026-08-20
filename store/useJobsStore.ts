import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  JobApplication,
  ApplicationStatus,
  Keyword,
  MatchAnalysis,
  LinkCheckResult,
  ActivityEntry,
} from "@/types/jobs";
import type { ResumeData } from "@/types/resume";
import { extractKeywordsLocal, computeMatchScore } from "@/lib/ai/localAnalyzer";
import { useAuthStore } from "./useAuthStore";
import { upsertJobToSupabase, deleteJobFromSupabase, saveATSEvaluationToSupabase } from "@/lib/supabase/db";

const STALE_DAYS = 7;

function now(): string {
  return new Date().toISOString();
}

function addActivity(
  activities: ActivityEntry[],
  type: ActivityEntry["type"],
  description: string
): ActivityEntry[] {
  return [
    { id: crypto.randomUUID(), type, description, createdAt: now() },
    ...activities,
  ].slice(0, 50);
}

function syncJobIfAuthenticated(job: JobApplication) {
  try {
    const user = useAuthStore.getState().user;
    if (user && !user.isDemoUser && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      upsertJobToSupabase(user.id, job);
    }
  } catch (err) {
    console.error("Error en sync de job:", err);
  }
}

// ─── Estado del store ─────────────────────────────────────────────────────────
interface JobsStoreState {
  applications: JobApplication[];
  selectedId: string | null;
  isScrapingUrl: boolean;
  isCheckingLinks: boolean;
  isAnalyzing: boolean;

  // CRUD
  addApplication: (
    data: Pick<JobApplication, "title" | "company"> &
      Partial<Omit<JobApplication, "id" | "createdAt" | "updatedAt">>
  ) => JobApplication;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  duplicateApplication: (id: string) => void;
  setSelectedId: (id: string | null) => void;

  // Analisis de keywords
  analyzeKeywords: (id: string, resumeData: ResumeData) => void;
  setMatchAnalysis: (id: string, analysis: MatchAnalysis) => void;
  setKeywords: (id: string, keywords: Keyword[]) => void;

  // Verificacion de links
  setLinkCheck: (id: string, result: LinkCheckResult) => void;
  setIsCheckingLinks: (v: boolean) => void;
  setIsScrapingUrl: (v: boolean) => void;

  // Evaluaciones ATS
  saveEvaluation: (jobId: string, report: import("@/types/evaluator").EvaluationReport) => void;
  getLatestEvaluation: (jobId: string) => import("@/types/evaluator").EvaluationReport | undefined;

  // Notas
  updateNotes: (id: string, notes: string) => void;

  // Selectores derivados
  getStaleApplications: () => JobApplication[];
  getByStatus: (status: ApplicationStatus) => JobApplication[];
  getTopMissingKeywords: (id: string) => Keyword[];
}

export const useJobsStore = create<JobsStoreState>()(
  persist(
    (set, get) => ({
      applications: [],
      selectedId: null,
      isScrapingUrl: false,
      isCheckingLinks: false,
      isAnalyzing: false,

      // ─── CRUD ────────────────────────────────────────────────────────────
      addApplication(data) {
        const entry: JobApplication = {
          id: crypto.randomUUID(),
          title: data.title,
          company: data.company,
          url: data.url,
          status: data.status ?? "bookmarked",
          description: data.description ?? "",
          notes: data.notes ?? "",
          location: data.location,
          salary: data.salary,
          portal: data.portal,
          keywords: data.keywords ?? [],
          matchAnalysis: data.matchAnalysis,
          linkCheck: data.linkCheck,
          activity: addActivity([], "note", "Postulacion creada"),
          evaluations: data.evaluations ?? [],
          lastEvaluationReport: data.lastEvaluationReport,
          createdAt: now(),
          updatedAt: now(),
          appliedAt: data.appliedAt,
        };
        set((s) => ({ applications: [entry, ...s.applications] }));
        syncJobIfAuthenticated(entry);
        return entry;
      },

      updateApplication(id, updates) {
        set((s) => {
          const updatedApps = s.applications.map((app) => {
            if (app.id !== id) return app;
            const updated = {
              ...app,
              ...updates,
              updatedAt: now(),
              activity:
                updates.status && updates.status !== app.status
                  ? addActivity(
                      app.activity,
                      "status_change",
                      `Estado cambiado a "${updates.status}"`
                    )
                  : app.activity,
            };
            syncJobIfAuthenticated(updated);
            return updated;
          });
          return { applications: updatedApps };
        });
      },

      deleteApplication(id) {
        set((s) => ({
          applications: s.applications.filter((a) => a.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        }));
        try {
          const user = useAuthStore.getState().user;
          if (user && !user.isDemoUser) {
            deleteJobFromSupabase(id);
          }
        } catch (err) {
          console.error("Error al eliminar job en Supabase:", err);
        }
      },

      duplicateApplication(id) {
        const app = get().applications.find((a) => a.id === id);
        if (!app) return;
        const copy: JobApplication = {
          ...app,
          id: crypto.randomUUID(),
          status: "bookmarked",
          activity: addActivity([], "note", "Duplicada desde otra postulacion"),
          evaluations: app.evaluations ?? [],
          lastEvaluationReport: app.lastEvaluationReport,
          createdAt: now(),
          updatedAt: now(),
          appliedAt: undefined,
        };
        set((s) => ({ applications: [copy, ...s.applications] }));
        syncJobIfAuthenticated(copy);
      },

      setSelectedId(id) {
        set({ selectedId: id });
      },

      // ─── Analisis ────────────────────────────────────────────────────────
      analyzeKeywords(id, resumeData) {
        const app = get().applications.find((a) => a.id === id);
        if (!app || !app.description) return;

        set({ isAnalyzing: true });
        try {
          const keywords = extractKeywordsLocal(app.description);
          const analysis = computeMatchScore(keywords, resumeData);
          const fullAnalysis: MatchAnalysis = {
            ...analysis,
            suggestions: [],
          };

          set((s) => {
            const updatedApps = s.applications.map((a) => {
              if (a.id !== id) return a;
              const updated = {
                ...a,
                keywords,
                matchAnalysis: fullAnalysis,
                updatedAt: now(),
                activity: addActivity(a.activity, "ai_analysis", "Analisis de keywords realizado"),
              };
              syncJobIfAuthenticated(updated);
              return updated;
            });
            return {
              isAnalyzing: false,
              applications: updatedApps,
            };
          });
        } catch {
          set({ isAnalyzing: false });
        }
      },

      setMatchAnalysis(id, analysis) {
        set((s) => {
          const updatedApps = s.applications.map((a) => {
            if (a.id !== id) return a;
            const updated = {
              ...a,
              matchAnalysis: analysis,
              updatedAt: now(),
              activity: addActivity(a.activity, "ai_analysis", "Analisis de match actualizado por IA"),
            };
            syncJobIfAuthenticated(updated);
            return updated;
          });
          return { applications: updatedApps };
        });
      },

      setKeywords(id, keywords) {
        set((s) => {
          const updatedApps = s.applications.map((a) => {
            if (a.id !== id) return a;
            const updated = { ...a, keywords, updatedAt: now() };
            syncJobIfAuthenticated(updated);
            return updated;
          });
          return { applications: updatedApps };
        });
      },

      // ─── Links ───────────────────────────────────────────────────────────
      setLinkCheck(id, result) {
        set((s) => {
          const updatedApps = s.applications.map((a) => {
            if (a.id !== id) return a;
            const updated = {
              ...a,
              linkCheck: result,
              updatedAt: now(),
              activity: addActivity(
                a.activity,
                "link_check",
                result.ok ? "Link verificado: activo" : "Link verificado: inactivo o roto"
              ),
            };
            syncJobIfAuthenticated(updated);
            return updated;
          });
          return { applications: updatedApps };
        });
      },

      setIsCheckingLinks(v) {
        set({ isCheckingLinks: v });
      },

      setIsScrapingUrl(v) {
        set({ isScrapingUrl: v });
      },

      // ─── Evaluaciones ATS ────────────────────────────────────────────────
      saveEvaluation(jobId, report) {
        set((s) => {
          const updatedApps = s.applications.map((a) => {
            if (a.id !== jobId) return a;
            const evals = a.evaluations ?? [];
            const updated = {
              ...a,
              lastEvaluationReport: report,
              evaluations: [report, ...evals].slice(0, 20),
              updatedAt: now(),
              activity: addActivity(
                a.activity,
                "ats_evaluation",
                `Evaluacion ATS realizada: Match ${report.matchScore}% | Formato ATS ${report.atsScore}%`
              ),
            };
            syncJobIfAuthenticated(updated);
            return updated;
          });
          return { applications: updatedApps };
        });

        try {
          const user = useAuthStore.getState().user;
          if (user && !user.isDemoUser && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            saveATSEvaluationToSupabase(user.id, report);
          }
        } catch (err) {
          console.error("Error al guardar evaluacion ATS en Supabase:", err);
        }
      },

      getLatestEvaluation(jobId) {
        const app = get().applications.find((a) => a.id === jobId);
        if (!app) return undefined;
        return app.lastEvaluationReport ?? app.evaluations?.[0];
      },

      // ─── Notas ───────────────────────────────────────────────────────────
      updateNotes(id, notes) {
        get().updateApplication(id, { notes });
      },

      // ─── Selectores ──────────────────────────────────────────────────────
      getStaleApplications() {
        const threshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
        return get().applications.filter(
          (a) => a.status !== "rejected" && a.status !== "offer" && a.updatedAt < threshold
        );
      },

      getByStatus(status) {
        return get().applications.filter((a) => a.status === status);
      },

      getTopMissingKeywords(id) {
        const app = get().applications.find((a) => a.id === id);
        if (!app?.matchAnalysis?.missing) return [];
        return app.matchAnalysis.missing.slice(0, 5);
      },
    }),
    {
      name: "schemacv-jobs-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
