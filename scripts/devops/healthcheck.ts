#!/usr/bin/env tsx
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { verifyReleaseConsistency } from "./verify-release";

// ─── Utilidades de formato ANSI para consola ────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  
  // Colores de texto
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  
  // Fondos
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgCyan: "\x1b[46m",
};

interface DiagnosticResult {
  category: string;
  name: string;
  passed: boolean;
  durationMs: number;
  message: string;
  details?: string[];
  fileLocation?: string;
  fixSuggestion?: string;
}

const results: DiagnosticResult[] = [];

function printHeader() {
  console.clear();
  console.log(`
${c.cyan}${c.bold}======================================================================${c.reset}
${c.cyan}${c.bold}                  SCHEMACV - PRE-FLIGHT HEALTHCHECK                   ${c.reset}
${c.cyan}${c.bold}           Diagnóstico y Análisis Integral de Código v1.0             ${c.reset}
${c.cyan}${c.bold}======================================================================${c.reset}
`);
}

function runCheck(
  category: string,
  name: string,
  fn: () => { passed: boolean; message: string; details?: string[]; fileLocation?: string; fixSuggestion?: string }
) {
  const start = Date.now();
  process.stdout.write(`  ${c.dim}[RUN]${c.reset} ${name}...`);
  try {
    const outcome = fn();
    const duration = Date.now() - start;
    process.stdout.write(`\r\x1b[K`);

    if (outcome.passed) {
      console.log(`  ${c.green}${c.bold}[OK]${c.reset}   ${name} ${c.dim}(${duration}ms)${c.reset}`);
    } else {
      console.log(`  ${c.red}${c.bold}[FAIL]${c.reset} ${name} ${c.dim}(${duration}ms)${c.reset}`);
    }

    results.push({
      category,
      name,
      durationMs: duration,
      ...outcome,
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    process.stdout.write(`\r\x1b[K`);
    console.log(`  ${c.red}${c.bold}[FAIL]${c.reset} ${name} ${c.dim}(${duration}ms)${c.reset}`);
    results.push({
      category,
      name,
      passed: false,
      durationMs: duration,
      message: err.message || "Excepción no controlada durante el análisis",
      details: err.stack ? [err.stack.split("\n")[1] || ""] : undefined,
    });
  }
}

// ─── 1. Verificación de Variables de Entorno (.env) ──────────────────────────
function checkEnvironmentVariables() {
  const envPath = path.resolve(process.cwd(), ".env");
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  const hasEnv = fs.existsSync(envPath) || fs.existsSync(envLocalPath);

  if (!hasEnv) {
    return {
      passed: false,
      message: "No se encontró el archivo .env ni .env.local en la raíz del proyecto.",
      fixSuggestion: "Crea un archivo .env con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const content = (fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, "utf8") : "") +
    (fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "");

  const missing: string[] = [];
  if (!content.includes("NEXT_PUBLIC_SUPABASE_URL")) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!content.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Variables críticas no configuradas en .env: ${missing.join(", ")}`,
      fileLocation: ".env",
      fixSuggestion: "Añade las credenciales de Supabase en tu archivo .env local.",
    };
  }

  return {
    passed: true,
    message: "Variables de entorno de Supabase configuradas correctamente.",
  };
}

// ─── 2. Verificación de Tipos TypeScript (tsc) ──────────────────────────────
function checkTypeScriptTypes() {
  try {
    execSync("npx tsc --noEmit", { stdio: "pipe", encoding: "utf8" });
    return {
      passed: true,
      message: "Todos los tipos e interfaces de TypeScript son válidos.",
    };
  } catch (err: any) {
    const rawOutput = (err.stdout || "") + (err.stderr || "");
    const lines = rawOutput.split("\n").filter((l: string) => l.includes("error TS"));
    
    const parsedErrors = lines.slice(0, 5).map((l: string) => {
      const match = l.match(/(.+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)/);
      if (match) {
        return `${match[1]}:${match[2]}:${match[3]} -> ${match[5]} [${match[4]}]`;
      }
      return l.trim();
    });

    const firstError = parsedErrors[0] || "Error en compilación de tipos";
    const fileMatch = firstError.match(/^([^:]+):(\d+):(\d+)/);

    return {
      passed: false,
      message: `Se encontraron ${lines.length} error(es) de TypeScript.`,
      details: parsedErrors,
      fileLocation: fileMatch ? `${fileMatch[1]} (Línea ${fileMatch[2]}, Columna ${fileMatch[3]})` : undefined,
      fixSuggestion: "Corrige los tipos incompatibles listados en el detalle.",
    };
  }
}

// ─── 3. Verificación de Calidad ESLint ───────────────────────────────────────
function checkESLint() {
  try {
    execSync("npx eslint", { stdio: "pipe", encoding: "utf8" });
    return {
      passed: true,
      message: "Código libre de errores de sintaxis y reglas de React/Next.js.",
    };
  } catch (err: any) {
    const rawOutput = (err.stdout || "") + (err.stderr || "");
    const errorLines = rawOutput.split("\n").filter((l: string) => l.toLowerCase().includes("error") && !l.includes("0 errors"));

    return {
      passed: errorLines.length === 0,
      message: errorLines.length === 0 ? "ESLint aprobado con advertencias no bloqueantes." : `ESLint detectó ${errorLines.length} error(es).`,
      details: errorLines.slice(0, 6),
      fixSuggestion: "Corrige los errores ejecutando 'npm run lint'.",
    };
  }
}

// ─── 4. Validación de la Capa de Prompts y Schemas Zod ──────────────────────
function checkAIPromptsAndSchemas() {
  try {
    const output = execSync("npx tsx scripts/ai/validate-prompts.ts", { stdio: "pipe", encoding: "utf8" });
    const passedAll = output.includes("TODAS LAS PRUEBAS DE LA CAPA DE PROMPTS PASARON EXITOSAMENTE (10/10)");
    
    return {
      passed: passedAll,
      message: passedAll ? "10/10 builders de prompts y parsers de IA sincronizados." : "Falló la validación de prompts de IA.",
    };
  } catch (err: any) {
    return {
      passed: false,
      message: "Error al ejecutar 'scripts/ai/validate-prompts.ts'",
      details: [(err.stdout || "").slice(-300)],
      fileLocation: "lib/ai/prompts.ts",
      fixSuggestion: "Verifica la consistencia entre los esquemas Zod y los builders de prompts.",
    };
  }
}

// ─── 5. Verificación de Integridad de Plantillas ATS ────────────────────────
function checkTemplatesIntegrity() {
  const templatesDir = path.resolve(process.cwd(), "components/templates");
  const requiredTemplates = [
    "ChileProfesional.tsx",
    "HarvardClassic.tsx",
    "TechMinimalist.tsx",
    "ModernExecutive.tsx",
    "SkillsFirstBuilder.tsx",
    "StanfordClean.tsx",
    "CompactSwiss.tsx",
    "ExecutiveSerif.tsx",
    "TechCompact.tsx",
    "ModernMinimal.tsx",
    "CareerChanger.tsx",
    "AcademicInternational.tsx",
  ];

  const missing = requiredTemplates.filter((t) => !fs.existsSync(path.join(templatesDir, t)));

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Faltan ${missing.length} archivos de plantilla en components/templates/`,
      details: missing,
      fixSuggestion: "Restaura los componentes de plantilla faltantes.",
    };
  }

  return {
    passed: true,
    message: "Las 12 plantillas ATS están presentes y accesibles.",
  };
}

// ─── 6. Ejecución del Diagnóstico y Renderizado del Informe ──────────────────
async function main() {
  printHeader();

  console.log(`${c.bold}Iniciando batería de análisis preventivo...${c.reset}\n`);

  runCheck("Configuración", "Variables de Entorno (.env)", checkEnvironmentVariables);
  runCheck("Tipado", "Verificación de Tipos TypeScript", checkTypeScriptTypes);
  runCheck("Calidad", "Análisis de Reglas ESLint", checkESLint);
  runCheck("IA & Schemas", "Validación de Capa de Prompts (Zod)", checkAIPromptsAndSchemas);
  runCheck("Plantillas ATS", "Integridad de las 12 Plantillas ATS", checkTemplatesIntegrity);
  runCheck("Release & Versión", "Consistencia de Versión y CHANGELOG", verifyReleaseConsistency);

  console.log(`\n${c.cyan}----------------------------------------------------------------------${c.reset}\n`);

  const allPassed = results.every((r) => r.passed);
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  if (allPassed) {
    console.log(`  ${c.green}${c.bold}[ESTADO: SATISFACTORIO]${c.reset}`);
    console.log(`  ${c.green}Todos los módulos superaron el diagnóstico (${totalDuration}ms).${c.reset}`);
    console.log(`  ${c.dim}Código verificado: sin errores de tipos, sintaxis ni dependencias.${c.reset}`);
    console.log(`\n  Comando para iniciar entorno de desarrollo: ${c.bold}npm run dev${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`  ${c.red}${c.bold}[ESTADO: FALLO DETECTADO]${c.reset}\n`);

    const failed = results.filter((r) => !r.passed);
    failed.forEach((f, idx) => {
      console.log(`  ${c.red}${c.bold}[${idx + 1}] ${f.name}${c.reset}`);
      console.log(`      Motivo: ${f.message}`);
      if (f.fileLocation) {
        console.log(`      Ubicación: ${c.underline}${f.fileLocation}${c.reset}`);
      }
      if (f.details && f.details.length > 0) {
        console.log(`      Detalle:`);
        f.details.forEach((d) => console.log(`        - ${d.trim()}`));
      }
      if (f.fixSuggestion) {
        console.log(`      Acción requerida: ${f.fixSuggestion}`);
      }
      console.log("");
    });

    console.log(`  ${c.red}Corrige los puntos anteriores antes de proceder al despliegue.${c.reset}\n`);
    process.exit(1);
  }
}

main();
