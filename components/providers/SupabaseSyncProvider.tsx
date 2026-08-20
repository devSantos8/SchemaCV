"use client";

import React, { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useResumeStore } from "@/store/useResumeStore";
import { useJobsStore } from "@/store/useJobsStore";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchUserResumes,
  fetchUserJobs,
  getSupabaseProfile,
} from "@/lib/supabase/db";
import { EMPTY_RESUME_DATA, INITIAL_PROFILES, SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import { resumeDataToYaml } from "@/lib/exporters/yamlExporter";
import type { ResumeProfile, TemplateId } from "@/types/resume";
import type { JobApplication } from "@/types/jobs";

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, initSession } = useAuthStore();
  const syncedUserIdRef = useRef<string | null>(null);

  // 1. Escuchar cambios de sesión de Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    initSession();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getSupabaseProfile(session.user.id);
        const userName = profile?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuario";
        const userEmail = session.user.email || "";

        useAuthStore.setState({
          user: {
            id: session.user.id,
            name: userName,
            email: userEmail,
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
    if (!user) return;

    // Si es usuario demo/invitado, cargar datos de muestra
    if (user.isDemoUser) {
      if (syncedUserIdRef.current !== "demo") {
        syncedUserIdRef.current = "demo";
        useResumeStore.setState({
          profiles: INITIAL_PROFILES,
          activeProfileId: INITIAL_PROFILES[0].id,
          resumeData: INITIAL_PROFILES[0].data,
          yamlContent: resumeDataToYaml(INITIAL_PROFILES[0].data),
          masterProfileData: SAMPLE_RESUME_FULLSTACK,
          activeTemplate: INITIAL_PROFILES[0].templateId,
        });
      }
      return;
    }

    if (!isSupabaseConfigured()) return;

    // Validar que el user.id sea un UUID real de Supabase auth.users
    const isSupabaseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isSupabaseUuid) return;

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
          } else {
            useResumeStore.setState({
              masterProfileData: { ...EMPTY_RESUME_DATA, name: user?.name || "", email: user?.email || "" },
            });
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
              yamlContent: resumeDataToYaml(mappedProfiles[0].data),
              activeTemplate: mappedProfiles[0].templateId,
            });
          } else {
            // Usuario con cuenta pero sin CVs creados todavía
            const cleanData = { ...EMPTY_RESUME_DATA, name: user?.name || "", email: user?.email || "" };
            useResumeStore.setState({
              profiles: [],
              activeProfileId: "",
              resumeData: cleanData,
              yamlContent: "",
            });
          }
        } else {
          // Cuenta 100% nueva: iniciar en blanco (0 CVs, 0 datos mock)
          const cleanData = { ...EMPTY_RESUME_DATA, name: user?.name || "", email: user?.email || "" };
          useResumeStore.setState({
            profiles: [],
            activeProfileId: "",
            resumeData: cleanData,
            yamlContent: "",
            masterProfileData: cleanData,
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
        } else {
          // Cuenta nueva: iniciar con 0 postulaciones
          useJobsStore.setState({ applications: [] });
        }
      } catch (err) {
        console.error("Error durante la sincronización de Supabase:", err);
      }
    }

    syncUserData(user.id);
  }, [user?.id, user?.isDemoUser, user?.name, user?.email]);

  return <>{children}</>;
}
