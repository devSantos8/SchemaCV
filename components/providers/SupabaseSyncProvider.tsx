"use client";

import React, { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useJobsStore } from "@/store/useJobsStore";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchUserResumes,
  upsertResumeToSupabase,
  fetchUserJobs,
  upsertJobToSupabase,
  getSupabaseProfile,
} from "@/lib/supabase/db";
import type { ResumeProfile, TemplateId } from "@/types/resume";
import type { JobApplication } from "@/types/jobs";

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, initSession } = useAuthStore();
  const { profiles, resumeData, masterProfileData } = useResumeStore();
  const { applications } = useJobsStore();
  const syncedUserIdRef = useRef<string | null>(null);

  // 1. Escuchar cambios de sesión de Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    initSession();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getSupabaseProfile(session.user.id);
        useAuthStore.setState({
          user: {
            id: session.user.id,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuario",
            email: session.user.email || "",
            avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
            bannerTheme: profile?.banner_theme || "default",
            joinedDate: new Date(session.user.created_at).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            }),
            isDemoUser: false,
          },
          isAuthenticated: true,
          isAuthModalOpen: false,
        });
      } else if (event === "SIGNED_OUT") {
        syncedUserIdRef.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initSession]);

  // 2. Sincronización de datos al iniciar sesión con usuario real
  useEffect(() => {
    if (!user || user.isDemoUser || !isSupabaseConfigured()) return;
    if (syncedUserIdRef.current === user.id) return;

    syncedUserIdRef.current = user.id;

    async function syncUserData(userId: string) {
      try {
        // A. Cargar currículums de Supabase
        const cloudResumes = await fetchUserResumes(userId);
        if (cloudResumes && cloudResumes.length > 0) {
          const master = cloudResumes.find((r: any) => r.is_master);
          const standard = cloudResumes.filter((r: any) => !r.is_master);

          if (master && master.data) {
            useResumeStore.setState({ masterProfileData: master.data });
          }

          if (standard.length > 0) {
            const mappedProfiles: ResumeProfile[] = standard.map((r: any) => ({
              id: r.id,
              name: r.name,
              targetRole: r.target_role || "",
              templateId: (r.template_id || "harvard") as TemplateId,
              paperSize: "letter" as const,
              createdAt: r.created_at,
              updatedAt: r.updated_at,
              data: r.data,
            }));

            useResumeStore.setState({
              profiles: mappedProfiles,
              activeProfileId: mappedProfiles[0].id,
              resumeData: mappedProfiles[0].data,
              activeTemplate: mappedProfiles[0].templateId,
            });
          }
        } else {
          // Si el usuario es nuevo, guardar su currículum inicial y perfil base en Supabase
          await upsertResumeToSupabase(userId, {
            name: "Perfil Base",
            templateId: "harvard",
            isMaster: true,
            data: masterProfileData,
          });

          await upsertResumeToSupabase(userId, {
            name: "Currículum Principal",
            targetRole: "Senior Full Stack & Cloud Developer",
            templateId: "harvard",
            isMaster: false,
            data: resumeData,
          });
        }

        // B. Cargar postulaciones del Job Tracker
        const cloudJobs = await fetchUserJobs(userId);
        if (cloudJobs && cloudJobs.length > 0) {
          const mappedJobs: JobApplication[] = cloudJobs.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            status: j.status,
            location: j.location,
            salary: j.salary,
            url: j.url,
            portal: j.portal,
            description: j.description || "",
            notes: j.notes || "",
            keywords: j.keywords || [],
            matchAnalysis: j.match_analysis,
            activity: j.activity || [],
            evaluations: [],
            createdAt: j.created_at,
            updatedAt: j.updated_at,
          }));

          useJobsStore.setState({ applications: mappedJobs });
        }
      } catch (err) {
        console.error("Error durante la sincronización inicial de Supabase:", err);
      }
    }

    syncUserData(user.id);
  }, [user?.id, user?.isDemoUser, masterProfileData, resumeData]);

  return <>{children}</>;
}
