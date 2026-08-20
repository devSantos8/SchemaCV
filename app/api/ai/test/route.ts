import { NextRequest, NextResponse } from "next/server";
import { testAIConnection, AIProviderError } from "@/lib/ai/providers";
import type { AIProvider } from "@/types/jobs";

export async function POST(req: NextRequest) {
  const apiKey = (req.headers.get("X-AI-Key") ?? "").trim();
  const provider = (req.headers.get("X-AI-Provider") ?? "google") as AIProvider;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "API key no proporcionada." }, { status: 400 });
  }

  try {
    const result = await testAIConnection(provider, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de conexion.";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
