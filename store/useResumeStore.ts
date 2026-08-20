import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ResumeData,
  ResumeProfile,
  TemplateId,
  PaperSize,
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  ProjectEntry,
  CertificationEntry,
} from "@/types/resume";
import { EMPTY_RESUME_DATA, INITIAL_PROFILES, SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
import { resumeDataToYaml, yamlToResumeData } from "@/lib/exporters/yamlExporter";

const MAX_HISTORY_LENGTH = 50;

interface ResumeStoreState {
  // Perfiles
  profiles: ResumeProfile[];
  activeProfileId: string;

  // Estado del CV activo
  resumeData: ResumeData;
  yamlContent: string;
  yamlError: string | null;

  // Historial Deshacer / Rehacer (Undo / Redo)
  historyPast: ResumeData[];
  historyFuture: ResumeData[];

  // Preferencias de visualización
  activeTab: "visual" | "yaml";
  activeTemplate: TemplateId;
  paperSize: PaperSize;
  zoom: number;

  // Perfil Base Maestro (Información Completa de Carrera)
  masterProfileData: ResumeData;

  // Modales y estados de UI
  isImportModalOpen: boolean;
  isProfileModalOpen: boolean;
  isTemplateGalleryOpen: boolean;
  isMasterProfileModalOpen: boolean;
  isExporting: boolean;
  isSaving: boolean;

  // Acciones de Deshacer / Rehacer
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Acciones para sincronización de datos
  setResumeData: (updater: Partial<ResumeData> | ((prev: ResumeData) => Partial<ResumeData>), syncYaml?: boolean, recordHistory?: boolean) => void;
  setYamlContent: (newYaml: string) => void;
  formatCurrentYaml: () => void;

  // Acciones de Perfiles
  setActiveProfile: (profileId: string) => void;
  createProfile: (name: string, targetRole: string, cloneCurrent?: boolean) => void;
  duplicateProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  updateProfileMeta: (profileId: string, name: string, targetRole: string) => void;

  // Acciones de Plantilla y Vista
  setActiveTemplate: (templateId: TemplateId) => void;
  setPaperSize: (paperSize: PaperSize) => void;
  setZoom: (zoom: number) => void;
  setActiveTab: (tab: "visual" | "yaml") => void;

  // Acciones de Reordenamiento de Secciones
  setSectionOrder: (newOrder: string[]) => void;

  // Acciones de Perfil Base Maestro
  updateMasterProfileData: (updater: Partial<ResumeData> | ((prev: ResumeData) => Partial<ResumeData>)) => void;
  syncActiveCvWithMaster: () => void;
  saveActiveCvAsMaster: () => void;
  createProfileFromMaster: (name: string, targetRole: string, templateId?: TemplateId) => void;

  // Acciones de Modales
  setImportModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setTemplateGalleryOpen: (open: boolean) => void;
  setMasterProfileModalOpen: (open: boolean) => void;
  setIsExporting: (exporting: boolean) => void;

  // Carga e Importación completa
  loadImportedResume: (data: ResumeData) => void;
  resetToSampleData: () => void;
  clearUserData: (userName?: string, userEmail?: string) => void;
}

const defaultEmptyData: ResumeData = { ...EMPTY_RESUME_DATA };
const defaultEmptyYaml = resumeDataToYaml(defaultEmptyData);

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: "",
      resumeData: defaultEmptyData,
      yamlContent: defaultEmptyYaml,
      yamlError: null,

      // Pila de historial
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,

      activeTab: "visual",
      activeTemplate: "harvard",
      paperSize: "letter",
      zoom: 100,

      masterProfileData: defaultEmptyData,

      isImportModalOpen: false,
      isProfileModalOpen: false,
      isTemplateGalleryOpen: false,
      isMasterProfileModalOpen: false,
      isExporting: false,
      isSaving: false,

      // Acción Deshacer (Undo)
      undo: () => {
        set((state) => {
          if (state.historyPast.length === 0) return state;

          const previous = state.historyPast[state.historyPast.length - 1];
          const newPast = state.historyPast.slice(0, state.historyPast.length - 1);
          const newFuture = [state.resumeData, ...state.historyFuture];

          const newYaml = resumeDataToYaml(previous);
          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, data: previous, updatedAt: new Date().toISOString() }
              : p
          );

          return {
            resumeData: previous,
            yamlContent: newYaml,
            yamlError: null,
            historyPast: newPast,
            historyFuture: newFuture,
            canUndo: newPast.length > 0,
            canRedo: newFuture.length > 0,
            profiles: updatedProfiles,
          };
        });
      },

      // Acción Rehacer (Redo)
      redo: () => {
        set((state) => {
          if (state.historyFuture.length === 0) return state;

          const next = state.historyFuture[0];
          const newFuture = state.historyFuture.slice(1);
          const newPast = [...state.historyPast, state.resumeData];

          const newYaml = resumeDataToYaml(next);
          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, data: next, updatedAt: new Date().toISOString() }
              : p
          );

          return {
            resumeData: next,
            yamlContent: newYaml,
            yamlError: null,
            historyPast: newPast,
            historyFuture: newFuture,
            canUndo: newPast.length > 0,
            canRedo: newFuture.length > 0,
            profiles: updatedProfiles,
          };
        });
      },

      // Actualizar datos del CV con registro automático en el historial
      setResumeData: (updater, syncYaml = true, recordHistory = true) => {
        set((state) => {
          const updatedPartial = typeof updater === "function" ? updater(state.resumeData) : updater;
          const updatedData: ResumeData = {
            ...state.resumeData,
            ...updatedPartial,
          };

          const newYaml = syncYaml ? resumeDataToYaml(updatedData) : state.yamlContent;

          let newPast = state.historyPast;
          if (recordHistory) {
            newPast = [...state.historyPast, state.resumeData].slice(-MAX_HISTORY_LENGTH);
          }

          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, data: updatedData, updatedAt: new Date().toISOString() }
              : p
          );

          return {
            resumeData: updatedData,
            yamlContent: newYaml,
            yamlError: null,
            historyPast: newPast,
            historyFuture: [],
            canUndo: newPast.length > 0,
            canRedo: false,
            profiles: updatedProfiles,
          };
        });
      },

      // Actualizar YAML directamente y sincronizar bidireccionalmente
      setYamlContent: (newYaml) => {
        const { data, error } = yamlToResumeData(newYaml);
        set((state) => {
          if (error || !data) {
            return { yamlContent: newYaml, yamlError: error };
          }

          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, data, updatedAt: new Date().toISOString() }
              : p
          );

          const newPast = [...state.historyPast, state.resumeData].slice(-MAX_HISTORY_LENGTH);

          return {
            yamlContent: newYaml,
            yamlError: null,
            resumeData: data,
            historyPast: newPast,
            historyFuture: [],
            canUndo: newPast.length > 0,
            canRedo: false,
            profiles: updatedProfiles,
          };
        });
      },

      // Formatear YAML
      formatCurrentYaml: () => {
        set((state) => ({
          yamlContent: resumeDataToYaml(state.resumeData),
          yamlError: null,
        }));
      },

      // Gestión de Perfiles
      setActiveProfile: (profileId) => {
        const state = get();
        const profile = state.profiles.find((p) => p.id === profileId);
        if (profile) {
          const yaml = resumeDataToYaml(profile.data);
          set({
            activeProfileId: profile.id,
            resumeData: profile.data,
            yamlContent: yaml,
            yamlError: null,
            activeTemplate: profile.templateId,
            paperSize: profile.paperSize,
            historyPast: [],
            historyFuture: [],
            canUndo: false,
            canRedo: false,
          });
        }
      },

      createProfile: (name, targetRole, cloneCurrent = false) => {
        const state = get();
        const baseData: ResumeData = cloneCurrent ? { ...state.resumeData } : { ...EMPTY_RESUME_DATA };
        const newProfile: ResumeProfile = {
          id: crypto.randomUUID(),
          name,
          targetRole,
          templateId: state.activeTemplate || "harvard",
          paperSize: state.paperSize || "letter",
          data: baseData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedProfiles = [...state.profiles, newProfile];
        set({
          profiles: updatedProfiles,
          activeProfileId: newProfile.id,
          resumeData: newProfile.data,
          yamlContent: resumeDataToYaml(newProfile.data),
          yamlError: null,
          historyPast: [],
          historyFuture: [],
          canUndo: false,
          canRedo: false,
        });
      },

      duplicateProfile: (profileId) => {
        const state = get();
        const original = state.profiles.find((p) => p.id === profileId);
        if (!original) return;

        const duplicated: ResumeProfile = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copia)`,
          data: JSON.parse(JSON.stringify(original.data)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          profiles: [...state.profiles, duplicated],
          activeProfileId: duplicated.id,
          resumeData: duplicated.data,
          yamlContent: resumeDataToYaml(duplicated.data),
          activeTemplate: duplicated.templateId,
          paperSize: duplicated.paperSize,
        });
      },

      deleteProfile: (profileId) => {
        const state = get();
        if (state.profiles.length <= 1) return;

        const filtered = state.profiles.filter((p) => p.id !== profileId);
        let nextActive = state.activeProfileId;

        if (state.activeProfileId === profileId) {
          nextActive = filtered[0].id;
          const nextProfile = filtered[0];
          set({
            profiles: filtered,
            activeProfileId: nextActive,
            resumeData: nextProfile.data,
            yamlContent: resumeDataToYaml(nextProfile.data),
            activeTemplate: nextProfile.templateId,
            paperSize: nextProfile.paperSize,
            historyPast: [],
            historyFuture: [],
            canUndo: false,
            canRedo: false,
          });
        } else {
          set({ profiles: filtered });
        }
      },

      updateProfileMeta: (profileId, name, targetRole) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId
              ? { ...p, name, targetRole, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      setActiveTemplate: (templateId) => {
        set((state) => {
          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId ? { ...p, templateId } : p
          );
          return { activeTemplate: templateId, profiles: updatedProfiles };
        });
      },

      setPaperSize: (paperSize) => {
        set((state) => {
          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId ? { ...p, paperSize } : p
          );
          return { paperSize, profiles: updatedProfiles };
        });
      },

      setZoom: (zoom) => set({ zoom }),
      setActiveTab: (activeTab) => set({ activeTab }),

      setSectionOrder: (newOrder) => {
        get().setResumeData({ section_order: newOrder });
      },

      // Perfil Base Maestro
      updateMasterProfileData: (updater) => {
        set((state) => {
          const updatedPartial = typeof updater === "function" ? updater(state.masterProfileData) : updater;
          return {
            masterProfileData: {
              ...state.masterProfileData,
              ...updatedPartial,
            },
          };
        });
      },

      syncActiveCvWithMaster: () => {
        const { masterProfileData, setResumeData } = get();
        setResumeData({
          name: masterProfileData.name,
          email: masterProfileData.email,
          phone: masterProfileData.phone,
          location: masterProfileData.location,
          website: masterProfileData.website,
          social_networks: masterProfileData.social_networks,
        });
      },

      saveActiveCvAsMaster: () => {
        const { resumeData } = get();
        set({ masterProfileData: { ...resumeData } });
      },

      createProfileFromMaster: (name, targetRole, templateId = "harvard") => {
        const state = get();
        const newProfile: ResumeProfile = {
          id: crypto.randomUUID(),
          name,
          targetRole,
          templateId,
          paperSize: "letter",
          data: {
            ...state.masterProfileData,
            headline: targetRole,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedProfiles = [...state.profiles, newProfile];
        set({
          profiles: updatedProfiles,
          activeProfileId: newProfile.id,
          resumeData: newProfile.data,
          yamlContent: resumeDataToYaml(newProfile.data),
          yamlError: null,
          activeTemplate: templateId,
          historyPast: [],
          historyFuture: [],
          canUndo: false,
          canRedo: false,
        });
      },

      setImportModalOpen: (isImportModalOpen) => set({ isImportModalOpen }),
      setProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),
      setTemplateGalleryOpen: (isTemplateGalleryOpen) => set({ isTemplateGalleryOpen }),
      setMasterProfileModalOpen: (isMasterProfileModalOpen) => set({ isMasterProfileModalOpen }),
      setIsExporting: (isExporting) => set({ isExporting }),

      loadImportedResume: (data) => {
        const state = get();
        const newProfile: ResumeProfile = {
          id: crypto.randomUUID(),
          name: data.headline ? `Perfil ${data.headline}` : "CV Importado",
          targetRole: data.headline || "Profesional",
          templateId: "harvard",
          paperSize: "letter",
          data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          profiles: [...state.profiles, newProfile],
          activeProfileId: newProfile.id,
          resumeData: data,
          yamlContent: resumeDataToYaml(data),
          yamlError: null,
          activeTemplate: "harvard",
          historyPast: [],
          historyFuture: [],
          canUndo: false,
          canRedo: false,
        });
      },

      resetToSampleData: () => {
        const initial = INITIAL_PROFILES[0];
        set({
          profiles: INITIAL_PROFILES,
          activeProfileId: initial.id,
          resumeData: initial.data,
          yamlContent: resumeDataToYaml(initial.data),
          masterProfileData: SAMPLE_RESUME_FULLSTACK,
          activeTemplate: initial.templateId,
        });
      },

      clearUserData: (userName = "", userEmail = "") => {
        const cleanData: ResumeData = {
          ...EMPTY_RESUME_DATA,
          name: userName,
          email: userEmail,
        };
        set({
          profiles: [],
          activeProfileId: "",
          resumeData: cleanData,
          yamlContent: resumeDataToYaml(cleanData),
          yamlError: null,
          masterProfileData: cleanData,
          historyPast: [],
          historyFuture: [],
          canUndo: false,
          canRedo: false,
        });
      },
    }),
    {
      name: "schemacv-resume-storage-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
