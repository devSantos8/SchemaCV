/**
 * Suite de Validación Automatizada ATS para SchemaCV
 * Verifica el cumplimiento estricto de las Reglas ATS y extracción PDF real en todas las 12 plantillas,
 * probando tanto el exportador semántico HTML como el renderizado de componentes React.
 * 
 * Ejecución: npm run test:ats (o npx tsx scripts/validate-ats.ts)
 */

import puppeteer, { Browser } from "puppeteer";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { extractText } from "unpdf";
import { generateTemplateHtml } from "../lib/exporters/htmlTemplateExporter";
import { TemplateId, SECTION_LABELS, ResumeData, getVisibleResumeData } from "../types/resume";

import { ChileProfesional } from "../components/templates/ChileProfesional";
import { HarvardClassic } from "../components/templates/HarvardClassic";
import { TechMinimalist } from "../components/templates/TechMinimalist";
import { ModernExecutive } from "../components/templates/ModernExecutive";
import { SkillsFirstBuilder } from "../components/templates/SkillsFirstBuilder";
import { StanfordClean } from "../components/templates/StanfordClean";
import { CompactSwiss } from "../components/templates/CompactSwiss";
import { ExecutiveSerif } from "../components/templates/ExecutiveSerif";
import { TechCompact } from "../components/templates/TechCompact";
import { ModernMinimal } from "../components/templates/ModernMinimal";
import { CareerChanger } from "../components/templates/CareerChanger";
import { AcademicInternational } from "../components/templates/AcademicInternational";

const TEMPLATES: { id: TemplateId; name: string; comp: React.FC<any> }[] = [
  { id: "chile_profesional", name: "Chile & LatAm Profesional", comp: ChileProfesional },
  { id: "harvard", name: "Classic Dense (Harvard Style)", comp: HarvardClassic },
  { id: "tech_minimalist", name: "Engineering Clean (Tech Minimalist)", comp: TechMinimalist },
  { id: "modern_executive", name: "Modern Executive", comp: ModernExecutive },
  { id: "skills_first", name: "Skills-First Builder", comp: SkillsFirstBuilder },
  { id: "stanford_clean", name: "Entry Academic (Stanford Clean)", comp: StanfordClean },
  { id: "compact_swiss", name: "Compact Swiss Grid", comp: CompactSwiss },
  { id: "executive_serif", name: "Executive Serif", comp: ExecutiveSerif },
  { id: "tech_compact", name: "Tech Compact", comp: TechCompact },
  { id: "modern_minimal", name: "Modern Minimal", comp: ModernMinimal },
  { id: "career_changer", name: "Career Changer", comp: CareerChanger },
  { id: "academic_international", name: "Academic International", comp: AcademicInternational },
];

const REAL_TEST_DATA: ResumeData = {
  name: "JOAIN MATIAS MONROY SANTOS",
  headline: "Software Engineer | Full Stack & Generative AI",
  email: "joain.monroy@example.com",
  phone: "+56 9 1234 5678",
  location: "Santiago, Chile",
  website: "https://jmonroy.dev",
  summary: "Software Engineer con experiencia en desarrollo full stack y modelos generativos.",
  language: "es",
  social_networks: [
    { network: "LinkedIn", username: "jmonroys17", url: "https://linkedin.com/in/jmonroys17" },
    { network: "GitHub", username: "devSantos8", url: "https://github.com/devSantos8" },
  ],
  skills: [
    { id: "s1", category: "Backend", skills: ["Python", "Node.js", "FastAPI", "PostgreSQL"] },
  ],
  experience: [
    {
      id: "e1",
      position: "Ingeniero I",
      company: "DevOps Tech",
      location: "Santiago, Chile",
      start_date: "Mar 2026",
      end_date: "",
      current: true,
      summary: "Liderazgo en despliegue de modelos.",
      highlights: ["Diseño de arquitectura escalable."],
    },
  ],
  education: [
    {
      id: "ed1",
      institution: "Universidad de Chile",
      degree: "Ingeniería Informática",
      start_date: "2020",
      end_date: "2025",
      current: false,
      highlights: [],
    },
  ],
  projects: [],
  custom_sections: [],
  hidden_sections: [],
  section_order: [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
  ],
  certifications: [
    { id: "c1", name: "Cloud Architecture", issuer: "Google", date: "2026" },
  ],
};

async function testPdfTextExtraction(browser: Browser, html: string): Promise<string> {
  const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>CV</title>
    <style>
      @page { size: letter portrait; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; background: white; color: #09090b; }
    </style>
  </head>
  <body>
    <div id="print-root">
      ${html}
    </div>
  </body>
</html>`;

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
  const pdfBuffer = await page.pdf({
    format: "letter",
    printBackground: true,
    margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
  });
  await page.close();

  const { text } = await extractText(new Uint8Array(pdfBuffer));
  return text.join("\n");
}

async function runAtsSuite() {
  console.log("\n==================================================================");
  console.log(" 🧪 SUITE E2E DE VALIDACIÓN AUTOMATIZADA ATS & PDF EXTRACTION — SCHEMACV");
  console.log("==================================================================\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let totalPassed = 0;

  try {
    for (const t of TEMPLATES) {
      console.log(`\n📄 Verificando plantilla: ${t.name} (${t.id})...`);
      
      // 1. Probar vía exportador HTML semántico
      const pureHtml = generateTemplateHtml(REAL_TEST_DATA, t.id, "letter");
      const pureText = await testPdfTextExtraction(browser, pureHtml);

      // 2. Probar vía componente React directo
      const Component = t.comp;
      const visibleData = getVisibleResumeData(REAL_TEST_DATA);
      const reactHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Component, { data: visibleData, paperSize: "letter" })
      );
      const reactText = await testPdfTextExtraction(browser, reactHtml);

      const checks = [
        {
          name: "A1: Nombre y Headline en líneas separadas (sin SANTOSSoftware / SANTOSAI)",
          passed: !/SANTOSSoftware|SANTOSAI/i.test(pureText) && !/SANTOSSoftware|SANTOSAI/i.test(reactText),
          detail: "Línea de nombre limpia y salto de línea verificado",
        },
        {
          name: "A2: Emisor y año de certificación como 'Google (2026)' (con espacio exacto)",
          passed: /Google\s+\(2026\)/.test(pureText) && /Google\s+\(2026\)/.test(reactText),
          detail: "Formato 'Google (2026)' verificado en texto extraído",
        },
        {
          name: "A3: Categoría de skills con espacio 'Backend: Python'",
          passed: /Backend:\s+Python/.test(pureText) && /Backend:\s+Python/.test(reactText),
          detail: "Espacio tras dos puntos en categorías verificado",
        },
        {
          name: "A4: Empleo actual renderiza 'Presente'",
          passed: /Mar 2026\s*[-–→|]\s*Presente/i.test(pureText) && /Mar 2026\s*[-–→|]\s*Presente/i.test(reactText),
          detail: "Rango 'Mar 2026 – Presente' verificado",
        },
        {
          name: "A5: Enlaces sociales canónicos linkedin.com/in/... y github.com/...",
          passed:
            (pureText.includes("linkedin.com/in/jmonroys17") || pureText.includes("LinkedIn: jmonroys17") || pureText.includes("LinkedIn/jmonroys17")) &&
            (reactText.includes("linkedin.com/in/jmonroys17") || reactText.includes("LinkedIn: jmonroys17") || reactText.includes("LinkedIn/jmonroys17")),
          detail: "URLs canónicas normalizadas con /in/",
        },
        {
          name: "A6: Separadores sin fusión (no 'Ingeniero I+DevOps')",
          passed: !/Ingeniero I\+DevOps/i.test(pureText) && !/Ingeniero I\+DevOps/i.test(reactText),
          detail: "Cargo y Empresa separados correctamente",
        },
      ];

      const allPassed = checks.every((c) => c.passed);
      if (allPassed) totalPassed++;

      const icon = allPassed ? "✅ PASS" : "❌ FAIL";
      console.log(`[${icon}] ${t.name}`);
      checks.forEach((c) => {
        const checkIcon = c.passed ? "  ✓" : "  ✗";
        console.log(`${checkIcon} ${c.name} — ${c.detail}`);
      });
    }
  } finally {
    await browser.close();
  }

  console.log("\n------------------------------------------------------------------");
  console.log(`📊 Resultado Final: ${totalPassed} / ${TEMPLATES.length} plantillas aprobadas`);
  console.log("------------------------------------------------------------------\n");

  if (totalPassed < TEMPLATES.length) {
    console.error("❌ Falló la validación ATS en una o más plantillas.");
    process.exit(1);
  } else {
    console.log("🎉 TODAS las 12 plantillas superaron el 100% de las pruebas E2E de extracción de texto y Reglas ATS.\n");
    process.exit(0);
  }
}

runAtsSuite();
