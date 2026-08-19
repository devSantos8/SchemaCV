import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { runATSEvaluationPipeline } from "@/lib/ats";
import type { ResumeData } from "@/types/resume";
import type { AIProvider } from "@/types/jobs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const apiKey = req.headers.get("X-AI-Key") || "";
    const aiProvider = (req.headers.get("X-AI-Provider") || "openai") as AIProvider;

    let jobId = "job-eval";
    let jobTitle = "Puesto Técnico";
    let company = "Empresa";
    let jobDescription = "";
    let resumeData: ResumeData | undefined;
    let rawCvText: string | undefined;
    let sourceType: "schema_profile" | "uploaded_pdf" = "schema_profile";
    let profileName: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // Manejar subida de archivo PDF
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      jobId = (formData.get("jobId") as string) || jobId;
      jobTitle = (formData.get("jobTitle") as string) || jobTitle;
      company = (formData.get("company") as string) || company;
      jobDescription = (formData.get("jobDescription") as string) || "";
      profileName = (formData.get("profileName") as string) || (file ? file.name : "PDF Subido");
      sourceType = "uploaded_pdf";

      if (file) {
        const buffer = await file.arrayBuffer();
        const { text } = await extractText(new Uint8Array(buffer));
        rawCvText = Array.isArray(text) ? text.join("\n") : String(text);
      }
    } else {
      // Manejar JSON
      const body = await req.json();
      jobId = body.jobId || jobId;
      jobTitle = body.jobTitle || jobTitle;
      company = body.company || company;
      jobDescription = body.jobDescription || "";
      resumeData = body.resumeData;
      rawCvText = body.rawCvText;
      sourceType = body.sourceType || (resumeData ? "schema_profile" : "uploaded_pdf");
      profileName = body.profileName;
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "La descripción de la oferta es obligatoria para realizar la evaluación." },
        { status: 400 }
      );
    }

    const aiConfig = apiKey
      ? {
          enabled: true,
          provider: aiProvider,
          apiKey,
        }
      : undefined;

    const report = await runATSEvaluationPipeline({
      jobId,
      jobTitle,
      company,
      jobDescription,
      resumeData,
      rawCvText,
      sourceType,
      profileName,
      aiConfig,
    });

    return NextResponse.json(report);
  } catch (err) {
    console.error("Error en /api/evaluate:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno durante la evaluación ATS." },
      { status: 500 }
    );
  }
}
