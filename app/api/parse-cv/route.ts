import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { ResumeData, ResumeSchema } from "@/types/resume";
import { classifySkillsIntoCategories } from "@/lib/taxonomy/skillsTaxonomy";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Parser heurístico local cuando no hay API Key configurada.
 */
function parseResumeHeuristically(rawText: string): ResumeData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Extraer datos de contacto con Regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,9}/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const websiteMatch = rawText.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.(?:dev|io|me|com|net|org|cl|co|es))(?:\/[^\s]*)?/i);

  // Nombre (primera línea corta no vacía)
  let name = "Tu Nombre";
  for (const line of lines.slice(0, 5)) {
    if (line.length > 2 && line.length < 50 && !line.includes("@") && !line.includes("http")) {
      name = line.replace(/^[#*\s-]+/, "");
      break;
    }
  }

  // Titular profesional (segunda línea o inferido)
  let headline = "Desarrollador de Software";
  for (const line of lines.slice(1, 6)) {
    if (
      line !== name &&
      line.length > 3 &&
      line.length < 70 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !phoneMatch?.[0]?.includes(line)
    ) {
      headline = line;
      break;
    }
  }

  // 2. Extraer habilidades y categorizarlas
  const detectedSkills = classifySkillsIntoCategories(
    rawText.split(/[,|\n;•\-]+/).map((s) => s.trim())
  );

  const skills = detectedSkills.map((cat, idx) => ({
    id: `skill-${Date.now()}-${idx}`,
    category: cat.category,
    skills: cat.skills,
  }));

  // 3. Extraer bloques de experiencia y educación básicos
  const experience = [
    {
      id: `exp-parsed-${Date.now()}-1`,
      company: "Experiencia Profesional",
      position: headline || "Ingeniero de Software",
      start_date: "2023",
      end_date: "Presente",
      current: true,
      highlights: lines
        .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"))
        .slice(0, 5)
        .map((l) => l.replace(/^[•\-*]\s*/, "")),
      summary: "Responsable de desarrollo y optimización de soluciones técnicas.",
    },
  ];

  const education = [
    {
      id: `edu-parsed-${Date.now()}-1`,
      institution: "Universidad / Instituto",
      degree: "Ingeniería en Informática / Ciencias de la Computación",
      area: "Desarrollo de Software",
      start_date: "2020",
      end_date: "2024",
      current: false,
      highlights: [],
    },
  ];

  const social_networks = [];
  if (linkedinMatch) {
    social_networks.push({
      network: "LinkedIn",
      username: linkedinMatch[1],
      url: `https://linkedin.com/in/${linkedinMatch[1]}`,
      icon: "linkedin",
    });
  }
  if (githubMatch) {
    social_networks.push({
      network: "GitHub",
      username: githubMatch[1],
      url: `https://github.com/${githubMatch[1]}`,
      icon: "github",
    });
  }

  return {
    name,
    headline,
    summary:
      lines.find((l) => l.length > 80 && !l.startsWith("•") && !l.includes("@")) ||
      "Profesional con experiencia en desarrollo de software y resolución de problemas técnicos.",
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    location: "Santiago, Chile",
    website: websiteMatch ? websiteMatch[0] : undefined,
    social_networks,
    skills: skills.length > 0 ? skills : [
      {
        id: "skill-lang-default",
        category: "Languages",
        skills: ["TypeScript", "JavaScript", "Python", "SQL"],
      },
    ],
    experience,
    projects: [],
    education,
    certifications: [],
    custom_sections: [],
    section_order: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    let rawText = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("text") as string | null;

      if (pastedText) {
        rawText = pastedText;
      } else if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const { text } = await extractText(new Uint8Array(arrayBuffer));
        rawText = Array.isArray(text) ? text.join("\n") : String(text || "");
      }
    } else {
      const body = await req.json();
      rawText = body.text || "";
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del documento proporcionado." },
        { status: 400 }
      );
    }

    // Si existe API Key de Google/Gemini configurada en el entorno, usamos Vercel AI SDK
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const { object } = await generateObject({
          model: google("gemini-1.5-flash"),
          schema: ResumeSchema,
          prompt: `Eres un experto internacional en ATS (Applicant Tracking Systems) y reclutamiento técnico.
Analiza el siguiente texto de un currículum o perfil de LinkedIn y estructúralo de manera rigurosa bajo el esquema tipado.
Reglas clave:
1. Normaliza los nombres de empresas, cargos, fechas (formato 'Mes AAAA' o 'AAAA-MM') y ubicaciones.
2. Separa y redacta las viñetas de logros (highlights) usando verbos de acción fuertes y fórmulas de impacto cuantificable (STAR / XYZ).
3. Clasifica las habilidades técnicas en sus categorías canónicas (Languages, Frameworks & Libraries, Cloud & DevOps, Databases & Storage, Tools & Platforms, Methodologies & Soft Skills).
4. No omitas ningún dato relevante.

Texto crudo del CV:
"""
${rawText.slice(0, 15000)}
"""`,
        });

        return NextResponse.json({ success: true, data: object, source: "ai" });
      } catch (aiErr) {
        console.warn("Fallo en procesamiento con IA, usando fallback heurístico:", aiErr);
      }
    }

    // Fallback heurístico inteligente
    const heuristicData = parseResumeHeuristically(rawText);
    return NextResponse.json({
      success: true,
      data: heuristicData,
      source: "heuristic",
    });
  } catch (error: any) {
    console.error("Error en /api/parse-cv:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el currículum." },
      { status: 500 }
    );
  }
}
