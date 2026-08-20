import puppeteer from "puppeteer";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { extractText } from "unpdf";
import { TechMinimalist } from "../components/templates/TechMinimalist";
import { ChileProfesional } from "../components/templates/ChileProfesional";
import { HarvardClassic } from "../components/templates/HarvardClassic";
import { ModernExecutive } from "../components/templates/ModernExecutive";
import { StanfordClean } from "../components/templates/StanfordClean";
import { CompactSwiss } from "../components/templates/CompactSwiss";
import { ExecutiveSerif } from "../components/templates/ExecutiveSerif";
import { TechCompact } from "../components/templates/TechCompact";
import { ModernMinimal } from "../components/templates/ModernMinimal";
import { CareerChanger } from "../components/templates/CareerChanger";
import { AcademicInternational } from "../components/templates/AcademicInternational";
import { SkillsFirstBuilder } from "../components/templates/SkillsFirstBuilder";

const sampleData = {
  name: "JOAIN MATIAS MONROY SANTOS",
  headline: "Software Engineer",
  email: "joain.monroy@example.com",
  phone: "+56 9 1234 5678",
  location: "Santiago, Chile",
  website: "https://jmonroy.dev",
  summary: "Software Engineer con experiencia en desarrollo full stack.",
  language: "es" as const,
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
  section_order: ["summary", "skills", "experience", "projects", "education", "certifications"],
  certifications: [
    { id: "c1", name: "Cloud Architecture", issuer: "Google", date: "2026" },
  ],
};

const templates = [
  { id: "tech_minimalist", comp: TechMinimalist },
  { id: "chile_profesional", comp: ChileProfesional },
  { id: "harvard", comp: HarvardClassic },
  { id: "modern_executive", comp: ModernExecutive },
  { id: "stanford_clean", comp: StanfordClean },
  { id: "compact_swiss", comp: CompactSwiss },
  { id: "executive_serif", comp: ExecutiveSerif },
  { id: "tech_compact", comp: TechCompact },
  { id: "modern_minimal", comp: ModernMinimal },
  { id: "career_changer", comp: CareerChanger },
  { id: "academic_international", comp: AcademicInternational },
  { id: "skills_first", comp: SkillsFirstBuilder },
];

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const t of templates) {
    const Component = t.comp;
    const reactHtml = ReactDOMServer.renderToStaticMarkup(
      <Component data={sampleData} paperSize="letter" />
    );

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>CV</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page { size: letter portrait; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; background: white; color: #09090b; }
    </style>
  </head>
  <body>
    <div id="print-root">
      ${reactHtml}
    </div>
  </body>
</html>`;

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({ format: "Letter", printBackground: true });
    await page.close();

    const { text } = await extractText(new Uint8Array(pdfBuffer));
    console.log(`\n=================== TEMPLATE: ${t.id} ===================`);
    console.log(text.join("\n"));
  }

  await browser.close();
}

run();
