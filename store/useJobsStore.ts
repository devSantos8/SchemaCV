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
          createdAt: now(),
          updatedAt: now(),
          appliedAt: data.appliedAt,
        };
        set((s) => ({ applications: [entry, ...s.applications] }));
        return entry;
      },

      updateApplication(id, updates) {
        set((s) => ({
          applications: s.applications.map((app) =>
            app.id === id
              ? {
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
                }
              : app
          ),
        }));
      },

      deleteApplication(id) {
        set((s) => ({
          applications: s.applications.filter((a) => a.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        }));
      },

      duplicateApplication(id) {
        const app = get().applications.find((a) => a.id === id);
        if (!app) return;
        const copy: JobApplication = {
          ...app,
          id: crypto.randomUUID(),
          status: "bookmarked",
          activity: addActivity([], "note", "Duplicada desde otra postulacion"),
          createdAt: now(),
          updatedAt: now(),
          appliedAt: undefined,
        };
        set((s) => ({ applications: [copy, ...s.applications] }));
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

          set((s) => ({
            isAnalyzing: false,
            applications: s.applications.map((a) =>
              a.id === id
                ? {
                    ...a,
                    keywords,
                    matchAnalysis: fullAnalysis,
                    updatedAt: now(),
                    activity: addActivity(a.activity, "ai_analysis", "Analisis de keywords realizado"),
                  }
                : a
            ),
          }));
        } catch {
          set({ isAnalyzing: false });
        }
      },

      setMatchAnalysis(id, analysis) {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  matchAnalysis: analysis,
                  updatedAt: now(),
                  activity: addActivity(a.activity, "ai_analysis", "Analisis de match actualizado por IA"),
                }
              : a
          ),
        }));
      },

      setKeywords(id, keywords) {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, keywords, updatedAt: now() } : a
          ),
        }));
      },

      // ─── Links ───────────────────────────────────────────────────────────
      setLinkCheck(id, result) {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  linkCheck: result,
                  updatedAt: now(),
                  activity: addActivity(
                    a.activity,
                    "link_check",
                    result.ok ? "Link verificado: activo" : "Link verificado: inactivo o roto"
                  ),
                }
              : a
          ),
        }));
      },

      setIsCheckingLinks(v) {
        set({ isCheckingLinks: v });
      },

      setIsScrapingUrl(v) {
        set({ isScrapingUrl: v });
      },

      // ─── Notas ───────────────────────────────────────────────────────────
      updateNotes(id, notes) {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, notes, updatedAt: now() } : a
          ),
        }));
      },

      // ─── Selectores derivados ─────────────────────────────────────────────
      getStaleApplications() {
        const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
        return get().applications.filter(
          (a) =>
            a.status === "applied" &&
            new Date(a.updatedAt).getTime() < cutoff
        );
      },

      getByStatus(status) {
        return get().applications.filter((a) => a.status === status);
      },

      getTopMissingKeywords(id) {
        const app = get().applications.find((a) => a.id === id);
        if (!app?.matchAnalysis) return [];
        return app.matchAnalysis.missing.slice(0, 8);
      },
    }),
    {
      name: "schemacv-jobs",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
