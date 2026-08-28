import { chromium } from "playwright";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TemplateRenderer } from "../../components/templates/TemplateRenderer";
import { ResumeData, TemplateId, PaperSize } from "../../types/resume";
import fs from "fs";
import path from "path";

const sampleUserCV: ResumeData = {
  name: "JOAIN MATIAS MONROY SANTOS",
  headline: "Software Engineer | Full Stack Developer & DevOps",
  email: "joainsantos.m@gmail.com",
  phone: "+56 949002793",
  location: "Padre Hurtado, Chile",
  website: "",
  social_networks: [
    { network: "linkedin", username: "jmonroys17", url: "https://linkedin.com/in/jmonroys17" },
    { network: "github", username: "devSantos8", url: "https://github.com/devSantos8" },
  ],
  summary: "Ingeniero en Informática enfocado en desarrollo Full Stack (Python, TypeScript, React) y automatización DevOps/QA. Con experiencia creando herramientas internas e integraciones con IA en entornos corporativos, aporto trabajo colaborativo con stakeholders, código mantenible y entrega ágil de soluciones.",
  skills: [
    { id: "1", category: "Backend", skills: ["Python", "Node.js", "NestJS", "Django", "TypeScript", "REST APIs"] },
    { id: "2", category: "Frontend", skills: ["React", "Next.js", "JavaScript", "Tailwind CSS", "HTML5", "CSS3"] },
    { id: "3", category: "Base de Datos", skills: ["PostgreSQL", "SQL Server", "SQLite"] },
    { id: "4", category: "Herramientas e IA", skills: ["Claude Code", "GitHub Copilot", "Antigravity CLI", "APIs LLMs", "RAG"] },
    { id: "5", category: "DevOps y QA", skills: ["Git", "CI/CD", "GitHub Actions", "Docker", "Supabase", "Firebase", "Kubernetes"] },
    { id: "6", category: "Idiomas", skills: ["Español (nativo)", "Inglés: Técnico (Lectura y Documentación)"] },
  ],
  experience: [
    {
      id: "1",
      company: "Banco de Crédito e Inversiones (Bci)",
      position: "Ingeniero I+DevOps",
      location: "Las Condes, Chile",
      start_date: "Mar 2026",
      end_date: "",
      current: true,
      summary: "",
      highlights: [
        "Diseñé e implementé una solución end-to-end de asistente de IA interna con OpenAI y prompt engineering, reduciendo la tasa de fallback del 85% al 5%.",
        "Implementé un pipeline de RAG (Retrieval-Augmented Generation) y contexto semántico en la plataforma corporativa de innovación, acelerando en un 60% la evaluación y filtrado de iniciativas tecnológicas.",
        "Lideré la migración e integración de sistemas hacia una arquitectura desacoplada (Next.js, NestJS, Python y SQL Server), reduciendo la latencia un 65% y garantizando la estabilidad operativa del servicio.",
        "Refactoricé y optimicé la arquitectura web en Flask (Python) en producción, reduciendo tiempos de carga de 14s a 4s y documentando el procedimiento para asegurar reproducibilidad y trazabilidad.",
        "Automaticé suites de pruebas REST mediante la conversión de Postman/cURL a Karate DSL en pipelines CI/CD y colaboré en células ágiles junto a QA y Product Owners para asegurar la calidad de cada entrega.",
      ],
    },
  ],
  projects: [
    {
      id: "1",
      name: "SchemaCV - Plataforma SaaS & Validador ATS",
      technologies: [],
      start_date: "",
      end_date: "",
      description: "",
      highlights: [
        "Plataforma web para diseño, edición dual y auditoría determinista de currículums técnicos orientada a compatibilidad con sistemas ATS.",
        "Desarrollé un motor de validación con 10 reglas deterministas de parseo y exportación vectorial a PDF/DOCX, alcanzando un 100% de compatibilidad en lectura de datos.",
        "Diseñé la arquitectura y componentes en React y Tailwind CSS bajo metodología ágil (Kanban), integrando asistentes de IA con streaming en tiempo real y módulo de Job Tracking.",
      ],
    },
  ],
  education: [
    {
      id: "1",
      institution: "INACAP",
      degree: "Ingeniería en Informática",
      area: "",
      location: "Santiago, Chile",
      start_date: "Mar 2022",
      end_date: "Dic 2025",
      current: false,
      gpa: "",
      highlights: [
        "Certificados Académicos: Desarrollador Full Stack, Arquitectura en la Nube, Diseño y Gestión de Bases de Datos.",
      ],
    },
  ],
  certifications: [
    { id: "1", name: "Google AI Essentials", issuer: "Google", date: "2026" },
    { id: "2", name: "Introduction to Git and GitHub", issuer: "Google", date: "2026" },
    { id: "3", name: "Docker Essentials", issuer: "LinkedIn", date: "2026" },
    { id: "4", name: "Cloud Developing, Generative AI & Machine Learning", issuer: "AWS Academy Graduate", date: "2024" },
  ],
  section_order: ["summary", "skills", "experience", "projects", "education", "certifications"],
};

async function testPdfExport(templateId: TemplateId, paperSize: PaperSize = "letter") {
  const element = React.createElement(TemplateRenderer, {
    templateId,
    data: sampleUserCV,
    paperSize,
  });

  const templateHtml = renderToStaticMarkup(element);

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: ${paperSize === "a4" ? "210mm 297mm" : "8.5in 11in"};
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #09090b;
          }
          .page-break-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div id="cv-root" style="width: ${paperSize === "a4" ? "210mm" : "8.5in"}; margin: 0 auto;">
          ${templateHtml}
        </div>
      </body>
    </html>
  `;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
  });

  await page.setContent(fullHtml, { waitUntil: "networkidle" });
  await page.evaluateHandle("document.fonts.ready");

  const outputDir = path.join(process.cwd(), "test_outputs");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const pdfPath = path.join(outputDir, `${templateId}_chromium.pdf`);
  const pdfBuffer = await page.pdf({
    format: paperSize === "a4" ? "A4" : "Letter",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  fs.writeFileSync(pdfPath, pdfBuffer);

  const pngPath = path.join(outputDir, `${templateId}_chromium.png`);
  await page.screenshot({ path: pngPath, fullPage: false });

  await browser.close();
  console.log(`Generated ${pdfPath} and ${pngPath}`);
}

async function run() {
  await testPdfExport("academic_international", "letter");
  await testPdfExport("chile_profesional", "letter");
  await testPdfExport("harvard", "letter");
  console.log("All test templates compiled via Chromium successfully!");
}

run().catch(console.error);
