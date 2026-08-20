import { NextRequest, NextResponse } from "next/server";
import { suggestImprovementsAI, AIProviderError } from "@/lib/ai/providers";
import type { AIProvider, Keyword } from "@/types/jobs";
import type { ResumeData } from "@/types/resume";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-AI-Key") ?? "";
  const provider = (req.headers.get("X-AI-Provider") ?? "openai") as AIProvider;

  if (!apiKey) {
    return NextResponse.json({ error: "API key requerida." }, { status: 400 });
  }

  const { missingKeywords, resumeData, jobDescription } = (await req.json()) as {
    missingKeywords: Keyword[];
    resumeData: ResumeData;
    jobDescription?: string;
  };

  try {
    const suggestions = await suggestImprovementsAI(
      missingKeywords,
      resumeData,
      provider,
      apiKey,
      jobDescription
    );
    return NextResponse.json({ suggestions });
  } catch (err) {
    const message = err instanceof AIProviderError ? err.message : "Error de IA.";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
