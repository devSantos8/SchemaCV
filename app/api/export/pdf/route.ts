import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
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

    let componentHtml = "";
    if (resumeData) {
      componentHtml = generateTemplateHtml(
        resumeData as ResumeData,
        templateId as TemplateId,
        paperSize as PaperSize
      );
    } else if (html && typeof html === "string" && html.trim().length > 20) {
      componentHtml = html;
    }

    if (!componentHtml) {
      return NextResponse.json(
        { error: "Se requiere 'resumeData' o 'html' para compilar el PDF." },
        { status: 400 }
      );
    }

    browser = await puppeteer.launch({
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
    <script src="https://cdn.tailwindcss.com"></script>
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
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      ul.list-disc, .list-disc, ul {
        list-style-type: disc !important;
      }
      li {
        display: list-item !important;
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
      ${componentHtml}
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

    return new Response(pdfBuffer as unknown as BodyInit, {
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
      { error: "Error interno al generar el PDF vectorial." },
      { status: 500 }
    );
  }
}
