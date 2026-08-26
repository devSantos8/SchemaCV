import puppeteer from "puppeteer";
import { extractText } from "unpdf";
import React from "react";
import { renderToString } from "react-dom/server";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { generateTemplateHtml } from "@/lib/exporters/htmlTemplateExporter";
import type { ResumeData, TemplateId } from "@/types/resume";

const AUDIT_RESUME: ResumeData = {
  name: "JOAIN MATIAS MONROY SANTOS",
  headline: "AI Engineer | Full Stack & Generative AI",
  email: "joain.monroy@example.com",
  phone: "+56 9 1234 5678",
  location: "Santiago, Chile",
  website: "https://jmonroy.dev",
  social_networks: [
    {
      network: "LinkedIn",
      username: "jmonroys17",
      url: "https://linkedin.com/in/jmonroys17",
    },
    {
      network: "GitHub",
      username: "devSantos8",
      url: "https://github.com/devSantos8",
    },
  ],
  summary: "AI Engineer con experiencia en desarrollo full stack y modelos generativos.",
  skills: [
    {
      id: "sk-1",
      category: "Backend",
      skills: ["Python", "Node.js", "FastAPI", "PostgreSQL"],
    },
  ],
  experience: [
    {
      id: "exp-1",
      position: "Ingeniero I",
      company: "DevOps Tech",
      location: "Santiago, Chile",
      start_date: "Mar 2026",
      current: true,
      highlights: ["Liderazgo en despliegue de modelos."],
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
    {
      id: "cert-1",
      name: "Cloud Architecture",
      issuer: "Google",
      date: "2026",
    },
    {
      id: "cert-2",
      name: "Cloud Foundations",
      issuer: "AWS Academy Graduate",
      date: "2024",
    },
    {
      id: "cert-3",
      name: "Generative AI",
      issuer: "LinkedIn",
      date: "2026",
    },
  ],
};

const TEMPLATES: TemplateId[] = [
  "chile_profesional",
  "harvard",
  "tech_minimalist",
  "modern_executive",
  "skills_first",
  "stanford_clean",
  "compact_swiss",
  "executive_serif",
  "tech_compact",
  "modern_minimal",
  "career_changer",
  "academic_international",
];

async function testExtraction() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  for (const t of TEMPLATES) {
    const reactHtml = renderToString(
      React.createElement(TemplateRenderer, {
        templateId: t,
        data: AUDIT_RESUME,
        paperSize: "letter",
      })
    );

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body><div id="cv-printable-document">${reactHtml}</div></body></html>`;
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({ format: "Letter" });

    const res = await extractText(new Uint8Array(pdfBuffer));
    console.log(`\n=================== TEMPLATE: ${t} ===================`);
    console.log("Pages count:", res.totalPages);
    console.log("Full text:\n" + JSON.stringify(res.text));
  }

  await browser.close();
}

testExtraction().catch(console.error);
