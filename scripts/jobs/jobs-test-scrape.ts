/**
 * Script: jobs:test-scrape
 * Prueba los parsers del scraper con HTML de fixtures locales.
 * Uso: npx tsx scripts/jobs-test-scrape.ts
 */
import { readFileSync, existsSync } from "fs";
import path from "path";

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures");

interface ParseResult {
  title: string;
  company: string;
  description: string;
  portal: string;
}

function parseLinkedIn(html: string): Partial<ParseResult> {
  const title = html.match(/<h1[^>]*class="[^"]*top-card-layout__title[^"]*"[^>]*>([^<]+)<\/h1>/)?.[1]?.trim()
    ?? html.match(/<title>([^|<]+)/)?.[1]?.trim() ?? "";
  const company = html.match(/class="[^"]*topcard__org-name[^"]*"[^>]*>[\s]*([^<]+)/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) ?? "";
  return { title, company, description, portal: "LinkedIn" };
}

function parseGreenhouse(html: string): Partial<ParseResult> {
  const title = html.match(/<h1[^>]*class="[^"]*app-title[^"]*"[^>]*>([^<]+)<\/h1>/)?.[1]?.trim()
    ?? html.match(/<h1>([^<]+)<\/h1>/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/id="content"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) ?? "";
  return { title, description, portal: "Greenhouse" };
}

const PARSERS: Record<string, (html: string) => Partial<ParseResult>> = {
  "linkedin.html": parseLinkedIn,
  "greenhouse.html": parseGreenhouse,
};

console.log("\n[jobs:test-scrape] Probando parsers con fixtures...\n");

let passed = 0;
let failed = 0;

for (const [filename, parser] of Object.entries(PARSERS)) {
  const fixturePath = path.join(FIXTURES_DIR, filename);
  if (!existsSync(fixturePath)) {
    console.log(`⚠  ${filename}: fixture no encontrado (${fixturePath})`);
    continue;
  }
  try {
    const html = readFileSync(fixturePath, "utf-8");
    const result = parser(html);
    const ok = result.title && result.title.length > 0;
    if (ok) {
      console.log(`✓  ${filename}:`);
      console.log(`   titulo: ${result.title}`);
      console.log(`   empresa: ${result.company || "(no detectada)"}`);
      console.log(`   descripcion: ${result.description?.slice(0, 80)}...`);
      passed++;
    } else {
      console.log(`✗  ${filename}: No se extrajo titulo`);
      failed++;
    }
  } catch (err) {
    console.log(`✗  ${filename}: Error — ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

console.log(`\n[jobs:test-scrape] ${passed} pasaron, ${failed} fallaron.\n`);
if (failed > 0) process.exit(1);
