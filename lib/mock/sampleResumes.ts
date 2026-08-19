import { ResumeData, ResumeProfile } from "@/types/resume";

export const SAMPLE_RESUME_FULLSTACK: ResumeData = {
  name: "Carlos Mendoza Rivera",
  headline: "Senior Full Stack Engineer & Cloud Architect",
  summary:
    "Ingeniero de Software y Arquitecto Cloud con más de 6 años de experiencia diseñando y construyendo plataformas digitales de alta concurrencia con React, TypeScript, Next.js y ecosistemas backend en Node.js, Python y Go. Especializado en arquitectura de microservicios, optimización para motores de búsqueda y rendimiento web, orquestación de contenedores y pipelines CI/CD automatizados.",
  email: "carlos.mendoza.dev@example.com",
  phone: "+1 (555) 382-9102",
  location: "San Francisco, CA (Remoto)",
  website: "https://carlosmendoza.dev",
  social_networks: [
    {
      network: "LinkedIn",
      username: "carlosmendoza-dev",
      url: "https://linkedin.com/in/carlosmendoza-dev",
      icon: "linkedin",
    },
    {
      network: "GitHub",
      username: "cmendoza-tech",
      url: "https://github.com/cmendoza-tech",
      icon: "github",
    },
  ],
  skills: [
    {
      id: "skills-lang",
      category: "Languages",
      skills: ["TypeScript", "JavaScript (ES6+)", "Python", "Go", "SQL", "HTML5", "CSS3/SCSS"],
    },
    {
      id: "skills-fw",
      category: "Frameworks & Libraries",
      skills: ["React", "Next.js", "Node.js", "Express", "NestJS", "Tailwind CSS", "GraphQL", "Zustand"],
    },
    {
      id: "skills-devops",
      category: "Cloud & DevOps",
      skills: ["AWS (ECS, S3, Lambda, CloudFront)", "Docker", "Kubernetes", "GitHub Actions", "Terraform", "CI/CD"],
    },
    {
      id: "skills-db",
      category: "Databases & Storage",
      skills: ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch", "Prisma ORM"],
    },
    {
      id: "skills-tools",
      category: "Tools & Testing",
      skills: ["Git", "Jest", "Playwright", "Postman", "Datadog", "Figma", "REST APIs"],
    },
    {
      id: "skills-soft",
      category: "Methodologies",
      skills: ["System Architecture", "Scrum / Agile", "Mentoring", "Code Review", "Performance Optimization"],
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Apex Cloud Systems",
      position: "Senior Full Stack & Cloud Engineer",
      location: "San Francisco, CA (Remoto)",
      start_date: "Mar 2023",
      end_date: "Presente",
      current: true,
      highlights: [
        "Diseñó e implementó microservicios distribuidos de alta disponibilidad procesando más de 40M de peticiones diarias con un SLA del 99.98%.",
        "Lideró la modernización del frontend con Next.js y Tailwind CSS, reduciendo los tiempos de carga inicial (LCP) de 3.2s a 0.8s.",
        "Automatizó flujos de integración y despliegue continuo (CI/CD) con GitHub Actions y Docker, reduciendo el tiempo de entrega de 45 a 8 minutos.",
        "Optimizó consultas analíticas en PostgreSQL e implementó capas de caché con Redis, disminuyendo el uso de CPU en bases de datos en un 35%.",
        "Supervisó a un equipo de 6 ingenieros de software, promoviendo pruebas unitarias exhaustivas y revisiones de código de alta calidad.",
      ],
      summary: "Liderazgo técnico en arquitectura de interfaces y modernización de infraestructura en la nube.",
    },
    {
      id: "exp-2",
      company: "NovaTech Innovations",
      position: "Full Stack Developer",
      location: "Austin, TX",
      start_date: "Ene 2021",
      end_date: "Feb 2023",
      current: false,
      highlights: [
        "Construyó aplicaciones web escalables con React, TypeScript y Node.js para clientes de comercio electrónico y finanzas.",
        "Diseñó APIs RESTful y GraphQL seguras con autenticación OAuth 2.0 y control de acceso basado en roles (RBAC).",
        "Implementó pipelines de telemetría y monitoreo con Prometheus y Grafana, aumentando la visibilidad de errores en tiempo real.",
      ],
      summary: "Desarrollo full stack de plataformas digitales y diseño de APIs seguras.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "OmniFlow - Distributed Task Orchestrator",
      description:
        "Motor distribuido de orquestación de tareas y procesamiento de colas asíncronas con monitoreo reactivo.",
      url: "https://omniflow-demo.dev",
      github_url: "https://github.com/cmendoza-tech/omniflow",
      start_date: "2024",
      end_date: "2024",
      technologies: ["TypeScript", "Go", "Redis", "Docker", "Next.js", "PostgreSQL"],
      highlights: [
        "Procesa más de 15,000 tareas por segundo con latencia inferior a 12ms.",
        "Panel interactivo en tiempo real para observabilidad y resolución automática de fallos en colas de trabajo.",
      ],
    },
    {
      id: "proj-2",
      name: "HyperScale - API Gateway & Cache Layer",
      description:
        "Gateway de microservicios con balanceo de carga dinámico, limitador de tasa distribuido y caché de borde.",
      url: "https://hyperscale-gateway.dev",
      github_url: "https://github.com/cmendoza-tech/hyperscale",
      start_date: "2023",
      end_date: "2024",
      technologies: ["Node.js", "Redis", "Docker", "AWS ECS", "Terraform"],
      highlights: [
        "Redujo el consumo de ancho de banda en un 55% mediante compresión inteligente y almacenamiento en caché.",
        "Adoptado por más de 10 equipos de desarrollo internos para estandarizar el consumo de microservicios.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universidad Tecnológica Metropolitana",
      degree: "Licenciatura en Ciencias de la Computación & Ingeniería de Software",
      area: "Sistemas Distribuidos y Arquitectura Cloud",
      location: "Santiago, Chile",
      start_date: "2016",
      end_date: "2020",
      current: false,
      gpa: "Distinción Máxima (GPA 3.9/4.0)",
      highlights: [
        "Tesis de grado destacada: Diseño e implementación de arquitecturas serverless resilientes a fallos.",
        "Ayudante de cátedra en Estructuras de Datos y Algoritmos Avanzados durante 2 años consecutivos.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      date: "2024",
      url: "https://aws.amazon.com/verification",
      summary: "Validación avanzada en diseño de infraestructuras empresariales multi-región y resilientes.",
    },
    {
      id: "cert-2",
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation (CNCF)",
      date: "2023",
      url: "https://credentials.cncf.io",
      summary: "Administración, configuración y despliegue de clústeres Kubernetes en entornos de producción.",
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
