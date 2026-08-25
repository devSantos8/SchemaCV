import puppeteer from 'puppeteer';
import { extractText } from 'unpdf';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { AcademicInternational } from '../components/templates/AcademicInternational';
import { ResumeData } from '../types/resume';

const USER_DATA: ResumeData = {
  name: "Joain Matias Monroy Santos",
  headline: "Ingeniero de Software | Full Stack & DevOps",
  email: "joainsantos.m@gmail.com",
  phone: "+56 949002793",
  location: "Padre Hurtado, Chile",
  website: "https://tudominio.dev",
  summary: "Ingeniero en Informática con experiencia en desarrollo de software y procesos DevOps dentro de un entorno financiero. He trabajado con Python, Docker y GitHub Actions en la automatización, la implementación de quality gates y la optimización de sistemas, aplicando prácticas de desarrollo seguro y creando tooling interno para mejorar la calidad del código.",
  language: "es",
  social_networks: [
    { network: "LinkedIn", username: "jmonroys17", url: "https://linkedin.com/in/jmonroys17" },
    { network: "GitHub", username: "devSantos8", url: "https://github.com/devSantos8" },
  ],
  skills: [
    { id: "s1", category: "IA Aplicada y Automatización", skills: ["Claude Code", "GitHub Copilot", "Antigravity CLI", "APIs LLMs", "RAG"] },
    { id: "s2", category: "DevOps, CI/CD y Cloud", skills: ["Git", "CI/CD", "GitHub Actions", "Docker", "AWS", "Supabase", "Firebase", "Kubernetes"] },
    { id: "s3", category: "Idiomas", skills: ["Español (nativo)", "Inglés (Básico - Técnico)"] },
  ],
  experience: [
    {
      id: "e1",
      position: "Ingeniero I+DevOps",
      company: "Banco de Crédito e Inversiones (Bci)",
      location: "Las Condes, Chile",
      start_date: "Mar 2026",
      end_date: "",
      current: true,
      summary: "",
      highlights: [
        "Diseñé e implementé una solución end-to-end de asistente de IA interna con OpenAI y prompt engineering, reduciendo la tasa de fallback del 65% al 3%.",
        "Implementé un pipeline de RAG (Retrieval-Augmented Generation) y contexto semántico en la plataforma corporativa de innovación, acelerando en un 80% la evaluación y filtrado de iniciativas tecnológicas.",
        "Lideré la migración de una plataforma en producción hacia un stack moderno desacoplado (Next.js, NestJS, Python y SQL Server), mejorando la estabilidad del sistema y reduciendo la latencia de respuesta en un 65%.",
        "Refactoricé y optimicé la arquitectura web en Flask (Python) en producción, reduciendo tiempos de carga de 14s a 4s y documentando el procedimiento para asegurar reproducibilidad y trazabilidad.",
        "Automaticé quality gates en pipelines de CI/CD integrando conversión de colecciones Postman/cURL a Karate DSL y creando un dashboard de gobernanza y cumplimiento para monitoreo continuo de la calidad de APIs.",
      ],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "SchemaCV",
      description: "Plataforma web para diseño, edición dual y auditoría determinista de currículums técnicos 100% optimizados para filtros ATS.",
      technologies: [],
      start_date: "",
      end_date: "",
      highlights: [
        "Desarrollé un validador automatizado con 10 reglas de compatibilidad ATS y exportación vectorial a PDF/DOCX, alcanzando un 100% de tasa de parseo.",
        "Lideré el desarrollo bajo metodología ágil (Kanban/Scrum), integrando Job Tracker y asistente IA con streaming en tiempo real.",
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
  certifications: [
    { id: "c1", name: "Google IT Automation with Python", issuer: "Google", date: "En Curso" },
    { id: "c2", name: "Developing Secure Software (LFD121: OWASP & Codificación Segura)", issuer: "Linux Foundation", date: "En Curso" },
    { id: "c3", name: "Introduction to Git and GitHub", issuer: "Google", date: "2026" },
    { id: "c4", name: "Docker Essentials", issuer: "LinkedIn", date: "2026" },
    { id: "c5", name: "Cloud Developing & Cloud Foundations", issuer: "AWS Academy Graduate", date: "2024" },
  ],
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
};

async function testExactRoute() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Exact reproduction of what Header.tsx sends when summary is present (in screenshot summary was visible!)
  const reactMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AcademicInternational, { data: USER_DATA, paperSize: 'letter' })
  );
  const clientOuterHtml = `<div id="cv-printable-document" class="relative bg-white text-zinc-950 shadow-2xl rounded-sm transition-all border border-zinc-200/80 dark:border-zinc-800/80 print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:m-0 print:p-0 w-[8.5in] min-h-[11in]">${reactMarkup}</div>`;

  const routeFullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV_Test</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
              mono: ['Geist Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
              serif: ['EB Garamond', 'Georgia', 'Times New Roman', 'serif'],
            }
          }
        }
      }
    </script>
    <style>
      :root {
        --font-geist-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-geist-mono: 'Geist Mono', monospace;
      }
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
        color: #09090b !important;
        font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      ${clientOuterHtml}
    </div>
  </body>
</html>`;

  await page.setContent(routeFullHtml, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.evaluateHandle("document.fonts.ready");

  const pdfBuffer = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    preferCSSPageSize: true,
  });

  const { totalPages, text } = await extractText(new Uint8Array(pdfBuffer));
  console.log(`\nExact Route Result: totalPages = ${totalPages}`);
  console.log('Last page text lines:', text[text.length - 1]?.slice(0, 300));
  await browser.close();
}

testExactRoute();
