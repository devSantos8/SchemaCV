import { generateNativeResumePdf } from "../../lib/exporters/reactPdf/renderPdf";
import { extractText } from "unpdf";
import { ResumeData, TemplateId, PaperSize } from "../../types/resume";
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

async function test() {
  const templates: TemplateId[] = [
    "academic_international",
    "harvard",
    "tech_minimalist",
    "chile_profesional",
    "stanford_clean",
    "compact_swiss",
    "modern_executive",
    "skills_first",
    "executive_serif",
    "tech_compact",
    "modern_minimal",
    "career_changer",
  ];
  
  for (const size of ["letter", "a4"] as PaperSize[]) {
    console.log(`\n--- Testing Paper Size: ${size.toUpperCase()} ---`);
    for (const t of templates) {
      const pdfBuf = await generateNativeResumePdf({
        data: USER_DATA,
        templateId: t,
        paperSize: size,
        title: `Test_${t}_${size}`,
      });
      const parsed = await extractText(new Uint8Array(pdfBuf));
      console.log(`[React-PDF] Template: ${t.padEnd(24)} | Size: ${size} -> Pages: ${parsed.totalPages}`);
      if (t === "academic_international" && size === "letter") {
        console.log("\n--- Full Extracted Text for Academic International (Letter) ---");
        console.log(parsed.text[0]);
        console.log("----------------------------------------------------------------\n");
      }
    }
  }
}

test();
