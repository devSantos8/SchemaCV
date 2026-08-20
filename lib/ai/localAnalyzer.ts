import type { Keyword, MatchAnalysis } from "@/types/jobs";
import type { ResumeData } from "@/types/resume";
import { COMMON_SKILLS_TAXONOMY } from "@/lib/taxonomy/skillsTaxonomy";

// Stopwords que no aportan valor como keywords
const STOPWORDS = new Set([
  "el","la","los","las","un","una","unos","unas","de","del","en","con","por","para","que","a","al","y","o","es","su","se","le","lo","me","te","nos","vos","como","si","no","mas","pero","ya","todo","muy","bien","son","ser","estar","tener","hacer","dia","mes","ano","trabajo","empresa","equipo","cargo","puesto","rol","posicion","experiencia","anos","conocimiento","manejo","nivel","basico","intermedio","avanzado","requerido","deseable","indispensable","valorable","buscamos","ofrecemos","requisitos","funciones","responsabilidades","habilidades","competencias"
]);

// Extrae tokens limpios de un texto
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

// Cuenta frecuencia de tokens
function countFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

/**
 * Extrae keywords localmente desde la descripcion de la oferta.
 * Combina frecuencia de tokens + lookup en la taxonomia de habilidades.
 */
export function extractKeywordsLocal(description: string): Keyword[] {
  const tokens = tokenize(description);
  const freq = countFrequency(tokens);

  // Bigrams
  const bigrams: Map<string, number> = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1);
  }

  const candidates = new Map<string, { text: string; frequency: number }>();

  // Buscar skills de la taxonomia en los tokens
  for (const skill of COMMON_SKILLS_TAXONOMY) {
    const skillName = skill.name;
    const lower = skillName.toLowerCase();
    const singleFreq = freq.get(lower) ?? 0;
    const bigramFreq = bigrams.get(lower) ?? 0;
    // Tambien verificar aliases si existen
    let aliasFreq = 0;
    if (skill.aliases) {
      for (const alias of skill.aliases) {
        aliasFreq += freq.get(alias.toLowerCase()) ?? 0;
      }
    }
    const total = singleFreq + bigramFreq + aliasFreq;
    if (total > 0) {
      candidates.set(lower, { text: skillName, frequency: total });
    }
  }

  // Tokens frecuentes con simbolos tecnicos no en taxonomia
  for (const [token, count] of freq.entries()) {
    if (count >= 2 && !candidates.has(token) && token.length > 3) {
      if (/[0-9]/.test(token) || token.includes(".") || token.includes("#") || token.includes("+")) {
        candidates.set(token, { text: token, frequency: count });
      }
    }
  }

  const result: Keyword[] = Array.from(candidates.values())
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 30)
    .map((c) => ({
      text: c.text,
      frequency: c.frequency,
      matched: false,
      source: "local" as const,
    }));

  return result;
}

/**
 * Calcula el puntaje de match entre las keywords de la oferta y el CV del usuario.
 */
export function computeMatchScore(
  keywords: Keyword[],
  resumeData: ResumeData
): Omit<MatchAnalysis, "suggestions" | "explanation"> {
  const cvText = [
    resumeData.summary ?? "",
    ...(resumeData.skills ?? []).flatMap((s) => [s.category, ...s.skills]),
    ...(resumeData.experience ?? []).flatMap((e) => [
      e.position,
      e.company,
      ...(e.highlights ?? []),
      e.summary ?? "",
    ]),
    ...(resumeData.projects ?? []).flatMap((p) => [
      p.name,
      p.description ?? "",
      ...(p.technologies ?? []),
      ...(p.highlights ?? []),
    ]),
    ...(resumeData.certifications ?? []).map((c) => c.name),
  ]
    .join(" ")
    .toLowerCase();

  const matched: Keyword[] = [];
  const missing: Keyword[] = [];

  for (const kw of keywords) {
    const isMatch = cvText.includes(kw.text.toLowerCase());
    if (isMatch) {
      matched.push({ ...kw, matched: true });
    } else {
      missing.push({ ...kw, matched: false });
    }
  }

  const score = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 0;

  return {
    score,
    matched,
    missing,
    generatedBy: "local" as const,
    generatedAt: new Date().toISOString(),
  };
}
