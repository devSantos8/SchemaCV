import type { ResumeData } from '@/types/resume';
import type { ATSParsedSimulation, ATSDetectedSection } from '@/types/evaluator';

// Patrones comunes de mojibake (texto corrupto por codificación ISO-8859 / UTF-8 rota)
const MOJIBAKE_PATTERNS = [
  /Ã¡|Ã©|Ã­|Ã³|Ãº|Ã±|Ã |Ã‰|Ã |Ã“|Ãš|Ã‘/g,
  /â€“|â€”|â€™|â€œ|â€ |â€¢/g,
  /\uFFFD/g, // Replacement character 
  /&amp;|&lt;|&gt;|&quot;|&#39;/g,
];

// Regex para datos de contacto
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/;
const LINKEDIN_REGEX = /(?:linkedin\.com\/in\/[\w-]+|in\/[\w-]+)/i;
const GITHUB_REGEX = /(?:github\.com\/[\w-]+)/i;
const URL_REGEX = /https?:\/\/[^\s/$.?#].[^\s]*/gi;

// Mapeo canónico de nombres de secciones
const SECTION_CANONICAL_PATTERNS: { canonical: string; pattern: RegExp; isStandard: boolean }[] = [
  { canonical: 'summary', pattern: /^(?:resumen|perfil|acerca de m[ií]|summary|professional summary|profile|about me|executive summary|extracto)$/i, isStandard: true },
  { canonical: 'experience', pattern: /^(?:experiencia|experiencia laboral|experiencia profesional|work experience|professional experience|employment history|historial laboral)$/i, isStandard: true },
  { canonical: 'skills', pattern: /^(?:habilidades|competencias|habilidades t[eé]cnicas|competencias t[eé]cnicas|technical skills|skills|technologies|stack tecnol[oó]gico|core competencies)$/i, isStandard: true },
  { canonical: 'education', pattern: /^(?:educaci[oó]n|formaci[oó]n|educaci[oó]n & formaci[oó]n|education|academic background|estudios|formaci[oó]n acad[eé]mica)$/i, isStandard: true },
  { canonical: 'projects', pattern: /^(?:proyectos|proyectos destacados|key projects|projects|personal projects|portfolio)$/i, isStandard: true },
  { canonical: 'certifications', pattern: /^(?:certificaciones|certificados|cursos|certifications|credentials|licenses|certifications & credentials)$/i, isStandard: true },
  // Nombres creativos o no estándar (penalizados en ATS)
  { canonical: 'experience', pattern: /^(?:mi camino|trayectoria|d[oó]nde he estado|lo que he hecho|where i've been|career journey)$/i, isStandard: false },
  { canonical: 'skills', pattern: /^(?:mi caja de herramientas|superpoderes|stack m[aá]gico|my toolbox|superpowers|wizardry)$/i, isStandard: false },
  { canonical: 'education', pattern: /^(?:conocimiento adquirido|estudiando la vida|alma mater)$/i, isStandard: false },
];

/**
 * Convierte un ResumeData estructurado en una simulación de texto plano secuencial top-to-bottom
 */
export function resumeDataToRawText(data: ResumeData): string {
  const lines: string[] = [];

  // Contacto en cabecera
  lines.push(data.name || '');
  if (data.headline) lines.push(data.headline);
  const contactParts: string[] = [];
  if (data.email) contactParts.push(data.email);
  if (data.phone) contactParts.push(data.phone);
  if (data.location) contactParts.push(data.location);
  if (data.website) contactParts.push(data.website);
  if (data.social_networks) {
    data.social_networks.forEach((s) => contactParts.push(s.url || s.username || s.network));
  }
  if (contactParts.length > 0) lines.push(contactParts.join(' | '));
  lines.push('');

  // Secciones en orden
  const order = data.section_order || ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'];
  const hidden = new Set(data.hidden_sections || []);

  for (const secKey of order) {
    if (hidden.has(secKey)) continue;

    switch (secKey) {
      case 'summary':
        if (data.summary) {
          lines.push('RESUMEN PROFESIONAL');
          lines.push(data.summary);
          lines.push('');
        }
        break;
      case 'skills':
        if (data.skills && data.skills.length > 0) {
          lines.push('HABILIDADES TÉCNICAS');
          data.skills.filter((s) => !s.hidden).forEach((s) => {
            lines.push(`${s.category}: ${s.skills.join(', ')}`);
          });
          lines.push('');
        }
        break;
      case 'experience':
        if (data.experience && data.experience.length > 0) {
          lines.push('EXPERIENCIA LABORAL');
          data.experience.filter((e) => !e.hidden).forEach((e) => {
            const dateStr = `${e.start_date} - ${e.end_date || (e.current ? 'Presente' : '')}`;
            lines.push(`${e.position} | ${e.company} | ${dateStr}`);
            if (e.location) lines.push(e.location);
            if (e.summary) lines.push(e.summary);
            (e.highlights || []).forEach((h) => lines.push(`• ${h}`));
            lines.push('');
          });
        }
        break;
      case 'projects':
        if (data.projects && data.projects.length > 0) {
          lines.push('PROYECTOS DESTACADOS');
          data.projects.filter((p) => !p.hidden).forEach((p) => {
            const techStr = p.technologies?.length ? ` (${p.technologies.join(', ')})` : '';
            lines.push(`${p.name}${techStr}`);
            if (p.description) lines.push(p.description);
            (p.highlights || []).forEach((h) => lines.push(`• ${h}`));
            lines.push('');
          });
        }
        break;
      case 'education':
        if (data.education && data.education.length > 0) {
          lines.push('EDUCACIÓN');
          data.education.filter((ed) => !ed.hidden).forEach((ed) => {
            lines.push(`${ed.degree} | ${ed.institution} | ${ed.start_date || ''} - ${ed.end_date || ''}`);
            (ed.highlights || []).forEach((h) => lines.push(`• ${h}`));
            lines.push('');
          });
        }
        break;
      case 'certifications':
        if (data.certifications && data.certifications.length > 0) {
          lines.push('CERTIFICACIONES');
          data.certifications.filter((c) => !c.hidden).forEach((c) => {
            const dateStr = c.date ? ` (${c.date})` : '';
            lines.push(`${c.name} - ${c.issuer}${dateStr}`);
          });
          lines.push('');
        }
        break;
    }
  }

  return lines.join('\n').trim();
}

/**
 * Simula cómo un parser ATS extrae, ordena e interpreta el texto crudo del CV.
 */
export function simulateATSParsing(input: {
  resumeData?: ResumeData;
  rawText?: string;
  sourceType: 'schema_profile' | 'uploaded_pdf';
}): ATSParsedSimulation {
  const text = input.rawText || (input.resumeData ? resumeDataToRawText(input.resumeData) : '');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Detección de Mojibake / Caracteres corruptos
  const corrupted: string[] = [];
  for (const pattern of MOJIBAKE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => {
        if (!corrupted.includes(m)) corrupted.push(m);
      });
    }
  }

  // 2. Extracción de Datos de Contacto
  const detectedLinks: string[] = [];
  const urlMatches = text.match(URL_REGEX);
  if (urlMatches) {
    urlMatches.forEach((u) => {
      if (!detectedLinks.includes(u)) detectedLinks.push(u);
    });
  }

  const linkedinMatch = text.match(LINKEDIN_REGEX);
  if (linkedinMatch && !detectedLinks.some((l) => l.includes(linkedinMatch[0]))) {
    detectedLinks.push(linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`);
  }

  const githubMatch = text.match(GITHUB_REGEX);
  if (githubMatch && !detectedLinks.some((l) => l.includes(githubMatch[0]))) {
    detectedLinks.push(githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`);
  }

  const detectedEmail = text.match(EMAIL_REGEX)?.[0] || input.resumeData?.email;
  const detectedPhone = text.match(PHONE_REGEX)?.[0] || input.resumeData?.phone;

  // Detección de Nombre (típicamente las primeras 1-2 líneas que no sean email/teléfono)
  let detectedName = input.resumeData?.name;
  if (!detectedName && lines.length > 0) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (!line.includes('@') && !line.includes('http') && line.length < 50 && !/^\+?\d/.test(line)) {
        detectedName = line;
        break;
      }
    }
  }

  // Detección de ubicación
  const detectedLocation = input.resumeData?.location || undefined;

  // 3. Detección de Secciones y Orden Secuencial
  const detectedSections: ATSDetectedSection[] = [];
  const readingOrderIssues: string[] = [];

  let currentSection: ATSDetectedSection | null = null;
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/[:\-—–_]/g, '').trim();

    // Ver si la línea coincide con algún encabezado conocido
    let matchedSectionInfo: { canonical: string; isStandard: boolean } | null = null;
    for (const item of SECTION_CANONICAL_PATTERNS) {
      if (item.pattern.test(cleanLine)) {
        matchedSectionInfo = item;
        break;
      }
    }

    if (matchedSectionInfo) {
      if (currentSection) {
        detectedSections.push(currentSection);
      }
      sectionIndex++;
      currentSection = {
        canonicalName: matchedSectionInfo.canonical,
        detectedHeader: line,
        orderIndex: sectionIndex,
        isStandard: matchedSectionInfo.isStandard,
        itemCount: 0,
        snippet: '',
      };
    } else if (currentSection) {
      if (currentSection.snippet.length < 200) {
        currentSection.snippet += (currentSection.snippet ? ' ' : '') + line;
      }
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.includes('|')) {
        currentSection.itemCount++;
      }
    }
  }

  if (currentSection) {
    detectedSections.push(currentSection);
  }

  // Si no se detectaron secciones explícitas pero tenemos ResumeData
  if (detectedSections.length === 0 && input.resumeData) {
    const order = input.resumeData.section_order || [];
    order.forEach((s, idx) => {
      detectedSections.push({
        canonicalName: s,
        detectedHeader: s.toUpperCase(),
        orderIndex: idx + 1,
        isStandard: true,
        itemCount: 1,
        snippet: 'Sección estructurada estándar',
      });
    });
  }

  // Detectar problemas de orden de lectura
  const canonicalSequence = detectedSections.map((s) => s.canonicalName);

  // Si experiencia y educación aparecen duplicadas o fragmentadas
  if (canonicalSequence.filter((s) => s === 'experience').length > 1) {
    readingOrderIssues.push('Se detectaron múltiples bloques de experiencia fragmentados (posible indicio de sidebars o columnas complejas).');
  }

  // Verificar si el contacto está en el cuerpo
  const isInBody = Boolean(detectedEmail || detectedPhone || input.sourceType === 'schema_profile');

  // Confianza OCR / Texto seleccionable
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const characterCount = text.length;
  let ocrConfidence = 100;
  if (input.sourceType === 'uploaded_pdf') {
    if (characterCount < 100) ocrConfidence = 10;
    else if (characterCount < 400) ocrConfidence = 50;
    else if (corrupted.length > 3) ocrConfidence = 75;
  }

  return {
    rawExtractedText: text,
    characterCount,
    wordCount,
    detectedContact: {
      name: detectedName,
      email: detectedEmail,
      phone: detectedPhone,
      location: detectedLocation,
      links: detectedLinks,
      isInBody,
    },
    detectedSections,
    readingOrderIssues,
    encodingIssues: {
      hasMojibake: corrupted.length > 0,
      corruptedCharacters: corrupted,
    },
    ocrConfidence,
  };
}
