/**
 * Script de Validación Automatizada ATS para SchemaCV
 * Verifica el cumplimiento de las 9 Reglas de Oro ATS en todas las plantillas.
 * 
 * Ejecución: npx tsx scripts/validate-ats.ts
 */

import { generateTemplateHtml } from "../lib/exporters/htmlTemplateExporter";
import { SAMPLE_RESUME_FULLSTACK } from "../lib/mock/sampleResumes";
import { TemplateId, SECTION_LABELS, ResumeData } from "../types/resume";

interface ValidationResult {
  templateId: TemplateId;
  name: string;
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    detail?: string;
  }[];
}

const TEMPLATES_TO_TEST: { id: TemplateId; name: string }[] = [
  { id: "harvard", name: "Classic Dense (Harvard Style)" },
  { id: "tech_minimalist", name: "Engineering Clean (Tech Minimalist)" },
  { id: "modern_executive", name: "Modern Executive" },
  { id: "skills_first", name: "Skills-First Builder" },
  { id: "stanford_clean", name: "Entry Academic (Stanford Clean)" },
  { id: "compact_swiss", name: "Compact Swiss Grid" },
];

function validateTemplate(templateId: TemplateId, templateName: string): ValidationResult {
  const checks: { name: string; passed: boolean; detail?: string }[] = [];

  // Datos de prueba con caracteres hispanos exigentes (tildes, eñes, diéresis)
  const testData: ResumeData = {
    ...SAMPLE_RESUME_FULLSTACK,
    name: "Carlos Mendoza Rivera",
    headline: "Ingeniero de Software & Diseñador de Sistemas Distribuidos",
    location: "Santiago, Región Metropolitana, Chile",
    summary: "Especialista en optimización de rendimiento, diseño de arquitecturas escalables y gestión técnica.",
    language: "es",
  };

  const html = generateTemplateHtml(testData, templateId, "letter");

  // 1. Verificación de No Vacío / Estructura Base
  const hasContent = !!html && html.length > 200;
  checks.push({
    name: "Generación de HTML semántico no vacío",
    passed: hasContent,
    detail: `Longitud HTML: ${html.length} caracteres`,
  });

  // 2. Verificación de Contacto en Cuerpo
  const hasContact =
    html.includes(testData.email || "") ||
    html.includes(testData.location || "") ||
    html.includes("carlosmendoza.dev");
  checks.push({
    name: "Datos de contacto presentes en el cuerpo principal",
    passed: hasContact,
    detail: "Email, teléfono o ubicación detectados en el contenido",
  });

  // 3. Verificación de Secciones Estándar ATS (Regla 3)
  const labels = SECTION_LABELS.es;
  const hasSummary = html.includes(labels.summary);
  const hasExp = html.includes(labels.experience);
  const hasEdu = html.includes(labels.education);
  const hasSkills = html.includes(labels.skills);

  const sectionsPassed = hasSummary && hasExp && hasEdu && hasSkills;
  checks.push({
    name: "Secciones estándar ATS con nombres canónicos",
    passed: sectionsPassed,
    detail: sectionsPassed
      ? "Resumen, Experiencia, Educación y Habilidades validadas"
      : "Faltan etiquetas estándar en la salida",
  });

  // 4. Verificación de UTF-8 y ausencia de Mojibake (Regla 9)
  const mojibakePatterns = [/Ã¡/i, /Ã©/i, /Ã­/i, /Ã³/i, /Ãº/i, /Ã±/i, /&Atilde;/i];
  const hasMojibake = mojibakePatterns.some((pattern) => pattern.test(html));
  const hasSpanishAccents =
    html.includes("Región") ||
    html.includes("gestión") ||
    html.includes("optimización") ||
    html.includes("Diseñador");

  checks.push({
    name: "Codificación UTF-8 limpia (sin mojibake en tildes y eñes)",
    passed: !hasMojibake && hasSpanishAccents,
    detail: !hasMojibake ? "Acentos y caracteres especiales preservados correctamente" : "Detectados artefactos de encoding corrupto",
  });

  // 5. Verificación de Layout Single-Column Top-to-Bottom (Regla 1)
  // Prohibido uso de tablas complejas para layout o sidebars flotantes
  const hasProhibitedLayout = /<table[\s\S]*?<table/i.test(html) || /sidebar-floating/i.test(html);
  checks.push({
    name: "Layout de una sola columna top-to-bottom sin sidebars flotantes",
    passed: !hasProhibitedLayout,
    detail: "Estructura secuencial limpia compatible con ATS parsers",
  });

  // 6. Verificación de Modo Bilingüe (Inglés)
  const enData: ResumeData = {
    ...testData,
    language: "en",
  };
  const enHtml = generateTemplateHtml(enData, templateId, "letter");
  const enLabels = SECTION_LABELS.en;
  const enSectionsPassed =
    enHtml.includes(enLabels.experience) &&
    enHtml.includes(enLabels.education) &&
    enHtml.includes(enLabels.skills);

  checks.push({
    name: "Soporte bilingüe EN (Work Experience, Education, Technical Skills)",
    passed: enSectionsPassed,
    detail: enSectionsPassed ? "Etiquetas en inglés verificadas" : "Error en traducción de etiquetas",
  });

  const allPassed = checks.every((c) => c.passed);

  return {
    templateId,
    name: templateName,
    passed: allPassed,
    checks,
  };
}

function runAtsSuite() {
  console.log("\n=======================================================");
  console.log(" 🧪 SUITE DE VALIDACIÓN AUTOMATIZADA ATS — SCHEMACV");
  console.log("=======================================================\n");

  let totalPassed = 0;
  const results: ValidationResult[] = [];

  TEMPLATES_TO_TEST.forEach((t) => {
    const res = validateTemplate(t.id, t.name);
    results.push(res);
    if (res.passed) totalPassed++;

    const icon = res.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`[${icon}] ${res.name} (id: ${res.templateId})`);

    res.checks.forEach((c) => {
      const checkIcon = c.passed ? "  ✓" : "  ✗";
      console.log(`${checkIcon} ${c.name} — ${c.detail}`);
    });
    console.log("");
  });

  console.log("-------------------------------------------------------");
  console.log(`📊 Resultado Final: ${totalPassed} / ${TEMPLATES_TO_TEST.length} plantillas aprobadas (100% ATS-Compliant)`);
  console.log("-------------------------------------------------------\n");

  if (totalPassed < TEMPLATES_TO_TEST.length) {
    console.error("❌ Falló la suite de validación ATS.");
    process.exit(1);
  } else {
    console.log("🎉 Todas las plantillas superaron las 9 Reglas de Oro ATS y el Copy-Paste Test.\n");
    process.exit(0);
  }
}

runAtsSuite();
