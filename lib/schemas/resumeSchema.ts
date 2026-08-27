import {
  ResumeSchema,
  ResumeData,
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  ProjectEntry,
  CertificationEntry,
  ReferenceEntry,
  SocialNetwork,
  normalizeSocialUrl,
} from "@/types/resume";

export { ResumeSchema };

/**
 * Normaliza y valida datos de entrada de CV asegurando valores por defecto seguros.
 */
export function validateAndNormalizeResume(raw: unknown): {
  success: boolean;
  data: ResumeData | null;
  errors: string[];
} {
  const result = ResumeSchema.safeParse(raw);
  if (result.success) {
    // Normalizar redes sociales
    const normalizedSocial = (result.data.social_networks || []).map((sn) => {
      const { url, username } = normalizeSocialUrl(sn.network, sn.url || sn.username || "");
      return {
        ...sn,
        url: url || sn.url,
        username: username || sn.username,
      };
    });

    return {
      success: true,
      data: {
        ...result.data,
        social_networks: normalizedSocial,
      },
      errors: [],
    };
  }

  const errorMessages = result.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`
  );
  return {
    success: false,
    data: null,
    errors: errorMessages,
  };
}

/**
 * Convierte un formato YAML estilo RenderCV crudo al formato tipado de SchemaCV.
 */
export function mapRenderCvToSchemaCv(renderCvData: any): Partial<ResumeData> {
  const cv = renderCvData?.cv || renderCvData || {};
  const sections = cv.sections || {};

  // Mapeo de redes sociales
  const social_networks: SocialNetwork[] = [];
  if (Array.isArray(cv.social_networks)) {
    cv.social_networks.forEach((sn: any) => {
      const net = sn.network || "Link";
      const rawVal = sn.url || sn.username || "";
      const { url, username } = normalizeSocialUrl(net, rawVal);
      social_networks.push({
        network: net,
        username: username || sn.username || "",
        url: url || (sn.username ? `https://${net.toLowerCase()}.com/${sn.username}` : ""),
        icon: sn.network?.toLowerCase(),
      });
    });
  }

  // Mapeo de Experiencia
  const experience: ExperienceEntry[] = [];
  const rawExperience = sections.experience || sections.work_experience || [];
  if (Array.isArray(rawExperience)) {
    rawExperience.forEach((exp: any, idx: number) => {
      experience.push({
        id: `exp-${Date.now()}-${idx}`,
        company: exp.company || exp.organization || "Empresa",
        position: exp.position || exp.role || "Cargo",
        location: exp.location || "",
        start_date: exp.start_date || exp.date || "",
        end_date: exp.end_date || (exp.current ? "Presente" : ""),
        current: Boolean(exp.current || exp.end_date?.toLowerCase() === "present" || exp.end_date?.toLowerCase() === "presente"),
        highlights: Array.isArray(exp.highlights)
          ? exp.highlights
          : exp.summary
          ? [exp.summary]
          : [],
        summary: exp.summary || "",
      });
    });
  }

  // Mapeo de Educación
  const education: EducationEntry[] = [];
  const rawEducation = sections.education || [];
  if (Array.isArray(rawEducation)) {
    rawEducation.forEach((edu: any, idx: number) => {
      education.push({
        id: `edu-${Date.now()}-${idx}`,
        institution: edu.institution || edu.school || "Institución",
        degree: edu.degree || "Título",
        area: edu.area || edu.major || "",
        location: edu.location || "",
        start_date: edu.start_date || edu.date || "",
        end_date: edu.end_date || "",
        current: Boolean(edu.current),
        gpa: edu.gpa ? String(edu.gpa) : undefined,
        highlights: Array.isArray(edu.highlights) ? edu.highlights : [],
      });
    });
  }

  // Mapeo de Skills
  const skills: SkillCategory[] = [];
  const rawSkills = sections.skills || sections.technologies || [];
  if (Array.isArray(rawSkills)) {
    rawSkills.forEach((cat: any, idx: number) => {
      if (typeof cat === "string") {
        skills.push({
          id: `skill-cat-${Date.now()}-${idx}`,
          category: "General",
          skills: [cat],
        });
      } else if (cat && typeof cat === "object") {
        const categoryName = cat.category || cat.label || cat.name || "Habilidades";
        const skillList = Array.isArray(cat.skills || cat.items || cat.details)
          ? (cat.skills || cat.items || cat.details).map(String)
          : [];
        skills.push({
          id: `skill-cat-${Date.now()}-${idx}`,
          category: categoryName,
          skills: skillList,
        });
      }
    });
  }

  // Mapeo de Proyectos
  const projects: ProjectEntry[] = [];
  const rawProjects = sections.projects || [];
  if (Array.isArray(rawProjects)) {
    rawProjects.forEach((proj: any, idx: number) => {
      projects.push({
        id: `proj-${Date.now()}-${idx}`,
        name: proj.name || proj.title || "Proyecto",
        description: proj.description || proj.summary || "",
        url: proj.url || proj.link || undefined,
        github_url: proj.github_url || undefined,
        start_date: proj.start_date || proj.date || "",
        end_date: proj.end_date || "",
        technologies: Array.isArray(proj.technologies || proj.stack)
          ? (proj.technologies || proj.stack).map(String)
          : [],
        highlights: Array.isArray(proj.highlights) ? proj.highlights : [],
      });
    });
  }

  // Mapeo de Certificaciones
  const certifications: CertificationEntry[] = [];
  const rawCerts = sections.certifications || sections.certificates || [];
  if (Array.isArray(rawCerts)) {
    rawCerts.forEach((cert: any, idx: number) => {
      certifications.push({
        id: `cert-${Date.now()}-${idx}`,
        name: cert.name || cert.title || "Certificación",
        issuer: cert.issuer || cert.organization || "Emisor",
        date: cert.date || cert.issue_date || "",
        url: cert.url || undefined,
        summary: cert.summary || "",
      });
    });
  }

  // Mapeo de Referencias
  const references: ReferenceEntry[] = [];
  const rawRefs = sections.references || sections.referees || [];
  if (Array.isArray(rawRefs)) {
    rawRefs.forEach((ref: any, idx: number) => {
      references.push({
        id: `ref-${Date.now()}-${idx}`,
        name: ref.name || ref.title || "Nombre Referente",
        position: ref.position || ref.role || "Cargo",
        company: ref.company || ref.organization || "Empresa",
        email: ref.email || undefined,
        phone: ref.phone || undefined,
        relationship: ref.relationship || ref.context || undefined,
      });
    });
  }

  return {
    name: cv.name || "Tu Nombre",
    headline: cv.headline || cv.title || "",
    summary: cv.summary || cv.bio || "",
    email: cv.email || undefined,
    phone: cv.phone || "",
    location: cv.location || "",
    website: cv.website || undefined,
    social_networks,
    skills,
    experience,
    projects,
    education,
    certifications,
    references,
    section_titles: renderCvData?.meta?.section_titles || {},
    hidden_sections: renderCvData?.meta?.hidden_sections || [],
    section_order: renderCvData?.meta?.section_order || [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "references",
    ],
  };
}
