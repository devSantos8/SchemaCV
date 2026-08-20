import { ResumeData, ResumeProfile } from "@/types/resume";

export const EMPTY_RESUME_DATA: ResumeData = {
  name: "",
  headline: "",
  summary: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  social_networks: [],
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  custom_sections: [],
  section_order: ["summary", "skills", "experience", "projects", "education", "certifications"],
  hidden_sections: [],
};

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
  ],
  experience: [
    {
      id: "exp-1",
      company: "Vanguard Tech Solutions",
      position: "Senior Full Stack & DevOps Engineer",
      location: "San Francisco, CA",
      start_date: "2022-03",
      end_date: "Presente",
      current: true,
      summary:
        "Liderazgo en la migración a arquitectura orientada a microservicios e implementación de infraestructura distribuida en la nube con alta resiliencia.",
      highlights: [
        "Diseñé e implementé la arquitectura de microservicios con Node.js y Next.js, reduciendo la latencia de respuesta P99 en un 42% para más de 1.2M de usuarios activos mensuales.",
        "Automatice pipelines de despliegue continuo (CI/CD) con GitHub Actions y Kubernetes (EKS), reduciendo el tiempo de despliegue de 45 a 8 minutos y logrando una tasa de disponibilidad del 99.98%.",
        "Implementé caching distribuido con Redis y optimización de consultas en PostgreSQL, soportando picos de carga de hasta 15,000 transacciones por segundo durante eventos masivos.",
        "Mentoricé a un equipo de 6 ingenieros junior y mid-level en buenas prácticas de TypeScript estricto, Clean Architecture y pruebas automatizadas E2E.",
      ],
    },
    {
      id: "exp-2",
      company: "Nexus Software Labs",
      position: "Full Stack Software Developer",
      location: "Austin, TX (Remoto)",
      start_date: "2019-06",
      end_date: "2022-02",
      current: false,
      summary:
        "Desarrollo full-stack de aplicaciones web B2B de análisis financiero y procesamiento de datos en tiempo real.",
      highlights: [
        "Desarrollé paneles analíticos interactivos en tiempo real utilizando React, TypeScript, D3.js y WebSockets, procesando más de 500,000 eventos diarios con rendering optimizado a 60 FPS.",
        "Diseñé e integré APIs RESTful y GraphQL en Python (FastAPI) y PostgreSQL, acelerando la generación de reportes complejos en un 65%.",
        "Configuré entornos reproducibles con Docker y Docker Compose, estandarizando el onboarding de nuevos desarrolladores en menos de 2 horas.",
        "Aumenté la cobertura de pruebas unitarias y de integración del 35% al 88% usando Jest, React Testing Library y PyTest.",
      ],
    },
    {
      id: "exp-3",
      company: "Innova Digital Agency",
      position: "Frontend Developer",
      location: "Santiago, Chile",
      start_date: "2018-01",
      end_date: "2019-05",
      current: false,
      summary: "Construcción de interfaces web de alto impacto visual y optimización SEO.",
      highlights: [
        "Construí más de 14 plataformas web responsivas con React y arquitectura JAMstack, alcanzando puntajes superiores a 95 en Google Lighthouse (Performance, Accessibility, SEO).",
        "Optimicé el bundle de JavaScript mediante code-splitting y lazy-loading, logrando una reducción del 50% en el First Contentful Paint (FCP).",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "SchemaCV Engine & ATS Validator",
      description:
        "Motor de ingeniería de currículums de código abierto con renderizado tipográfico de precisión milimétrica, parser AST y sincronización bidireccional YAML en tiempo real.",
      technologies: ["Next.js 15", "TypeScript", "Tailwind CSS", "Zustand", "Rust/WASM"],
      url: "https://github.com/cmendoza-tech/schemacv-engine",
      highlights: [
        "Desarrollé el motor de validación contra 12 estándares ATS con feedback semántico instantáneo.",
        "Implementé exportación dual de alta fidelidad: PDF vectorial a 300 DPI y documentos nativos Microsoft Word DOCX.",
      ],
    },
    {
      id: "proj-2",
      name: "CloudMetrics Distributed Monitor",
      description:
        "Sistema ligero de observabilidad y telemetría distribuida para clústeres Kubernetes con alertas inteligentes y dashboard de bajo consumo de memoria.",
      technologies: ["Go", "React", "Prometheus", "Docker", "gRPC"],
      url: "https://github.com/cmendoza-tech/cloudmetrics",
      highlights: [
        "Arquitectura con recolección de métricas a menos de 5ms de overhead por nodo monitoreado.",
        "Más de 850 estrellas en GitHub y adoptado por más de 30 equipos de ingeniería.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universidad Técnica Federico Santa María",
      degree: "Ingeniería Civil en Informática (Software Engineering)",
      area: "Ciencias de la Computación y Sistemas Distribuidos",
      location: "Valparaíso, Chile",
      start_date: "2013-03",
      end_date: "2018-12",
      current: false,
      gpa: "Distinción Máxima (Top 5%)",
      highlights: [
        "Tesis de grado: Optimización de algoritmos de enrutamiento distribuido en redes heterogéneas.",
        "Ayudante de cátedra en Estructuras de Datos, Algoritmos y Sistemas Operativos durante 3 años consecutivos.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Professional (SAP-C02)",
      issuer: "Amazon Web Services",
      date: "2024-05",
      url: "https://aws.amazon.com/verification",
    },
    {
      id: "cert-2",
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation (CNCF)",
      date: "2023-11",
      url: "https://www.cncf.io/certification/cka/",
    },
    {
      id: "cert-3",
      name: "HashiCorp Certified: Terraform Associate (003)",
      issuer: "HashiCorp",
      date: "2023-08",
    },
  ],
  custom_sections: [],
  section_order: ["summary", "skills", "experience", "projects", "education", "certifications"],
  hidden_sections: [],
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
