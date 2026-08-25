import puppeteer from 'puppeteer';
import { extractText } from 'unpdf';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { generateTemplateHtml } from '../lib/exporters/htmlTemplateExporter';
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
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
  ],
};

async function testUserCv() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  // 1. Test pure HTML exporter
  const pureHtml = generateTemplateHtml(USER_DATA, 'academic_international', 'letter');
  const page1 = await browser.newPage();
  await page1.setContent(`<!DOCTYPE html><html><head><meta charset='UTF-8'><style>@page{size:letter portrait;margin:0;}*{box-sizing:border-box;}body{margin:0;padding:0;}</style></head><body>${pureHtml}</body></html>`, { waitUntil: 'domcontentloaded' });
  const pdf1 = await page1.pdf({ format: 'Letter', printBackground: true, margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
  const res1 = await extractText(new Uint8Array(pdf1));
  console.log('Pure HTML exporter total pages:', res1.totalPages);
  await page1.close();

  // 2. Test React component via client outerHTML simulation (which is what Header.tsx sends!)
  const reactMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AcademicInternational, { data: USER_DATA, paperSize: 'letter' })
  );
  
  // In Header.tsx: html is printDoc.outerHTML where printDoc has min-h-[11in]
  const clientHtml = `<div id="cv-printable-document" class="w-[8.5in] min-h-[11in]">${reactMarkup}</div>`;
  
  const page2 = await browser.newPage();
  const routeHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page { size: letter portrait; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; background: white; color: #09090b; }
      .page-break-avoid { break-inside: avoid !important; }
    </style>
  </head>
  <body>
    <div id="print-root" style="width: 100%; margin: 0; padding: 0;">
      ${clientHtml}
    </div>
  </body>
</html>`;

  await page2.setContent(routeHtml, { waitUntil: 'networkidle0' as any });
  const pdf2 = await page2.pdf({ format: 'Letter', printBackground: true, margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
  const res2 = await extractText(new Uint8Array(pdf2));
  console.log('React Client HTML total pages:', res2.totalPages);
  await page2.close();

  await browser.close();
}

testUserCv();
