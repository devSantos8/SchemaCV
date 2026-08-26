#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { verifyReleaseConsistency } from "./verify-release";

type BumpType = "patch" | "minor" | "major";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function calculateNextVersion(currentVersion: string, type: BumpType): string {
  const parts = currentVersion.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Versión actual inválida: ${currentVersion}`);
  }

  let [major, minor, patch] = parts;

  switch (type) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    case "patch":
      patch += 1;
      break;
  }

  return `${major}.${minor}.${patch}`;
}

function bump(type: BumpType) {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const manifestYamlPath = path.resolve(process.cwd(), "manifest.yaml");
  const changelogPath = path.resolve(process.cwd(), "CHANGELOG.md");
  const versionTsPath = path.resolve(process.cwd(), "lib/version.ts");

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const currentVersion = packageJson.version;
  const newVersion = calculateNextVersion(currentVersion, type);
  const today = new Date().toISOString().split("T")[0];

  console.log(`\n${c.cyan}${c.bold}======================================================================${c.reset}`);
  console.log(`${c.cyan}${c.bold}                  INCREMENTO AUTOMÁTICO DE VERSIÓN                    ${c.reset}`);
  console.log(`${c.cyan}${c.bold}======================================================================${c.reset}\n`);
  console.log(`  Versión actual : ${c.yellow}${currentVersion}${c.reset}`);
  console.log(`  Nueva versión  : ${c.green}${c.bold}${newVersion}${c.reset} (${type})\n`);

  // 1. Actualizar package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");
  console.log(`  [OK] package.json actualizado a v${newVersion}`);

  // 2. Actualizar manifest.yaml
  if (fs.existsSync(manifestYamlPath)) {
    const rawYaml = fs.readFileSync(manifestYamlPath, "utf8");
    const updatedYaml = rawYaml.replace(/^version:\s*["']?[^"'\n]+["']?/m, `version: ${newVersion}`);
    fs.writeFileSync(manifestYamlPath, updatedYaml, "utf8");
    console.log(`  [OK] manifest.yaml actualizado a v${newVersion}`);
  }

  // 3. Actualizar lib/version.ts
  if (fs.existsSync(versionTsPath)) {
    const rawTs = fs.readFileSync(versionTsPath, "utf8");
    const updatedTs = rawTs.replace(/releaseDate:\s*"[^"]*"/, `releaseDate: "${today}"`);
    fs.writeFileSync(versionTsPath, updatedTs, "utf8");
    console.log(`  [OK] lib/version.ts actualizado con fecha ${today}`);
  }

  // 4. Actualizar CHANGELOG.md
  if (fs.existsSync(changelogPath)) {
    const changelogContent = fs.readFileSync(changelogPath, "utf8");
    const newSectionHeader = `## [Unreleased]\n\n## [${newVersion}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- `;

    const updatedChangelog = changelogContent.replace("## [Unreleased]", newSectionHeader);
    fs.writeFileSync(changelogPath, updatedChangelog, "utf8");
    console.log(`  [OK] CHANGELOG.md actualizado con nueva sección [${newVersion}]`);
  }

  console.log(`\n----------------------------------------------------------------------\n`);

  // 5. Validar consistencia
  const verification = verifyReleaseConsistency();
  if (verification.passed) {
    console.log(`  ${c.green}${c.bold}[ÉXITO] Todos los archivos fueron actualizados y sincronizados.${c.reset}`);
    console.log(`  ${c.yellow}Recuerda describir los cambios en CHANGELOG.md antes de commitear.${c.reset}\n`);
  } else {
    console.log(`  ${c.red}${c.bold}[ERROR] Ocurrió un problema de validación.${c.reset}\n`);
  }
}

const arg = (process.argv[2] || "patch").toLowerCase() as BumpType;
if (!["patch", "minor", "major"].includes(arg)) {
  console.error(`Uso: npx tsx scripts/devops/bump-version.ts [patch | minor | major]`);
  process.exit(1);
}

bump(arg);
