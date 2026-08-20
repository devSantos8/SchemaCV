import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { generateTemplateHtml } from "@/lib/exporters/htmlTemplateExporter";

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const body = await req.json();
    const {
      html,
      resumeData,
      title,
      templateId = "tech_minimalist",
      paperSize = "letter",
    } = body;

    let documentHtml = html;

    // Si se envían los datos del CV y la plantilla en vez del HTML crudo, lo compilamos con el exportador puro
    if (!documentHtml && resumeData) {
      documentHtml = generateTemplateHtml(resumeData, templateId, paperSize);
    }

    if (!documentHtml) {
      return NextResponse.json(
        { error: "Se requiere 'html' o 'resumeData' para compilar el PDF." },
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

    const candidateClean = (resumeData?.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .trim();

    const pdfDocumentTitle =
      title || (candidateClean ? `CV_${candidateClean}` : "Curriculum_Vitae");

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pdfDocumentTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
      }
      .page-break-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
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
      timeout: 30000,
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

    return new NextResponse(pdfBuffer as any, {
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
