import type { ResumeData } from '@/types/resume';
import type { ATSAuditRule, ATSParsedSimulation } from '@/types/evaluator';

/**
 * Batería de auditoría de formato ATS.
 * Evalúa 10 reglas deterministas con severidad y guía de remediación.
 */
export function auditATSFormat(input: {
  resumeData?: ResumeData;
  simulation: ATSParsedSimulation;
  sourceType: 'schema_profile' | 'uploaded_pdf';
}): { rules: ATSAuditRule[]; atsScore: number } {
  const { simulation, resumeData, sourceType } = input;
  const rawText = simulation.rawExtractedText || '';
  const wordCount = simulation.wordCount || 0;
  const isBlankOrEmpty = wordCount < 30 || (!resumeData?.name && !rawText.trim());
  const rules: ATSAuditRule[] = [];

  // ─── 1. Layout de 1 Sola Columna Secuencial ─────────────────────────────────
  const hasReadingOrderIssue = simulation.readingOrderIssues.length > 0;
  rules.push({
    id: 'single_column',
    name: 'Estructura de 1 Columna (Lectura Secuencial)',
    category: 'layout',
    status: isBlankOrEmpty ? 'fail' : hasReadingOrderIssue ? 'fail' : 'pass',
    severity: 'critical',
    scoreWeight: 15,
    scoreEarned: isBlankOrEmpty ? 0 : hasReadingOrderIssue ? 0 : 15,
    message: isBlankOrEmpty
      ? 'Documento vacío o sin texto suficiente para validar estructura lineal.'
      : hasReadingOrderIssue
      ? 'Se detectó desorden o fragmentación en las secciones de experiencia/educación.'
      : 'Estructura lineal top-to-bottom correcta sin sidebars ni columnas flotantes.',
    detail: hasReadingOrderIssue ? simulation.readingOrderIssues.join(' ') : undefined,
    fixGuide: {
      whyItMatters: 'Los ATS leen el texto de izquierda a derecha. Los diseños de dos columnas o sidebars hacen que el texto se mezcle entre columnas.',
      howToFix: 'Usa una plantilla de columna única donde cada sección vaya debajo de la anterior.',
      example: 'Encabezado -> Resumen -> Habilidades -> Experiencia -> Educación.',
    },
  });

  // ─── 2. Datos de Contacto en el Cuerpo Principal ────────────────────────────
  const hasEmail = Boolean(simulation.detectedContact.email && simulation.detectedContact.email.trim());
  const hasPhone = Boolean(simulation.detectedContact.phone && simulation.detectedContact.phone.trim());
  const hasContact = hasEmail || hasPhone;
  const contactInBody = simulation.detectedContact.isInBody;
  const contactPassed = hasContact && contactInBody;

  rules.push({
    id: 'contact_in_body',
    name: 'Contacto en el Cuerpo Principal',
    category: 'contact',
    status: contactPassed ? 'pass' : hasContact ? 'warning' : 'fail',
    severity: 'critical',
    scoreWeight: 15,
    scoreEarned: contactPassed ? 15 : hasContact ? 7 : 0,
    message: contactPassed
      ? `Contacto identificado (${simulation.detectedContact.email || 'Email'}, ${simulation.detectedContact.phone || 'Teléfono'}).`
      : 'No se detectó email o teléfono de contacto en el texto del currículum.',
    detail: !hasContact ? 'El parser no pudo extraer ninguna dirección de correo o teléfono.' : undefined,
    fixGuide: {
      whyItMatters: 'Muchos sistemas ATS omiten las cabeceras y pies de página (headers/footers) del PDF al extraer el texto plano.',
      howToFix: 'Ubica tu nombre, correo, teléfono y ciudad en el flujo normal del documento al inicio.',
      example: 'Juan Pérez | juan@email.com | +56 9 1234 5678 | Santiago, Chile',
    },
  });

  // ─── 3. Encabezados de Sección Estándar y Canónicos ─────────────────────────
  const nonStandardSections = simulation.detectedSections.filter((s) => !s.isStandard);
  const totalSections = simulation.detectedSections.length;
  const hasSections = totalSections >= 3;
  const headingsPassed = hasSections && nonStandardSections.length === 0;

  rules.push({
    id: 'standard_headings',
    name: 'Encabezados de Sección Canónicos',
    category: 'headings',
    status: isBlankOrEmpty || totalSections === 0 ? 'fail' : headingsPassed ? 'pass' : nonStandardSections.length > 0 ? 'fail' : 'warning',
    severity: 'critical',
    scoreWeight: 15,
    scoreEarned: isBlankOrEmpty || totalSections === 0 ? 0 : headingsPassed ? 15 : nonStandardSections.length > 0 ? 5 : 8,
    message: isBlankOrEmpty || totalSections === 0
      ? 'No se identificaron encabezados de sección estándar en el documento.'
      : headingsPassed
      ? `Todos los encabezados (${totalSections}) usan nombres estándar reconocibles por ATS.`
      : nonStandardSections.length > 0
      ? `Encabezados no estándar detectados: ${nonStandardSections.map((s) => `"${s.detectedHeader}"`).join(', ')}.`
      : 'Pocas secciones identificadas en el documento.',
    detail: nonStandardSections.length > 0 ? 'Los nombres creativos impiden que el parser clasifique la información.' : undefined,
    fixGuide: {
      whyItMatters: 'Los algoritmos ATS buscan palabras clave exactas para clasificar cada sección.',
      howToFix: 'Reemplaza nombres metafóricos por títulos universales.',
      example: 'Usa "Experiencia Laboral" en lugar de "Mi Trayectoria" o "Habilidades Técnicas" en lugar de "Superpoderes".',
    },
  });

  // ─── 4. Fusión de Tokens Semánticos (Anti-Fused Tokens) ────────────────────
  const fusedTokensDetected: string[] = [];

  // Check 4.1: Nombre + Headline fusionados (ej: "SANTOSAI Engineer")
  if (resumeData?.name && resumeData?.headline) {
    const lastNamePart = resumeData.name.trim().split(/\s+/).pop() || '';
    const firstHeadlinePart = resumeData.headline.trim().split(/\s+/)[0] || '';
    if (lastNamePart && firstHeadlinePart) {
      const fusedPair = `${lastNamePart}${firstHeadlinePart}`;
      if (rawText.includes(fusedPair)) {
        fusedTokensDetected.push(`Nombre y Titular pegados ("${fusedPair}")`);
      }
    }
  }

  // Check 4.2: Emisor + Año en certificaciones (ej: "Google2026", "Graduate2024")
  const fusedYearRegex = /\b([a-zA-Z]{3,})(19\d\d|20\d\d)\b/g;
  let matchYear: RegExpExecArray | null;
  while ((matchYear = fusedYearRegex.exec(rawText)) !== null) {
    // Excluir siglas legítimas como CSS3, HTML5, MP3, etc.
    const token = matchYear[0];
    if (!/^(?:W3C|UTF8|SHA256|ISO9001|ECMA2026|ES2022)$/i.test(token)) {
      fusedTokensDetected.push(`Texto y año pegados ("${token}")`);
    }
  }

  // Check 4.3: Habilidad con dos puntos sin espacio (ej: "Backend:Python")
  const fusedColonRegex = /\b([a-zA-Z]{2,}):([a-zA-Z]{2,})\b/g;
  let matchColon: RegExpExecArray | null;
  while ((matchColon = fusedColonRegex.exec(rawText)) !== null) {
    const fullMatch = matchColon[0];
    if (!/^https?:/i.test(fullMatch)) {
      fusedTokensDetected.push(`Etiqueta sin espacio tras ':' ("${fullMatch}")`);
    }
  }

  // Check 4.4: Delimitadores de layout pegados sin espacio (ej: "Position|Company", "Section—Title")
  const textWithoutUrls = rawText
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, "")
    .replace(/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*/gi, "");

  const fusedDelimiterRegex = /\b([a-zA-Z]{2,})([|—])([a-zA-Z]{2,})\b/g;
  let matchDelim: RegExpExecArray | null;
  while ((matchDelim = fusedDelimiterRegex.exec(textWithoutUrls)) !== null) {
    const fullMatch = matchDelim[0];
    fusedTokensDetected.push(`Delimitador sin espacios ("${fullMatch}")`);
  }

  const hasFusedTokens = fusedTokensDetected.length > 0;
  rules.push({
    id: 'no_fused_tokens',
    name: 'Separación de Tokens Semánticos (Anti-Fused Tokens)',
    category: 'layout',
    status: isBlankOrEmpty ? 'pass' : hasFusedTokens ? 'fail' : 'pass',
    severity: 'critical',
    scoreWeight: 10,
    scoreEarned: isBlankOrEmpty ? 10 : hasFusedTokens ? 0 : 10,
    message: hasFusedTokens
      ? `Se detectaron tokens fusionados sin espacio: ${fusedTokensDetected.slice(0, 3).join(', ')}.`
      : 'Todos los tokens de texto (nombre, emisor, años, categorías) extraídos con separación limpia.',
    detail: hasFusedTokens ? fusedTokensDetected.join(' | ') : undefined,
    fixGuide: {
      whyItMatters: 'Si un token se fusiona como "Google2026" o "SANTOSAI", el ATS no puede identificar el nombre de la empresa ni del candidato.',
      howToFix: 'Inserta separadores textuales explícitos (" — ", " | ") y espacio tras los dos puntos.',
      example: 'Google — (2026) / Backend: Python, Node.js',
    },
  });

  // ─── 5. Formato Canónico de URLs de Contacto ────────────────────────────────
  const invalidUrls: string[] = [];
  const socialList = resumeData?.social_networks || [];
  for (const sn of socialList) {
    const netLower = sn.network.toLowerCase();
    const urlVal = sn.url || '';
    if (netLower.includes('linkedin')) {
      if (urlVal && !urlVal.includes('linkedin.com/in/')) {
        invalidUrls.push(`LinkedIn debe incluir "/in/": "${urlVal}"`);
      }
    }
    if (netLower.includes('github')) {
      if (urlVal && !urlVal.includes('github.com/')) {
        invalidUrls.push(`GitHub debe ser "github.com/usuario": "${urlVal}"`);
      }
    }
  }

  const hasInvalidUrls = invalidUrls.length > 0;
  rules.push({
    id: 'canonical_social_urls',
    name: 'Formato Canónico de URLs (LinkedIn y GitHub)',
    category: 'contact',
    status: hasInvalidUrls ? 'warning' : 'pass',
    severity: 'warning',
    scoreWeight: 5,
    scoreEarned: hasInvalidUrls ? 2 : 5,
    message: hasInvalidUrls
      ? `URLs con formato no canónico: ${invalidUrls.join(', ')}.`
      : 'Enlaces profesionales (LinkedIn /in/, GitHub) con formato canónico correcto.',
    detail: hasInvalidUrls ? invalidUrls.join(' | ') : undefined,
    fixGuide: {
      whyItMatters: 'Los reclutadores y parsers ATS usan el enlace directo al perfil "linkedin.com/in/usuario" para enriquecer el candidato.',
      howToFix: 'Asegúrate de incluir "/in/" en tus enlaces de LinkedIn.',
      example: 'https://linkedin.com/in/tu-usuario',
    },
  });

  // ─── 6. Consistencia y Legibilidad de Fechas ─────────────────────────────────
  const dateWithMonthRegex = /(?:Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2}\/|\d{4}-\d{2})[\w\s.-]*\d{4}/gi;
  const yearOnlyRegex = /\b(19\d\d|20\d\d)\s*[-—–]\s*(19\d\d|20\d\d|Presente|Present)\b/gi;
  
  const datesWithMonth = (rawText.match(dateWithMonthRegex) || []).length;
  const yearsOnly = (rawText.match(yearOnlyRegex) || []).length;
  const hasExperienceEntries = (resumeData?.experience?.filter((e) => !e.hidden)?.length ?? 0) > 0;
  const datesPassed = hasExperienceEntries
    ? resumeData!.experience!.every((e) => Boolean(e.start_date))
    : datesWithMonth > 0;

  rules.push({
    id: 'date_consistency',
    name: 'Fechas con Mes y Año Estructurados',
    category: 'dates',
    status: isBlankOrEmpty || (!hasExperienceEntries && datesWithMonth === 0 && yearsOnly === 0)
      ? 'fail'
      : datesPassed
      ? 'pass'
      : yearsOnly > 0
      ? 'warning'
      : 'fail',
    severity: 'warning',
    scoreWeight: 10,
    scoreEarned: isBlankOrEmpty || (!hasExperienceEntries && datesWithMonth === 0 && yearsOnly === 0)
      ? 0
      : datesPassed
      ? 10
      : yearsOnly > 0
      ? 6
      : 2,
    message: isBlankOrEmpty || (!hasExperienceEntries && datesWithMonth === 0 && yearsOnly === 0)
      ? 'No se encontraron fechas de empleo ni historial cronológico registrado.'
      : datesPassed
      ? 'Fechas estructuradas detectadas correctamente con mes y año.'
      : 'Se detectaron fechas solo con año o rangos incompletos sin mes.',
    detail: yearsOnly > 0 ? 'Poner solo el año ("2022 - 2023") confunde el cálculo de meses de experiencia en el ATS.' : undefined,
    fixGuide: {
      whyItMatters: 'Los ATS calculan los años exactos sumando meses de empleo. "2022 - 2023" puede ser interpretado como 2 meses o 24 meses.',
      howToFix: 'Incluye siempre el mes abreviado y año en cada empleo y estudio.',
      example: 'Mar 2022 – Presente / 03/2022 – 11/2023',
    },
  });

  // ─── 7. Orden Cronológico Inverso (Workday / Taleo Standard) ────────────────
  const expList = (resumeData?.experience || []).filter((e) => !e.hidden);
  let isReverseChronological = true;
  if (expList.length > 1) {
    let prevYear = 9999;
    for (const exp of expList) {
      const startMatch = (exp.start_date || '').match(/\b(19\d\d|20\d\d)\b/);
      const year = exp.current ? 9999 : startMatch ? parseInt(startMatch[1], 10) : 0;
      if (year > prevYear && prevYear !== 9999) {
        isReverseChronological = false;
        break;
      }
      if (year > 0) prevYear = year;
    }
  }

  rules.push({
    id: 'reverse_chronological',
    name: 'Orden Cronológico Inverso',
    category: 'dates',
    status: isBlankOrEmpty ? 'pass' : isReverseChronological ? 'pass' : 'warning',
    severity: 'warning',
    scoreWeight: 5,
    scoreEarned: isBlankOrEmpty ? 5 : isReverseChronological ? 5 : 2,
    message: isReverseChronological
      ? 'Experiencias ordenadas desde la más reciente a la más antigua.'
      : 'Se detectaron empleos desordenados cronológicamente.',
    fixGuide: {
      whyItMatters: 'Los ATS corporativos (Workday, Taleo, Greenhouse) esperan que el empleo más reciente aparezca en primer lugar.',
      howToFix: 'Ordena tus experiencias laborales de la más reciente a la más antigua.',
      example: '2024 – Presente (arriba) -> 2022 – 2024 -> 2020 – 2022 (abajo)',
    },
  });

  // ─── 8. Cuantificación de Logros (Métricas y Números) ───────────────────────
  const allHighlights: string[] = [];
  (resumeData?.experience || []).forEach((e) => (e.highlights || []).forEach((h) => allHighlights.push(h)));
  (resumeData?.projects || []).forEach((p) => (p.highlights || []).forEach((h) => allHighlights.push(h)));

  const metricRegex = /\b\d+(?:[.,]\d+)?\s*(?:%|x|ms|s|k|m|mil|millones|usd|clp|\$|€|horas|usuarios|users|clientes|transacciones|petabytes|terabytes|gb)\b|\b\d{2,}\b/i;
  const quantifiedCount = allHighlights.filter((h) => metricRegex.test(h)).length;
  const totalHighlights = allHighlights.length;
  const quantifiedRatio = totalHighlights > 0 ? quantifiedCount / totalHighlights : 0;
  const hasGoodMetrics = totalHighlights >= 2 && (quantifiedRatio >= 0.3 || quantifiedCount >= 2);

  rules.push({
    id: 'quantified_impact',
    name: 'Cuantificación de Logros e Impacto',
    category: 'content',
    status: isBlankOrEmpty ? 'warning' : hasGoodMetrics ? 'pass' : quantifiedCount > 0 ? 'warning' : 'fail',
    severity: 'critical',
    scoreWeight: 10,
    scoreEarned: isBlankOrEmpty ? 2 : hasGoodMetrics ? 10 : quantifiedCount > 0 ? 5 : 0,
    message: hasGoodMetrics
      ? `Logros cuantificados con métricas claras (${quantifiedCount} de ${totalHighlights} viñetas con cifras de impacto).`
      : quantifiedCount > 0
      ? `Solo ${quantifiedCount} viñetas contienen métricas medibles. Se recomienda cuantificar al menos el 40% de los logros.`
      : 'No se detectaron métricas medibles (porcentajes, cifras, tiempos de reducción o volumen) en tus logros.',
    fixGuide: {
      whyItMatters: 'Los reclutadores y filtros ATS priorizan candidatos con logros medibles (% de mejora, reducción de latencia, usuarios impactados).',
      howToFix: 'Añade números concretos a tus responsabilidades usando la fórmula: Logro + Acción + Métrica.',
      example: '• Reduje la latencia de respuesta en un 65% mediante arquitectura desacoplada.',
    },
  });

  // ─── 9. Verbos de Acción Fuertes ─────────────────────────────────────────────
  const actionVerbRegex = /^\s*(?:[•\-*]\s*)?(?:Desarrollé|Diseñé|Lideré|Implementé|Optimizé|Construí|Automaticé|Migré|Coordiné|Gestioné|Creé|Reduje|Aumenté|Refactoricé|Arquitecté|Evalué|Configuré|Administré|Integré|Desplegué|Encabecé|Supervisé|Ejecuté|Consolidé|Analicé|Built|Designed|Developed|Led|Implemented|Optimized|Migrated|Automated|Created|Architected|Managed|Engineered|Deployed|Spearheaded)\b/i;
  const actionVerbCount = allHighlights.filter((h) => actionVerbRegex.test(h)).length;
  const actionVerbRatio = totalHighlights > 0 ? actionVerbCount / totalHighlights : 0;
  const hasStrongActionVerbs = totalHighlights >= 2 && (actionVerbRatio >= 0.4 || actionVerbCount >= 2);

  rules.push({
    id: 'action_verbs',
    name: 'Verbos de Acción al Inicio de Viñetas',
    category: 'content',
    status: isBlankOrEmpty ? 'warning' : hasStrongActionVerbs ? 'pass' : actionVerbCount > 0 ? 'warning' : 'fail',
    severity: 'warning',
    scoreWeight: 10,
    scoreEarned: isBlankOrEmpty ? 2 : hasStrongActionVerbs ? 10 : actionVerbCount > 0 ? 5 : 1,
    message: hasStrongActionVerbs
      ? `Viñetas redactadas con verbos de acción fuertes (${actionVerbCount} viñetas activas).`
      : actionVerbCount > 0
      ? `Solo ${actionVerbCount} viñetas inician con verbos de acción. Evita expresiones pasivas como "Encargado de...".`
      : 'Inicia cada viñeta con un verbo de acción en primera persona o pasado (ej. "Desarrollé", "Lideré", "Optimizé").',
    fixGuide: {
      whyItMatters: 'Los verbos de acción transmiten liderazgo y proactividad, capturando la atención de los reclutadores en los primeros 6 segundos.',
      howToFix: 'Empieza cada punto con un verbo fuerte en lugar de sustantivos pasivos.',
      example: '• Lideré la migración hacia microservicios en lugar de "Responsable de la migración".',
    },
  });

  // ─── 10. Viñetas Estándar (Bullets Sin Glifos Rotos) ───────────────────────────
  const weirdBulletRegex = /[➔➜➤►▶→⇒✔✓✗✘★☆◆◇■□]/g;
  const hasWeirdBullets = weirdBulletRegex.test(rawText);

  rules.push({
    id: 'standard_bullets',
    name: 'Viñetas Estándar (•)',
    category: 'bullets',
    status: isBlankOrEmpty ? 'warning' : hasWeirdBullets ? 'fail' : 'pass',
    severity: 'warning',
    scoreWeight: 5,
    scoreEarned: isBlankOrEmpty ? 2 : hasWeirdBullets ? 1 : 5,
    message: isBlankOrEmpty
      ? 'No hay viñetas ni logros laborales redactados aún.'
      : hasWeirdBullets
      ? 'Se detectaron flechas, íconos decorativos o checks en lugar de viñetas estándar.'
      : 'Viñetas y listas con formato estándar limpio.',
    detail: hasWeirdBullets ? 'Los glifos especiales se extraen a menudo como caracteres basura o rompen la línea.' : undefined,
    fixGuide: {
      whyItMatters: 'Íconos gráficos como flechas o estrellas se convierten en caracteres no imprimibles al extraer el texto.',
      howToFix: 'Usa exclusivamente el punto estándar (•) o guion simple (-).',
      example: '• Lideré la migración a microservicios logrando un 30% más de throughput.',
    },
  });

  // ─── 11. Codificación UTF-8 Limpia (Sin Mojibake) ─────────────────────────────
  const hasEncodingIssue = simulation.encodingIssues.hasMojibake;
  rules.push({
    id: 'clean_encoding',
    name: 'Codificación Limpia UTF-8 (Acentos y Ñ)',
    category: 'encoding',
    status: hasEncodingIssue ? 'fail' : isBlankOrEmpty ? 'warning' : 'pass',
    severity: 'critical',
    scoreWeight: 5,
    scoreEarned: hasEncodingIssue ? 0 : isBlankOrEmpty ? 2 : 5,
    message: hasEncodingIssue
      ? `Se detectaron caracteres corruptos (mojibake): ${simulation.encodingIssues.corruptedCharacters.slice(0, 5).join(', ')}.`
      : isBlankOrEmpty
      ? 'Texto insuficiente para comprobar codificación.'
      : 'Texto 100% libre de caracteres corruptos o fallas de codificación.',
    fixGuide: {
      whyItMatters: 'Si un acento se corrompe en "GestiÃ³n", el ATS no encontrará la palabra clave "Gestión".',
      howToFix: 'Exporta siempre en UTF-8 estándar con fuentes vectoriales embebidas.',
      example: 'Exporta directamente desde SchemaCV o usa fuentes estándar.',
    },
  });

  // ─── 12. Densidad de Texto y Seleccionabilidad (Copy-Paste Test) ──────────────
  const isSelectable = simulation.ocrConfidence >= 80;
  const hasGoodWordCount = wordCount >= 180;
  const isModerateWordCount = wordCount >= 70;

  rules.push({
    id: 'selectable_text',
    name: 'Densidad de Contenido & Texto Seleccionable',
    category: 'content',
    status: isBlankOrEmpty || wordCount < 40
      ? 'fail'
      : hasGoodWordCount && isSelectable
      ? 'pass'
      : 'warning',
    severity: 'critical',
    scoreWeight: 5,
    scoreEarned: isBlankOrEmpty || wordCount < 40
      ? 0
      : hasGoodWordCount && isSelectable
      ? 5
      : isModerateWordCount
      ? 3
      : 1,
    message: isBlankOrEmpty || wordCount < 40
      ? `Contenido insuficiente (${wordCount} palabras). Un CV profesional para ATS requiere entre 250 y 650 palabras.`
      : hasGoodWordCount
      ? `Documento con capa de texto nítida y densidad adecuada (${wordCount} palabras).`
      : `Contenido escaso (${wordCount} palabras). Se recomienda expandir descripciones de logros.`,
    fixGuide: {
      whyItMatters: 'Un CV con menos de 150 palabras carece de densidad de palabras clave técnicas para superar el filtro del robot.',
      howToFix: 'Agrega detalles cuantificables y viñetas de logros en cada experiencia.',
      example: 'Verifica seleccionando el texto con Ctrl+A en tu visor de PDF.',
    },
  });

  // ─── 13. Completitud Esencial de Secciones ──────────────────────────────────
  const canonicalNames = new Set(simulation.detectedSections.map((s) => s.canonicalName));
  const hasExperience = (resumeData?.experience?.filter((e) => !e.hidden)?.length ?? 0) > 0 || canonicalNames.has('experience');
  const hasSkills = (resumeData?.skills?.filter((s) => !s.hidden)?.length ?? 0) > 0 || canonicalNames.has('skills');
  const hasEducation = (resumeData?.education?.filter((ed) => !ed.hidden)?.length ?? 0) > 0 || canonicalNames.has('education');
  const completenessPassed = hasExperience && hasSkills && hasEducation;
  const missingCount = [!hasExperience, !hasSkills, !hasEducation].filter(Boolean).length;

  rules.push({
    id: 'section_completeness',
    name: 'Completitud de Secciones Esenciales',
    category: 'content',
    status: completenessPassed ? 'pass' : isBlankOrEmpty || missingCount >= 2 ? 'fail' : 'warning',
    severity: 'critical',
    scoreWeight: 5,
    scoreEarned: completenessPassed ? 5 : isBlankOrEmpty || missingCount >= 2 ? 0 : 2,
    message: completenessPassed
      ? 'Secciones clave presentes (Experiencia, Habilidades, Educación y Contacto).'
      : isBlankOrEmpty
      ? 'Currículum en blanco; faltan las 3 secciones indispensables (Experiencia, Habilidades, Educación).'
      : `Faltan secciones clave: ${[!hasExperience ? 'Experiencia' : '', !hasSkills ? 'Habilidades' : '', !hasEducation ? 'Educación' : ''].filter(Boolean).join(', ')}.`,
    fixGuide: {
      whyItMatters: 'Un CV sin sección explícita de habilidades o educación es descartado automáticamente por filtros de preselección.',
      howToFix: 'Asegúrate de incluir siempre las 4 secciones fundamentales.',
      example: 'Contacto -> Habilidades -> Experiencia -> Educación.',
    },
  });

  // Calcular score total (0-100)
  const totalEarned = rules.reduce((acc, r) => acc + r.scoreEarned, 0);
  const atsScore = isBlankOrEmpty
    ? Math.min(15, Math.round(totalEarned))
    : Math.max(0, Math.min(100, Math.round(totalEarned)));

  return { rules, atsScore };
}
