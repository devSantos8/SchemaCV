/**
 * Script CLI: ats:evaluate
 * Ejecuta la batería de auditoría ATS completa por línea de comandos.
 * 
 * Uso:
 *   npx tsx scripts/ats-evaluate-cli.ts --cv <archivo.pdf|archivo.json> --job <url|archivo.txt|"texto...">
 *   npx tsx scripts/ats-evaluate-cli.ts --cv examples/sample_senior_cloud.json --job "Buscamos Senior Cloud Engineer con AWS, Docker, Kubernetes, Terraform y 5+ años de exp..."
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import path from "path";
import { extractText } from "unpdf";
import { runATSEvaluationPipeline } from "../lib/ats";
import type { ResumeData } from "../types/resume";

function parseArgs() {
  const args = process.argv.slice(2);
  const options: { cv?: string; job?: string; out?: string; json?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cv" && args[i + 1]) {
      options.cv = args[++i];
    } else if (args[i] === "--job" && args[i + 1]) {
      options.job = args[++i];
    } else if (args[i] === "--out" && args[i + 1]) {
      options.out = args[++i];
    } else if (args[i] === "--json") {
      options.json = true;
    }
  }

  return options;
}

async function main() {
  const { cv, job, out, json } = parseArgs();

  console.log("\n============================================================");
  console.log(" 🔍 SchemaCV — Evaluador y Auditor ATS Automatizado (CLI)");
  console.log("============================================================\n");

  if (!cv || !job) {
    console.error("❌ Error: Faltan argumentos requeridos.");
    console.log("\nUso:");
    console.log("  npx tsx scripts/ats-evaluate-cli.ts --cv <cv.pdf|cv.json> --job <oferta.txt|url|\"texto...\">\n");
    process.exit(1);
  }

  // 1. Cargar CV
  let resumeData: ResumeData | undefined;
  let rawCvText: string | undefined;
  let sourceType: "schema_profile" | "uploaded_pdf" = "schema_profile";

  if (existsSync(cv)) {
    if (cv.endsWith(".json")) {
      try {
        resumeData = JSON.parse(readFileSync(cv, "utf-8")) as ResumeData;
        console.log(`✓ CV cargado como ResumeData JSON: ${cv}`);
      } catch (err) {
        console.error(`❌ Error al parsear JSON del CV: ${cv}`);
        process.exit(1);
      }
    } else if (cv.endsWith(".pdf")) {
      try {
        const buffer = readFileSync(cv);
        const { text } = await extractText(new Uint8Array(buffer));
        rawCvText = Array.isArray(text) ? text.join("\n") : String(text);
        sourceType = "uploaded_pdf";
        console.log(`✓ CV cargado y parseado desde PDF: ${cv} (${rawCvText.length} caracteres extraídos)`);
      } catch (err) {
        console.error(`❌ Error al extraer texto del PDF: ${cv}`);
        process.exit(1);
      }
    } else {
      rawCvText = readFileSync(cv, "utf-8");
      sourceType = "uploaded_pdf";
      console.log(`✓ CV cargado como texto: ${cv}`);
    }
  } else {
    console.error(`❌ Archivo de CV no encontrado: ${cv}`);
    process.exit(1);
  }

  // 2. Cargar Oferta de Empleo
  let jobDescription = job;
  let jobTitle = "Oferta Evaluada";
  let company = "Empresa Reclutadora";

  if (existsSync(job)) {
    jobDescription = readFileSync(job, "utf-8");
    console.log(`✓ Oferta cargada desde archivo: ${job}`);
  } else if (job.startsWith("http://") || job.startsWith("https://")) {
    console.log(`🌐 Extrayendo oferta desde URL: ${job}...`);
    try {
      const res = await fetch(job, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SchemaCV-Bot/1.0)" },
      });
      const html = await res.text();
      // Limpieza básica de HTML
      jobDescription = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      console.log(`✓ Oferta extraída (${jobDescription.length} caracteres)`);
    } catch (err) {
      console.error(`❌ No se pudo descargar la URL: ${job}`);
      process.exit(1);
    }
  }

  // 3. Ejecutar Pipeline Completo
  console.log("\n⚡ Ejecutando pipeline de auditoría y análisis...\n");

  const report = await runATSEvaluationPipeline({
    jobId: "cli-eval",
    jobTitle,
    company,
    jobDescription,
    resumeData,
    rawCvText,
    sourceType,
    profileName: path.basename(cv),
  });

  if (json) {
    console.log(JSON.stringify(report, null, 2));
    if (out) {
      writeFileSync(out, JSON.stringify(report, null, 2), "utf-8");
      console.log(`\n💾 Reporte guardado en: ${out}`);
    }
    return;
  }

  // 4. Salida en Consola Formateada
  console.log("------------------------------------------------------------");
  console.log(` 📊 RESULTADOS DE LA EVALUACIÓN ATS`);
  console.log("------------------------------------------------------------");
  console.log(` 🛡️  Compatibilidad de Formato ATS : ${report.atsScore} / 100`);
  console.log(` 🎯  Match con la Oferta           : ${report.matchScore} / 100`);
  console.log("------------------------------------------------------------\n");

  // Puntos Críticos
  if (report.criticalPoints.length > 0) {
    console.log("⚠️  PUNTOS CRÍTICOS DETECTADOS:");
    report.criticalPoints.forEach((cp, idx) => {
      console.log(`  ${idx + 1}. [${cp.type}] ${cp.title}`);
      console.log(`     Detalle: ${cp.description}`);
      console.log(`     Acción : ${cp.actionPrompt}\n`);
    });
  } else {
    console.log("✅ Sin bloqueos críticos de formato ni requisitos excluyentes ausentes.\n");
  }

  // Resumen de Reglas ATS
  console.log("📋 AUDITORÍA DE NORMAS ATS (B1 + B2):");
  report.auditRules.forEach((r) => {
    const symbol = r.status === "pass" ? "✓" : r.status === "warning" ? "⚠" : "✗";
    console.log(`  ${symbol} [${r.status.toUpperCase()}] ${r.name} (${r.scoreEarned}/${r.scoreWeight} pts)`);
    if (r.status !== "pass") {
      console.log(`     → ${r.message}`);
    }
  });

  // Desglose de Match
  console.log("\n🎯 DESGLOSE DE REQUISITOS Y COMPETENCIAS (B3):");
  console.log(`  • Hard Skills       : ${report.categoryBreakdown.hardSkills.matched}/${report.categoryBreakdown.hardSkills.total} (${report.categoryBreakdown.hardSkills.score}%)`);
  console.log(`  • Herramientas/Cloud: ${report.categoryBreakdown.toolsPlatforms.matched}/${report.categoryBreakdown.toolsPlatforms.total} (${report.categoryBreakdown.toolsPlatforms.score}%)`);
  console.log(`  • Soft Skills       : ${report.categoryBreakdown.softSkills.matched}/${report.categoryBreakdown.softSkills.total} (${report.categoryBreakdown.softSkills.score}%)`);
  console.log(`  • Años Experiencia  : ${report.categoryBreakdown.experienceYears.candidateYears} / ${report.categoryBreakdown.experienceYears.requiredYears ?? "—"} años (${report.categoryBreakdown.experienceYears.meets ? "Cumple ✓" : "Brecha detectada ✗"})`);

  if (report.missingKeywords.length > 0) {
    console.log("\n🔑 TOP KEYWORDS FALTANTES SUGERIDAS:");
    report.missingKeywords.slice(0, 8).forEach((kw, idx) => {
      console.log(`  ${idx + 1}. ${kw.text} [${kw.importance}] (+${kw.estimatedScoreGain}% match proyectado)`);
    });
  }

  console.log("\n💡 DIAGNÓSTICO GENERAL:");
  console.log(`  ${report.summaryText}\n`);

  if (out) {
    writeFileSync(out, JSON.stringify(report, null, 2), "utf-8");
    console.log(`💾 Reporte exportado a JSON: ${out}\n`);
  }

  console.log("============================================================\n");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
