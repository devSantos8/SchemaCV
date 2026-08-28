import { generateTemplateHtml } from "@/lib/exporters/htmlTemplateExporter";
import type { ResumeData, TemplateId, PaperSize } from "@/types/resume";

export interface GeneratePdfOptions {
  data: ResumeData;
  templateId: TemplateId;
  paperSize?: PaperSize;
  title?: string;
}

/**
 * Compila el currículum a un Buffer PDF vectorial de alta precisión utilizando Headless Chromium.
 * 100% Paridad visual con el editor web y 100% compatible con motores de lectura ATS.
 */
export async function generateChromiumResumePdf(options: GeneratePdfOptions): Promise<Buffer> {
  const { data, templateId, paperSize = "letter", title = "Curriculum Vitae" } = options;
  const isA4 = paperSize === "a4";
  const pageWidth = isA4 ? "210mm" : "8.5in";
  const pageHeight = isA4 ? "297mm" : "11in";

  const rawResumeHtml = generateTemplateHtml(data, templateId, paperSize);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <!-- Google Fonts para soporte tipográfico completo -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
    
    <style>
      @page {
        size: ${isA4 ? "210mm 297mm" : "8.5in 11in"};
        margin: 0;
      }
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box;
      }
      html, body {
        margin: 0;
        padding: 0;
        width: ${pageWidth};
        background-color: #ffffff;
        color: #09090b;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      .page-break-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    </style>
  </head>
  <body>
    ${rawResumeHtml}
  </body>
</html>`;

  // Intentar primero con Puppeteer
  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: isA4 ? 794 : 816,
        height: isA4 ? 1123 : 1056,
        deviceScaleFactor: 2,
      });

      await page.setContent(fullHtml, {
        waitUntil: "domcontentloaded",
      });

      await page.evaluateHandle("document.fonts.ready");

      const pdfUint8Array = await page.pdf({
        format: isA4 ? "A4" : "Letter",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await browser.close();
      return Buffer.from(pdfUint8Array);
    } catch (pageErr) {
      await browser.close();
      throw pageErr;
    }
  } catch (puppeteerErr) {
    console.warn("Puppeteer no disponible o falló, usando Playwright...", puppeteerErr);
    
    // Fallback a Playwright
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const page = await browser.newPage({
        viewport: {
          width: isA4 ? 794 : 816,
          height: isA4 ? 1123 : 1056,
        },
      });

      await page.setContent(fullHtml, {
        waitUntil: "networkidle",
      });

      await page.evaluateHandle("document.fonts.ready");

      const pdfBuffer = await page.pdf({
        format: isA4 ? "A4" : "Letter",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (playwrightErr) {
      await browser.close();
      throw playwrightErr;
    }
  }
}
