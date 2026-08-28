import { chromium } from "playwright";
import { generateChromiumResumePdf } from "../../lib/exporters/chromium/pdfExporter";
import { ResumeData } from "../../types/resume";
import fs from "fs";

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
  // 1. Academic
  const pdfBuf = await generateChromiumResumePdf({
    data: USER_DATA,
    templateId: "academic_international",
    paperSize: "letter",
    title: "Test_Academic",
  });
  fs.writeFileSync("test_academic.pdf", pdfBuf);

  // 2. Chile
  const pdfBufChile = await generateChromiumResumePdf({
    data: USER_DATA,
    templateId: "chile_profesional",
    paperSize: "letter",
    title: "Test_Chile",
  });
  fs.writeFileSync("test_chile.pdf", pdfBufChile);

  const browser = await chromium.launch();

  const renderPdfToPng = async (buf: Buffer, outName: string) => {
    const freshPage = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
    const b64 = buf.toString("base64");
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; background: #52525b; }
            canvas { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3); background: white; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div id="container"></div>
          <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdfData = atob('${b64}');
            pdfjsLib.getDocument({ data: pdfData }).promise.then(async function(pdf) {
              window.numPages = pdf.numPages;
              for (let i = 1; i <= pdf.numPages; i++) {
                const p = await pdf.getPage(i);
                const viewport = p.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.id = 'page-' + i;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                document.getElementById('container').appendChild(canvas);
                await p.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
              }
              window.done = true;
            });
          </script>
        </body>
      </html>
    `;
    await freshPage.setContent(html);
    await freshPage.waitForFunction(() => (window as any).done === true, { timeout: 15000 });
    const pages = await freshPage.evaluate(() => (window as any).numPages);
    console.log(`${outName} Pages: ${pages}`);
    await freshPage.locator("#page-1").screenshot({ path: outName });
    await freshPage.close();
  };

  await renderPdfToPng(pdfBuf, "academic_perfect.png");
  await renderPdfToPng(pdfBufChile, "chile_perfect.png");

  await browser.close();
}

run();
