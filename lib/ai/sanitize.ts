/**
 * /lib/ai/sanitize.ts
 * Utilidades de sanitizado, limpieza de HTML y control de longitud para entradas de IA.
 */

/**
 * Elimina etiquetas HTML, scripts, estilos y decodifica entidades comunes.
 */
export function stripHtml(input: string): string {
  if (!input) return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&[a-z0-9]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

/**
 * Trunca un texto de forma segura sin romper palabras si es posible.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || "";

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace).trim() + "…";
  }
  return truncated.trim() + "…";
}

/**
 * Sanitiza una cadena para su uso seguro en prompts (limpia HTML y trunca).
 */
export function sanitizePromptText(input: string, maxLength: number = 6000): string {
  if (!input) return "";
  const cleaned = stripHtml(input);
  return truncateText(cleaned, maxLength);
}

/**
 * Detecta si un texto está predominantemente en Español o Inglés.
 */
export function detectLanguage(text: string): "es" | "en" {
  if (!text) return "es";

  const sample = text.toLowerCase().slice(0, 1500);

  const esTokens = [
    "experiencia",
    "educacion",
    "educación",
    "habilidades",
    "proyectos",
    "requisitos",
    "responsabilidades",
    "trabajo",
    "puesto",
    "empresa",
    "funciones",
    "desarrollo",
    "conocimiento",
    "años",
  ];

  const enTokens = [
    "experience",
    "education",
    "skills",
    "projects",
    "requirements",
    "responsibilities",
    "job",
    "position",
    "company",
    "development",
    "knowledge",
    "years",
    "summary",
  ];

  let esScore = 0;
  let enScore = 0;

  for (const token of esTokens) {
    if (sample.includes(token)) esScore += 2;
  }
  for (const token of enTokens) {
    if (sample.includes(token)) enScore += 2;
  }

  return enScore > esScore ? "en" : "es";
}
