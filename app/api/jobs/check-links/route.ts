import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import type { LinkCheckResult } from "@/types/jobs";

const limit = pLimit(5);

async function checkUrl(url: string): Promise<LinkCheckResult> {
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SchemaCV-Bot/1.0)" },
    });
    // Algunos servidores rechazan HEAD, reintenta con GET
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SchemaCV-Bot/1.0)" },
      });
    }
    clearTimeout(timeout);
    return { url, status: response.status, ok: response.ok, checkedAt };
  } catch {
    clearTimeout(timeout);
    return { url, status: null, ok: false, checkedAt };
  }
}

export async function POST(req: NextRequest) {
  let urls: string[];
  try {
    const body = await req.json() as { urls?: string[] };
    if (!Array.isArray(body.urls) || body.urls.length === 0) throw new Error();
    urls = body.urls.slice(0, 20); // max 20 URLs por request
  } catch {
    return NextResponse.json({ error: "Campo urls[] requerido." }, { status: 400 });
  }

  const results = await Promise.all(urls.map((url) => limit(() => checkUrl(url))));
  return NextResponse.json(results);
}
