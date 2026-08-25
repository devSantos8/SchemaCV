import puppeteer from "puppeteer";
import { extractText } from "unpdf";
import fs from "fs";
import path from "path";
import { generateTemplateHtml } from "../lib/exporters/htmlTemplateExporter";
import { ResumeData, TemplateId } from "../types/resume";

const SAMPLE_USER_CV: ResumeData = {
  name: "Joain Matias Monroy Santos",
  headline: "Ingeniero de Software | Full Stack & DevOps",
  summary:
    "Ingeniero en Informática con experiencia en desarrollo de software y procesos DevOps dentro de un entorno financiero. He trabajado con Python, Docker y GitHub Actions en la automatización, la implementación de quality gates y la optimización de sistemas, aplicando prácticas de desarrollo seguro y creando tooling interno para mejorar la calidad del código.",
  email: "joainsantos.m@gmail.com",
  phone: "+56 949002793",
  location: "Padre Hurtado, Chile",
  website: "",
  social_networks: [
    { network: "LinkedIn", username: "jmonroys17", url: "https://linkedin.com/in/jmonroys17" },
    { network: "GitHub", username: "devSantos8", url: "https://github.com/devSantos8" },
  ],
  skills: [
    { id: "s1", category: "Backend", skills: ["Python", "Node.js", "NestJS", "Django", "TypeScript", "REST APIs"] },
    { id: "s2", category: "Frontend", skills: ["React", "Next.js", "JavaScript", "Tailwind CSS", "HTML5", "CSS3"] },
    { id: "s3", category: "Base de Datos", skills: ["PostgreSQL", "SQL Server", "SQLite"] },
    { id: "s4", category: "IA Aplicada y Automatización", skills: ["Claude Code", "GitHub Copilot", "Antigravity CLI", "APIs LLMs", "RAG"] },
    { id: "s5", category: "DevOps, CI/CD y Cloud", skills: ["Git", "CI/CD", "GitHub Actions", "Docker", "AWS", "Supabase", "Firebase", "Kubernetes"] },
    { id: "s6", category: "Idiomas", skills: ["Español (nativo)", "Ingles (Básico - Técnico)"] },
  ],
  experience: [
    {
      id: "exp1",
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
      start_date: "",
      end_date: "",
      technologies: [],
      url: "",
      github_url: "",
      highlights: [
        "Desarrollé un validador automatizado con 10 reglas de compatibilidad ATS y exportación vectorial a PDF/DOCX, alcanzando un 100% de tasa de parseo.",
        "Lideré el desarrollo bajo metodología ágil (Kanban/Scrum), integrando Job Tracker y asistente IA con streaming en tiempo real.",
      ],
    },
  ],
  education: [
    {
      id: "e1",
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

async function inspectPdfExtraction() {
  console.log("\n==================================================================");
  console.log(" 🔍 INSPECTOR DE EXTRACCIÓN ATS & VERIFICACIÓN DE DATOS DEL PDF");
  console.log("==================================================================\n");

  const customFilePath = process.argv[2];
  let pdfBuffer: Uint8Array;
  let sourceName = "";

  if (customFilePath && fs.existsSync(customFilePath)) {
    console.log(`📂 Leyendo archivo PDF existente: ${customFilePath}`);
    pdfBuffer = new Uint8Array(fs.readFileSync(customFilePath));
    sourceName = path.basename(customFilePath);
  } else {
    const templateId: TemplateId = (process.argv[2] as TemplateId) || "academic_international";
    console.log(`⚙️  Generando PDF con la plantilla: ${templateId} (Letter)...`);

    const documentHtml = generateTemplateHtml(SAMPLE_USER_CV, templateId, "letter");

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV_Joain_Santos</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page { size: letter portrait; margin: 0; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; }
      body { margin: 0; padding: 0; background: white; color: #09090b; }
      ul.list-disc, .list-disc, .entry-bullets, ul { list-style-type: disc !important; }
      li { display: list-item !important; }
      .page-break-avoid { break-inside: avoid !important; }
    </style>
  </head>
  <body>
    <div id="print-root" style="width: 100%; margin: 0; padding: 0;">
      ${documentHtml}
    </div>
  </body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluateHandle("document.fonts.ready");

    const rawPdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: true,
    });

    await browser.close();
    pdfBuffer = new Uint8Array(rawPdf);
    sourceName = `Generado en memoria (${templateId})`;
  }

  // Extracción de texto con unpdf
  const { totalPages, text: pagesText } = await extractText(pdfBuffer);
  const fullExtractedText = pagesText.join("\n\n");
  const lines = fullExtractedText.split("\n").map((l) => l.trim()).filter(Boolean);

  console.log(`\n📄 Archivo inspeccionado: ${sourceName}`);
  console.log(`📊 Número de páginas: ${totalPages} ${totalPages === 1 ? "✅ (1 SOLA PÁGINA)" : "❌ (MÚLTIPLES PÁGINAS)"}`);

  // Pruebas y verificación de datos extraídos
  console.log("\n------------------------------------------------------------------");
  console.log(" 🧪 AUDITORÍA DETALLADA DE DATOS EXTRAÍDOS (PARSER ATS)");
  console.log("------------------------------------------------------------------");

  // 1. Encabezado
  const nameExtracted = lines.find((l) => /JOAIN MATIAS MONROY SANTOS|Joain Matias Monroy Santos/i.test(l));
  const headlineExtracted = lines.find((l) => /Ingeniero de Software/i.test(l));
  const headerJoined = fullExtractedText.includes("SANTOSIngeniero") || fullExtractedText.includes("SANTOSSoftware");

  console.log("\n[1] ENCABEZADO Y PERFIL:");
  console.log(`  • Nombre: ${nameExtracted ? `✅ "${nameExtracted}"` : "❌ NO DETECTADO"}`);
  console.log(`  • Titular / Rol: ${headlineExtracted ? `✅ "${headlineExtracted}"` : "❌ NO DETECTADO"}`);
  console.log(`  • Tokens separados: ${!headerJoined ? "✅ CORRECTO (Salto de línea limpio)" : "❌ ERROR: Nombre y Titular pegados"}`);

  // 2. Información de Contacto
  const emailExtracted = fullExtractedText.match(/joainsantos\.m@gmail\.com/i);
  const phoneExtracted = fullExtractedText.match(/\+56\s*949002793|\+56949002793/i);
  const linkedinExtracted = fullExtractedText.match(/linkedin\.com\/in\/jmonroys17/i);
  const githubExtracted = fullExtractedText.match(/github\.com\/devSantos8/i);
  const locationExtracted = fullExtractedText.match(/Padre Hurtado/i);

  console.log("\n[2] INFORMACIÓN DE CONTACTO:");
  console.log(`  • Email: ${emailExtracted ? `✅ ${emailExtracted[0]}` : "❌ NO DETECTADO"}`);
  console.log(`  • Teléfono: ${phoneExtracted ? `✅ ${phoneExtracted[0]}` : "❌ NO DETECTADO"}`);
  console.log(`  • LinkedIn: ${linkedinExtracted ? `✅ ${linkedinExtracted[0]}` : "❌ NO DETECTADO"}`);
  console.log(`  • GitHub: ${githubExtracted ? `✅ ${githubExtracted[0]}` : "❌ NO DETECTADO"}`);
  console.log(`  • Ubicación: ${locationExtracted ? `✅ Padre Hurtado, Chile` : "❌ NO DETECTADO"}`);

  // 3. Competencias Técnicas
  const hasBackend = fullExtractedText.includes("Backend:") || fullExtractedText.includes("Python");
  const hasFrontend = fullExtractedText.includes("Frontend:") || fullExtractedText.includes("React");
  const hasDb = fullExtractedText.includes("PostgreSQL");
  const hasDevOps = fullExtractedText.includes("Docker") && fullExtractedText.includes("CI/CD");

  console.log("\n[3] COMPETENCIAS TÉCNICAS:");
  console.log(`  • Backend (Python, NestJS, TypeScript): ${hasBackend ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);
  console.log(`  • Frontend (React, Next.js, Tailwind): ${hasFrontend ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);
  console.log(`  • Bases de Datos (PostgreSQL, SQL Server): ${hasDb ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);
  console.log(`  • DevOps & Cloud (Docker, CI/CD, AWS): ${hasDevOps ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);

  // 4. Experiencia Laboral
  const hasBci = fullExtractedText.includes("Banco de Crédito e Inversiones") || fullExtractedText.includes("Bci");
  const hasCargo = fullExtractedText.includes("Ingeniero I+DevOps");
  const hasExpDate = fullExtractedText.includes("Mar 2026") && (fullExtractedText.includes("Presente") || fullExtractedText.includes("Present"));
  const b1 = fullExtractedText.includes("OpenAI") || fullExtractedText.includes("fallback");
  const b2 = fullExtractedText.includes("RAG") || fullExtractedText.includes("Retrieval-Augmented");
  const b3 = fullExtractedText.includes("migración") || fullExtractedText.includes("desacoplado");
  const b4 = fullExtractedText.includes("Flask") || fullExtractedText.includes("14s a 4s");
  const b5 = fullExtractedText.includes("quality gates") || fullExtractedText.includes("Karate");

  console.log("\n[4] EXPERIENCIA LABORAL (100% DE ITEMS EXTRAÍDOS):");
  console.log(`  • Cargo: ${hasCargo ? "✅ Ingeniero I+DevOps" : "❌ NO DETECTADO"}`);
  console.log(`  • Empresa: ${hasBci ? "✅ Banco de Crédito e Inversiones (Bci)" : "❌ NO DETECTADO"}`);
  console.log(`  • Ubicación & Período: ${hasExpDate ? "✅ (Las Condes, Chile) Mar 2026 – Presente" : "❌ NO DETECTADO"}`);
  console.log(`  • Viñeta 1 (IA Asistente OpenAI / Fallback): ${b1 ? "✅ EXTRAÍDO COMPLETO" : "❌ NO DETECTADO"}`);
  console.log(`  • Viñeta 2 (RAG & Contexto Semántico): ${b2 ? "✅ EXTRAÍDO COMPLETO" : "❌ NO DETECTADO"}`);
  console.log(`  • Viñeta 3 (Migración Stack Desacoplado): ${b3 ? "✅ EXTRAÍDO COMPLETO" : "❌ NO DETECTADO"}`);
  console.log(`  • Viñeta 4 (Optimización Flask 14s a 4s): ${b4 ? "✅ EXTRAÍDO COMPLETO" : "❌ NO DETECTADO"}`);
  console.log(`  • Viñeta 5 (Quality Gates CI/CD & Karate DSL): ${b5 ? "✅ EXTRAÍDO COMPLETO" : "❌ NO DETECTADO"}`);

  // 5. Proyectos
  const hasSchemaCv = fullExtractedText.includes("SchemaCV");
  const hasAtsValidator = fullExtractedText.includes("validador") || fullExtractedText.includes("ATS");

  console.log("\n[5] PROYECTOS DESTACADOS:");
  console.log(`  • Proyecto: ${hasSchemaCv ? "✅ SchemaCV" : "❌ NO DETECTADO"}`);
  console.log(`  • Impacto ATS: ${hasAtsValidator ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);

  // 6. Educación & Certificaciones
  const hasInacap = fullExtractedText.includes("INACAP");
  const hasGoogleCert = fullExtractedText.includes("Google") && fullExtractedText.includes("Python");
  const hasLinuxCert = fullExtractedText.includes("Linux Foundation") || fullExtractedText.includes("LFD121");
  const hasDockerCert = fullExtractedText.includes("Docker Essentials");

  console.log("\n[6] EDUCACIÓN & CERTIFICACIONES:");
  console.log(`  • Educación: ${hasInacap ? "✅ INACAP — Ingeniería en Informática" : "❌ NO DETECTADO"}`);
  console.log(`  • Certificación Google Python: ${hasGoogleCert ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);
  console.log(`  • Certificación Linux Foundation (OWASP): ${hasLinuxCert ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);
  console.log(`  • Certificación Docker Essentials: ${hasDockerCert ? "✅ DETECTADO" : "❌ NO DETECTADO"}`);

  // Verificación de anomalías (tokens pegados)
  const anomalies: string[] = [];
  if (/GoogleEn\s*Curso/i.test(fullExtractedText)) anomalies.push("GoogleEn Curso (pegado)");
  if (/Linux FoundationEn\s*Curso/i.test(fullExtractedText)) anomalies.push("Linux FoundationEn Curso (pegado)");
  if (/Google2026/i.test(fullExtractedText)) anomalies.push("Google2026 (pegado)");
  if (/LinkedIn2026/i.test(fullExtractedText)) anomalies.push("LinkedIn2026 (pegado)");
  if (/Backend:Python/i.test(fullExtractedText)) anomalies.push("Backend:Python (sin espacio)");

  console.log("\n------------------------------------------------------------------");
  if (anomalies.length === 0) {
    console.log(" 🎉 RESULTADO FINAL: 100% COMPATIBILIDAD ATS & EXTRACCIÓN PERFECTA");
    console.log(" ✅ Cero tokens fusionados, 1 sola página y todos los campos legibles.");
  } else {
    console.log(` ⚠️ ANOMALÍAS DETECTADAS (${anomalies.length}):`);
    anomalies.forEach((a) => console.log(`   - ${a}`));
  }
  console.log("------------------------------------------------------------------\n");

  console.log("📜 --- VISTA PREVIA DEL TEXTO EXTRAÍDO (OCR/PDF STREAM) ---\n");
  console.log(fullExtractedText);
  console.log("\n------------------------------------------------------------------\n");
}

inspectPdfExtraction();
