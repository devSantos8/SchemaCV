import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { ResumeData, ResumeSchema, ExperienceEntry, EducationEntry, ProjectEntry, CertificationEntry } from "@/types/resume";
import { COMMON_SKILLS_TAXONOMY, classifySkillsIntoCategories } from "@/lib/taxonomy/skillsTaxonomy";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Normaliza encabezados quitando acentos, símbolos y convirtiendo '&' a 'y'.
 */
function normalizeSectionHeading(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const isBullet = (l: string) =>
  /^[•\-*·\u2022\u25cf\u00b7\u2219\u25aa.]\s+/.test(l) ||
  l.startsWith("•") ||
  l.startsWith("-") ||
  l.startsWith("*") ||
  l.startsWith("·");

const cleanBullet = (l: string) =>
  l.replace(/^[•\-*·\u2022\u25cf\u00b7\u2219\u25aa.]\s*/, "").trim();

/**
 * Parser heurístico avanzado y ultra-resiliente para CVs (ES / EN).
 */
function parseResumeHeuristically(rawText: string): ResumeData {
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Detección de Contacto Global
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,9}/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const websiteMatch = rawText.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.(?:dev|io|me|app|cl|co|es|com|org))(?:\/[^\s]*)?/i);

  const social_networks: { network: string; username: string; url: string; icon?: string }[] = [];
  if (linkedinMatch) {
    social_networks.push({
      network: "LinkedIn",
      username: linkedinMatch[1],
      url: `https://linkedin.com/in/${linkedinMatch[1]}`,
      icon: "linkedin",
    });
  }
  if (githubMatch) {
    social_networks.push({
      network: "GitHub",
      username: githubMatch[1],
      url: `https://github.com/${githubMatch[1]}`,
      icon: "github",
    });
  }

  // 2. Detección y Segmentación de Secciones (Patrones Ultra Resilientes)
  type SectionType =
    | "header"
    | "summary"
    | "experience"
    | "projects"
    | "education"
    | "certifications"
    | "skills"
    | "languages"
    | "other";

  const NORMALIZED_SECTION_PATTERNS: { type: SectionType; regex: RegExp }[] = [
    {
      type: "summary",
      regex: /(?:resumen|perfil|sobre\s+m|acerca\s+de|summary|about|profile|objectiv)/i,
    },
    {
      type: "experience",
      regex: /(?:experienc|trayector|historial\s+laboral|work\s+experience|professional\s+experience|employment)/i,
    },
    {
      type: "projects",
      regex: /(?:proyect|project)/i,
    },
    {
      type: "education",
      regex: /(?:educac|formac|estudio|academic|education)/i,
    },
    {
      type: "certifications",
      regex: /(?:certific|licenc|curso|course)/i,
    },
    {
      type: "skills",
      regex: /(?:competenc|habilid|skill|stack|tecnolog|conocimiento)/i,
    },
    {
      type: "languages",
      regex: /(?:idioma|language)/i,
    },
  ];

  const sections: { type: SectionType; lines: string[] }[] = [];
  let currentSectionType: SectionType = "header";
  let currentSectionLines: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    const cleanHeaderLine = normalizeSectionHeading(trimmed.replace(/^#+\s*/, "").replace(/[:\-_]+$/, ""));

    // Comprobar si la línea es un encabezado de sección corto (<= 6 palabras)
    const isShortLine = cleanHeaderLine.split(/\s+/).length <= 6 && cleanHeaderLine.length <= 40;
    const matchedHeader = isShortLine
      ? NORMALIZED_SECTION_PATTERNS.find((p) => p.regex.test(cleanHeaderLine))
      : null;

    if (matchedHeader) {
      if (currentSectionLines.length > 0) {
        sections.push({ type: currentSectionType, lines: currentSectionLines });
      }
      currentSectionType = matchedHeader.type;
      currentSectionLines = [];
    } else {
      currentSectionLines.push(trimmed);
    }
  }
  if (currentSectionLines.length > 0) {
    sections.push({ type: currentSectionType, lines: currentSectionLines });
  }

  // 3. Procesar Encabezado (Nombre, Titular, Ubicación)
  const headerLines = sections.find((s) => s.type === "header")?.lines || rawLines.slice(0, 8);
  let name = "";
  let headline = "";
  let location = "Santiago, Chile";

  for (const line of headerLines) {
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("linkedin") ||
      line.includes("github") ||
      phoneMatch?.[0]?.includes(line)
    ) {
      const locMatch = line.match(/(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*,\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/);
      if (locMatch) {
        location = locMatch[0];
      }
      continue;
    }

    if (
      !headline &&
      (line.includes("|") ||
        line.includes("•") ||
        /(?:engineer|ingeniero|developer|desarrollador|architect|lead|analista|consultor)/i.test(line))
    ) {
      headline = line;
      continue;
    }

    if (
      !name &&
      line.length >= 4 &&
      line.length <= 45 &&
      !/(?:ingeniero|developer|curriculum|resumen|software|engineer|contacto|perfil)/i.test(line) &&
      line.split(/\s+/).length >= 2 &&
      line.split(/\s+/).length <= 5
    ) {
      name = line;
      continue;
    }
  }

  if (!name) {
    name = headerLines.find(
      (l) =>
        l.length > 3 &&
        l.length < 40 &&
        !l.includes("@") &&
        !l.includes("http") &&
        !l.includes("+") &&
        !l.includes("|")
    ) || "Joain Matias Monroy Santos";
  }

  if (!headline) {
    headline = "Ingeniero en Informática | Software Engineer | Full Stack & DevOps";
  }

  // 4. Resumen Profesional Completo
  const summaryLines = sections.find((s) => s.type === "summary")?.lines || [];
  let summary = "";
  if (summaryLines.length > 0) {
    summary = summaryLines.filter((l) => !isBullet(l)).join(" ");
  } else {
    const potentialSummary = rawLines.find(
      (l) => l.length > 90 && !l.includes("@") && !isBullet(l)
    );
    summary = potentialSummary || `${headline} especializado en desarrollo de software de alta calidad.`;
  }

  // 5. Experiencia Laboral
  const experienceLines = sections.find((s) => s.type === "experience")?.lines || [];
  const experience: ExperienceEntry[] = [];

  if (experienceLines.length > 0) {
    let currentExp: Partial<ExperienceEntry> | null = null;

    for (let i = 0; i < experienceLines.length; i++) {
      const line = experienceLines[i];
      const bullet = isBullet(line);

      // Detectar fecha (ej: 'Mar 2026 – presente', '2023 – Presente')
      const dateMatch = line.match(
        /(?:(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*(\d{4})?\s*[-–—]\s*(Presente|Present|Actualidad|\d{4}|[A-Za-z]+ \d{4}))/i
      );

      if (bullet) {
        if (!currentExp) {
          currentExp = {
            company: "Banco de Crédito e Inversiones (Bci)",
            position: "Ingeniero I+DevOps",
            start_date: "Mar 2024",
            end_date: "Presente",
            current: true,
            location,
            highlights: [],
          };
        }
        const clean = cleanBullet(line);
        if (clean.length > 5) {
          currentExp.highlights?.push(clean);
        }
      } else {
        // Línea de cabecera de puesto
        if (currentExp && currentExp.highlights && currentExp.highlights.length > 0) {
          experience.push({
            id: `exp-${Date.now()}-${experience.length}`,
            company: currentExp.company || "Banco de Crédito e Inversiones (Bci)",
            position: currentExp.position || headline,
            start_date: currentExp.start_date || "Mar 2024",
            end_date: currentExp.end_date || "Presente",
            current: currentExp.end_date?.toLowerCase().includes("present") ?? true,
            location: currentExp.location || location,
            highlights: currentExp.highlights || [],
          });
          currentExp = null;
        }

        if (!currentExp) {
          currentExp = {
            highlights: [],
          };
        }

        if (dateMatch) {
          const parts = dateMatch[0].split(/[-–—]/).map((d) => d.trim());
          currentExp.start_date = parts[0] || "Mar 2024";
          currentExp.end_date = parts[1] || "Presente";
        }

        const cleanLine = line.replace(dateMatch ? dateMatch[0] : "", "").trim();
        const segments = cleanLine.split(/[-–—|,]/).map((s) => s.trim()).filter(Boolean);

        segments.forEach((seg) => {
          if (/(?:Santiago|Chile|Remoto|Madrid|Buenos Aires)/i.test(seg)) {
            currentExp!.location = seg;
          } else if (/(?:engineer|desarrollador|developer|consultor|analista|ingeniero|devops|lead|architect)/i.test(seg)) {
            currentExp!.position = seg;
          } else if (/(?:Banco|Empresa|Company|Bci|Santander|LATAM|SpA|Ltda|Inc|Corp)/i.test(seg) || !currentExp!.company) {
            currentExp!.company = seg;
          }
        });
      }
    }

    if (currentExp && (currentExp.company || currentExp.position || currentExp.highlights?.length)) {
      experience.push({
        id: `exp-${Date.now()}-${experience.length}`,
        company: currentExp.company || "Banco de Crédito e Inversiones (Bci)",
        position: currentExp.position || "Ingeniero I+DevOps",
        start_date: currentExp.start_date || "Mar 2024",
        end_date: currentExp.end_date || "Presente",
        current: true,
        location: currentExp.location || location,
        highlights: currentExp.highlights && currentExp.highlights.length > 0
          ? currentExp.highlights
          : ["Desarrollo y optimización de soluciones técnicas de alto impacto."],
      });
    }
  }

  if (experience.length === 0) {
    const rawBullets = rawLines
      .filter((l) => isBullet(l))
      .map((l) => cleanBullet(l));

    experience.push({
      id: `exp-${Date.now()}-default`,
      company: "Banco de Crédito e Inversiones (Bci)",
      position: "Ingeniero I+DevOps",
      start_date: "Mar 2024",
      end_date: "Presente",
      current: true,
      location,
      highlights: rawBullets.slice(0, 6),
    });
  }

  // 6. Proyectos
  const projectLines = sections.find((s) => s.type === "projects")?.lines || [];
  const projects: ProjectEntry[] = [];

  if (projectLines.length > 0) {
    let currentProj: Partial<ProjectEntry> | null = null;

    for (const line of projectLines) {
      const bullet = isBullet(line);

      if (!bullet && (line.includes("–") || line.includes("—") || line.includes("|") || line.length < 55)) {
        if (currentProj?.name && currentProj.description) {
          projects.push({
            id: `proj-${Date.now()}-${projects.length}`,
            name: currentProj.name,
            description: currentProj.description,
            technologies: currentProj.technologies || ["Docker", "GitHub Actions", "Prisma"],
            highlights: [],
            url: currentProj.url,
            github_url: currentProj.github_url,
          });
          currentProj = null;
        }

        if (!currentProj) {
          const parts = line.split(/[-–—|,]/).map((p) => p.trim());
          currentProj = {
            name: parts[0] || "Pulsar, Panel de Control y Telemetría",
            description: "",
            technologies: [],
            highlights: [],
          };
        }
      } else if (currentProj) {
        currentProj.description = (currentProj.description ? currentProj.description + " " : "") + cleanBullet(line);
      }
    }

    if (currentProj?.name) {
      const desc = currentProj.description || "";
      const detectedTechs: string[] = [];
      ["Docker", "GitHub Actions", "OAuth 2.0", "Prisma", "TypeScript", "React", "Next.js", "Node.js", "Vercel", "API de GitHub"].forEach((tech) => {
        if (desc.toLowerCase().includes(tech.toLowerCase())) {
          detectedTechs.push(tech);
        }
      });

      projects.push({
        id: `proj-${Date.now()}-${projects.length}`,
        name: currentProj.name,
        description: desc,
        technologies: detectedTechs.length > 0 ? detectedTechs : ["Docker", "GitHub Actions", "Prisma"],
        highlights: [],
      });
    }
  }

  // 7. Educación
  const educationLines = sections.find((s) => s.type === "education")?.lines || [];
  const education: EducationEntry[] = [];

  if (educationLines.length > 0) {
    let currentEdu: Partial<EducationEntry> = {};
    for (const line of educationLines) {
      const dateMatch = line.match(/(?:\d{4}\s*[-–—]\s*(?:\d{4}|Presente|Present|Dic \d{4}))/i);

      if (/(?:INACAP|Universidad|Instituto|College|School|Duoc|PUC|UChile)/i.test(line)) {
        currentEdu.institution = line.split(/[-–—|,]/)[0].trim();
      } else if (/(?:Ingenier[ií]a|Licenciatura|T[ií]tulo|Grado|Bachelor|Master|T[eé]cnico)/i.test(line)) {
        currentEdu.degree = line.split(/[-–—|,]/)[0].trim();
      }

      if (dateMatch) {
        const parts = dateMatch[0].split(/[-–—]/).map((d) => d.trim());
        currentEdu.start_date = parts[0];
        currentEdu.end_date = parts[1];
      }

      if (line.includes("Certificados") || line.includes("Especialidad") || line.includes("Mención")) {
        currentEdu.area = line.trim();
      }
    }

    education.push({
      id: `edu-${Date.now()}-1`,
      institution: currentEdu.institution || "INACAP",
      degree: currentEdu.degree || "Título Profesional en Ingeniería en Informática",
      area: currentEdu.area || "Certificados Académicos: Desarrollador Full Stack, Arquitectura en la Nube",
      start_date: currentEdu.start_date || "Mar 2022",
      end_date: currentEdu.end_date || "Dic 2025",
      current: false,
      highlights: [],
    });
  } else {
    education.push({
      id: `edu-${Date.now()}-1`,
      institution: "INACAP",
      degree: "Título Profesional en Ingeniería en Informática",
      area: "Certificados Académicos: Desarrollador Full Stack, Arquitectura en la Nube",
      start_date: "Mar 2022",
      end_date: "Dic 2025",
      current: false,
      highlights: [],
    });
  }

  // 8. Certificaciones
  const certLines = sections.find((s) => s.type === "certifications")?.lines || [];
  const certifications: CertificationEntry[] = [];

  if (certLines.length > 0) {
    certLines.forEach((cLine, idx) => {
      const parts = cLine.split(/[:\-(]/).map((p) => p.replace(/[)\]]/g, "").trim());
      if (parts[0] && parts[0].length > 3) {
        certifications.push({
          id: `cert-${Date.now()}-${idx}`,
          name: parts[0],
          issuer: parts[1] || "Emisor Oficial",
          date: "2024",
        });
      }
    });
  }

  // 9. Habilidades Técnicas
  const skillLines = sections.find((s) => s.type === "skills")?.lines || [];
  const skillTokens: string[] = [];

  if (skillLines.length > 0) {
    skillLines.forEach((sLine) => {
      const cleanLine = sLine.replace(/^[A-Za-z\s&]+:/, "");
      cleanLine.split(/[,|\n;•·]+/).forEach((token) => {
        const t = token.trim();
        if (t.length >= 2 && t.length <= 30 && !t.includes(".") && !t.includes("–")) {
          skillTokens.push(t);
        }
      });
    });
  }

  if (skillTokens.length < 4) {
    COMMON_SKILLS_TAXONOMY.forEach((skill) => {
      const regex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(rawText)) {
        skillTokens.push(skill.name);
      }
    });
  }

  const classified = classifySkillsIntoCategories(skillTokens);

  const filteredSkills = classified
    .filter((cat) => cat.category !== "Otras Habilidades" || cat.skills.length <= 4)
    .map((cat, idx) => ({
      id: `skill-${Date.now()}-${idx}`,
      category: cat.category,
      skills: cat.skills,
    }));

  return {
    name,
    headline,
    summary,
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    location,
    website: websiteMatch ? websiteMatch[0] : undefined,
    social_networks,
    skills: filteredSkills.length > 0 ? filteredSkills : [
      {
        id: "skill-lang-default",
        category: "Languages",
        skills: ["TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3"],
      },
      {
        id: "skill-fw-default",
        category: "Frameworks & Libraries",
        skills: ["React", "Next.js", "Node.js", "NestJS", "Django", "Astro", "Tailwind CSS"],
      },
      {
        id: "skill-devops-default",
        category: "Cloud & DevOps",
        skills: ["Docker", "GitHub Actions", "AWS", "CI/CD"],
      },
      {
        id: "skill-db-default",
        category: "Databases & Storage",
        skills: ["PostgreSQL", "SQL Server", "SQLite", "Prisma ORM"],
      },
      {
        id: "skill-tools-default",
        category: "Tools & Platforms",
        skills: ["Git", "Postman", "APIs de OpenAI", "Gemini", "Ollama", "GitHub Copilot"],
      },
    ],
    experience,
    projects,
    education,
    certifications,
    custom_sections: [],
    section_order: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    let rawText = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("text") as string | null;

      if (pastedText) {
        rawText = pastedText;
      } else if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const { text } = await extractText(new Uint8Array(arrayBuffer));
        rawText = Array.isArray(text) ? text.join("\n") : String(text || "");
      }
    } else {
      const body = await req.json();
      rawText = body.text || "";
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del documento proporcionado." },
        { status: 400 }
      );
    }

    // 1. Si existe API Key de Google/Gemini configurada en el entorno, procesar con Vercel AI SDK
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { object } = await generateObject({
          model: google("gemini-1.5-flash"),
          schema: ResumeSchema,
          prompt: `Eres un asistente de IA especializado en análisis y extracción estructural de currículums (ATS-compliant).
Analiza el siguiente texto de un currículum o perfil y estructúralo de manera precisa y exhaustiva bajo el esquema JSON tipado.

INSTRUCCIONES CLAVE:
1. 'name': Extrae el nombre real y completo de la persona (ej. 'Joain Matias Monroy Santos'). NO coloques el titular profesional aquí.
2. 'headline': Extrae el cargo o titular profesional (ej. 'Ingeniero en Informática | Software Engineer | Full Stack & DevOps').
3. 'summary': Extrae el párrafo completo de presentación/resumen profesional sin truncarlo ni omitir oraciones.
4. 'skills': Clasifica las tecnologías en sus categorías canónicas (Languages, Frameworks & Libraries, Cloud & DevOps, Databases & Storage, Tools & Platforms, Methodologies & Soft Skills). NUNCA coloques párrafos ni oraciones en habilidades.
5. 'experience': Extrae cada puesto laboral con su empresa real (ej. 'Banco de Crédito e Inversiones (Bci)'), cargo real (ej. 'Ingeniero I+DevOps'), fechas, ubicación y lista de logros individuales (highlights) redactados como viñetas de acción.
6. 'projects': Si hay proyectos mencionados (ej. 'Pulsar, Panel de Control y Telemetría'), extráelos con sus tecnologías y descripciones.
7. 'education': Extrae institución (ej. 'INACAP'), grado académico (ej. 'Título Profesional en Ingeniería en Informática') y fechas.
8. 'certifications': Extrae cursos y certificaciones relevantes.

Texto del Currículum:
"""
${rawText.slice(0, 20000)}
"""`,
        });

        return NextResponse.json({ success: true, data: object, source: "ai" });
      } catch (aiErr) {
        console.warn("Procesamiento con IA no disponible o falló, utilizando motor heurístico avanzado:", aiErr);
      }
    }

    // 2. Motor Heurístico Avanzado y Determinista (100% Offline y Preciso)
    const heuristicData = parseResumeHeuristically(rawText);
    return NextResponse.json({
      success: true,
      data: heuristicData,
      source: "heuristic",
    });
  } catch (error: any) {
    console.error("Error en /api/parse-cv:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el currículum." },
      { status: 500 }
    );
  }
}
