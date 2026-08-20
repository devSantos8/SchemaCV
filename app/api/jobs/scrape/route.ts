import { NextRequest, NextResponse } from "next/server";
import type { ScrapeResult } from "@/types/jobs";

// Rate limiting basico en memoria (se resetea al reiniciar el servidor)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Parsers por portal ────────────────────────────────────────────────────────
function parseLinkedIn(html: string): Partial<ScrapeResult> {
  const title = html.match(/<h1[^>]*class="[^"]*top-card-layout__title[^"]*"[^>]*>([^<]+)<\/h1>/)?.[1]?.trim()
    ?? html.match(/<title>([^|<]+)/)?.[1]?.trim() ?? "";
  const company = html.match(/class="[^"]*topcard__org-name[^"]*"[^>]*>[\s]*([^<]+)/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return { title, company, description, portal: "LinkedIn" };
}

function parseGreenhouse(html: string): Partial<ScrapeResult> {
  const title = html.match(/<h1[^>]*class="[^"]*app-title[^"]*"[^>]*>([^<]+)<\/h1>/)?.[1]?.trim()
    ?? html.match(/<h1>([^<]+)<\/h1>/)?.[1]?.trim() ?? "";
  const company = html.match(/class="[^"]*company[^"]*"[^>]*>([^<]+)<\/[^>]+>/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/id="content"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return { title, company, description, portal: "Greenhouse" };
}

function parseLever(html: string): Partial<ScrapeResult> {
  const title = html.match(/<h2[^>]*class="[^"]*posting-name[^"]*"[^>]*>([^<]+)<\/h2>/)?.[1]?.trim()
    ?? html.match(/<title>([^|<]+)/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/class="[^"]*section-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return { title, description, portal: "Lever" };
}

function parseGetOnBoard(html: string): Partial<ScrapeResult> {
  const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() ?? "";
  const company = html.match(/class="[^"]*company-name[^"]*"[^>]*>([^<]+)<\/[^>]+>/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return { title, company, description, portal: "GetOnBoard" };
}

function parseWorkday(html: string): Partial<ScrapeResult> {
  const title = html.match(/<title>([^|<-]+)/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return { title, description, portal: "Workday" };
}

function parseIndeed(html: string): Partial<ScrapeResult> {
  const title = html.match(/<title>([^-<]+)/)?.[1]?.trim() ?? "";
  const company = html.match(/class="[^"]*companyName[^"]*"[^>]*>([^<]+)<\/[^>]+>/)?.[1]?.trim() ?? "";
  const descMatch = html.match(/id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return { title, company, description, portal: "Indeed" };
}

// Fallback generico con Readability
async function parseFallback(html: string, url: string): Promise<Partial<ScrapeResult>> {
  try {
    // Importacion dinamica para evitar bundle en edge
    const { Readability } = await import("@mozilla/readability");
    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return {
      title: article?.title ?? "",
      description: article?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      portal: "Web",
    };
  } catch {
    // Extraccion minima si falla Readability
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
    const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);
    return { title, description: text, portal: "Web" };
  }
}

function detectPortal(url: string): string {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("greenhouse.io")) return "greenhouse";
  if (url.includes("lever.co")) return "lever";
  if (url.includes("getonbrd.com") || url.includes("getonboard")) return "getonboard";
  if (url.includes("workday.com") || url.includes("myworkdayjobs.com")) return "workday";
  if (url.includes("indeed.com")) return "indeed";
  return "generic";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit superado. Espera un minuto." }, { status: 429 });
  }

  let url: string;
  try {
    const body = await req.json() as { url?: string };
    if (!body.url) throw new Error("URL requerida");
    url = body.url;
    new URL(url); // Valida formato
  } catch {
    return NextResponse.json({ error: "URL invalida o cuerpo malformado." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SchemaCV-Bot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `El portal respondio con estado ${response.status}. Pega la descripcion manualmente.` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const portal = detectPortal(url);

    let parsed: Partial<ScrapeResult> = {};
    switch (portal) {
      case "linkedin": parsed = parseLinkedIn(html); break;
      case "greenhouse": parsed = parseGreenhouse(html); break;
      case "lever": parsed = parseLever(html); break;
      case "getonboard": parsed = parseGetOnBoard(html); break;
      case "workday": parsed = parseWorkday(html); break;
      case "indeed": parsed = parseIndeed(html); break;
      default: parsed = await parseFallback(html, url);
    }

    const result: ScrapeResult = {
      title: parsed.title || "Sin titulo",
      company: parsed.company || "Sin empresa",
      description: parsed.description || "",
      publishedAt: parsed.publishedAt,
      location: parsed.location,
      salary: parsed.salary,
      portal: parsed.portal,
    };

    return NextResponse.json(result);
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "Tiempo de espera agotado (10s). Pega la descripcion manualmente."
          : "No se pudo acceder a la URL. Pega la descripcion manualmente.",
      },
      { status: 502 }
    );
  }
}
