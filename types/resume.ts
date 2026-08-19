import { z } from "zod";

// Red social / Enlace de contacto
export const SocialNetworkSchema = z.object({
  network: z.string().describe("Nombre de la plataforma, ej: LinkedIn, GitHub, X, Portfolio"),
  username: z.string().optional().describe("Nombre de usuario"),
  url: z.string().url().describe("URL completa"),
  icon: z.string().optional().describe("Nombre del icono Lucide opcional"),
});

export type SocialNetwork = z.infer<typeof SocialNetworkSchema>;

// Entrada de Experiencia Laboral
export const ExperienceEntrySchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  location: z.string().optional(),
  start_date: z.string().describe("Fecha de inicio, ej: 2022-03 o Mar 2022"),
  end_date: z.string().optional().describe("Fecha de fin o 'Presente'"),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]).describe("Viñetas con impacto cuantitativo (STAR/XYZ)"),
  summary: z.string().optional(),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;

// Entrada de Educación
export const EducationEntrySchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  area: z.string().optional().describe("Área de estudio / Especialidad"),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type EducationEntry = z.infer<typeof EducationEntrySchema>;

// Categoría de Habilidad
export const SkillCategorySchema = z.object({
  id: z.string(),
  category: z.string().describe("Nombre de la categoría, ej: Languages, Frameworks, Cloud & DevOps"),
  skills: z.array(z.string()).describe("Lista de habilidades individuales"),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type SkillCategory = z.infer<typeof SkillCategorySchema>;

// Entrada de Proyecto
export const ProjectEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;

// Entrada de Certificación
export const CertificationEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  url: z.string().url().optional(),
  summary: z.string().optional(),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;

// Entrada de Publicación o Logro Personalizado
export const CustomEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type CustomEntry = z.infer<typeof CustomEntrySchema>;

// Sección Personalizada
export const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  entries: z.array(CustomEntrySchema).default([]),
  hidden: z.boolean().default(false).optional().describe("Si es true, se oculta del CV final"),
});

export type CustomSection = z.infer<typeof CustomSectionSchema>;

// Tipo y Orden de Secciones
export type SectionType =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "custom";

export interface SectionMeta {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
}

// Idioma del currículum para ATS
export type ResumeLanguage = "es" | "en";

export const SECTION_LABELS: Record<
  ResumeLanguage,
  {
    summary: string;
    skills: string;
    experience: string;
    projects: string;
    education: string;
    certifications: string;
    present: string;
  }
> = {
  es: {
    summary: "Resumen Profesional",
    skills: "Competencias Técnicas",
    experience: "Experiencia Laboral",
    projects: "Proyectos Destacados",
    education: "Educación & Formación",
    certifications: "Certificaciones",
    present: "Presente",
  },
  en: {
    summary: "Professional Summary",
    skills: "Technical Skills",
    experience: "Work Experience",
    projects: "Key Projects",
    education: "Education",
    certifications: "Certifications & Credentials",
    present: "Present",
  },
};

// Estructura completa de CV compatible con RenderCV y optimizada para ATS
export const ResumeSchema = z.object({
  name: z.string(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  language: z.enum(["es", "en"]).default("es").optional(),
  social_networks: z.array(SocialNetworkSchema).default([]),
  
  // Secciones
  skills: z.array(SkillCategorySchema).default([]),
  experience: z.array(ExperienceEntrySchema).default([]),
  projects: z.array(ProjectEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  certifications: z.array(CertificationEntrySchema).default([]),
  custom_sections: z.array(CustomSectionSchema).default([]),
  
  // Metadatos de visibilidad y orden de secciones
  hidden_sections: z.array(z.string()).default([]).optional().describe("Lista de IDs de secciones ocultas"),
  section_order: z.array(z.string()).default([
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications"
  ]),
});

export type ResumeData = z.infer<typeof ResumeSchema>;

/**
 * Filtra los datos del CV excluyendo secciones ocultas y elementos individuales marcados como hidden: true.
 * Esto permite que el renderizado de plantillas y exportadores reflow automáticamente el contenido visible.
 */
export function getVisibleResumeData(data: ResumeData): ResumeData {
  const hiddenSections = new Set(data.hidden_sections || []);

  return {
    ...data,
    section_order: (data.section_order || []).filter((s) => !hiddenSections.has(s)),
    skills: (data.skills || []).filter((item) => !item.hidden),
    experience: (data.experience || []).filter((item) => !item.hidden),
    projects: (data.projects || []).filter((item) => !item.hidden),
    education: (data.education || []).filter((item) => !item.hidden),
    certifications: (data.certifications || []).filter((item) => !item.hidden),
    custom_sections: (data.custom_sections || [])
      .filter((sec) => !sec.hidden)
      .map((sec) => ({
        ...sec,
        entries: (sec.entries || []).filter((e) => !e.hidden),
      })),
  };
}

// Tipo de plantilla
export type TemplateId =
  | "harvard"
  | "tech_minimalist"
  | "modern_executive"
  | "skills_first"
  | "stanford_clean"
  | "compact_swiss"
  | "executive_serif"
  | "tech_compact"
  | "modern_minimal"
  | "career_changer"
  | "academic_international";

export type PaperSize = "letter" | "a4";

// Perfil de CV guardado
export interface ResumeProfile {
  id: string;
  name: string;
  targetRole: string;
  templateId: TemplateId;
  paperSize: PaperSize;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}
