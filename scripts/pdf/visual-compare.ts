import { chromium } from "playwright";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AcademicInternational } from "../../components/templates/AcademicInternational";
import { ChileProfesional } from "../../components/templates/ChileProfesional";
import { generateNativeResumePdf } from "../../lib/exporters/reactPdf/renderPdf";
import { ResumeData } from "../../types/resume";
import fs from "fs";
import path from "path";

const USER_DATA: ResumeData = {
  name: "JOAIN MATIAS MONROY SANTOS",
  headline: "AI & Automation Engineer | Full Stack Developer",
  location: "Padre Hurtado, Chile",
  phone: "+56 949002793",
  email: "joainsantos.m@gmail.com",
  summary: "Ingeniero Informático con interés en transformar problemas reales en soluciones simples, automatizadas y apoyadas en inteligencia artificial. Me caracteriza la curiosidad por aprender nuevas tecnologías, el pensamiento práctico y las ganas de construir y mejorar procesos. Busco seguir desarrollándome en equipos donde pueda aportar, aprender y asumir nuevos desafíos. Disponibilidad inmediata.",
  language: "es",
  social_networks: [
    { network: "LinkedIn", username: "jmonroys17", url: "https://linkedin.com/in/jmonroys17" },
    { network: "GitHub", username: "devSantos8", url: "https://github.com/devSantos8" },
  ],
  custom_sections: [],
  hidden_sections: [],
  experience: [
    {
      id: "e1",
      position: "Ingeniero I+DevOps",
      company: "Banco de Crédito e Inversiones (Bci)",
      location: "Las Condes, Chile",
      start_date: "Mar 2026",
      end_date: "Presente",
      current: true,
      summary: "",
      highlights: [
        "Desarrollé un asistente de IA interna integrando la API de OpenAI y técnicas avanzadas de prompt engineering, reduciendo la tasa de fallback de consultas del 85% al 0%, ofreciendo una IA adaptaba a la plataforma.",
        "Automaticé controles de calidad en pipelines de CI/CD integrando conversión de colecciones Postman/cURL a Karate DSL y creando un dashboard de gobernanza y cumplimiento para monitoreo continuo de la calidad de APIs.",
        "Implementé un pipeline de RAG (Retrieval-Augmented Generation) y contexto semántico en la plataforma corporativa de innovación, acelerando en un 60% la evaluación y filtrado de iniciativas tecnológicas.",
        "Lideré la migración de una plataforma en producción hacia un stack moderno desacoplado (Next.js, NestJS, Python y SQL Server), mejorando la estabilidad del sistema y reduciendo la latencia de respuesta en un 65%.",
        "Refactoricé y optimicé la arquitectura web en Flask (Python) y TailwindCSS en producción, reduciendo los tiempos de carga del sistema de 14s a 4s (mejora del 71%).",
      ],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "SchemaCV",
      description: "",
      technologies: [],
      start_date: "",
      end_date: "",
      highlights: [
        "Plataforma SaaS para auditoría ATS con motor determinista y asistentes de IA. Diseño e implementación de la arquitectura subyacente y del flujo de integración y despliegue continuo para el ciclo de vida del producto.",
      ],
    },
    {
      id: "p2",
      name: "CommitFlow - Proyecto de Titulo",
      description: "",
      technologies: [],
      start_date: "",
      end_date: "",
      highlights: [
        "Plataforma para la gestión del ciclo de vida del software (SDLC) y seguimiento de entregables. Liderazgo técnico bajo marco Scrum, construyendo los pipelines de automatización (CI/CD) para el despliegue continuo en la nube.",
      ],
    },
  ],
  education: [
    {
      id: "ed1",
      institution: "INACAP",
      degree: "Ingeniería en Informática",
      location: "Santiago, Chile",
      start_date: "Mar 2022",
      end_date: "Dic 2025",
      current: false,
      highlights: [
        "Certificados Académicos: Desarrollador Full Stack, Arquitectura en la Nube, Diseño y Gestión de Bases de Datos.",
      ],
    },
  ],
  skills: [
    { id: "s1", category: "Backend", skills: ["Python", "Node.js", "NestJS", "Django", "TypeScript", "REST APIs"] },
    { id: "s2", category: "Frontend", skills: ["React", "Next.js", "JavaScript", "Tailwind CSS", "HTML5", "CSS3"] },
    { id: "s3", category: "Base de Datos", skills: ["PostgreSQL", "SQL Server"] },
    { id: "s4", category: "IA Aplicada y Automatización", skills: ["Claude Code", "GitHub Copilot", "Antigravity CLI", "APIs LLMs", "RAG", "Zapier (basico)"] },
    { id: "s5", category: "DevOps, CI/CD y Cloud", skills: ["Git", "CI/CD", "GitHub Actions", "Docker", "AWS", "Supabase", "Firebase", "Kubernetes"] },
    { id: "s6", category: "Idiomas", skills: ["Español (nativo)", "Ingles (Básico - Técnico)"] },
  ],
  certifications: [
    { id: "c1", name: "Google IT Automation with Python", issuer: "Google", date: "En Curso" },
    { id: "c2", name: "Google AI Essentials", issuer: "Google", date: "2026" },
    { id: "c3", name: "Introduction to Git and GitHub", issuer: "Google", date: "2026" },
    { id: "c4", name: "Docker Essentials", issuer: "LinkedIn", date: "2026" },
    { id: "c5", name: "Cloud Developing & Cloud Foundations", issuer: "AWS Academy Graduate", date: "2024" },
  ],
  section_order: [
    "summary",
    "experience",
    "projects",
    "education",
    "skills",
    "certifications",
  ],
};

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  // 1. Render Preview (AcademicInternational) in Tailwind
  const htmlAcademic = renderToStaticMarkup(React.createElement(AcademicInternational, { data: USER_DATA, paperSize: "letter" }));
  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background: #f4f4f5; display: flex; justify-content: center; padding: 20px; }
          .preview-page { width: 8.5in; min-height: 11in; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        </style>
      </head>
      <body>
        <div class="preview-page">
          ${htmlAcademic}
        </div>
      </body>
    </html>
  `;

  await page.setContent(previewHtml, { waitUntil: "networkidle" });
  await page.locator(".preview-page").screenshot({ path: "test_preview_academic.png" });
  console.log("Saved test_preview_academic.png");

  // 2. Render React-PDF generated PDF
  const pdfBuf = await generateNativeResumePdf({
    data: USER_DATA,
    templateId: "academic_international",
    paperSize: "letter",
    title: "Test_Academic",
  });
  fs.writeFileSync("test_academic.pdf", pdfBuf);

  // Render PDF to image using PDF.js via Playwright
  const pdfBase64 = pdfBuf.toString("base64");
  const pdfViewerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          body { margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; background: #f4f4f5; }
          canvas { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdfData = atob('${pdfBase64}');
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
          loadingTask.promise.then(async function(pdf) {
            window.numPages = pdf.numPages;
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              canvas.id = 'page-' + i;
              document.getElementById('container').appendChild(canvas);
              await page.render({ canvasContext: context, viewport: viewport }).promise;
            }
            window.rendered = true;
          });
        </script>
      </body>
    </html>
  `;
  await page.setContent(pdfViewerHtml);
  await page.waitForFunction(() => (window as any).rendered === true, { timeout: 10000 });
  const numPagesAcademic = await page.evaluate(() => (window as any).numPages);
  console.log(`[Playwright] Academic International PDF Page Count: ${numPagesAcademic}`);
  await page.locator("#page-1").screenshot({ path: "test_pdf_academic_page1.png" });
  console.log("Saved test_pdf_academic_page1.png");

  // 3. Render Chile Profesional Preview
  const htmlChile = renderToStaticMarkup(React.createElement(ChileProfesional, { data: USER_DATA, paperSize: "letter" }));
  const previewHtmlChile = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background: #f4f4f5; display: flex; justify-content: center; padding: 20px; }
          .preview-page { width: 8.5in; min-height: 11in; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        </style>
      </head>
      <body>
        <div class="preview-page">
          ${htmlChile}
        </div>
      </body>
    </html>
  `;
  await page.setContent(previewHtmlChile, { waitUntil: "networkidle" });
  await page.locator(".preview-page").screenshot({ path: "test_preview_chile.png" });
  console.log("Saved test_preview_chile.png");

  // 4. Render React-PDF Chile
  const pdfBufChile = await generateNativeResumePdf({
    data: USER_DATA,
    templateId: "chile_profesional",
    paperSize: "letter",
    title: "Test_Chile",
  });
  fs.writeFileSync("test_chile.pdf", pdfBufChile);
  console.log("Saved test_chile.pdf");

  const pdfBase64Chile = pdfBufChile.toString("base64");
  const pdfViewerHtmlChile = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          body { margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; background: #f4f4f5; }
          canvas { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div id="container-chile"></div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdfData = atob('${pdfBase64Chile}');
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
          loadingTask.promise.then(async function(pdf) {
            window.numPagesChile = pdf.numPages;
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              canvas.id = 'page-chile-' + i;
              document.getElementById('container-chile').appendChild(canvas);
              await page.render({ canvasContext: context, viewport: viewport }).promise;
            }
            window.renderedChile = true;
          });
        </script>
      </body>
    </html>
  `;
  await page.setContent(pdfViewerHtmlChile);
  await page.waitForFunction(() => (window as any).renderedChile === true, { timeout: 10000 });
  const numPagesChile = await page.evaluate(() => (window as any).numPagesChile);
  console.log(`[Playwright] Chile Profesional PDF Page Count: ${numPagesChile}`);
  await page.locator("#page-chile-1").screenshot({ path: "test_pdf_chile_page1.png" });
  console.log("Saved test_pdf_chile_page1.png");

  await browser.close();
  console.log("Visual compare done!");
}

run();
