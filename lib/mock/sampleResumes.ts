import { ResumeData, ResumeProfile } from "@/types/resume";

export const SAMPLE_RESUME_FULLSTACK: ResumeData = {
  name: "Joain Matias Monroy Santos",
  headline: "Desarrollador Full Stack & Ingeniero DevOps",
  summary:
    "Ingeniero de Software y Desarrollador Full Stack con sólida experiencia construyendo aplicaciones y canales digitales escalables con React, TypeScript y Next.js en el frontend, y Node.js/Python en el backend. Especializado en integración de APIs REST de alta concurrencia, pipelines CI/CD automatizados, orquestación Docker y metodologías ágiles en el sector financiero.",
  email: "matiasmonroy483@gmail.com",
  phone: "+56 9 4900 2793",
  location: "Santiago, Chile",
  website: "https://jmonroys.dev",
  social_networks: [
    {
      network: "LinkedIn",
      username: "jmonroys17",
      url: "https://linkedin.com/in/jmonroys17",
      icon: "linkedin",
    },
    {
      network: "GitHub",
      username: "devSantos8",
      url: "https://github.com/devSantos8",
      icon: "github",
    },
  ],
  skills: [
    {
      id: "skills-lang",
      category: "Languages",
      skills: ["TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3", "Bash"],
    },
    {
      id: "skills-fw",
      category: "Frameworks & Libraries",
      skills: ["React", "Next.js", "Node.js", "NestJS", "Tailwind CSS", "Astro", "Zustand", "Radix UI"],
    },
    {
      id: "skills-devops",
      category: "Cloud & DevOps",
      skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "GitLab CI", "CI/CD Pipelines", "Linux"],
    },
    {
      id: "skills-db",
      category: "Databases & Storage",
      skills: ["PostgreSQL", "SQL Server", "Redis", "SQLite", "Prisma ORM"],
    },
    {
      id: "skills-tools",
      category: "Tools & Platforms",
      skills: ["Git", "REST APIs", "Postman", "Figma", "Vite", "OpenAI API", "Gemini API"],
    },
    {
      id: "skills-soft",
      category: "Methodologies & Soft Skills",
      skills: ["Scrum / Agile", "Clean Architecture", "Code Review", "Resolución de Problemas", "Liderazgo Técnico"],
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Banco de Crédito e Inversiones (Bci)",
      position: "Ingeniero I+DevOps & Full Stack",
      location: "Santiago, Chile",
      start_date: "Mar 2026",
      end_date: "Presente",
      current: true,
      highlights: [
        "Desarrollé y mantuve microservicios y canales digitales para la plataforma de innovación del banco, integrando más de 15 APIs REST y reduciendo la latencia de respuesta en un 35%.",
        "Construí componentes de UI reutilizables y accesibles en React y TypeScript con Tailwind CSS, acelerando los ciclos de entrega de frontend en un 40%.",
        "Automaticé la conversión de colecciones Postman/cURL a suites de pruebas Karate automatizadas, integrándolas en pipelines CI/CD para validar contratos de API.",
        "Optimicé el rendimiento en producción de una plataforma interna de gestión, reduciendo el tiempo de carga de 14s a 4s mediante code-splitting y consultas optimizadas.",
        "Implementé un asistente inteligente basado en GenAI (OpenAI API) para la plataforma de soporte interno Bci, disminuyendo la tasa de error en respuestas del 85% al 15%.",
        "Colaboré estrechamente en células ágiles con QA, producto y DevOps en revisiones de código y despliegues sin tiempo de inactividad.",
      ],
      summary: "Liderazgo en desarrollo de canales digitales y modernización de procesos CI/CD.",
    },
    {
      id: "exp-2",
      company: "TechNova Solutions",
      position: "Desarrollador Software Junior",
      location: "Santiago, Chile",
      start_date: "Ene 2024",
      end_date: "Feb 2026",
      current: false,
      highlights: [
        "Desarrollé módulos web en Next.js y Node.js para clientes de comercio electrónico y gestión empresarial.",
        "Diseñé esquemas de bases de datos relacionales en PostgreSQL con Prisma ORM, optimizando índices para consultas analíticas frecuentes.",
        "Implementé autenticación segura con JWT y roles de usuario, protegiendo rutas de API críticas.",
      ],
      summary: "Desarrollo full stack de aplicaciones web modernas.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Pulsar - Panel de Control & Telemetría",
      description:
        "Dashboard interactivo de telemetría y monitoreo de eventos en tiempo real con latencia menor a 15ms.",
      url: "https://pulsar-telemetry.dev",
      github_url: "https://github.com/devSantos8/Pulsar",
      start_date: "Jul 2026",
      end_date: "Ago 2026",
      technologies: ["React", "TypeScript", "Prisma ORM", "Docker", "GitHub Actions"],
      highlights: [
        "Construí un dashboard en tiempo real con soporte para telemetría, filtrado reactivo y visualizaciones interactivas.",
        "Implementé autenticación OAuth 2.0 (GitHub y Google) con control de sesiones basado en tokens seguros.",
        "Contenericé la solución con Docker multi-stage builds y pipelines CI/CD automatizados, reduciendo el peso de la imagen en un 60%.",
      ],
    },
    {
      id: "proj-2",
      name: "SchemaCV - ATS Resume Platform",
      description:
        "Plataforma web de ingeniería de CVs basada en sincronización bidireccional YAML y exportación multiformato.",
      url: "https://schemacv.dev",
      github_url: "https://github.com/devSantos8/SchemaCV",
      start_date: "Ago 2026",
      end_date: "Presente",
      technologies: ["Next.js 15", "TypeScript", "Tailwind CSS", "CodeMirror", "Zustand", "docx"],
      highlights: [
        "Diseñé la arquitectura de sincronización reactiva en tiempo real entre formularios visuales y esquemas YAML validados con Zod.",
        "Desarrollé 4 motores de plantillas optimizados para pasar los filtros de los ATS más exigentes del mercado.",
        "Implementé un compilador nativo a DOCX vectorial y PDF de alta precisión.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "INACAP",
      degree: "Título Profesional en Ingeniería en Informática",
      area: "Ingeniería de Software & Arquitectura Cloud",
      location: "Santiago, Chile",
      start_date: "Mar 2022",
      end_date: "Dic 2025",
      current: false,
      gpa: "6.5 / 7.0",
      highlights: [
        "Diplomados y certificados académicos: Desarrollador Full Stack, Arquitectura en la Nube, Diseño de Sistemas Ágiles, Gestión de Bases de Datos.",
        "Proyecto de titulación con distinción máxima enfocado en automatización de pruebas y pipelines de observabilidad.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2025",
      url: "https://aws.amazon.com/verification",
      summary: "Diseño de infraestructuras escalables, alta disponibilidad y resiliencia en la nube.",
    },
    {
      id: "cert-2",
      name: "Docker & Kubernetes Certified Specialist",
      issuer: "Linux Foundation",
      date: "2025",
      url: "https://credentials.linuxfoundation.org",
      summary: "Orquestación de microservicios y despliegues continuos.",
    },
  ],
  custom_sections: [],
  section_order: [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
  ],
};

export const INITIAL_PROFILES: ResumeProfile[] = [
  {
    id: "profile-fullstack",
    name: "Perfil Full-Stack & DevOps",
    targetRole: "Senior Full Stack & Cloud Developer",
    templateId: "tech_minimalist",
    paperSize: "letter",
    data: SAMPLE_RESUME_FULLSTACK,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "profile-backend",
    name: "Perfil Backend & Cloud",
    targetRole: "Backend Engineer / Systems Architect",
    templateId: "harvard",
    paperSize: "letter",
    data: {
      ...SAMPLE_RESUME_FULLSTACK,
      headline: "Ingeniero de Software Backend & Arquitecto Cloud",
      section_order: ["summary", "experience", "skills", "projects", "education", "certifications"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "profile-executive",
    name: "Perfil Liderazgo Técnico",
    targetRole: "Engineering Lead / Tech Lead",
    templateId: "modern_executive",
    paperSize: "letter",
    data: {
      ...SAMPLE_RESUME_FULLSTACK,
      headline: "Tech Lead & Arquitecto de Soluciones Digitales",
      section_order: ["summary", "experience", "projects", "skills", "education", "certifications"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
