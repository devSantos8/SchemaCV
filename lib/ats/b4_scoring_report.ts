import type { ResumeData } from '@/types/resume';
import type { EvaluationReport } from '@/types/evaluator';
import { simulateATSParsing } from './b1_parse_simulation';
import { auditATSFormat } from './b2_format_audit';
import { analyzeJobMatch } from './b3_match_analyzer';
import { explainMatchAI } from '@/lib/ai/providers';
import type { AIProvider } from '@/types/jobs';

export interface EvaluatePipelineOptions {
  jobId: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeData?: ResumeData;
  rawCvText?: string;
  sourceType: 'schema_profile' | 'uploaded_pdf';
  profileName?: string;
  aiConfig?: {
    enabled: boolean;
    provider: AIProvider;
    apiKey: string;
  };
}

/**
 * Pipeline completo de evaluación ATS (B1 + B2 + B3 + B4)
 */
export async function runATSEvaluationPipeline(
  options: EvaluatePipelineOptions
): Promise<EvaluationReport> {
  const {
    jobId,
    jobTitle,
    company,
    jobDescription,
    resumeData,
    rawCvText,
    sourceType,
    profileName,
    aiConfig,
  } = options;

  // 1. Simulación de Parseo ATS (B1)
  const simulation = simulateATSParsing({
    resumeData,
    rawText: rawCvText,
    sourceType,
  });

  // 2. Auditoría de Formato ATS (B2)
  const { rules: auditRules, atsScore } = auditATSFormat({
    resumeData,
    simulation,
    sourceType,
  });

  // 3. Match contra la Oferta (B3)
  const { requirements, categoryBreakdown, missingKeywords, matchScore } = analyzeJobMatch({
    jobDescription,
    resumeData,
    rawCvText: rawCvText || simulation.rawExtractedText,
  });

  // 4. Extracción de Puntos Críticos Unificados
  const criticalPoints: EvaluationReport['criticalPoints'] = [];

  // 4.1 Fallas críticas de formato
  const criticalFormatFails = auditRules.filter((r) => r.status === 'fail' && r.severity === 'critical');
  for (const fail of criticalFormatFails) {
    criticalPoints.push({
      id: `crit-format-${fail.id}`,
      type: 'format_blocker',
      title: `Bloqueo ATS: ${fail.name}`,
      description: fail.message,
      actionPrompt: fail.fixGuide.howToFix,
    });
  }

  // 4.2 Requisitos Must-Have no cubiertos
  const missingMustHaves = requirements.filter((r) => !r.matched && r.importance === 'must_have');
  for (const must of missingMustHaves.slice(0, 4)) {
    criticalPoints.push({
      id: `crit-must-${must.id}`,
      type: 'missing_must_have',
      title: `Requisito Excluyente Faltante: ${must.text}`,
      description: `La oferta solicita "${must.text}" como requisito obligatorio o indispensable.`,
      actionPrompt: `Si posees experiencia con ${must.text}, inclúyela explícitamente en tus habilidades o viñetas de logros.`,
    });
  }

  // 4.3 Brecha de años de experiencia
  if (!categoryBreakdown.experienceYears.meets && categoryBreakdown.experienceYears.requiredYears) {
    criticalPoints.push({
      id: 'crit-exp-gap',
      type: 'experience_gap',
      title: `Años de Experiencia Requeridos (${categoryBreakdown.experienceYears.requiredYears}+ años)`,
      description: `La oferta solicita al menos ${categoryBreakdown.experienceYears.requiredYears} años de experiencia laboral. Se estimaron ${categoryBreakdown.experienceYears.candidateYears} años en el CV.`,
      actionPrompt: 'Destaca logros de alto impacto cuantitativo y responsabilidades de liderazgo para compensar la brecha de años.',
    });
  }

  // 5. Generación de Resumen (Local o Asistido por IA)
  let summaryText = '';
  let aiEnhanced = false;

  if (aiConfig?.enabled && aiConfig.apiKey && resumeData) {
    try {
      summaryText = await explainMatchAI(
        {
          score: matchScore,
          matched: requirements.filter((r) => r.matched).map((r) => ({ text: r.text, frequency: 1, matched: true, source: 'ai' })),
          missing: missingKeywords.map((k) => ({ text: k.text, frequency: k.frequency, matched: false, source: 'ai' })),
          generatedBy: 'ai',
        },
        jobDescription,
        resumeData,
        aiConfig.provider,
        aiConfig.apiKey
      );
      aiEnhanced = true;
    } catch {
      aiEnhanced = false;
    }
  }

  if (!summaryText) {
    // Resumen local estructurado
    const matchedCount = requirements.filter((r) => r.matched).length;
    const totalCount = requirements.length;
    summaryText = `Tu currículum alcanza un ${atsScore}% de compatibilidad de formato ATS y un ${matchScore}% de coincidencia con la oferta de ${jobTitle} en ${company}. Se identificaron ${matchedCount} de ${totalCount} competencias clave. ${
      criticalPoints.length > 0
        ? `Se detectaron ${criticalPoints.length} puntos de atención prioritarios a resolver antes de postular.`
        : 'Tu perfil cumple con los requisitos fundamentales y tiene alta probabilidad de superar los filtros iniciales.'
    }`;
  }

  return {
    id: `eval-${Date.now()}`,
    jobId,
    jobTitle,
    company,
    cvSourceType: sourceType,
    profileName,
    createdAt: new Date().toISOString(),
    atsScore,
    matchScore,
    simulation,
    auditRules,
    requirements,
    categoryBreakdown,
    missingKeywords,
    criticalPoints,
    summaryText,
    aiEnhanced,
  };
}
