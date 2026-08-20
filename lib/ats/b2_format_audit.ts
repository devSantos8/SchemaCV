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

  // ─── 4. Consistencia y Legibilidad de Fechas ─────────────────────────────────
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

  // ─── 5. Viñetas Estándar (Bullets Sin Glifos Rotos) ───────────────────────────
  const weirdBulletRegex = /[➔➜➤►▶→⇒✔✓✗✘★☆◆◇■□]/g;
  const hasWeirdBullets = weirdBulletRegex.test(rawText);

  rules.push({
    id: 'standard_bullets',
    name: 'Viñetas Estándar (•)',
    category: 'bullets',
    status: isBlankOrEmpty ? 'warning' : hasWeirdBullets ? 'fail' : 'pass',
    severity: 'warning',
    scoreWeight: 10,
    scoreEarned: isBlankOrEmpty ? 3 : hasWeirdBullets ? 2 : 10,
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

  // ─── 6. Codificación UTF-8 Limpia (Sin Mojibake) ─────────────────────────────
  const hasEncodingIssue = simulation.encodingIssues.hasMojibake;
  rules.push({
    id: 'clean_encoding',
    name: 'Codificación Limpia UTF-8 (Acentos y Ñ)',
    category: 'encoding',
    status: hasEncodingIssue ? 'fail' : isBlankOrEmpty ? 'warning' : 'pass',
    severity: 'critical',
    scoreWeight: 10,
    scoreEarned: hasEncodingIssue ? 0 : isBlankOrEmpty ? 4 : 10,
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

  // ─── 7. Densidad de Texto y Seleccionabilidad (Copy-Paste Test) ──────────────
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
    scoreWeight: 10,
    scoreEarned: isBlankOrEmpty || wordCount < 40
      ? 0
      : hasGoodWordCount && isSelectable
      ? 10
      : isModerateWordCount
      ? 5
      : 2,
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

  // ─── 8. Sin Elementos Gráficos ni Fotos Innecesarias ────────────────────────
  const hasPhotoRisk = sourceType === 'uploaded_pdf' && rawText.length < 250;
  rules.push({
    id: 'no_graphics_photos',
    name: 'Sin Gráficos, Barras de Progreso ni Fotos',
    category: 'layout',
    status: hasPhotoRisk ? 'warning' : isBlankOrEmpty ? 'warning' : 'pass',
    severity: 'info',
    scoreWeight: 5,
    scoreEarned: hasPhotoRisk || isBlankOrEmpty ? 2 : 5,
    message: isBlankOrEmpty
      ? 'Pendiente de contenido estructurado.'
      : hasPhotoRisk
      ? 'Precaución: asegúrate de no incluir fotos o barras porcentuales de habilidades.'
      : 'Formato limpio de texto sin elementos gráficos que obstaculicen la lectura.',
    fixGuide: {
      whyItMatters: 'Las barras de habilidades (ej: "Python 80%") son ilegibles para el ATS y restan espacio valioso.',
      howToFix: 'Agrupa tus habilidades por categorías en texto plano.',
      example: 'Backend: Python, Node.js, PostgreSQL, Docker.',
    },
  });

  // ─── 9. Tipografía Web-Safe y Legible ────────────────────────────────────────
  rules.push({
    id: 'web_safe_typography',
    name: 'Tipografía Estándar y Alto Contraste',
    category: 'typography',
    status: isBlankOrEmpty ? 'warning' : 'pass',
    severity: 'info',
    scoreWeight: 5,
    scoreEarned: isBlankOrEmpty ? 2 : 5,
    message: isBlankOrEmpty
      ? 'Tipografía base configurada.'
      : 'Fuentes estándar compatibles con renderizado vectorial limpio.',
    fixGuide: {
      whyItMatters: 'Fuentes decorativas o no estándar pueden no estar embebidas y causar caracteres invisibles en el ATS.',
      howToFix: 'Usa familias tipográficas estándar (EB Garamond, Calibri, Arial, Helvetica, Georgia).',
      example: 'EB Garamond para perfiles clásicos, Segoe UI / Arial para perfiles técnicos.',
    },
  });

  // ─── 10. Completitud Esencial de Secciones ──────────────────────────────────
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
