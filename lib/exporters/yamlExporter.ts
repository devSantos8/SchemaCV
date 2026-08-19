import YAML from "yaml";
import { ResumeData } from "@/types/resume";
import { mapRenderCvToSchemaCv, validateAndNormalizeResume } from "@/lib/schemas/resumeSchema";

/**
 * Convierte un objeto ResumeData a un string YAML limpio, ordenado y compatible con RenderCV y ATS.
 */
export function resumeDataToYaml(data: ResumeData): string {
  // Construimos una estructura limpia y legible
  const yamlObject: Record<string, any> = {
    cv: {
      name: data.name,
      ...(data.headline ? { headline: data.headline } : {}),
      ...(data.location ? { location: data.location } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.website ? { website: data.website } : {}),
      ...(data.social_networks && data.social_networks.length > 0
        ? {
            social_networks: data.social_networks.map((sn) => ({
              network: sn.network,
              ...(sn.username ? { username: sn.username } : {}),
              url: sn.url,
            })),
          }
        : {}),
      sections: {} as Record<string, any>,
    },
    meta: {
      section_order: data.section_order,
    },
  };

  const sections = yamlObject.cv.sections;

  // Resumen
  if (data.summary) {
    sections.summary = [data.summary];
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    sections.skills = data.skills.map((sc) => ({
      category: sc.category,
      skills: sc.skills,
    }));
  }

  // Experiencia
  if (data.experience && data.experience.length > 0) {
    sections.experience = data.experience.map((exp) => ({
      company: exp.company,
      position: exp.position,
      ...(exp.location ? { location: exp.location } : {}),
      start_date: exp.start_date,
      end_date: exp.end_date || (exp.current ? "Presente" : ""),
      ...(exp.highlights && exp.highlights.length > 0
        ? { highlights: exp.highlights }
        : {}),
      ...(exp.summary ? { summary: exp.summary } : {}),
    }));
  }

  // Proyectos
  if (data.projects && data.projects.length > 0) {
    sections.projects = data.projects.map((proj) => ({
      name: proj.name,
      ...(proj.description ? { description: proj.description } : {}),
      ...(proj.url ? { url: proj.url } : {}),
      ...(proj.github_url ? { github_url: proj.github_url } : {}),
      ...(proj.start_date ? { start_date: proj.start_date } : {}),
      ...(proj.end_date ? { end_date: proj.end_date } : {}),
      ...(proj.technologies && proj.technologies.length > 0
        ? { technologies: proj.technologies }
        : {}),
      ...(proj.highlights && proj.highlights.length > 0
        ? { highlights: proj.highlights }
        : {}),
    }));
  }

  // Educación
  if (data.education && data.education.length > 0) {
    sections.education = data.education.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      ...(edu.area ? { area: edu.area } : {}),
      ...(edu.location ? { location: edu.location } : {}),
      ...(edu.start_date ? { start_date: edu.start_date } : {}),
      ...(edu.end_date ? { end_date: edu.end_date } : {}),
      ...(edu.gpa ? { gpa: edu.gpa } : {}),
      ...(edu.highlights && edu.highlights.length > 0
        ? { highlights: edu.highlights }
        : {}),
    }));
  }

  // Certificaciones
  if (data.certifications && data.certifications.length > 0) {
    sections.certifications = data.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      ...(cert.date ? { date: cert.date } : {}),
      ...(cert.url ? { url: cert.url } : {}),
      ...(cert.summary ? { summary: cert.summary } : {}),
    }));
  }

  // Secciones personalizadas
  if (data.custom_sections && data.custom_sections.length > 0) {
    data.custom_sections.forEach((cs) => {
      const key = cs.title.toLowerCase().replace(/\s+/g, "_");
      sections[key] = cs.entries.map((entry) => ({
        title: entry.title,
        ...(entry.subtitle ? { subtitle: entry.subtitle } : {}),
        ...(entry.date ? { date: entry.date } : {}),
        ...(entry.location ? { location: entry.location } : {}),
        ...(entry.description ? { description: entry.description } : {}),
        ...(entry.highlights && entry.highlights.length > 0
          ? { highlights: entry.highlights }
          : {}),
      }));
    });
  }

  return YAML.stringify(yamlObject, {
    indent: 2,
    lineWidth: 0,
    singleQuote: false,
  });
}

/**
 * Parsea un string YAML y lo convierte a ResumeData, validando y normalizando.
 */
export function yamlToResumeData(yamlStr: string): {
  success: boolean;
  data: ResumeData | null;
  error?: string;
} {
  try {
    const parsed = YAML.parse(yamlStr);
    if (!parsed || typeof parsed !== "object") {
      return { success: false, data: null, error: "El contenido YAML no es un objeto válido." };
    }

    // Normalizar a formato SchemaCV
    const normalizedPartial = mapRenderCvToSchemaCv(parsed);

    // Conservar metadatos de orden si existen
    if (parsed.meta?.section_order && Array.isArray(parsed.meta.section_order)) {
      normalizedPartial.section_order = parsed.meta.section_order;
    }

    // Resumen directo de cv.sections.summary
    const summaryRaw = parsed.cv?.sections?.summary || parsed.sections?.summary;
    if (Array.isArray(summaryRaw) && summaryRaw.length > 0) {
      normalizedPartial.summary = summaryRaw.join(" ");
    } else if (typeof summaryRaw === "string") {
      normalizedPartial.summary = summaryRaw;
    }

    const validation = validateAndNormalizeResume(normalizedPartial);
    if (validation.success && validation.data) {
      return { success: true, data: validation.data };
    }

    return {
      success: false,
      data: null,
      error: `Error de validación: ${validation.errors.slice(0, 3).join(", ")}`,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: `Sintaxis YAML inválida: ${err.message || "Error desconocido"}`,
    };
  }
}
