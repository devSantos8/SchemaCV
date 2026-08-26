/**
 * Script: jobs:seed
 * Genera datos de ejemplo de postulaciones en formato JSON para importar en el store.
 * Uso: npx tsx scripts/jobs-seed.ts
 */
import { writeFileSync } from "fs";

const SAMPLE_JOBS = [
  {
    id: "seed-001",
    title: "Senior Full Stack Developer",
    company: "Acme Technologies",
    url: "https://example.com/jobs/fullstack",
    status: "applied",
    description: "We are looking for a Senior Full Stack Developer with experience in React, Node.js, TypeScript, PostgreSQL, Docker, and AWS. You will design and implement scalable microservices, lead technical reviews, and mentor junior developers.",
    notes: "Envie CV el 15 de agosto. Esperando respuesta.",
    location: "Santiago, Chile (Remoto)",
    salary: "$2500 - $3500 USD/mes",
    portal: "LinkedIn",
    keywords: [],
    activity: [
      { id: "a1", type: "note", description: "Postulacion creada", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
      { id: "a2", type: "status_change", description: 'Estado cambiado a "applied"', createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    appliedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "seed-002",
    title: "Backend Engineer — Python/FastAPI",
    company: "FinTech Startup",
    url: "https://example.com/jobs/backend",
    status: "interviewing",
    description: "Backend Engineer role focused on Python, FastAPI, PostgreSQL, Redis, Kubernetes and CI/CD pipelines. Experience with event-driven architectures (Kafka) is a plus.",
    notes: "Entrevista tecnica el 20 de agosto a las 10am.",
    location: "Buenos Aires, Argentina (Hibrido)",
    salary: "$2000 - $3000 USD/mes",
    portal: "GetOnBoard",
    keywords: [],
    activity: [
      { id: "b1", type: "note", description: "Postulacion creada", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
      { id: "b2", type: "interview", description: "Entrevista tecnica programada", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    appliedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "seed-003",
    title: "Frontend Developer — React",
    company: "Digital Agency",
    url: undefined,
    status: "bookmarked",
    description: "Frontend developer with React, Next.js, TypeScript, Tailwind CSS and performance optimization experience. Familiarity with GraphQL and testing (Jest, Cypress) required.",
    notes: "",
    location: "Remoto",
    portal: "Indeed",
    keywords: [],
    activity: [
      { id: "c1", type: "note", description: "Postulacion creada", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Escribir como JSON listo para importar
const output = {
  state: {
    applications: SAMPLE_JOBS,
    selectedId: null,
    isScrapingUrl: false,
    isCheckingLinks: false,
    isAnalyzing: false,
  },
  version: 0,
};

writeFileSync("tests/fixtures/seed-jobs.json", JSON.stringify(output, null, 2), "utf-8");
console.log(`[jobs:seed] Seed generado: tests/fixtures/seed-jobs.json (${SAMPLE_JOBS.length} postulaciones)`);
console.log("[jobs:seed] Copia el contenido en localStorage[schemacv-jobs] para usar en desarrollo.");
