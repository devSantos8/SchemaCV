import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import type { AIProvider, Keyword, MatchAnalysis } from "@/types/jobs";
import type { ResumeData } from "@/types/resume";
import { KEYWORDS_PROMPT, EXPLAIN_MATCH_PROMPT, SUGGEST_PROMPT } from "./prompts";

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
  if (
    msg.includes("401") ||
    msg.includes("invalid_api_key") ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("API_KEY_NOT_FOUND") ||
    msg.includes("Unauthorized")
  ) {
    return new AIProviderError("API key invalida o sin permisos.", "invalid_key");
  }
  if (
    msg.includes("429") ||
    msg.includes("rate_limit") ||
    msg.includes("Rate limit") ||
    msg.includes("RESOURCE_EXHAUSTED")
  ) {
    return new AIProviderError("Rate limit alcanzado. Espera un momento.", "rate_limit");
  }
  if (msg.includes("insufficient_quota") || msg.includes("402") || msg.includes("no credits")) {
    return new AIProviderError("Sin creditos disponibles en tu cuenta.", "no_credits");
  }
  return new AIProviderError(`Error desconocido: ${msg}`, "unknown");
}

// ─── Schema de keywords ───────────────────────────────────────────────────────
const KeywordsOutputSchema = z.object({
  keywords: z.array(
    z.object({
      text: z.string(),
      frequency: z.number().int().min(1),
    })
  ).max(30),
});

// ─── Factory de modelos ───────────────────────────────────────────────────────
function getModel(provider: AIProvider, apiKey: string) {
  switch (provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google("gemini-2.0-flash");
    }
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai("gpt-4o-mini");
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic("claude-3-5-haiku-20241022");
    }
  }
}

// ─── Funciones publicas ───────────────────────────────────────────────────────

/**
 * Extrae keywords usando IA con structured output.
 */
export async function extractKeywordsAI(
  description: string,
  provider: AIProvider,
  apiKey: string
): Promise<Pick<Keyword, "text" | "frequency">[]> {
  try {
    const model = getModel(provider, apiKey);
    const { object } = await generateObject({
      model,
      system: KEYWORDS_PROMPT,
      prompt: `Descripcion de la oferta:\n\n${description.slice(0, 6000)}`,
      schema: KeywordsOutputSchema,
    });
    return object.keywords;
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
  apiKey: string
): Promise<string> {
  try {
    const model = getModel(provider, apiKey);
    const context = `
Score de match: ${matchAnalysis.score}/100
Keywords encontradas (${matchAnalysis.matched.length}): ${matchAnalysis.matched.map((k) => k.text).join(", ")}
Keywords faltantes (${matchAnalysis.missing.length}): ${matchAnalysis.missing.map((k) => k.text).join(", ")}
Resumen del CV: ${resumeData.summary ?? "No disponible"}
Descripcion del puesto: ${jobDescription.slice(0, 2000)}`;

    const { text } = await generateText({
      model,
      system: EXPLAIN_MATCH_PROMPT,
      prompt: context,
      maxOutputTokens: 400,
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
  apiKey: string
): Promise<string[]> {
  try {
    const model = getModel(provider, apiKey);
    const experienceSummary = (resumeData.experience ?? [])
      .map((e) => `${e.position} en ${e.company}: ${(e.highlights ?? []).join(" | ")}`)
      .join("\n");

    const prompt = `
Keywords faltantes: ${missingKeywords.map((k) => k.text).join(", ")}

Experiencia real del candidato:
${experienceSummary}

Proyectos:
${(resumeData.projects ?? []).map((p) => `${p.name}: ${(p.technologies ?? []).join(", ")} - ${p.description ?? ""}`).join("\n")}`;

    const { text } = await generateText({
      model,
      system: SUGGEST_PROMPT,
      prompt,
      maxOutputTokens: 600,
    });

    // Parsear sugerencias como lista
    return text
      .split("\n")
      .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((line) => line.length > 10)
      .slice(0, 5);
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
  const model = getModel(provider, apiKey);
  const { text } = await generateText({
    model,
    prompt: "Responde solo: OK",
    maxOutputTokens: 5,
  });
  const modelMap: Record<AIProvider, string> = {
    google: "gemini-2.0-flash",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku",
  };
  return { ok: text.trim().length > 0, model: modelMap[provider] };
}
