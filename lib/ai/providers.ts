import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import type { AIProvider, Keyword, MatchAnalysis } from "@/types/jobs";
import type { ResumeData } from "@/types/resume";
import {
  buildExtractKeywordsPrompt,
  buildExplainMatchPrompt,
  buildSuggestImprovementsPrompt,
  buildBulletRewriterPrompt,
  buildCoverLetterPrompt,
  buildATSAuditNarrativePrompt,
  KeywordExtractionResultSchema,
  ImprovementSuggestionsResultSchema,
  BulletRewriterResultSchema,
  RECOMMENDED_PARAMS,
  type BulletRewriterResult,
} from "./prompts";

// ─── Errores tipados ──────────────────────────────────────────────────────────
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_key" | "rate_limit" | "no_credits" | "unknown"
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

function mapError(err: unknown): AIProviderError {
  const msg = err instanceof Error ? err.message : String(err);
  const errObj = err as Record<string, unknown> | null | undefined;
  const fullDetails = JSON.stringify(errObj?.data || errObj?.responseBody || "") + " " + msg;

  if (
    fullDetails.includes("401") ||
    fullDetails.includes("invalid_api_key") ||
    fullDetails.includes("API_KEY_INVALID") ||
    fullDetails.includes("API_KEY_NOT_FOUND") ||
    fullDetails.includes("API key not valid") ||
    fullDetails.includes("Unauthorized") ||
    fullDetails.includes("API_KEY_SERVICE_BLOCKED")
  ) {
    return new AIProviderError("API key invalida o sin permisos.", "invalid_key");
  }
  if (
    fullDetails.includes("429") ||
    fullDetails.includes("rate_limit") ||
    fullDetails.includes("Rate limit") ||
    fullDetails.includes("RESOURCE_EXHAUSTED") ||
    fullDetails.includes("Quota exceeded")
  ) {
    return new AIProviderError("Limite de cuota o rate limit alcanzado. Espera un momento.", "rate_limit");
  }
  if (fullDetails.includes("insufficient_quota") || fullDetails.includes("402") || fullDetails.includes("no credits")) {
    return new AIProviderError("Sin creditos disponibles en tu cuenta.", "no_credits");
  }
  if (fullDetails.includes("User location is not supported") || fullDetails.includes("location is not supported")) {
    return new AIProviderError("La API no esta disponible en tu region actual.", "unknown");
  }
  return new AIProviderError(`Error de conexion: ${msg.slice(0, 120)}`, "unknown");
}

// ─── Factory de modelos ───────────────────────────────────────────────────────
function getModel(provider: AIProvider, apiKey: string) {
  const cleanKey = (apiKey || "").trim();
  switch (provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey: cleanKey });
      return google("gemini-3.6-flash");
    }
    case "openai": {
      const openai = createOpenAI({ apiKey: cleanKey });
      return openai("gpt-4o-mini");
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: cleanKey });
      return anthropic("claude-3-5-haiku-20241022");
    }
  }
}

// ─── Funciones publicas ───────────────────────────────────────────────────────

/**
 * Extrae keywords usando IA con structured output y validación tipada.
 */
export async function extractKeywordsAI(
  description: string,
  provider: AIProvider,
  apiKey: string,
  jobTitle?: string,
  company?: string
): Promise<Pick<Keyword, "text" | "frequency">[]> {
  try {
    const model = getModel(provider, apiKey);
    const { system, user } = buildExtractKeywordsPrompt({ description, jobTitle, company });
    const { object } = await generateObject({
      model,
      system,
      prompt: user,
      schema: KeywordExtractionResultSchema,
    });
    return object.keywords.map((k) => ({
      text: k.term,
      frequency: k.frequency,
    }));
  } catch (err) {
    throw mapError(err);
  }
}

/**
 * Genera una explicacion en lenguaje natural del puntaje de match.
 */
export async function explainMatchAI(
  matchAnalysis: Omit<MatchAnalysis, "suggestions" | "explanation">,
  jobDescription: string,
  resumeData: ResumeData,
  provider: AIProvider,
  apiKey: string,
  jobTitle: string = "Puesto Tecnológico",
  company?: string
): Promise<string> {
  try {
    const model = getModel(provider, apiKey);
    const { system, user } = buildExplainMatchPrompt({
      jobTitle,
      company,
      score: matchAnalysis.score,
      matchedKeywords: matchAnalysis.matched.map((k) => k.text),
      missingKeywords: matchAnalysis.missing.map((k) => k.text),
      resumeSummary: resumeData.summary ?? "No disponible",
      jobDescription,
    });

    const { text } = await generateText({
      model,
      system,
      prompt: user,
      maxOutputTokens: RECOMMENDED_PARAMS.explainMatch.maxTokens,
    });
    return text;
  } catch (err) {
    throw mapError(err);
  }
}

/**
 * Genera sugerencias de mejora usando SOLO la experiencia real del CV.
 */
export async function suggestImprovementsAI(
  missingKeywords: Keyword[],
  resumeData: ResumeData,
  provider: AIProvider,
  apiKey: string,
  jobDescription?: string
): Promise<string[]> {
  try {
    const model = getModel(provider, apiKey);
    const { system, user } = buildSuggestImprovementsPrompt({
      missingKeywords: missingKeywords.map((k) => k.text),
      resumeData,
      jobDescription,
    });

    const { object } = await generateObject({
      model,
      system,
      prompt: user,
      schema: ImprovementSuggestionsResultSchema,
    });

    return object.suggestions.map((s) => {
      if (s.backed && s.bulletExample) {
        return `[${s.section.toUpperCase()}] ${s.bulletExample} (${s.rationale})`;
      }
      if (!s.backed && s.acquisitionPath) {
        return `[BRECHA: ${s.keyword}] Recomendación: ${s.acquisitionPath}`;
      }
      return `${s.keyword}: ${s.rationale}`;
    });
  } catch (err) {
    throw mapError(err);
  }
}

/**
 * Reescritura de viñetas con structured output.
 */
export async function rewriteBulletAI(
  originalBullet: string,
  targetKeywords: string[],
  provider: AIProvider,
  apiKey: string
): Promise<BulletRewriterResult> {
  try {
    const model = getModel(provider, apiKey);
    const { system, user } = buildBulletRewriterPrompt({
      originalBullet,
      targetKeywords,
    });

    const { object } = await generateObject({
      model,
      system,
      prompt: user,
      schema: BulletRewriterResultSchema,
    });

    return object;
  } catch (err) {
    throw mapError(err);
  }
}

/**
 * Prueba la conexion con el proveedor de IA.
 */
export async function testAIConnection(
  provider: AIProvider,
  apiKey: string
): Promise<{ ok: boolean; model: string }> {
  const cleanKey = (apiKey || "").trim();

  if (provider === "google") {
    try {
      // 1. Validar clave y obtener modelos disponibles para esta cuenta
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
      const data = (await res.json()) as {
        error?: { message?: string; status?: string };
        models?: { name: string; supportedGenerationMethods?: string[] }[];
      };

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "API key no valida en Google AI Studio.");
      }

      const validModels = (data.models || [])
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));

      const preferenceOrder = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3-flash",
        "gemini-3.6",
        "gemini-3.5",
        "gemini-3.0-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-001",
        "gemini-2.5-flash-lite",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro",
      ];

      const candidateModels = [
        ...preferenceOrder.filter((m) => validModels.includes(m)),
        ...validModels,
      ];

      // Fallback si no hay lista
      if (candidateModels.length === 0) {
        candidateModels.push("gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash");
      }

      const google = createGoogleGenerativeAI({ apiKey: cleanKey });
      let lastGenError: unknown = null;

      for (const cand of candidateModels) {
        try {
          const { text } = await generateText({
            model: google(cand),
            prompt: "Responde: OK",
            maxOutputTokens: 5,
          });
          if (text.trim().length > 0) {
            return { ok: true, model: cand };
          }
        } catch (genErr) {
          lastGenError = genErr;
          const msg = String((genErr as Record<string, unknown>)?.message || genErr);
          const match = msg.match(/use models\/([\w.-]+)/i) || msg.match(/models\/(gemini-[\w.-]+)/i);
          if (match && match[1]) {
            const suggested = match[1];
            try {
              const { text } = await generateText({
                model: google(suggested),
                prompt: "Responde: OK",
                maxOutputTokens: 5,
              });
              if (text.trim().length > 0) {
                return { ok: true, model: suggested };
              }
            } catch (suggestErr) {
              lastGenError = suggestErr;
            }
          }
        }
      }

      if (lastGenError) {
        throw lastGenError;
      }

      return { ok: true, model: candidateModels[0] };
    } catch (err) {
      throw mapError(err);
    }
  }

  try {
    const model = getModel(provider, cleanKey);
    const { text } = await generateText({
      model,
      prompt: "Responde: OK",
      maxOutputTokens: 5,
    });
    const modelMap: Record<AIProvider, string> = {
      google: "gemini-3.6-flash",
      openai: "gpt-4o-mini",
      anthropic: "claude-3-5-haiku",
    };
    return { ok: text.trim().length > 0, model: modelMap[provider] };
  } catch (err) {
    throw mapError(err);
  }
}
