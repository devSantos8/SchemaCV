import { NextRequest, NextResponse } from "next/server";
import { explainMatchAI, AIProviderError } from "@/lib/ai/providers";
import type { AIProvider, MatchAnalysis } from "@/types/jobs";
import type { ResumeData } from "@/types/resume";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-AI-Key") ?? "";
  const provider = (req.headers.get("X-AI-Provider") ?? "openai") as AIProvider;

  if (!apiKey) {
    return NextResponse.json({ error: "API key requerida." }, { status: 400 });
  }

  const { matchAnalysis, jobDescription, resumeData } = await req.json() as {
    matchAnalysis: Omit<MatchAnalysis, "suggestions" | "explanation">;
    jobDescription: string;
    resumeData: ResumeData;
  };

  try {
    const explanation = await explainMatchAI(matchAnalysis, jobDescription, resumeData, provider, apiKey);
    return NextResponse.json({ explanation });
  } catch (err) {
    const message = err instanceof AIProviderError ? err.message : "Error de IA.";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
