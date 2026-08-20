import { z } from 'zod';
import type { ResumeData } from '@/types/resume';

// ─── Estado y Severidad de Reglas ATS ───────────────────────────────────────
export type ATSRuleStatus = 'pass' | 'fail' | 'warning';
export type ATSSeverity = 'critical' | 'warning' | 'info';

export interface ATSAuditRule {
  id: string;
  name: string;
  category: 'layout' | 'typography' | 'headings' | 'dates' | 'bullets' | 'contact' | 'content' | 'encoding';
  status: ATSRuleStatus;
  severity: ATSSeverity;
  scoreWeight: number; // Puntos ponderados
  scoreEarned: number;
  message: string;
  detail?: string;
  fixGuide: {
    whyItMatters: string;
    howToFix: string;
    example?: string;
  };
}

// ─── Simulación de Parseo ATS ───────────────────────────────────────────────
export interface ATSDetectedSection {
  canonicalName: string;
  detectedHeader: string;
  orderIndex: number;
  isStandard: boolean;
  itemCount: number;
  snippet: string;
}

export interface ATSParsedSimulation {
  rawExtractedText: string;
  characterCount: number;
  wordCount: number;
  detectedContact: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    links: string[];
    isInBody: boolean; // false si solo apareció en header/footer
  };
  detectedSections: ATSDetectedSection[];
  readingOrderIssues: string[];
  encodingIssues: {
    hasMojibake: boolean;
    corruptedCharacters: string[];
  };
  ocrConfidence: number; // 0-100% de confianza de texto seleccionable
}

// ─── Análisis de Match contra la Oferta ─────────────────────────────────────
export type RequirementImportance = 'must_have' | 'nice_to_have';

export interface EvaluatedRequirement {
  id: string;
  text: string;
  category: 'hard_skill' | 'tool_platform' | 'soft_skill' | 'certification' | 'experience_years';
  importance: RequirementImportance;
  matched: boolean;
  matchedTextInCV?: string;
}

export interface CategoryScoreBreakdown {
  hardSkills: { score: number; total: number; matched: number };
  toolsPlatforms: { score: number; total: number; matched: number };
  softSkills: { score: number; total: number; matched: number };
  certifications: { score: number; total: number; matched: number };
  experienceYears: { score: number; requiredYears?: number; candidateYears?: number; meets: boolean };
}

export interface MissingKeywordItem {
  text: string;
  category: string;
  importance: RequirementImportance;
  frequency: number;
  estimatedScoreGain: number; // Cuánto puntaje sumaría incorporarla (0-10)
}

// ─── Reporte Completo de Evaluación ─────────────────────────────────────────
export interface EvaluationReport {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  cvSourceType: 'schema_profile' | 'uploaded_pdf';
  profileName?: string;
  createdAt: string;

  // Los dos scores centrales (0-100)
  atsScore: number;       // Compatibilidad de formato ATS (B1 + B2)
  matchScore: number;     // Match semántico con la oferta (B3)

  // Baterías detalladas
  simulation: ATSParsedSimulation;
  auditRules: ATSAuditRule[];
  requirements: EvaluatedRequirement[];
  categoryBreakdown: CategoryScoreBreakdown;
  missingKeywords: MissingKeywordItem[];
  criticalPoints: {
    id: string;
    type: 'format_blocker' | 'missing_must_have' | 'experience_gap';
    title: string;
    description: string;
    actionPrompt: string;
  }[];

  // Resumen inteligente (Local o IA)
  summaryText?: string;
  aiEnhanced?: boolean;
}
