import { z } from 'zod';

// Estado de la postulacion
export const ApplicationStatusSchema = z.enum([
  'bookmarked',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'closed',
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  bookmarked: 'Guardada',
  applied: 'Postulada',
  interviewing: 'Entrevistas',
  offer: 'Oferta',
  rejected: 'Rechazada',
  closed: 'Cerrada',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  interviewing: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
  closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500',
};

// Keyword extraida
export const KeywordSchema = z.object({
  text: z.string(),
  frequency: z.number().int().min(1).default(1),
  matched: z.boolean().default(false),
  source: z.enum(['local', 'ai']).default('local'),
});
export type Keyword = z.infer<typeof KeywordSchema>;

// Analisis de match
export const MatchAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  matched: z.array(KeywordSchema),
  missing: z.array(KeywordSchema),
  suggestions: z.array(z.string()).default([]),
  generatedBy: z.enum(['local', 'ai']).default('local'),
  generatedAt: z.string().datetime().optional(),
  explanation: z.string().optional(),
});
export type MatchAnalysis = z.infer<typeof MatchAnalysisSchema>;

// Verificacion de links
export const LinkCheckResultSchema = z.object({
  url: z.string().url(),
  status: z.number().nullable(),
  ok: z.boolean(),
  checkedAt: z.string().datetime(),
});
export type LinkCheckResult = z.infer<typeof LinkCheckResultSchema>;

// Scrape de oferta
export const ScrapeResultSchema = z.object({
  title: z.string(),
  company: z.string(),
  description: z.string(),
  publishedAt: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  portal: z.string().optional(),
});
export type ScrapeResult = z.infer<typeof ScrapeResultSchema>;

// Entrada de historial
export const ActivityEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['status_change', 'note', 'interview', 'offer', 'ai_analysis', 'link_check', 'ats_evaluation']),
  description: z.string(),
  createdAt: z.string().datetime(),
});
export type ActivityEntry = z.infer<typeof ActivityEntrySchema>;

// Postulacion completa
export const JobApplicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  url: z.string().url().optional(),
  status: ApplicationStatusSchema.default('bookmarked'),
  description: z.string().default(''),
  notes: z.string().default(''),
  location: z.string().optional(),
  salary: z.string().optional(),
  portal: z.string().optional(),
  keywords: z.array(KeywordSchema).default([]),
  matchAnalysis: MatchAnalysisSchema.optional(),
  linkCheck: LinkCheckResultSchema.optional(),
  activity: z.array(ActivityEntrySchema).default([]),
  evaluations: z.array(z.custom<import('./evaluator').EvaluationReport>()).default([]),
  lastEvaluationReport: z.custom<import('./evaluator').EvaluationReport>().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  appliedAt: z.string().datetime().optional(),
});
export type JobApplication = z.infer<typeof JobApplicationSchema>;

// Proveedor de IA
export const AIProviderSchema = z.enum(['openai', 'anthropic']);
export type AIProvider = z.infer<typeof AIProviderSchema>;

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI (GPT-4o)',
  anthropic: 'Anthropic (Claude)',
};

// Mensaje de chat
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string().datetime(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
