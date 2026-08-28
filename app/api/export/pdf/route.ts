import { NextRequest, NextResponse } from "next/server";
import { generateChromiumResumePdf } from "@/lib/exporters/chromium/pdfExporter";
import type { ResumeData, TemplateId, PaperSize } from "@/types/resume";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumeData,
      title,
      templateId = "chile_profesional",
      paperSize = "letter",
    } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Se requiere 'resumeData' para compilar el PDF vectorial." },
        { status: 400 }
      );
    }

    const candidateClean = (resumeData?.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .trim();

    const pdfDocumentTitle =
      title || (candidateClean ? `CV_${candidateClean}` : "Curriculum_Vitae");

    const pdfBuffer = await generateChromiumResumePdf({
      data: resumeData as ResumeData,
      templateId: templateId as TemplateId,
      paperSize: paperSize as PaperSize,
      title: pdfDocumentTitle,
    });

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfDocumentTitle}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
        "X-Engine": "SchemaCV-Chromium-Vector-ATS-PDF",
      },
    });
  } catch (error) {
    console.error("Error al compilar PDF vectorial en el servidor:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al generar el PDF vectorial.",
      },
      { status: 500 }
    );
  }
}
