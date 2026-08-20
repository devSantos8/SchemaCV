import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { AIProvider } from "@/types/jobs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-AI-Key") ?? "";
  const provider = (req.headers.get("X-AI-Provider") ?? "openai") as AIProvider;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key requerida." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, jobTitle, company, jobDescription, resumeSummary } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
    jobTitle: string;
    company: string;
    jobDescription: string;
    resumeSummary: string;
  };

  const systemPrompt = `${CHAT_SYSTEM_PROMPT(jobTitle, company)}

Descripcion del puesto:
${jobDescription.slice(0, 3000)}

Resumen del candidato:
${resumeSummary}`;

  let model;
  if (provider === "google") {
    const google = createGoogleGenerativeAI({ apiKey: apiKey.trim() });
    model = google("gemini-3.6-flash");
  } else if (provider === "anthropic") {
    const anthropic = createAnthropic({ apiKey });
    model = anthropic("claude-3-5-haiku-20241022");
  } else {
    const openai = createOpenAI({ apiKey });
    model = openai("gpt-4o-mini");
  }

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      maxOutputTokens: 800,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error de IA." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
