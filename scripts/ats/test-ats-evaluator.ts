/**
 * Test Suite: Evaluador y Auditor ATS
 * Valida el funcionamiento del pipeline B1, B2, B3, B4 y el simulador proyectado.
 * 
 * Ejecución: npx tsx scripts/test-ats-evaluator.ts
 */
import { runATSEvaluationPipeline, calculateProjectedScore } from "@/lib/ats";
import type { ResumeData } from "@/types/resume";

const SAMPLE_ATS_COMPLIANT_CV: ResumeData = {
  name: "Carlos Mendoza",
  headline: "Senior Cloud & DevOps Engineer",
  email: "carlos.mendoza@email.com",
  phone: "+56 9 8765 4321",
  location: "Santiago, Chile",
  summary: "Ingeniero de Software con más de 6 años de experiencia especializándome en arquitecturas cloud, microservicios y Kubernetes.",
  skills: [
    { id: "sk-1", category: "Lenguajes", skills: ["TypeScript", "Python", "Go", "SQL"] },
    { id: "sk-2", category: "Cloud & DevOps", skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions"] },
    { id: "sk-3", category: "Databases", skills: ["PostgreSQL", "Redis", "MongoDB"] },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Tech Corp",
      position: "Senior DevOps Engineer",
      start_date: "2021-03",
      end_date: "Presente",
      current: true,
      location: "Santiago, Chile",
      highlights: [
        "Diseñé e implementé clústeres de Kubernetes en AWS EKS soportando 2M requests/día.",
        "Automaticé pipelines de CI/CD con GitHub Actions reduciendo el tiempo de despliegue en un 45%.",
      ],
    },
    {
      id: "exp-2",
      company: "Fintech SA",
      position: "Cloud Engineer",
      start_date: "2018-01",
      end_date: "2021-02",
      current: false,
      location: "Santiago, Chile",
      highlights: [
        "Migración de arquitectura monolítica a contenedores Docker sobre AWS.",
        "Implementación de infraestructura como código usando Terraform.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universidad de Chile",
      degree: "Ingeniería Civil en Informática",
      start_date: "2012-03",
      end_date: "2017-12",
      current: false,
      highlights: [],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services",
      date: "2022",
    },
  ],
  projects: [],
  social_networks: [],
  custom_sections: [],
  section_order: ["summary", "skills", "experience", "education", "certifications"],
};

const SAMPLE_JOB_OFFER = `
Buscamos Senior DevOps / Cloud Engineer para liderar nuestra infraestructura en la nube.

Requisitos Excluyentes (Must Have):
- Al menos 4 años de experiencia en roles DevOps o Cloud.
- Manejo avanzado de AWS (EC2, EKS, S3, IAM) y Docker.
- Experiencia sólida con Kubernetes y Terraform indispensable.
- Manejo de CI/CD con GitHub Actions.

Requisitos Deseables (Nice to Have):
- Conocimiento en Python o Go.
- Certificación AWS Solutions Architect.
- Experiencia con Kafka y Elasticsearch es un plus.
`;

async function runTests() {
  console.log("\n🧪 [test:ats-evaluator] Iniciando batería de pruebas unitarias y de integración...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASÓ: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FALLÓ: ${testName}`);
      failed++;
    }
  }

  // ─── Test 1: CV Estándar debe aprobar formato ATS con alto puntaje ───────────
  console.log("▶ Test 1: CV Estándar ATS-compliant");
  const reportGood = await runATSEvaluationPipeline({
    jobId: "test-1",
    jobTitle: "Senior DevOps Engineer",
    company: "CloudTech",
    jobDescription: SAMPLE_JOB_OFFER,
    resumeData: SAMPLE_ATS_COMPLIANT_CV,
    sourceType: "schema_profile",
  });

  assert(reportGood.atsScore >= 90, `ATS Score debe ser >= 90 (obtenido: ${reportGood.atsScore})`);
  assert(reportGood.matchScore >= 75, `Match Score debe ser >= 75 (obtenido: ${reportGood.matchScore})`);
  assert(reportGood.criticalPoints.length === 0, `No debe tener puntos críticos (obtenidos: ${reportGood.criticalPoints.length})`);
  assert(reportGood.simulation.detectedContact.email === "carlos.mendoza@email.com", "Email detectado correctamente");

  // ─── Test 2: CV con fallas de formato debe ser penalizado ───────────────────
  console.log("\n▶ Test 2: Detección de fallas críticas (Mojibake y Sin Contacto)");
  const badRawText = `
M1 TR4YECT0R14
Donde he estado en la vida:
â€¢ Experiencia con computaciÃ³n cuÃ¡ntica y programaciÃ³n avanzada.
➔ DiseÃ±Ã³ sistemas con mÃºltiples flechas y sÃ­mbolos raros.
`;

  const reportBad = await runATSEvaluationPipeline({
    jobId: "test-2",
    jobTitle: "Developer",
    company: "Acme",
    jobDescription: SAMPLE_JOB_OFFER,
    rawCvText: badRawText,
    sourceType: "uploaded_pdf",
  });

  assert(reportBad.atsScore < 70, `ATS Score de CV defectuoso debe ser penalizado (< 70, obtenido: ${reportBad.atsScore})`);
  assert(reportBad.simulation.encodingIssues.hasMojibake === true, "Debe detectar caracteres corruptos (mojibake)");
  assert(reportBad.criticalPoints.length > 0, "Debe reportar puntos críticos");

  // ─── Test 3: Simulador de Score Proyectado ──────────────────────────────────
  console.log("\n▶ Test 3: Simulador de Score Proyectado");
  const initialScore = reportGood.matchScore;
  const simulatedScore = calculateProjectedScore(
    initialScore,
    ["Kafka", "Elasticsearch"],
    reportGood.missingKeywords
  );

  assert(simulatedScore >= initialScore, "Score proyectado debe aumentar al agregar keywords");

  console.log(`\n============================================================`);
  console.log(` 🏁 RESUMEN: ${passed} pruebas pasaron, ${failed} fallaron.`);
  console.log(`============================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Error en test suite:", err);
  process.exit(1);
});
