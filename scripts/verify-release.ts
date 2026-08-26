#!/usr/bin/env tsx
import fs from "fs";
import path from "path";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

export function verifyReleaseConsistency(): { passed: boolean; message: string; details?: string[] } {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const changelogPath = path.resolve(process.cwd(), "CHANGELOG.md");
  const manifestPath = path.resolve(process.cwd(), "lib/version.ts");

  const errors: string[] = [];

  // 1. Validar package.json
  if (!fs.existsSync(packageJsonPath)) {
    errors.push("No se encontró el archivo package.json.");
    return { passed: false, message: "package.json no encontrado", details: errors };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const version = packageJson.version;

  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-[\w.-]+)?$/;
  if (!version || !semverRegex.test(version)) {
    errors.push(`La versión en package.json ("${version}") no cumple con el estándar Semantic Versioning (X.Y.Z).`);
  }

  // 2. Validar CHANGELOG.md
  if (!fs.existsSync(changelogPath)) {
    errors.push("No se encontró el archivo CHANGELOG.md.");
  } else {
    const changelogContent = fs.readFileSync(changelogPath, "utf8");
    const versionHeaderRegex = new RegExp(`##\\s*\\[${version.replace(/\./g, "\\.")}\\]`, "m");

    if (!versionHeaderRegex.test(changelogContent)) {
      errors.push(
        `CHANGELOG.md no contiene una entrada documentada para la versión actual [${version}]. Agrega '## [${version}] - YYYY-MM-DD'.`
      );
    }
  }

  // 3. Validar lib/version.ts (Manifiesto de la aplicación)
  if (!fs.existsSync(manifestPath)) {
    errors.push("No se encontró el archivo de manifiesto lib/version.ts.");
  }

  if (errors.length > 0) {
    return {
      passed: false,
      message: `Inconsistencia en versión o CHANGELOG (${errors.length} problemas detectados).`,
      details: errors,
    };
  }

  return {
    passed: true,
    message: `Versión v${version} y CHANGELOG.md verificados y sincronizados.`,
  };
}

if (require.main === module) {
  console.log(`\n${c.cyan}${c.bold}======================================================================${c.reset}`);
  console.log(`${c.cyan}${c.bold}            VERIFICACIÓN DE RELEASE, MANIFIESTO Y CHANGELOG           ${c.reset}`);
  console.log(`${c.cyan}${c.bold}======================================================================${c.reset}\n`);

  const result = verifyReleaseConsistency();

  if (result.passed) {
    console.log(`  ${c.green}${c.bold}[OK]${c.reset}   ${result.message}\n`);
    process.exit(0);
  } else {
    console.log(`  ${c.red}${c.bold}[FAIL]${c.reset} ${result.message}\n`);
    if (result.details) {
      result.details.forEach((d) => console.log(`  ${c.red}- ${d}${c.reset}`));
    }
    console.log(`\n  ${c.yellow}Actualiza CHANGELOG.md o package.json antes de continuar.${c.reset}\n`);
    process.exit(1);
  }
}
