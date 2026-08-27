import { NextRequest, NextResponse } from "next/server";
import { generateNativeResumePdf } from "@/lib/exporters/reactPdf/renderPdf";
import { generateTemplateHtml } from "@/lib/exporters/htmlTemplateExporter";
import type { ResumeData, TemplateId, PaperSize } from "@/types/resume";

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const {
      html,
      resumeData,
      title,
      templateId = "chile_profesional",
      paperSize = "letter",
    } = body;

    const candidateClean = (resumeData?.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .trim();

    const pdfDocumentTitle =
      title || (candidateClean ? `CV_${candidateClean}` : "Curriculum_Vitae");

    // 1. MOTOR PRIMARIO: Generación Nativa con @react-pdf/renderer (Vectorial, 100% ATS, <100ms)
    if (resumeData) {
      const pdfBuffer = await generateNativeResumePdf({
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
          "X-PDF-Engine": "React-PDF-Native-ATS",
        },
      });
    }

    // 2. FALLBACK LEGACY: Puppeteer para strings HTML personalizados
    let documentHtml = html;
    if (!documentHtml || typeof documentHtml !== "string" || documentHtml.trim().length < 20) {
      return NextResponse.json(
        { error: "Se requiere 'resumeData' o 'html' para compilar el PDF." },
        { status: 400 }
      );
    }

    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();
    const isA4 = paperSize === "a4";

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pdfDocumentTitle}</title>
    <style>
      @page {
        size: ${isA4 ? "A4 portrait" : "letter portrait"};
        margin: 0;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: white !important;
        color: #09090b !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      ul.list-disc, .list-disc, .entry-bullets, ul {
        list-style-type: disc !important;
      }
      li {
        display: list-item !important;
      }
      .list-inside {
        list-style-position: inside !important;
      }
      .list-outside {
        list-style-position: outside !important;
      }
      .page-break-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div id="print-root" style="width: 100%; margin: 0; padding: 0;">
      ${documentHtml}
    </div>
  </body>
</html>`;

    await page.setContent(fullHtml, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const pdfBuffer = await page.pdf({
      format: isA4 ? "A4" : "Letter",
      printBackground: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    return new Response(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfDocumentTitle}.pdf"`,
      },
    });
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error("Error al compilar PDF vectorial en el servidor:", error);
    return NextResponse.json(
      { error: "Error interno al generar el PDF vectorial con Puppeteer." },
      { status: 500 }
    );
  }
}
