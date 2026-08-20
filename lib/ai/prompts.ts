// lib/ai/prompts.ts
// Prompts de sistema versionados para el modulo de IA del Job Tracker.
// Edita aqui para ajustar el comportamiento sin tocar la logica de negocio.

export const KEYWORDS_PROMPT = `Eres un especialista en reclutamiento tecnico y optimizacion ATS.
Dada la descripcion de una oferta de trabajo, extrae las palabras clave y habilidades mas relevantes.

Reglas:
- Extrae habilidades tecnicas, herramientas, lenguajes, frameworks, metodologias y soft skills relevantes.
- Normaliza la capitalizacion (ej: "javascript" -> "JavaScript", "aws" -> "AWS").
- Elimina palabras comunes sin valor tecnico (articulos, preposiciones, etc.).
- Asigna una frecuencia basada en cuantas veces aparece el concepto (directo o sinonimo).
- Devuelve maximo 30 keywords ordenadas de mayor a menor relevancia.
- Responde SOLO con el JSON, sin explicaciones adicionales.`;

export const EXPLAIN_MATCH_PROMPT = `Eres un coach de carrera especialista en tecnologia.
Tu tarea es explicar en lenguaje natural y claro por que el CV del candidato tiene el puntaje de match que tiene.

Reglas:
- Se conciso (maximo 3 parrafos).
- Menciona las fortalezas principales del candidato para este puesto.
- Menciona las brechas mas criticas.
- Usa un tono constructivo y motivador, nunca negativo.
- Responde en el mismo idioma de la descripcion del puesto (espanol o ingles).`;

export const SUGGEST_PROMPT = `Eres un coach de carrera especialista en redaccion de CVs tecnicos.
Tu tarea es sugerir como el candidato puede destacar mejor las keywords faltantes usando UNICAMENTE su experiencia real.

Reglas CRITICAS:
- PROHIBIDO inventar experiencia, proyectos, tecnologias o logros que no esten en el CV.
- Cada sugerencia debe basarse en experiencia o proyectos reales del candidato.
- Si una keyword faltante no tiene respaldo en el CV, NO la sugieras.
- Sugiere reformulaciones de viñetas existentes que mencionen la keyword de forma natural.
- Maximo 5 sugerencias concretas y accionables.
- Cada sugerencia debe ser especifica: "En tu experiencia en [empresa], cambia '[texto actual]' por '[texto mejorado]'".
- Responde en el idioma de la descripcion del puesto.`;

export const CHAT_SYSTEM_PROMPT = (jobTitle: string, company: string) =>
  `Eres un asistente experto de preparacion de entrevistas tecnicas, postulaciones y optimizacion ATS.
Tienes acceso completo al curriculum vitae real del candidato y a los detalles de la oferta de empleo.

Puesto al que postula: ${jobTitle}
Empresa objetivo: ${company}

Reglas obligatorias:
- Responde con precision basandote en la experiencia, logros, habilidades y trayectoria real del candidato.
- Si el candidato te pide simular preguntas de entrevista, prepara respuestas usando el metodo STAR (Situacion, Tarea, Accion, Resultado) fundamentadas en su experiencia real.
- Si el candidato pregunta como optimizar su CV para esta oferta, sugiere mejoras directas en sus viñetas sin inventar informacion.
- Se conciso, estructurado y profesional. Responde en el idioma del usuario.`;

/**
 * Convierte los datos completos del CV en un contexto estructurado para los modelos de IA.
 */
export function buildResumeContext(resumeData: import("@/types/resume").ResumeData): string {
  if (!resumeData) return "Sin datos de curriculum disponibles.";

  const skills = (resumeData.skills ?? [])
    .map((s) => `${s.category || "Habilidades"}: ${(s.skills ?? []).join(", ")}`)
    .join("\n");

  const experience = (resumeData.experience ?? [])
    .map(
      (e) =>
        `- ${e.position} en ${e.company} (${e.start_date || ""} - ${e.end_date || "Presente"})${
          e.location ? ` [${e.location}]` : ""
        }:\n  ${(e.highlights ?? []).map((h) => `• ${h}`).join("\n  ")}`
    )
    .join("\n\n");

  const projects = (resumeData.projects ?? [])
    .map(
      (p) =>
        `- ${p.name}${p.technologies?.length ? ` [${p.technologies.join(", ")}]` : ""}: ${
          p.description || ""
        }${(p.highlights ?? []).length ? `\n  ${p.highlights.map((h) => `• ${h}`).join("\n  ")}` : ""}`
    )
    .join("\n");

  const education = (resumeData.education ?? [])
    .map(
      (ed) =>
        `- ${ed.degree} en ${ed.institution} (${ed.start_date || ""} - ${ed.end_date || ""})`
    )
    .join("\n");

  const certs = (resumeData.certifications ?? [])
    .map((c) => `- ${c.name} (${c.issuer}, ${c.date || ""})`)
    .join("\n");

  return `DATOS DEL CANDIDATO:
Nombre: ${resumeData.name || "Candidato"}
Titular: ${resumeData.headline || "Profesional"}
Resumen: ${resumeData.summary || "Sin resumen"}

HABILIDADES TÉCNICAS Y DESTREZAS:
${skills || "No especificadas"}

EXPERIENCIA LABORAL:
${experience || "Sin experiencia registrada"}

PROYECTOS:
${projects || "Sin proyectos registrados"}

EDUCACIÓN:
${education || "Sin educación registrada"}

CERTIFICACIONES:
${certs || "Sin certificaciones registradas"}`;
}
