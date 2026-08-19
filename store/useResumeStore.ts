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
import { INITIAL_PROFILES, SAMPLE_RESUME_FULLSTACK } from "@/lib/mock/sampleResumes";
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

  // Modales y estados de UI
  isImportModalOpen: boolean;
  isProfileModalOpen: boolean;
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

  // Acciones de Modales
  setImportModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setIsExporting: (exporting: boolean) => void;

  // Carga e Importación completa
  loadImportedResume: (data: ResumeData) => void;
  resetToSampleData: () => void;
}

const initialProfile = INITIAL_PROFILES[0];
const initialYaml = resumeDataToYaml(initialProfile.data);

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set, get) => ({
      profiles: INITIAL_PROFILES,
      activeProfileId: initialProfile.id,
      resumeData: initialProfile.data,
      yamlContent: initialYaml,
      yamlError: null,

      // Pila de historial
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,

      activeTab: "visual",
      activeTemplate: initialProfile.templateId,
      paperSize: initialProfile.paperSize,
      zoom: 100,

      isImportModalOpen: false,
      isProfileModalOpen: false,
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

          // Registrar en la pila de historial si hubo cambio
          let newPast = state.historyPast;
          if (recordHistory) {
            newPast = [...state.historyPast, state.resumeData].slice(-MAX_HISTORY_LENGTH);
          }

          const updatedProfiles = state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? {
                  ...p,
                  data: updatedData,
                  templateId: state.activeTemplate,
                  paperSize: state.paperSize,
                  updatedAt: new Date().toISOString(),
                }
              : p
          );

          return {
            resumeData: updatedData,
            yamlContent: newYaml,
            yamlError: null,
            historyPast: newPast,
            historyFuture: recordHistory ? [] : state.historyFuture,
            canUndo: newPast.length > 0,
            canRedo: recordHistory ? false : state.historyFuture.length > 0,
            profiles: updatedProfiles,
          };
        });
      },

      // Actualizar contenido YAML desde el Editor CodeMirror
      setYamlContent: (newYaml: string) => {
        set((state) => {
          const parseResult = yamlToResumeData(newYaml);

          if (parseResult.success && parseResult.data) {
            const updatedData = parseResult.data;
            const newPast = [...state.historyPast, state.resumeData].slice(-MAX_HISTORY_LENGTH);
            const updatedProfiles = state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    data: updatedData,
                    updatedAt: new Date().toISOString(),
                  }
                : p
            );

            return {
              yamlContent: newYaml,
              resumeData: updatedData,
              yamlError: null,
              historyPast: newPast,
              historyFuture: [],
              canUndo: newPast.length > 0,
              canRedo: false,
              profiles: updatedProfiles,
            };
          } else {
            return {
              yamlContent: newYaml,
              yamlError: parseResult.error || "Error de sintaxis YAML",
            };
          }
        });
      },

      // Re-formatear el YAML actual
      formatCurrentYaml: () => {
        const { resumeData } = get();
        const formatted = resumeDataToYaml(resumeData);
        set({
          yamlContent: formatted,
          yamlError: null,
        });
      },

      // Cambiar de perfil activo
      setActiveProfile: (profileId: string) => {
        const { profiles } = get();
        const found = profiles.find((p) => p.id === profileId);
        if (found) {
          const yaml = resumeDataToYaml(found.data);
          set({
            activeProfileId: found.id,
            resumeData: found.data,
            yamlContent: yaml,
            yamlError: null,
            activeTemplate: found.templateId,
            paperSize: found.paperSize,
            historyPast: [],
            historyFuture: [],
            canUndo: false,
            canRedo: false,
          });
        }
      },

      // Crear nuevo perfil
      createProfile: (name: string, targetRole: string, cloneCurrent = true) => {
        const { resumeData, activeTemplate, paperSize, profiles } = get();
        const newId = `profile-${Date.now()}`;
        const newProfileData: ResumeData = cloneCurrent
          ? JSON.parse(JSON.stringify(resumeData))
          : {
              ...SAMPLE_RESUME_FULLSTACK,
              headline: targetRole,
            };

        const newProfile: ResumeProfile = {
          id: newId,
          name,
          targetRole,
          templateId: activeTemplate,
          paperSize,
          data: newProfileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedProfiles = [...profiles, newProfile];
        const yaml = resumeDataToYaml(newProfileData);

        set({
          profiles: updatedProfiles,
          activeProfileId: newId,
          resumeData: newProfileData,
          yamlContent: yaml,
          yamlError: null,
          historyPast: [],
          historyFuture: [],
          canUndo: false,
          canRedo: false,
        });
      },

      // Duplicar perfil existente
      duplicateProfile: (profileId: string) => {
        const { profiles } = get();
        const target = profiles.find((p) => p.id === profileId);
        if (!target) return;

        const newId = `profile-${Date.now()}`;
        const cloned: ResumeProfile = {
          ...target,
          id: newId,
          name: `${target.name} (Copia)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          profiles: [...profiles, cloned],
          activeProfileId: newId,
          resumeData: cloned.data,
          yamlContent: resumeDataToYaml(cloned.data),
          yamlError: null,
          historyPast: [],
          historyFuture: [],
          canUndo: false,
          canRedo: false,
        });
      },

      // Eliminar perfil
      deleteProfile: (profileId: string) => {
        const { profiles, activeProfileId } = get();
        if (profiles.length <= 1) return;

        const remaining = profiles.filter((p) => p.id !== profileId);
        let nextActive = remaining[0];
        if (activeProfileId === profileId) {
          set({
            profiles: remaining,
            activeProfileId: nextActive.id,
            resumeData: nextActive.data,
            yamlContent: resumeDataToYaml(nextActive.data),
            yamlError: null,
            activeTemplate: nextActive.templateId,
            paperSize: nextActive.paperSize,
            historyPast: [],
            historyFuture: [],
            canUndo: false,
            canRedo: false,
          });
        } else {
          set({ profiles: remaining });
        }
      },

      // Actualizar metadatos de un perfil
      updateProfileMeta: (profileId: string, name: string, targetRole: string) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  name,
                  targetRole,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      // Selección de plantilla
      setActiveTemplate: (templateId: TemplateId) => {
        set((state) => ({
          activeTemplate: templateId,
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId ? { ...p, templateId } : p
          ),
        }));
      },

      // Tamaño de papel
      setPaperSize: (paperSize: PaperSize) => {
        set((state) => ({
          paperSize,
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId ? { ...p, paperSize } : p
          ),
        }));
      },

      // Zoom de la vista previa
      setZoom: (zoom: number) => {
        set({ zoom: Math.min(150, Math.max(50, zoom)) });
      },

      // Pestaña activa (Visual / YAML)
      setActiveTab: (activeTab) => set({ activeTab }),

      // Reordenar secciones
      setSectionOrder: (newOrder: string[]) => {
        get().setResumeData({ section_order: newOrder });
      },

      // Modales y estados
      setImportModalOpen: (open: boolean) => set({ isImportModalOpen: open }),
      setProfileModalOpen: (open: boolean) => set({ isProfileModalOpen: open }),
      setIsExporting: (exporting: boolean) => set({ isExporting: exporting }),

      // Cargar CV importado
      loadImportedResume: (data: ResumeData) => {
        const { resumeData } = get();
        const yaml = resumeDataToYaml(data);
        set((state) => ({
          resumeData: data,
          yamlContent: yaml,
          yamlError: null,
          historyPast: [...state.historyPast, resumeData].slice(-MAX_HISTORY_LENGTH),
          historyFuture: [],
          canUndo: true,
          canRedo: false,
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, data, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      // Restaurar datos de muestra con guardado en historial
      resetToSampleData: () => {
        const { resumeData } = get();
        const yaml = resumeDataToYaml(SAMPLE_RESUME_FULLSTACK);
        set((state) => ({
          resumeData: SAMPLE_RESUME_FULLSTACK,
          yamlContent: yaml,
          yamlError: null,
          historyPast: [...state.historyPast, resumeData].slice(-MAX_HISTORY_LENGTH),
          historyFuture: [],
          canUndo: true,
          canRedo: false,
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, data: SAMPLE_RESUME_FULLSTACK, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
    }),
    {
      name: "schemacv-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        activeTemplate: state.activeTemplate,
        paperSize: state.paperSize,
        zoom: state.zoom,
      }),
    }
  )
);
