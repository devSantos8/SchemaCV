import type { ResumeData } from '@/types/resume';
import type {
  EvaluatedRequirement,
  CategoryScoreBreakdown,
  MissingKeywordItem,
  RequirementImportance,
} from '@/types/evaluator';
import { COMMON_SKILLS_TAXONOMY, type SkillCategoryKey } from '@/lib/taxonomy/skillsTaxonomy';

const MUST_HAVE_PATTERNS = [
  /must\s+have/i,
  /excluyente/i,
  /indispensable/i,
  /requerido/i,
  /requisito\s+(?:obligatorio|excluyente|indispensable|m[ií]nimo)/i,
  /obligatorio/i,
  /required/i,
  /essential/i,
  /minimum\s+requirements?/i,
  /m[ií]nimo\s+\d+\s+a[ñn]os/i,
  /al\s+menos\s+\d+\s+a[ñn]os/i,
  /at\s+least\s+\d+\s+years/i,
];

const NICE_TO_HAVE_PATTERNS = [
  /nice\s+to\s+have/i,
  /deseable/i,
  /plus/i,
  /idealmente/i,
  /valorable/i,
  /preferible/i,
  /preferred/i,
  /bonus/i,
  /desired/i,
  /se\s+valora/i,
  /puntos\s+extra/i,
];

function mapCategoryToRequirementType(
  cat: SkillCategoryKey
): 'hard_skill' | 'tool_platform' | 'soft_skill' | 'certification' {
  switch (cat) {
    case 'Languages':
    case 'Frameworks & Libraries':
    case 'Databases & Storage':
      return 'hard_skill';
    case 'Cloud & DevOps':
    case 'Tools & Platforms':
      return 'tool_platform';
    case 'Methodologies & Soft Skills':
      return 'soft_skill';
    default:
      return 'hard_skill';
  }
}

/**
 * Extrae y analiza los años de experiencia pedidos en la oferta vs los del candidato
 */
function analyzeExperienceYears(
  jobDesc: string,
  resumeData?: ResumeData,
  cvText?: string
): { requiredYears?: number; candidateYears: number; meets: boolean; score: number } {
  // 1. Detectar años pedidos en la oferta
  const reqMatch = jobDesc.match(/\b(\d+)\+?\s*(?:a[ñn]os|years|yrs)\s+(?:de\s+)?(?:experiencia|exp)/i)
    || jobDesc.match(/(?:experiencia|experience)\s+(?:de\s+)?(?:al\s+menos|m[ií]nima\s+de|of\s+at\s+least)?\s*(\d+)\+?\s*(?:a[ñn]os|years)/i);
  
  const requiredYears = reqMatch ? parseInt(reqMatch[1], 10) : undefined;

  // 2. Calcular años del candidato
  let candidateYears = 0;
  if (resumeData?.experience && resumeData.experience.length > 0) {
    // Sumar duración estimada de empleos
    let totalMonths = 0;
    for (const exp of resumeData.experience) {
      if (exp.hidden) continue;
      const startYear = parseInt(exp.start_date.slice(0, 4), 10);
      let endYear = new Date().getFullYear();
      if (exp.end_date && exp.end_date !== 'Presente' && exp.end_date !== 'Present') {
        const parsed = parseInt(exp.end_date.slice(0, 4), 10);
        if (!isNaN(parsed)) endYear = parsed;
      }
      if (!isNaN(startYear) && endYear >= startYear) {
        totalMonths += (endYear - startYear) * 12 + 6;
      }
    }
    candidateYears = Math.max(1, Math.round(totalMonths / 12));
  } else if (cvText) {
    // Estimación por mención de años en el CV
    const cvYearsMatch = cvText.match(/\b(\d+)\+?\s*(?:a[ñn]os|years)\s+de\s+experiencia/i);
    if (cvYearsMatch) {
      candidateYears = parseInt(cvYearsMatch[1], 10);
    }
  }

  // 3. Evaluar cumplimiento
  let meets = true;
  let score = 100;

  if (requiredYears !== undefined) {
    if (candidateYears >= requiredYears) {
      meets = true;
      score = 100;
    } else if (candidateYears >= requiredYears - 1) {
      meets = true;
      score = 80;
    } else {
      meets = false;
      score = Math.max(20, Math.round((candidateYears / requiredYears) * 100));
    }
  }

  return { requiredYears, candidateYears, meets, score };
}

/**
 * Genera el corpus de texto del CV para búsqueda semántica
 */
function buildCVCorpus(resumeData?: ResumeData, rawCvText?: string): string {
  if (rawCvText) return rawCvText.toLowerCase();
  if (!resumeData) return '';

  return [
    resumeData.name,
    resumeData.headline,
    resumeData.summary,
    ...(resumeData.skills || []).flatMap((s) => [s.category, ...s.skills]),
    ...(resumeData.experience || []).flatMap((e) => [
      e.position,
      e.company,
      e.summary || '',
      ...(e.highlights || []),
    ]),
    ...(resumeData.projects || []).flatMap((p) => [
      p.name,
      p.description || '',
      ...(p.technologies || []),
      ...(p.highlights || []),
    ]),
    ...(resumeData.education || []).flatMap((ed) => [ed.degree, ed.institution, ed.area || '']),
    ...(resumeData.certifications || []).flatMap((c) => [c.name, c.issuer]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Analiza el match semántico y técnico de la oferta contra el CV
 */
export function analyzeJobMatch(input: {
  jobDescription: string;
  resumeData?: ResumeData;
  rawCvText?: string;
}): {
  requirements: EvaluatedRequirement[];
  categoryBreakdown: CategoryScoreBreakdown;
  missingKeywords: MissingKeywordItem[];
  matchScore: number;
} {
  const { jobDescription, resumeData, rawCvText } = input;
  const cvCorpus = buildCVCorpus(resumeData, rawCvText);
  const jobTextLower = jobDescription.toLowerCase();
  const paragraphs = jobDescription.split(/\n+/);

  const requirements: EvaluatedRequirement[] = [];
  const missingKeywords: MissingKeywordItem[] = [];

  // Categorías
  const hardSkillsList: EvaluatedRequirement[] = [];
  const toolsList: EvaluatedRequirement[] = [];
  const softSkillsList: EvaluatedRequirement[] = [];
  const certsList: EvaluatedRequirement[] = [];

  // 1. Escaneo contra Taxonomía de Habilidades
  for (const skill of COMMON_SKILLS_TAXONOMY) {
    const skillNameLower = skill.name.toLowerCase();
    
    // Comprobar si la oferta menciona esta habilidad (nombre o alias)
    let foundInJob = false;
    let freq = 0;

    const regex = new RegExp(`\\b${skillNameLower.replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = jobTextLower.match(regex);
    if (matches) {
      foundInJob = true;
      freq = matches.length;
    }

    if (!foundInJob && skill.aliases) {
      for (const alias of skill.aliases) {
        const aliasRegex = new RegExp(`\\b${alias.toLowerCase().replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const aliasMatches = jobTextLower.match(aliasRegex);
        if (aliasMatches) {
          foundInJob = true;
          freq += aliasMatches.length;
        }
      }
    }

    if (!foundInJob) continue;

    // Determinar si en la oferta está marcada como Must Have o Nice to Have
    let importance: RequirementImportance = 'must_have';
    for (const p of paragraphs) {
      if (p.toLowerCase().includes(skillNameLower)) {
        if (NICE_TO_HAVE_PATTERNS.some((pattern) => pattern.test(p))) {
          importance = 'nice_to_have';
          break;
        }
        if (MUST_HAVE_PATTERNS.some((pattern) => pattern.test(p))) {
          importance = 'must_have';
          break;
        }
      }
    }

    // Comprobar si el CV tiene la habilidad
    const cvHasSkill = cvCorpus.includes(skillNameLower) ||
      (skill.aliases && skill.aliases.some((a) => cvCorpus.includes(a.toLowerCase())));

    const reqItem: EvaluatedRequirement = {
      id: `req-${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
      text: skill.name,
      category: mapCategoryToRequirementType(skill.category),
      importance,
      matched: Boolean(cvHasSkill),
      matchedTextInCV: cvHasSkill ? skill.name : undefined,
    };

    requirements.push(reqItem);

    if (reqItem.category === 'hard_skill') hardSkillsList.push(reqItem);
    else if (reqItem.category === 'tool_platform') toolsList.push(reqItem);
    else if (reqItem.category === 'soft_skill') softSkillsList.push(reqItem);
    else if (reqItem.category === 'certification') certsList.push(reqItem);

    if (!cvHasSkill) {
      const isHard = reqItem.category === 'hard_skill';
      const isMust = importance === 'must_have';
      const estimatedGain = isHard && isMust ? 8 : isHard || isMust ? 5 : 2;

      missingKeywords.push({
        text: skill.name,
        category: skill.category,
        importance,
        frequency: freq,
        estimatedScoreGain: estimatedGain,
      });
    }
  }

  // 2. Ordenar keywords faltantes por ganancia potencial e importancia
  missingKeywords.sort((a, b) => b.estimatedScoreGain - a.estimatedScoreGain || b.frequency - a.frequency);

  // 3. Desglose de scores por categoría
  function computeGroupScore(items: EvaluatedRequirement[], weightMultiplier = 1) {
    if (items.length === 0) return { score: 100, total: 0, matched: 0 };
    const matched = items.filter((i) => i.matched).length;
    const score = Math.round((matched / items.length) * 100);
    return { score, total: items.length, matched };
  }

  const hardSkillsGroup = computeGroupScore(hardSkillsList, 2);
  const toolsGroup = computeGroupScore(toolsList, 1);
  const softSkillsGroup = computeGroupScore(softSkillsList, 1);
  const certsGroup = computeGroupScore(certsList, 1);
  const expYears = analyzeExperienceYears(jobDescription, resumeData, rawCvText);

  const categoryBreakdown: CategoryScoreBreakdown = {
    hardSkills: hardSkillsGroup,
    toolsPlatforms: toolsGroup,
    softSkills: softSkillsGroup,
    certifications: certsGroup,
    experienceYears: {
      score: expYears.score,
      requiredYears: expYears.requiredYears,
      candidateYears: expYears.candidateYears,
      meets: expYears.meets,
    },
  };

  // 4. Score Global de Match Ponderado (Hard skills x2)
  let weightedPoints = 0;
  let totalWeights = 0;

  if (hardSkillsGroup.total > 0) {
    weightedPoints += hardSkillsGroup.score * 2.5;
    totalWeights += 2.5;
  }
  if (toolsGroup.total > 0) {
    weightedPoints += toolsGroup.score * 1.5;
    totalWeights += 1.5;
  }
  if (softSkillsGroup.total > 0) {
    weightedPoints += softSkillsGroup.score * 1.0;
    totalWeights += 1.0;
  }
  if (expYears.requiredYears !== undefined) {
    weightedPoints += expYears.score * 1.0;
    totalWeights += 1.0;
  }

  const matchScore = totalWeights > 0 ? Math.round(weightedPoints / totalWeights) : 75;

  return {
    requirements,
    categoryBreakdown,
    missingKeywords,
    matchScore: Math.max(0, Math.min(100, matchScore)),
  };
}

/**
 * Función pura para simular el nuevo score si se incorporan ciertas keywords seleccionadas
 */
export function calculateProjectedScore(
  currentScore: number,
  selectedKeywords: string[],
  missingKeywords: MissingKeywordItem[]
): number {
  if (selectedKeywords.length === 0) return currentScore;

  const totalGain = selectedKeywords.reduce((acc, kwText) => {
    const item = missingKeywords.find((k) => k.text.toLowerCase() === kwText.toLowerCase());
    return acc + (item ? item.estimatedScoreGain : 3);
  }, 0);

  return Math.min(100, currentScore + totalGain);
}
