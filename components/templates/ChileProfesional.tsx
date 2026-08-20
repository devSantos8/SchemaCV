import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage, formatSocialDisplay } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const ChileProfesional: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
  const {
    name,
    headline,
    summary,
    email,
    phone,
    location,
    website,
    social_networks = [],
    skills = [],
    experience = [],
    projects = [],
    education = [],
    certifications = [],
    custom_sections = [],
    section_order = [
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
    ],
  } = data;

  const lang: ResumeLanguage = (data.language as ResumeLanguage) || "es";
  const labels = SECTION_LABELS[lang] || SECTION_LABELS.es;

  // Formatear items de contacto estándar Chile
  const contactItems: { label: string; url?: string }[] = [];
  if (location) contactItems.push({ label: location });
  if (phone) contactItems.push({ label: phone.startsWith("+") ? phone : `+56 9 ${phone}` });
  if (email) contactItems.push({ label: email, url: `mailto:${email}` });
  if (website) contactItems.push({ label: website.replace(/^https?:\/\//, ""), url: website });

  social_networks.forEach((sn) => {
    contactItems.push(formatSocialDisplay(sn));
  });

  return (
    <div
      className={`bg-white text-zinc-900 font-sans leading-normal w-full h-auto selection:bg-blue-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.42in 0.52in",
        fontSize: "9.2pt",
        fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─── ENCABEZADO FORMATO CHILE / LATAM TECH & CORPORATIVO ─── */}
      <header className="border-b-2 border-zinc-900 pb-2 mb-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[20pt] font-black tracking-tight text-zinc-950 uppercase leading-none">
            {name || "Tu Nombre Completo"}
          </h1>
          {headline && (
            <p className="text-[10.5pt] font-bold text-blue-800 dark:text-blue-600 tracking-normal mt-0.5">
              {headline}
            </p>
          )}

          {/* Fila de Contacto Canónica Accesible */}
          {contactItems.length > 0 && (
            <div className="text-[8.5pt] text-zinc-700 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 font-medium">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-700 hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {idx < contactItems.length - 1 && <span className="text-zinc-400 font-bold">|</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ─── RENDERIZADO SECUENCIAL ATS ─── */}
      <div className="space-y-2.5">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="space-y-0.5">
                  <h2 className="text-[9.5pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                    {labels.summary}
                  </h2>
                  <p className="text-[8.8pt] text-zinc-800 leading-normal text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "skills":
              if (skills.length === 0) return null;
              return (
                <section key="skills" className="space-y-1">
                  <h2 className="text-[9.5pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                    {labels.skills}
                  </h2>
                  <div className="space-y-0.5 text-[8.8pt]">
                    {skills.map((cat) => (
                      <div key={cat.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                        <span className="font-bold text-zinc-950 min-w-[130px] shrink-0">
                          {cat.category}:{" "}
                        </span>
                        <span className="text-zinc-800 font-normal">
                          {cat.skills.join(" • ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "experience":
              if (experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-1.5">
                  <h2 className="text-[9.5pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                    {labels.experience}
                  </h2>
                  <div className="space-y-2">
                    {experience.map((exp) => (
                      <article key={exp.id} className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-x-2">
                          <h3 className="text-[9.5pt] font-bold text-zinc-950">
                            {`${exp.position} | ${exp.company}`}
                            {exp.location && <span className="ml-1.5 font-sans font-normal text-zinc-600">({exp.location})</span>}
                          </h3>
                          <div className="text-[8.5pt] font-semibold text-zinc-600 shrink-0 font-mono">
                            {exp.start_date} – {exp.current ? labels.present : (exp.end_date || labels.present)}
                          </div>
                        </div>

                        {exp.summary && (
                          <p className="text-[8.5pt] text-zinc-700 italic">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-[9pt] text-zinc-800 leading-snug">
                            {exp.highlights.map((h, i) => (
                              <li key={i} className="pl-0.5">
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );

            case "education":
              if (education.length === 0) return null;
              return (
                <section key="education" className="space-y-1.5">
                  <h2 className="text-[9.5pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                    {labels.education}
                  </h2>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <article key={edu.id} className="space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-x-2">
                          <h3 className="text-[9.5pt] font-bold text-zinc-950">
                            {`${edu.degree}${edu.area ? ` en ${edu.area}` : ""} — ${edu.institution}`}
                          </h3>
                          <div className="text-[8.5pt] font-semibold text-zinc-600 shrink-0 font-mono">
                            {edu.start_date ? `${edu.start_date} → ` : ""}
                            {edu.current ? labels.present : (edu.end_date || labels.present)}
                          </div>
                        </div>
                        {edu.gpa && (
                          <p className="text-[8.5pt] text-zinc-600 font-mono font-medium">
                            GPA / Distinción: {edu.gpa}
                          </p>
                        )}
                        {edu.highlights && edu.highlights.some((h) => h && h.trim()) && (
                          <ul className="list-disc pl-4 space-y-0.5 text-[8.5pt] text-zinc-700 leading-snug mt-1">
                            {edu.highlights
                              .filter((h) => h && h.trim())
                              .map((h, i) => (
                                <li key={i} className="pl-0.5">{h}</li>
                              ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (projects.length === 0) return null;
              return (
                <section key="projects" className="space-y-1.5">
                  <h2 className="text-[10pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                    {labels.projects}
                  </h2>
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <article key={proj.id} className="space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-x-2">
                          <h3 className="text-[9.5pt] font-bold text-zinc-950 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <span>{proj.name}</span>
                            {proj.github_url && (
                              <a
                                href={proj.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[8pt] font-mono text-blue-700 hover:underline font-semibold"
                              >
                                [GitHub]
                              </a>
                            )}
                            {proj.url && (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[8pt] font-mono text-blue-700 hover:underline font-semibold"
                              >
                                [Demo]
                              </a>
                            )}
                          </h3>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="text-[8.5pt] font-mono text-zinc-600">
                              {proj.technologies.join(" • ")}
                            </span>
                          )}
                        </div>

                        {proj.description && proj.description.trim() && (
                          <p className="text-[8.5pt] text-zinc-700">
                            {proj.description}
                          </p>
                        )}

                        {proj.highlights && proj.highlights.some((h) => h && h.trim()) && (
                          <ul className="list-disc pl-4 space-y-0.5 text-[9pt] text-zinc-800 leading-snug">
                            {proj.highlights
                              .filter((h) => h && h.trim())
                              .map((h, i) => (
                                <li key={i} className="pl-0.5">
                                  {h}
                                </li>
                              ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );

            case "certifications":
              if (certifications.length === 0) return null;
              return (
                <section key="certifications" className="space-y-1">
                  <h2 className="text-[10pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                    {labels.certifications}
                  </h2>
                  <div className="space-y-1 text-[9pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <span className="font-semibold text-zinc-900">
                          {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ""}{" "}
                        </span>
                        {cert.date && (
                          <span className="text-[8.5pt] text-zinc-600 font-mono">
                            ({cert.date})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}

        {/* Secciones Personalizadas */}
        {custom_sections.map((custom) => {
          if (!custom.title || custom.entries.length === 0) return null;
          return (
            <section key={custom.id} className="space-y-1">
              <h2 className="text-[10pt] font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-0.5">
                {custom.title}
              </h2>
              <div className="space-y-1.5">
                {custom.entries.map((entry) => (
                  <div key={entry.id} className="text-[9pt]">
                    <div className="flex justify-between items-baseline font-bold text-zinc-950">
                      <span>{entry.title}</span>
                      {entry.date && <span className="font-mono text-[8.5pt] text-zinc-600">{entry.date}</span>}
                    </div>
                    {entry.subtitle && <p className="text-[8.5pt] text-zinc-700">{entry.subtitle}</p>}
                    {entry.description && <p className="text-zinc-800 leading-snug mt-0.5">{entry.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
