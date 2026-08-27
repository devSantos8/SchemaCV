import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import {
  ResumeData,
  ResumeSchema,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  SkillCategory,
} from "@/types/resume";
import { COMMON_SKILLS_TAXONOMY, classifySkillsIntoCategories } from "@/lib/taxonomy/skillsTaxonomy";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

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

const BULLET_START_REGEX = /^[•\-*·\u2022\u25cf\u00b7\u2219\u25aa\u2013\u2014\u25cb\u25e6\u25aa]\s*/;

// Verbos de acción en español e inglés sin dependencia de \b ASCII
const ACTION_VERBS_REGEX =
  /^(?:Constru[ií]|Integr[eé]|Document[eé]|Desarroll[eé]|Automatic[eé]|Optimiz[eé]|Lider[eé]|Dise[nñ][eé]|Cre[eé]|Implement[eé]|Configur[eé]|Mantuve|Gestion[eé]|Coordin[eé]|Particip[eé]|Colabor[eé]|Refactoric[eé]|Administr[eé]|Ejecut[eé]|Supervis[eé]|Program[eé]|Desplegu[eé]|Built|Developed|Designed|Implemented|Created|Led|Managed|Maintained|Automated|Optimized|Architected|Spearheaded|Engineered|Authored|Executed)(?:[\s:.,]|$)/i;

function isBulletStart(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (BULLET_START_REGEX.test(t)) return true;
  if (ACTION_VERBS_REGEX.test(t)) return true;
  return false;
}

function cleanBulletPrefix(line: string): string {
  return line.replace(BULLET_START_REGEX, "").trim();
}

// Regex integral para rangos de fechas (laboral y educación)
const DATE_RANGE_REGEX =
  /(?:(?:\b(?:Ene(?:ro)?|Feb(?:rero)?|Mar(?:zo)?|Abr(?:il)?|May(?:o)?|Jun(?:io)?|Jul(?:io)?|Ago(?:sto)?|Sep(?:tiembre)?|Sept(?:iembre)?|Oct(?:ubre)?|Nov(?:iembre)?|Dic(?:iembre)?|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*(?:de\s*)?\d{4}|\d{1,2}[/-]\d{2,4}|\b(?:19|20)\d{2}\b)\s*(?:[-–—/]|a|al|to|hasta)\s*(?:Presente|Present|Actualidad|Actual|Actualmente|Cursando|Ongoing|Current|\b(?:Ene(?:ro)?|Feb(?:rero)?|Mar(?:zo)?|Abr(?:il)?|May(?:o)?|Jun(?:io)?|Jul(?:io)?|Ago(?:sto)?|Sep(?:tiembre)?|Sept(?:iembre)?|Oct(?:ubre)?|Nov(?:iembre)?|Dic(?:iembre)?|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*(?:de\s*)?\d{4}|\d{1,2}[/-]\d{2,4}|\b(?:19|20)\d{2}\b))/i;

// Regex para fechas de certificaciones (incluye En Curso, Presente, Mes Año, Años)
const CERT_DATE_REGEX =
  /(?:\((?:En\s+Curso|En\s+Progreso|Cursando|Presente|Present|In\s+Progress|Actualidad|\d{4}(?:\s*[-–—/]\s*(?:Presente|Present|\d{4}))?|(?:Ene(?:ro)?|Feb(?:rero)?|Mar(?:zo)?|Abr(?:il)?|May(?:o)?|Jun(?:io)?|Jul(?:io)?|Ago(?:sto)?|Sep(?:tiembre)?|Sept(?:iembre)?|Oct(?:ubre)?|Nov(?:iembre)?|Dic(?:iembre)?|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*\d{2,4})\)|(?:(?:Emitido|Expira|Vigencia|Fecha|Issued|Expires):\s*)?(?:En\s+Curso|En\s+Progreso|Cursando|Presente|Present|In\s+Progress|Actualidad|(?:Ene(?:ro)?|Feb(?:rero)?|Mar(?:zo)?|Abr(?:il)?|May(?:o)?|Jun(?:io)?|Jul(?:io)?|Ago(?:sto)?|Sep(?:tiembre)?|Sept(?:iembre)?|Oct(?:ubre)?|Nov(?:iembre)?|Dic(?:iembre)?|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}\s*[-–—]\s*(?:\d{4}|Presente|Present)|\b(?:19|20)\d{2}\b))/i;

const KNOWN_CITIES_COUNTRIES_REGEX =
  /\b(?:Santiago|Las Condes|Providencia|Valparaíso|Concepción|Viña del Mar|Remoto|Remote|Madrid|Barcelona|Bogotá|Lima|Buenos Aires|Montevideo|CDMX|México|Mexico|Miami|New York|London|São Paulo|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,15}),\s*(?:Chile|Argentina|Colombia|Perú|Peru|México|Mexico|España|Spain|USA|US|Brasil|Brazil|Uruguay)\b/i;

const KNOWN_ROLE_KEYWORDS_REGEX =
  /(?:developer|desarrollador|engineer|ingeniero|architect|arquitecto|lead|tech lead|leader|manager|analyst|analista|consultant|consultor|specialist|especialista|cto|coo|ceo|director|practicante|intern|full\s*stack|backend|frontend|devops|cloud|qa|tester|scrum\s*master|product\s*owner|product\s*manager)/i;

const KNOWN_EDU_INSTITUTIONS_REGEX =
  /(?:universidad|instituto|facultad|duoc|inacap|colegio|liceo|politécnico|politecnico|bootcamp|academy|escuela|pontificia|federico santa mar[ií]a|mit|coursera|platzi|coderhouse|desaf[ií]o latam|42|udemy|edx)/i;

const KNOWN_EDU_DEGREES_REGEX =
  /(?:ingenier[ií]a|licenciatura|t[eé]cnico|diplomado|master|m[aá]ster|mag[ií]ster|postgrado|doctorado|phd|bachelor|bootcamp|certificaci[oó]n profesional|analista programador|bachiller|profesor)/i;

const EXTENDED_TECH_CATALOG = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "NestJS", "Django", "FastAPI", "Flask",
  "Tailwind CSS", "HTML5", "CSS3", "Docker", "Kubernetes", "PostgreSQL", "SQL Server", "SQLite", "MySQL", "MongoDB", "Redis",
  "Prisma", "TypeORM", "Drizzle", "AWS", "GCP", "Azure", "Firebase", "Supabase", "Git", "GitHub Actions", "GitLab CI",
  "Karate DSL", "Postman", "cURL", "RAG", "OpenAI", "Claude", "Gemini", "GraphQL", "REST APIs", "Vite", "Jest", "Playwright",
  "Cypress", "Terraform", "Linux", "Nginx", "Figma", "Zustand", "Redux", "TanStack Query", "Radix UI", "Framer Motion", "Bash",
  "Go", "Golang", "Java", "Spring Boot", "C#", ".NET", "C++", "PHP", "Ruby", "Astro", "Vue", "Angular", "Scrum", "Kanban"
];

/**
 * Preprocesa el texto dividiendo líneas pegadas por extractores PDF
 */
function preprocessRawLines(rawText: string): string[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const SECTION_KEYWORDS = [
    "RESUMEN PROFESIONAL",
    "PERFIL PROFESIONAL",
    "EXPERIENCIA LABORAL",
    "EXPERIENCIA PROFESIONAL",
    "PROYECTOS DESTACADOS",
    "PROYECTOS",
    "EDUCACIÓN & FORMACIÓN",
    "EDUCACIÓN Y FORMACIÓN",
    "EDUCACIÓN",
    "EDUCACION",
    "COMPETENCIAS TÉCNICAS",
    "HABILIDADES TÉCNICAS",
    "HABILIDADES",
    "CERTIFICACIONES",
    "IDIOMAS",
  ];

  const processed: string[] = [];
  for (const line of lines) {
    let current = line;
    let foundSplit = true;

    while (foundSplit) {
      foundSplit = false;
      for (const kw of SECTION_KEYWORDS) {
        const regex = new RegExp(`(?<=[.!?•\\-]\\s+|\\s{2,})(${kw}\\b)`, "i");
        const match = current.match(regex);
        if (match && match.index && match.index > 3) {
          const before = current.slice(0, match.index).trim();
          const rest = current.slice(match.index).trim();
          if (before) processed.push(before);
          current = rest;
          foundSplit = true;
          break;
        }
      }
    }
    if (current) processed.push(current);
  }

  return processed;
}

/**
 * Parser heurístico avanzado multi-sección y determinista para CVs técnicos.
 */
function parseResumeHeuristically(rawText: string): ResumeData {
  const rawLines = preprocessRawLines(rawText);

  // 1. Detección de Contacto Global
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,9}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);

  let website: string | undefined = undefined;
  const rawTextWithoutEmail = email ? rawText.replace(email, "") : rawText;
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|app|cl|co|es|org|site|net|tech|info|com))\b(?:\/[^\s]*)?/gi;
  let match: RegExpExecArray | null;
  while ((match = websiteRegex.exec(rawTextWithoutEmail)) !== null) {
    const candidate = match[0].trim().toLowerCase();
    if (
      !candidate.includes("linkedin.com") &&
      !candidate.includes("github.com") &&
      !candidate.includes("gmail.com") &&
      !candidate.includes("hotmail.com") &&
      !candidate.includes("outlook.com") &&
      !candidate.includes("yahoo.com") &&
      !candidate.includes("google.com") &&
      !candidate.startsWith("linkedin.co") &&
      !candidate.startsWith("github.co")
    ) {
      website = match[0].trim();
      break;
    }
  }

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

  // 2. Segmentación de Secciones Dinámicas
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
      regex: /^(?:resumen|perfil|sobre\s+m|acerca\s+de|summary|about|profile|objetivo)/i,
    },
    {
      type: "skills",
      regex: /^(?:competenc|habilid|skill|stack|tecnolog|conocimiento)/i,
    },
    {
      type: "experience",
      regex: /^(?:experienc|trayector|historial\s+laboral|work\s+experience|professional\s+experience|employment)/i,
    },
    {
      type: "projects",
      regex: /^(?:proyect|project)/i,
    },
    {
      type: "education",
      regex: /^(?:educac|formac|estudio|academic|education)/i,
    },
    {
      type: "certifications",
      regex: /^(?:certific|licenc|curso|course)/i,
    },
    {
      type: "languages",
      regex: /^(?:idioma|language)/i,
    },
  ];

  const sections: { type: SectionType; lines: string[] }[] = [];
  let currentSectionType: SectionType = "header";
  let currentSectionLines: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    const cleanHeaderLine = normalizeSectionHeading(trimmed.replace(/^#+\s*/, "").replace(/[:\-_]+$/, ""));

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

  // Captura dinámica del orden de secciones
  const STANDARD_ORDER_KEYS = [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
  ];
  const dynamicSectionOrder: string[] = [];
  for (const sec of sections) {
    if (
      sec.type !== "header" &&
      sec.type !== "other" &&
      sec.type !== "languages" &&
      STANDARD_ORDER_KEYS.includes(sec.type) &&
      !dynamicSectionOrder.includes(sec.type)
    ) {
      dynamicSectionOrder.push(sec.type);
    }
  }
  for (const std of STANDARD_ORDER_KEYS) {
    if (!dynamicSectionOrder.includes(std)) {
      dynamicSectionOrder.push(std);
    }
  }

  // 3. Encabezado
  const headerLines = sections.find((s) => s.type === "header")?.lines || rawLines.slice(0, 8);
  let name = "";
  let headline = "";
  let location = "";

  for (const line of headerLines) {
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("linkedin") ||
      line.includes("github") ||
      (phone && phone.includes(line))
    ) {
      const locMatch = line.match(/(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*,\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/);
      if (locMatch && !location) {
        location = locMatch[0];
      }
      continue;
    }

    if (
      !headline &&
      (line.includes("|") ||
        /(?:engineer|ingeniero|developer|desarrollador|architect|lead|analista|consultor|full\s*stack|devops)/i.test(line))
    ) {
      headline = line;
      continue;
    }

    if (
      !name &&
      line.length >= 3 &&
      line.length <= 50 &&
      !/(?:ingeniero|developer|curriculum|resumen|software|engineer|contacto|perfil)/i.test(line) &&
      line.split(/\s+/).length >= 2 &&
      line.split(/\s+/).length <= 6
    ) {
      name = line;
      continue;
    }
  }

  if (!name && headerLines.length > 0) {
    name = headerLines[0];
  }

  // 4. Resumen Profesional
  const summaryLines = sections.find((s) => s.type === "summary")?.lines || [];
  const summary = summaryLines.filter((l) => !isBulletStart(l)).join(" ");

  // 5. Experiencia Laboral Multi-Puesto
  const experienceLines = sections.filter((s) => s.type === "experience").flatMap((s) => s.lines);
  const experience: ExperienceEntry[] = [];

  if (experienceLines.length > 0) {
    interface RawExpBlock {
      header: string;
      subHeader?: string;
      rawBullets: string[];
    }
    const entries: RawExpBlock[] = [];
    let currentEntry: RawExpBlock | null = null;

    for (let i = 0; i < experienceLines.length; i++) {
      const line = experienceLines[i].trim();
      if (!line) continue;

      const dateMatch = line.match(DATE_RANGE_REGEX);
      const isBullet = isBulletStart(line);
      const isRoleCandidate = !isBullet && KNOWN_ROLE_KEYWORDS_REGEX.test(line);

      if (dateMatch && (!isBullet || line.includes("—") || line.includes("–") || line.includes("-") || line.includes("|"))) {
        if (currentEntry && currentEntry.rawBullets.length === 0 && !currentEntry.header.match(DATE_RANGE_REGEX)) {
          currentEntry.subHeader = line;
        } else {
          currentEntry = { header: line, rawBullets: [] };
          entries.push(currentEntry);
        }
        continue;
      }

      if (isRoleCandidate && !currentEntry) {
        currentEntry = { header: line, rawBullets: [] };
        entries.push(currentEntry);
        continue;
      }

      if (isRoleCandidate && currentEntry && currentEntry.rawBullets.length > 0) {
        currentEntry = { header: line, rawBullets: [] };
        entries.push(currentEntry);
        continue;
      }

      if (!currentEntry) {
        currentEntry = { header: line, rawBullets: [] };
        entries.push(currentEntry);
        continue;
      }

      if (isBullet) {
        currentEntry.rawBullets.push(cleanBulletPrefix(line));
      } else {
        if (currentEntry.rawBullets.length > 0) {
          const lastIdx = currentEntry.rawBullets.length - 1;
          const lastBullet = currentEntry.rawBullets[lastIdx];
          const isLowerStart = /^[a-z0-9,;()]/i.test(line) && !/^[A-ZÁÉÍÓÚÑ]/.test(line);
          const prevNotFinished = !/[.!?]$/.test(lastBullet.trim());

          if (isLowerStart || prevNotFinished) {
            currentEntry.rawBullets[lastIdx] = `${lastBullet} ${line}`;
          } else {
            currentEntry.rawBullets.push(line);
          }
        } else {
          if (!currentEntry.subHeader) {
            currentEntry.subHeader = line;
          } else {
            currentEntry.rawBullets.push(line);
          }
        }
      }
    }

    entries.forEach((ent, idx) => {
      const fullHeader = ent.subHeader ? `${ent.header} | ${ent.subHeader}` : ent.header;
      const dateMatch = fullHeader.match(DATE_RANGE_REGEX);
      let startDate = "";
      let endDate = "Presente";

      if (dateMatch) {
        const parts = dateMatch[0].split(/[-–—/]|(?:\s+a\s+|\s+al\s+|\s+to\s+)/i).map((d) => d.trim());
        startDate = parts[0] || "";
        endDate = parts[parts.length - 1] || "Presente";
      }

      let headerWithoutDate = fullHeader.replace(DATE_RANGE_REGEX, "").trim();

      let expLocation = location;
      const locParenMatches = headerWithoutDate.match(/\(([^)]+)\)/g);
      if (locParenMatches) {
        for (const paren of locParenMatches) {
          const inside = paren.slice(1, -1).trim();
          if (inside.includes(",") || /(?:Chile|Santiago|Condes|Remoto|Remote|Argentina|Mexico|México|USA|España)/i.test(inside)) {
            expLocation = inside;
            headerWithoutDate = headerWithoutDate.replace(paren, "").trim();
            break;
          }
        }
      }

      const segs = headerWithoutDate.split(/[-–—|]/).map((s) => s.trim()).filter(Boolean);
      let position = "";
      let company = "";

      if (segs.length >= 2) {
        if (KNOWN_ROLE_KEYWORDS_REGEX.test(segs[1]) && !KNOWN_ROLE_KEYWORDS_REGEX.test(segs[0])) {
          company = segs[0];
          position = segs.slice(1).join(" - ");
        } else {
          position = segs[0];
          company = segs.slice(1).join(" - ");
        }
      } else if (segs.length === 1) {
        position = segs[0];
        company = "";
      }

      experience.push({
        id: `exp-${Date.now()}-${idx}`,
        company: company.replace(/\s+/g, " ").trim(),
        position: position.replace(/\s+/g, " ").trim(),
        location: expLocation,
        start_date: startDate,
        end_date: endDate,
        current: /^(presente|present|actual|actualidad|ongoing|current)$/i.test(endDate.trim()),
        highlights: ent.rawBullets,
      });
    });
  }

  // 6. Proyectos Destacados (Multi-Proyecto)
  const projectLines = sections.filter((s) => s.type === "projects").flatMap((s) => s.lines);
  const projects: ProjectEntry[] = [];

  if (projectLines.length > 0) {
    interface ProjRaw {
      title: string;
      lines: string[];
    }
    const projEntries: ProjRaw[] = [];
    let currentProj: ProjRaw | null = null;

    for (let i = 0; i < projectLines.length; i++) {
      const line = projectLines[i].trim();
      if (!line) continue;

      const isBullet = isBulletStart(line);

      const isTitleCandidate =
        !isBullet &&
        (line.includes("|") ||
          line.includes("–") ||
          line.includes("—") ||
          line.includes(" - ") ||
          /^(?:proyectos?|projects?)\s*:/i.test(line) ||
          (line.length <= 75 && !/[.!?]$/.test(line)));

      if (!currentProj) {
        currentProj = { title: line, lines: [] };
        projEntries.push(currentProj);
      } else if (isTitleCandidate && currentProj.lines.length > 0) {
        currentProj = { title: line, lines: [] };
        projEntries.push(currentProj);
      } else if (isBullet) {
        currentProj.lines.push(cleanBulletPrefix(line));
      } else {
        if (currentProj.lines.length > 0) {
          const lastIdx = currentProj.lines.length - 1;
          const lastLine = currentProj.lines[lastIdx];
          const isLowerStart = /^[a-z0-9,;()]/i.test(line) && !/^[A-ZÁÉÍÓÚÑ]/.test(line);
          const prevNotFinished = !/[.!?]$/.test(lastLine.trim());

          if (isLowerStart || prevNotFinished) {
            currentProj.lines[lastIdx] = `${lastLine} ${line}`;
          } else {
            currentProj.lines.push(line);
          }
        } else {
          currentProj.lines.push(line);
        }
      }
    }

    projEntries.forEach((pRaw, idx) => {
      const fullText = `${pRaw.title} ${pRaw.lines.join(" ")}`;
      const detectedTechs: string[] = [];

      EXTENDED_TECH_CATALOG.forEach((t) => {
        const reg = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (reg.test(fullText) && !detectedTechs.includes(t)) {
          detectedTechs.push(t);
        }
      });

      const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_\-\/]+/i);
      const urlMatch = fullText.match(/https?:\/\/[a-zA-Z0-9_\-\.\/]+/i);

      let cleanName = pRaw.title.replace(/^proyectos?\s*:\s*/i, "").trim();
      if (cleanName.includes("|")) {
        cleanName = cleanName.split("|")[0].trim();
      }

      projects.push({
        id: `proj-${Date.now()}-${idx}`,
        name: cleanName,
        technologies: detectedTechs,
        github_url: githubMatch ? (githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`) : undefined,
        url: urlMatch ? urlMatch[0] : undefined,
        highlights: pRaw.lines,
      });
    });
  }

  // 7. Educación & Formación (Multi-Entrada)
  const educationLines = sections.filter((s) => s.type === "education").flatMap((s) => s.lines);
  const education: EducationEntry[] = [];

  if (educationLines.length > 0) {
    interface EduRawBlock {
      lines: string[];
    }
    const eduBlocks: EduRawBlock[] = [];
    let currentBlock: EduRawBlock | null = null;

    for (let i = 0; i < educationLines.length; i++) {
      const line = educationLines[i].trim();
      if (!line) continue;

      const isBullet = isBulletStart(line);
      const isInst = !isBullet && KNOWN_EDU_INSTITUTIONS_REGEX.test(line);

      if (isInst && (!currentBlock || currentBlock.lines.length >= 2)) {
        currentBlock = { lines: [line] };
        eduBlocks.push(currentBlock);
      } else if (!currentBlock) {
        currentBlock = { lines: [line] };
        eduBlocks.push(currentBlock);
      } else {
        currentBlock.lines.push(line);
      }
    }

    eduBlocks.forEach((blk, idx) => {
      let institution = "";
      let degree = "";
      let eduLocation = location;
      let startDate = "";
      let endDate = "";
      const highlights: string[] = [];

      for (const line of blk.lines) {
        const isBullet = isBulletStart(line);
        let cleanLine = cleanBulletPrefix(line);

        const dateMatch = cleanLine.match(DATE_RANGE_REGEX);
        if (dateMatch) {
          const parts = dateMatch[0].split(/[-–—/]|(?:\s+a\s+|\s+al\s+|\s+to\s+)/i).map((d) => d.trim());
          startDate = parts[0] || "";
          endDate = parts[parts.length - 1] || "";
          cleanLine = cleanLine.replace(DATE_RANGE_REGEX, "").trim();
        }

        const locMatch = cleanLine.match(KNOWN_CITIES_COUNTRIES_REGEX);
        if (locMatch) {
          eduLocation = locMatch[0].trim();
          cleanLine = cleanLine.replace(locMatch[0], "").trim();
        }

        if (isBullet || /(?:certificados?\s+acad[eé]micos?|cursos?|distinciones?|menci[oó]n|honores|tesis|gpa|promedio)/i.test(line)) {
          highlights.push(cleanBulletPrefix(line));
          continue;
        }

        if (KNOWN_EDU_INSTITUTIONS_REGEX.test(cleanLine) && !institution) {
          institution = cleanLine;
        } else if (KNOWN_EDU_DEGREES_REGEX.test(cleanLine) && !degree) {
          degree = cleanLine;
        } else if (!institution && cleanLine.length < 55 && !cleanLine.includes(":")) {
          institution = cleanLine;
        } else if (!degree && cleanLine.length < 80 && !cleanLine.includes(":")) {
          degree = cleanLine;
        } else if (cleanLine) {
          highlights.push(cleanLine);
        }
      }

      if (!institution && degree) {
        institution = "Universidad / Instituto";
      }

      education.push({
        id: `edu-${Date.now()}-${idx}`,
        institution: institution || "Institución Educativa",
        degree: degree || "Formación Profesional",
        location: eduLocation,
        start_date: startDate,
        end_date: endDate,
        current: /^(presente|present|actual|cursando|ongoing)$/i.test(endDate.trim()),
        highlights,
      });
    });
  }

  // 8. Certificaciones
  const certLines = sections.filter((s) => s.type === "certifications").flatMap((s) => s.lines);
  const certifications: CertificationEntry[] = [];

  if (certLines.length > 0) {
    for (let i = 0; i < certLines.length; i++) {
      const line = cleanBulletPrefix(certLines[i].trim());
      if (!line || line.length < 3) continue;

      const dateMatch = line.match(CERT_DATE_REGEX);
      let certDate: string | undefined = undefined;
      let cleanLine = line;

      if (dateMatch) {
        certDate = dateMatch[0].replace(/^\(|\)$/g, "").trim();
        cleanLine = line.replace(dateMatch[0], "").trim();
      }

      const parts = cleanLine.split(/[-–—|:]/).map((p) => p.trim()).filter(Boolean);
      let certName = "";
      let issuer = "";

      if (parts.length >= 2) {
        certName = parts[0];
        issuer = parts.slice(1).join(" - ");
      } else {
        certName = cleanLine;
        issuer = "Certificación Oficial";
      }

      certifications.push({
        id: `cert-${Date.now()}-${i}`,
        name: certName.replace(/\s+/g, " ").trim(),
        issuer: issuer.replace(/\s+/g, " ").trim(),
        date: certDate,
      });
    }
  }

  // 9. Competencias Técnicas
  const skillLines = sections.filter((s) => s.type === "skills").flatMap((s) => s.lines);
  const skills: SkillCategory[] = [];

  if (skillLines.length > 0) {
    for (const line of skillLines) {
      if (line.includes(":")) {
        const colonIdx = line.indexOf(":");
        const catName = line.slice(0, colonIdx).trim();
        const itemsStr = line.slice(colonIdx + 1).trim();
        const tokens = itemsStr
          .split(/[,|\n;•·]+/)
          .map((t) => t.trim())
          .filter((t) => t.length >= 1 && t.length <= 60);

        if (tokens.length > 0) {
          skills.push({
            id: `skill-${Date.now()}-${skills.length}`,
            category: catName,
            skills: tokens,
          });
        }
      }
    }
  }

  // Fallback si no había categorías explícitas con dos puntos
  if (skills.length === 0) {
    const flatTokens: string[] = [];
    skillLines.forEach((sLine) => {
      sLine.split(/[,|\n;•·]+/).forEach((token) => {
        const t = token.trim();
        if (t.length >= 2 && t.length <= 30 && !t.includes(".")) {
          flatTokens.push(t);
        }
      });
    });

    if (flatTokens.length < 4) {
      COMMON_SKILLS_TAXONOMY.forEach((sk) => {
        const regex = new RegExp(`\\b${sk.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(rawText)) {
          flatTokens.push(sk.name);
        }
      });
    }

    const classified = classifySkillsIntoCategories(flatTokens);
    classified
      .filter((cat) => cat.category !== "Otras Habilidades" || cat.skills.length <= 4)
      .forEach((cat, idx) => {
        skills.push({
          id: `skill-${Date.now()}-${idx}`,
          category: cat.category,
          skills: cat.skills,
        });
      });
  }

  return {
    name,
    headline,
    summary,
    email: email || undefined,
    phone: phone || undefined,
    location: location || undefined,
    website,
    social_networks,
    skills,
    experience,
    projects,
    education,
    certifications,
    custom_sections: [],
    section_order: dynamicSectionOrder,
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
    const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();

    if (apiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const { object } = await generateObject({
          model: google("gemini-2.5-flash"),
          schema: ResumeSchema,
          prompt: `Eres un asistente de IA especializado en análisis y extracción estructural de currículums (ATS-compliant).
Analiza el siguiente texto de un currículum o perfil y estructúralo de manera precisa y exhaustiva bajo el esquema JSON tipado.

INSTRUCCIONES CLAVE:
1. 'name': Extrae el nombre real y completo de la persona.
2. 'headline': Extrae el cargo o titular profesional.
3. 'summary': Extrae el párrafo completo de presentación/resumen profesional sin truncarlo.
4. 'skills': Extrae las habilidades técnicas categorizadas.
5. 'experience': Extrae CADA puesto laboral independiente con su empresa, cargo, fechas, ubicación y lista de logros cuantitativos (highlights).
6. 'projects': Extrae CADA proyecto independiente con su nombre, tecnologías detectadas y viñetas de logros.
7. 'education': Extrae CADA grado o estudio independiente como un elemento en el array de educación.
8. 'certifications': Extrae las certificaciones individuales con sus nombres, emisores y fechas (incluyendo 'En Curso', 'Presente', etc.).
9. 'section_order': Conserva el orden exacto en que aparecen las secciones en el documento.

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

    // 2. Motor Heurístico Avanzado y Determinista Multi-Sección
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

