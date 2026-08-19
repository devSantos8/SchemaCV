import { NextRequest, NextResponse } from "next/server";
import { extractKeywordsAI, AIProviderError } from "@/lib/ai/providers";
import { extractKeywordsLocal } from "@/lib/ai/localAnalyzer";
import type { AIProvider, Keyword } from "@/types/jobs";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-AI-Key") ?? "";
  const provider = (req.headers.get("X-AI-Provider") ?? "openai") as AIProvider;
  const { description } = await req.json() as { description: string };

  if (!description) {
    return NextResponse.json({ error: "description requerida." }, { status: 400 });
  }

  // Siempre extraemos keywords locales como base
  const localKeywords = extractKeywordsLocal(description);

  if (!apiKey) {
    return NextResponse.json({ keywords: localKeywords, source: "local" });
  }

  try {
    const aiRaw = await extractKeywordsAI(description, provider, apiKey);

    // Merge: keywords de IA con source "ai", locales no duplicadas como "local"
    const aiTexts = new Set(aiRaw.map((k) => k.text.toLowerCase()));
    const merged: Keyword[] = [
      ...aiRaw.map((k) => ({ ...k, matched: false, source: "ai" as const })),
      ...localKeywords.filter((k) => !aiTexts.has(k.text.toLowerCase())).map((k) => ({
        ...k,
        source: "local" as const,
      })),
    ].slice(0, 35);

    return NextResponse.json({ keywords: merged, source: "ai" });
  } catch (err) {
    const message = err instanceof AIProviderError ? err.message : "Error de IA.";
    // Fallback a analisis local
    return NextResponse.json({ keywords: localKeywords, source: "local", warning: message });
  }
}
