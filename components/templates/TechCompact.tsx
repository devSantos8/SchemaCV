import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage, formatSocialDisplay } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const TechCompact: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
    section_order = [
      "skills",
      "experience",
      "projects",
      "education",
      "summary",
      "certifications",
    ],
  } = data;

  const lang: ResumeLanguage = (data.language as ResumeLanguage) || "es";
  const labels = SECTION_LABELS[lang] || SECTION_LABELS.es;

  const contactItems: { label: string; url?: string }[] = [];
  if (phone) contactItems.push({ label: phone });
  if (email) contactItems.push({ label: email, url: `mailto:${email}` });
  if (location) contactItems.push({ label: location });
  if (website) contactItems.push({ label: website.replace(/^https?:\/\//, ""), url: website });

  social_networks.forEach((sn) => {
    contactItems.push(formatSocialDisplay(sn));
  });

  return (
    <div
      className={`bg-white text-zinc-950 font-sans leading-tight w-full h-auto selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.45in 0.55in",
        fontSize: "9pt",
        fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header Compacto Tech en 1 Sola Línea */}
      <header className="pb-2 mb-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <h1 className="text-[18pt] font-black tracking-tight text-zinc-950 uppercase">
            {name || "Nombre Completo"}
          </h1>
          {headline && (
            <p className="text-[8.5pt] font-mono font-semibold text-zinc-700 mt-0.5">
              {headline}
            </p>
          )}
        </div>

        {/* Contacto en línea con pipes */}
        <div className="text-[8pt] font-mono text-zinc-600 flex flex-wrap gap-x-2 gap-y-0.5 sm:justify-end">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-950 underline underline-offset-2"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {idx < contactItems.length - 1 && <span className="text-zinc-300">|</span>}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Secciones de Alta Densidad */}
      <div className="space-y-2">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "skills":
              if (!skills || skills.length === 0) return null;
              return (
                <section key="skills" className="page-break-avoid">
                  <h2 className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1 font-mono">
                    // {labels.skills}
                  </h2>
                  <div className="space-y-0.5 text-[8.5pt] pl-0.5">
                    {skills.map((cat) => (
                      <div key={cat.id || cat.category} className="leading-snug">
                        <span className="font-bold text-zinc-950 font-mono text-[8pt] mr-1.5">
                          {cat.category}:{" "}
                        </span>
                        <span className="text-zinc-800">{cat.skills.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "experience":
              if (!experience || experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-1.5">
                  <h2 className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1 font-mono">
                    // {labels.experience}
                  </h2>
                  <div className="space-y-1.5 pl-0.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-[9pt] text-zinc-950">
                              {exp.position}
                            </span>
                            <span className="text-zinc-500 font-normal"> @ </span>
                            <span className="font-semibold text-[9pt] text-zinc-800">
                              {exp.company}
                            </span>
                            {exp.location && (
                              <span className="font-normal text-[8pt] text-zinc-500">
                                ({exp.location})
                              </span>
                            )}
                          </div>
                          <div className="text-[8pt] font-mono text-zinc-500 shrink-0">
                            {exp.start_date} – {exp.current ? labels.present : (exp.end_date || labels.present)}
                          </div>
                        </div>

                        {exp.summary && (
                          <p className="text-[8pt] text-zinc-600 mt-0.5 leading-tight">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-zinc-800 leading-snug mt-0.5">
                            {exp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!projects || projects.length === 0) return null;
              return (
                <section key="projects" className="space-y-1.5">
                  <h2 className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1 font-mono">
                    // {labels.projects}
                  </h2>
                  <div className="space-y-1.5 pl-0.5">
                    {projects.map((proj) => (
                      <div key={proj.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-[8.5pt] text-zinc-950">
                              {proj.name}
                            </span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="text-[7.5pt] font-mono text-zinc-500">
                                ({proj.technologies.join(", ")})
                              </span>
                            )}
                          </div>
                          {proj.start_date && (
                            <div className="text-[7.5pt] font-mono text-zinc-500 shrink-0">
                              {proj.start_date}
                              {proj.end_date ? ` – ${proj.end_date}` : ""}
                            </div>
                          )}
                        </div>

                        {proj.description && (
                          <p className="text-[8pt] text-zinc-600 leading-tight">
                            {proj.description}
                          </p>
                        )}

                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-zinc-800 leading-snug">
                            {proj.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "education":
              if (!education || education.length === 0) return null;
              return (
                <section key="education" className="page-break-avoid">
                  <h2 className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1 font-mono">
                    // {labels.education}
                  </h2>
                  <div className="space-y-1 pl-0.5">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-[8.5pt] text-zinc-950">
                            {edu.degree} {edu.area ? `en ${edu.area}` : ""}
                          </span>
                          <span className="text-zinc-400"> · </span>
                          <span className="font-medium text-[8.5pt] text-zinc-700">
                            {edu.institution}
                          </span>
                        </div>
                        <div className="text-[7.5pt] font-mono text-zinc-500 shrink-0">
                          {edu.start_date ? `${edu.start_date} – ` : ""}
                          {edu.current ? labels.present : (edu.end_date || labels.present)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="page-break-avoid">
                  <h2 className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1 font-mono">
                    // {labels.summary}
                  </h2>
                  <p className="text-[8.5pt] text-zinc-800 leading-snug pl-0.5">
                    {summary}
                  </p>
                </section>
              );

            case "certifications":
              if (!certifications || certifications.length === 0) return null;
              return (
                <section key="certifications" className="page-break-avoid">
                  <h2 className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1 font-mono">
                    // {labels.certifications}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 pl-0.5 text-[8pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <span className="font-semibold text-zinc-900">
                          {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ""}{" "}
                        </span>
                        {cert.date && (
                          <span className="text-zinc-500 font-mono text-[7.5pt] ml-1">
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
      </div>
    </div>
  );
};
