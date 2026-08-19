import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const { html, paperSize = "letter" } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "El contenido HTML es requerido." }, { status: 400 });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    // Establecer contenido con estilos Tailwind y fuentes
    await page.setContent(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: ${paperSize === "a4" ? "A4" : "letter"};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page-break-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div id="print-root">
            ${html}
          </div>
        </body>
      </html>`,
      { waitUntil: "domcontentloaded", timeout: 30000 }
    );

    const pdfBuffer = await page.pdf({
      format: paperSize === "a4" ? "A4" : "Letter",
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
        "Content-Disposition": `attachment; filename="SchemaCV_Export_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    if (browser) {
      await browser.close();
    }
    console.error("Error generando PDF con Puppeteer:", error);
    return NextResponse.json(
      { error: error.message || "Error al compilar el PDF con Puppeteer." },
      { status: 500 }
    );
  }
}
