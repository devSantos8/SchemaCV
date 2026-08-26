/**
 * Script generador de PDFs de ejemplo para SchemaCV
 * Genera un PDF de muestra por cada plantilla ATS del sistema usando Puppeteer.
 *
 * Ejecución: npx tsx scripts/generate-example-pdfs.ts
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { generateTemplateHtml } from "@/lib/exporters/htmlTemplateExporter";
import { TemplateId, ResumeData } from "@/types/resume";

const SAMPLE_DATA_PATH = path.resolve(process.cwd(), "examples/sample_junior_dev.json");
const OUTPUT_DIR = path.resolve(process.cwd(), "examples/pdf");

const ALL_TEMPLATES: { id: TemplateId; filename: string; title: string }[] = [
  { id: "harvard", filename: "01_classic_dense_harvard.pdf", title: "Classic Dense (Harvard)" },
  { id: "tech_minimalist", filename: "02_engineering_clean_tech.pdf", title: "Engineering Clean (Tech Minimalist)" },
  { id: "modern_executive", filename: "03_modern_executive.pdf", title: "Modern Executive" },
  { id: "skills_first", filename: "04_skills_first_builder.pdf", title: "Skills-First Builder" },
  { id: "stanford_clean", filename: "05_stanford_clean.pdf", title: "Stanford Clean" },
  { id: "compact_swiss", filename: "06_compact_swiss_grid.pdf", title: "Compact Swiss Grid" },
  { id: "executive_serif", filename: "07_executive_serif.pdf", title: "Executive Serif" },
  { id: "tech_compact", filename: "08_tech_compact.pdf", title: "Tech Compact" },
  { id: "modern_minimal", filename: "09_modern_minimal.pdf", title: "Modern Minimal" },
  { id: "career_changer", filename: "10_career_changer.pdf", title: "Career Changer" },
  { id: "academic_international", filename: "11_academic_international.pdf", title: "Academic International" },
];

async function generateAllPdfs() {
  console.log("\n=======================================================");
  console.log(" 📄 GENERADOR DE PDFs DE EJEMPLO — SCHEMACV");
  console.log("=======================================================\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const rawData = fs.readFileSync(SAMPLE_DATA_PATH, "utf-8");
  const sampleData: ResumeData = JSON.parse(rawData);

  console.log(`Cargado perfil de muestra: ${sampleData.name} (${sampleData.headline})`);
  console.log(`Directorio de salida: ${OUTPUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
    ],
  });

  const page = await browser.newPage();

  for (const t of ALL_TEMPLATES) {
    const documentHtml = generateTemplateHtml(sampleData, t.id, "letter");

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @page {
        size: letter portrait;
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
        color: #09090b;
        -webkit-font-smoothing: antialiased;
      }
    </style>
  </head>
  <body>
    ${documentHtml}
  </body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    const outputPath = path.join(OUTPUT_DIR, t.filename);
    await page.pdf({
      path: outputPath,
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.4in",
        bottom: "0.4in",
        left: "0.45in",
        right: "0.45in",
      },
    });

    console.log(`✅ [Generado] ${t.title} -> examples/pdf/${t.filename}`);
  }

  await browser.close();
  console.log("\n🎉 Se generaron con éxito los 11 PDFs de ejemplo ATS en examples/pdf/\n");
}

generateAllPdfs().catch((err) => {
  console.error("Error generando PDFs de ejemplo:", err);
  process.exit(1);
});
