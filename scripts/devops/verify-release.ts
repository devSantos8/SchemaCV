#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import yaml from "yaml";

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
  const manifestYamlPath = path.resolve(process.cwd(), "manifest.yaml");
  const versionModulePath = path.resolve(process.cwd(), "lib/version.ts");

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

  // 2. Validar manifest.yaml
  if (!fs.existsSync(manifestYamlPath)) {
    errors.push("No se encontró el archivo manifest.yaml en la raíz.");
  } else {
    try {
      const manifestContent = fs.readFileSync(manifestYamlPath, "utf8");
      const manifest = yaml.parse(manifestContent);

      if (!manifest || typeof manifest !== "object") {
        errors.push("manifest.yaml está vacío o no tiene una estructura YAML válida.");
      } else {
        if (manifest.version !== version) {
          errors.push(
            `Desfase de versión: manifest.yaml tiene '${manifest.version}' pero package.json tiene '${version}'.`
          );
        }
        if (!manifest.name) {
          errors.push("manifest.yaml debe incluir el campo 'name'.");
        }
        if (!manifest.ats_engine || typeof manifest.ats_engine !== "object") {
          errors.push("manifest.yaml debe incluir la sección 'ats_engine'.");
        }
      }
    } catch (parseErr: any) {
      errors.push(`Error de sintaxis al parsear manifest.yaml: ${parseErr.message}`);
    }
  }

  // 3. Validar CHANGELOG.md
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

  // 4. Validar lib/version.ts (Módulo TypeScript)
  if (!fs.existsSync(versionModulePath)) {
    errors.push("No se encontró el módulo lib/version.ts.");
  }

  if (errors.length > 0) {
    return {
      passed: false,
      message: `Inconsistencia de versión detectada (${errors.length} error(es)).`,
      details: errors,
    };
  }

  return {
    passed: true,
    message: `Versión v${version} sincronizada en package.json, manifest.yaml y CHANGELOG.md.`,
  };
}

if (require.main === module) {
  console.log(`\n${c.cyan}${c.bold}======================================================================${c.reset}`);
  console.log(`${c.cyan}${c.bold}            VERIFICACIÓN DE RELEASE, MANIFEST Y CHANGELOG             ${c.reset}`);
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
    console.log(`\n  ${c.yellow}Asegúrate de que package.json, manifest.yaml y CHANGELOG.md tengan la misma versión.${c.reset}\n`);
    process.exit(1);
  }
}
