/**
 * scripts/validate-prompts.ts
 * Batería de pruebas unitarias para la capa de Prompts de IA (/lib/ai/prompts.ts).
 *
 * Ejecutar con: npx tsx scripts/validate-prompts.ts
 */

import {
  PROMPTS_VERSION,
  ATS_EXPERT_BASE,
  RECOMMENDED_PARAMS,
  buildExtractKeywordsPrompt,
  buildExplainMatchPrompt,
  buildSuggestImprovementsPrompt,
  buildATSAuditNarrativePrompt,
  buildBulletRewriterPrompt,
  buildCoverLetterPrompt,
  buildChatSystemPrompt,
  buildResumeContext,
  parseKeywordExtractionOutput,
  parseImprovementSuggestionsOutput,
  parseBulletRewriterOutput,
  stripHtml,
  truncateText,
  sanitizePromptText,
  detectLanguage,
} from "../lib/ai/prompts";
import type { ResumeData } from "../types/resume";

const mockResume: ResumeData = {
  name: "Joain Matias Monroy",
  headline: "Software Engineer | Full Stack & AI Engineering",
  email: "joain@example.com",
  phone: "+1 234 567 890",
  location: "Santiago, Chile",
  social_networks: [],
  custom_sections: [],
  section_order: ["summary", "experience", "skills", "projects", "education", "certifications"],
  summary:
    "Ingeniero de software con 3 años de experiencia en desarrollo full-stack con TypeScript, React y Node.js.",
  skills: [
    { id: "1", category: "Lenguajes & Frameworks", skills: ["TypeScript", "React", "Next.js", "Node.js"] },
    { id: "2", category: "Bases de Datos & Cloud", skills: ["PostgreSQL", "Supabase", "Docker", "AWS"] },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Tech Corp",
      position: "Full Stack Developer",
      start_date: "Ene 2024",
      end_date: "Presente",
      current: true,
      location: "Remoto",
      highlights: [
        "Desarrollé microservicios en TypeScript reduciendo la latencia de API en 35%.",
        "Diseñé arquitectura de frontend con Next.js y Zustand mejorando el LCP en 40%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universidad Técnica",
      degree: "Ingeniería en Informática",
      start_date: "2019",
      end_date: "2023",
      current: false,
      highlights: [],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "SchemaCV",
      technologies: ["Next.js", "TypeScript", "TailwindCSS"],
      description: "Generador de CVs optimizados para ATS con validación determinista.",
      highlights: ["Implementé validador de 12 plantillas ATS."],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2024",
    },
  ],
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log(`\n🧪 INICIANDO VALIDACIÓN DE LA CAPA DE PROMPTS (v${PROMPTS_VERSION})\n`);

// ── 1. Principios Transversales ──
console.log("1️⃣ Verificando ATS_EXPERT_BASE y Versionado...");
assert(PROMPTS_VERSION === "1.0.0", "PROMPTS_VERSION debe ser 1.0.0");
assert(ATS_EXPERT_BASE.includes("REGLA DE ORO DE HONESTIDAD"), "Debe contener la REGLA DE ORO");
assert(ATS_EXPERT_BASE.includes("Workday"), "Debe citar Workday");
assert(ATS_EXPERT_BASE.includes("Greenhouse"), "Debe citar Greenhouse");
assert(ATS_EXPERT_BASE.includes("NUNCA inventes experiencia"), "Debe prohibir inventar experiencia");
console.log("  ✓ ATS_EXPERT_BASE verificado correctamente.");

// ── 2. Sanitizado y Helpers ──
console.log("\n2️⃣ Verificando Sanitizado y Detección de Idioma...");
const dirtyHtml = "<script>alert('xss')</script><p>Buscamos <b>Desarrollador React</b> &amp; Node.js &nbsp;</p>";
const cleaned = stripHtml(dirtyHtml);
assert(!cleaned.includes("<script>"), "stripHtml debe eliminar scripts");
assert(!cleaned.includes("<p>"), "stripHtml debe eliminar tags HTML");
assert(cleaned.includes("&"), "stripHtml debe decodificar &amp;");
assert(cleaned.includes("Desarrollador React"), "stripHtml debe preservar texto limpio");

const longText = "A ".repeat(100);
assert(truncateText(longText, 50).length <= 53, "truncateText debe respetar longitud");

assert(detectLanguage("Requisitos: 3 años de experiencia en desarrollo web con React y Node.js") === "es", "Debe detectar español");
assert(detectLanguage("Requirements: 3 years of experience in software development with React and Node.js") === "en", "Debe detectar inglés");
console.log("  ✓ Sanitizado y helpers de idioma aprobados.");

// ── 3. C1: extractKeywords Builder & Parser ──
console.log("\n3️⃣ Verificando C1: extractKeywords Prompt y Parser...");
const kwPrompt = buildExtractKeywordsPrompt({
  jobTitle: "Senior Frontend Engineer",
  company: "Stripe",
  description: "Buscamos ingeniero con experiencia en React, TypeScript y Tailwind CSS.",
});
assert(kwPrompt.system.includes(ATS_EXPERT_BASE), "System prompt debe incluir ATS_EXPERT_BASE");
assert(kwPrompt.user.includes("Senior Frontend Engineer"), "User prompt debe incluir el puesto");
assert(kwPrompt.user.includes("Stripe"), "User prompt debe incluir la empresa");

// Parser C1
const validKwJson = {
  keywords: [
    { term: "React", category: "hard_skill", importance: "required", frequency: 4, synonyms: ["React.js"] },
    { term: "TypeScript", category: "hard_skill", importance: "required", frequency: 3, synonyms: ["TS"] },
  ],
  yearsExperienceRequired: 3,
  educationRequired: "Licenciatura",
};
const parsedKw = parseKeywordExtractionOutput(validKwJson);
assert(parsedKw.keywords.length === 2, "Debe parsear 2 keywords");
assert(parsedKw.keywords[0].term === "React", "Keyword 1 debe ser React");
assert(parsedKw.yearsExperienceRequired === 3, "Años de experiencia debe ser 3");
console.log("  ✓ extractKeywords builder y parser aprobados.");

// ── 4. C2: explainMatch Builder ──
console.log("\n4️⃣ Verificando C2: explainMatch Prompt...");
const matchPrompt = buildExplainMatchPrompt({
  jobTitle: "Full Stack Engineer",
  score: 82,
  categoryScores: { hardSkills: 90, experience: 80, education: 100 },
  matchedKeywords: ["TypeScript", "React", "PostgreSQL"],
  missingKeywords: ["GraphQL", "Redis"],
  criticalIssues: ["Falta experiencia formal con Redis."],
  resumeSummary: mockResume.summary,
});
assert(matchPrompt.user.includes("82 / 100"), "User prompt debe incluir el puntaje exacto");
assert(matchPrompt.user.includes("TypeScript, React, PostgreSQL"), "User prompt debe incluir matched keywords");
assert(matchPrompt.user.includes("GraphQL, Redis"), "User prompt debe incluir missing keywords");
assert(matchPrompt.system.includes("3 Fortalezas"), "System prompt debe solicitar 3 fortalezas");
assert(matchPrompt.system.includes("3 Brechas"), "System prompt debe solicitar 3 brechas");
console.log("  ✓ explainMatch builder aprobado.");

// ── 5. C3: suggestImprovements Builder & Parser ──
console.log("\n5️⃣ Verificando C3: suggestImprovements Prompt y Parser...");
const suggestPrompt = buildSuggestImprovementsPrompt({
  missingKeywords: ["GraphQL", "Kubernetes"],
  resumeData: mockResume,
});
assert(suggestPrompt.user.includes("GraphQL, Kubernetes"), "User prompt debe contener las keywords faltantes");
assert(suggestPrompt.user.includes("Tech Corp"), "User prompt debe incluir la experiencia real del candidato");
assert(suggestPrompt.system.includes("backed = true"), "System prompt debe instruir sobre backed true/false");

// Parser C3
const validSuggestJson = {
  suggestions: [
    {
      keyword: "GraphQL",
      backed: false,
      section: "projects",
      acquisitionPath: "Desarrolla una API pequeña usando Apollo Server y Next.js.",
      priority: "high",
      rationale: "Requisito deseable en la oferta.",
    },
    {
      keyword: "TypeScript",
      backed: true,
      section: "experience",
      bulletExample: "Desarrollé microservicios en TypeScript reduciendo latencia en 35%.",
      priority: "high",
      rationale: "Alineación directa con la oferta.",
    },
  ],
};
const parsedSuggest = parseImprovementSuggestionsOutput(validSuggestJson);
assert(parsedSuggest.suggestions.length === 2, "Debe parsear 2 sugerencias");
assert(parsedSuggest.suggestions[0].backed === false, "Sugerencia 1 debe ser no backed");
assert(parsedSuggest.suggestions[1].backed === true, "Sugerencia 2 debe ser backed");
console.log("  ✓ suggestImprovements builder y parser aprobados.");

// ── 6. C4: atsAuditNarrative Builder ──
console.log("\n6️⃣ Verificando C4: atsAuditNarrative Prompt...");
const auditPrompt = buildATSAuditNarrativePrompt({
  overallScore: 65,
  rulesPassed: ["Contacto en el cuerpo", "Fuentes estándar"],
  rulesFailed: [
    {
      ruleId: "A1",
      title: "Encabezados no estándar",
      severity: "critical",
      description: "Se detectó el heading 'Mis Trabajos' en lugar de 'Experiencia Laboral'.",
      detail: "Los ATS no indexarán tus empleos.",
    },
  ],
  candidateName: "Joain Matias",
});
assert(auditPrompt.user.includes("65 / 100"), "User prompt debe incluir score");
assert(auditPrompt.user.includes("[CRITICAL] Encabezados no estándar"), "User prompt debe incluir regla fallida");
assert(auditPrompt.system.includes("NUNCA contradecir ni suavizar"), "Debe exigir fidelidad al validador");
console.log("  ✓ atsAuditNarrative builder aprobado.");

// ── 7. C5: bulletRewriter Builder & Parser ──
console.log("\n7️⃣ Verificando C5: bulletRewriter Prompt y Parser...");
const bulletPrompt = buildBulletRewriterPrompt({
  originalBullet: "Hice la página web con React y mejoré el rendimiento.",
  targetKeywords: ["React", "LCP", "Optimización"],
  experienceContext: { position: "Frontend Dev", company: "StartUp X" },
});
assert(bulletPrompt.user.includes("Hice la página web con React"), "Debe contener el bullet original");
assert(bulletPrompt.user.includes("React, LCP, Optimización"), "Debe contener las target keywords");

// Parser C5
const validBulletJson = {
  originalBullet: "Hice la página web con React.",
  variants: [
    {
      text: "Diseñé e implementé la interfaz de usuario con React y TypeScript, mejorando la velocidad de carga.",
      keywordsIncluded: ["React", "TypeScript"],
      actionVerb: "Diseñé",
      explanation: "Usa verbo de acción fuerte y especifica tecnologías.",
    },
    {
      text: "Lideré la optimización frontend en React reduciendo los tiempos de respuesta.",
      keywordsIncluded: ["React"],
      actionVerb: "Lideré",
      explanation: "Enfocado en liderazgo y rendimiento.",
    },
  ],
  tips: ["Cuantifica el porcentaje de mejora si tienes la métrica real."],
};
const parsedBullet = parseBulletRewriterOutput(validBulletJson);
assert(parsedBullet.variants.length === 2, "Debe contener 2 variantes");
assert(parsedBullet.variants[0].actionVerb === "Diseñé", "Debe identificar el verbo de acción");
console.log("  ✓ bulletRewriter builder y parser aprobados.");

// ── 8. C6: coverLetter Builder ──
console.log("\n8️⃣ Verificando C6: coverLetter Prompt...");
const coverPrompt = buildCoverLetterPrompt({
  resumeData: mockResume,
  jobTitle: "Senior Full Stack Engineer",
  company: "Mercado Libre",
  jobDescription: "Buscamos profesionales con experiencia en microservicios y React.",
  matchedKeywords: ["TypeScript", "Next.js", "PostgreSQL"],
});
assert(coverPrompt.user.includes("Mercado Libre"), "User prompt debe contener la empresa");
assert(coverPrompt.user.includes("Senior Full Stack Engineer"), "User prompt debe contener el puesto");
assert(coverPrompt.system.includes("Máximo 250 palabras"), "System prompt debe limitar a 250 palabras");
assert(coverPrompt.system.includes("3 párrafos"), "System prompt debe exigir 3 párrafos");
console.log("  ✓ coverLetter builder aprobado.");

// ── 9. C7: chat Contextual System Prompt ──
console.log("\n9️⃣ Verificando C7: chat Contextual System Prompt...");
const chatSystem = buildChatSystemPrompt({
  jobTitle: "Lead Architect",
  company: "FinTech Global",
  jobDescription: "Liderar la arquitectura de microservicios y pagos en la nube.",
  resumeData: mockResume,
  score: 88,
  matchedKeywords: ["TypeScript", "AWS", "Docker"],
  missingKeywords: ["Kubernetes", "Kafka"],
});
assert(chatSystem.includes("Lead Architect"), "Chat system prompt debe incluir el puesto");
assert(chatSystem.includes("FinTech Global"), "Chat system prompt debe incluir la empresa");
assert(chatSystem.includes("88 / 100"), "Chat system prompt debe incluir el match score");
assert(chatSystem.includes("Joain Matias Monroy"), "Chat system prompt debe incluir el nombre del candidato");
assert(chatSystem.includes("RECHAZA la solicitud respetuosamente"), "Debe rechazar inventar experiencia");
console.log("  ✓ chat system prompt dinámico aprobado.");

// ── 10. Recommended Parameters ──
console.log("\n🔟 Verificando RECOMMENDED_PARAMS...");
assert(RECOMMENDED_PARAMS.extractKeywords.temperature === 0.2, "extractKeywords temp debe ser 0.2");
assert(RECOMMENDED_PARAMS.explainMatch.temperature === 0.4, "explainMatch temp debe ser 0.4");
assert(RECOMMENDED_PARAMS.suggestImprovements.temperature === 0.3, "suggestImprovements temp debe ser 0.3");
assert(RECOMMENDED_PARAMS.chat.temperature === 0.7, "chat temp debe ser 0.7");
console.log("  ✓ RECOMMENDED_PARAMS verificados para las 7 skills.");

console.log("\n==================================================================");
console.log("🎉 TODAS LAS PRUEBAS DE LA CAPA DE PROMPTS PASARON EXITOSAMENTE (10/10)");
console.log("==================================================================\n");
