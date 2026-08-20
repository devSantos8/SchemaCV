import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const AcademicInternational: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "education",
      "experience",
      "projects",
      "skills",
      "summary",
      "certifications",
    ],
  } = data;

  const lang: ResumeLanguage = (data.language as ResumeLanguage) || "es";
  const labels = SECTION_LABELS[lang] || SECTION_LABELS.es;

  const contactItems: { label: string; url?: string }[] = [];
  if (location) contactItems.push({ label: location });
  if (phone) contactItems.push({ label: phone });
  if (email) contactItems.push({ label: email, url: `mailto:${email}` });
  if (website) contactItems.push({ label: website.replace(/^https?:\/\//, ""), url: website });

  social_networks.forEach((sn) => {
    contactItems.push({
      label: sn.username ? `${sn.network}: ${sn.username}` : sn.network,
      url: sn.url,
    });
  });

  return (
    <div
      className={`bg-white text-zinc-950 font-sans leading-normal w-full h-auto selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.55in 0.65in",
        fontSize: "10pt",
        fontFamily: "'Segoe UI', Calibri, Arial, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Encabezado Académico Internacional Formal Sin Itálicas */}
      <header className="text-center pb-2 mb-2.5">
        <h1 className="text-[20pt] font-bold text-zinc-950 uppercase tracking-tight mb-0.5">
          {name || "Nombre Completo"}
        </h1>
        {headline && (
          <p className="text-[10pt] font-medium text-zinc-700 mb-1">
            {headline}
          </p>
        )}

        {/* Contacto formal */}
        {contactItems.length > 0 && (
          <div className="text-[9pt] text-zinc-700 flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5">
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
                {idx < contactItems.length - 1 && <span className="text-zinc-400">•</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Secciones en Orden Académico */}
      <div className="space-y-3.5">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "education":
              if (!education || education.length === 0) return null;
              return (
                <section key="education" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-2">
                    {labels.education}
                  </h2>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <div key={edu.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[10pt] text-zinc-950">
                            {edu.institution}
                          </span>
                          <span className="text-[9pt] text-zinc-600 shrink-0 font-medium">
                            {edu.start_date ? `${edu.start_date} – ` : ""}
                            {edu.current ? labels.present : edu.end_date || ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-[9.5pt]">
                          <span className="text-zinc-800 font-medium">
                            {edu.degree} {edu.area ? `en ${edu.area}` : ""}
                          </span>
                          {edu.location && (
                            <span className="text-[8.5pt] text-zinc-600">
                              {edu.location}
                            </span>
                          )}
                        </div>
                        {edu.highlights && edu.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-[9pt] text-zinc-700 leading-snug">
                            {edu.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "experience":
              if (!experience || experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-3">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-2">
                    {labels.experience}
                  </h2>
                  <div className="space-y-2.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div>
                            <span className="font-bold text-[10pt] text-zinc-950">
                              {exp.position}
                            </span>
                            <span className="text-zinc-700 font-medium"> — {exp.company}</span>
                          </div>
                          <span className="text-[9pt] text-zinc-600 shrink-0 font-medium">
                            {exp.location ? `${exp.location} | ` : ""}
                            {exp.start_date} – {exp.current ? labels.present : exp.end_date}
                          </span>
                        </div>

                        {exp.summary && (
                          <p className="text-[9pt] text-zinc-700 mb-1 leading-snug">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.5pt] text-zinc-800 leading-snug">
                            {exp.highlights.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
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
                <section key="projects" className="space-y-2">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-2">
                    {labels.projects}
                  </h2>
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div>
                            <span className="font-bold text-[10pt] text-zinc-950">
                              {proj.name}
                            </span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="text-[9pt] text-zinc-600 ml-1.5 font-medium">
                                | {proj.technologies.join(", ")}
                              </span>
                            )}
                          </div>
                          {proj.start_date && (
                            <span className="text-[8.5pt] text-zinc-600 shrink-0 font-medium">
                              {proj.start_date}
                              {proj.end_date ? ` – ${proj.end_date}` : ""}
                            </span>
                          )}
                        </div>

                        {proj.description && (!proj.highlights || proj.highlights.length === 0 || proj.highlights[0] !== proj.description) && (
                          <p className="text-[9pt] text-zinc-700 mb-0.5 leading-snug">
                            {proj.description}
                          </p>
                        )}

                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9pt] text-zinc-800 leading-snug">
                            {proj.highlights.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "skills":
              if (!skills || skills.length === 0) return null;
              return (
                <section key="skills" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-1.5">
                    {labels.skills}
                  </h2>
                  <div className="space-y-1 text-[9.5pt]">
                    {skills.map((cat) => (
                      <div key={cat.id || cat.category} className="leading-snug">
                        <span className="font-bold text-zinc-900 text-[9pt] mr-1">
                          {cat.category}:
                        </span>
                        <span className="text-zinc-800">{cat.skills.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-1.5">
                    {labels.summary}
                  </h2>
                  <p className="text-[9.5pt] leading-relaxed text-zinc-800 text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "certifications":
              if (!certifications || certifications.length === 0) return null;
              return (
                <section key="certifications" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-1.5">
                    {labels.certifications}
                  </h2>
                  <div className="space-y-1 text-[9.5pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-zinc-900">{cert.name}</span>
                          <span className="text-zinc-700"> — {cert.issuer}</span>
                        </div>
                        {cert.date && (
                          <span className="text-[8.5pt] text-zinc-600 font-medium">
                            {cert.date}
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

        {/* Secciones personalizadas opcionales (Publicaciones, Idiomas, etc.) */}
        {custom_sections && custom_sections.length > 0 && custom_sections.map((sec) => (
          <section key={sec.id} className="page-break-avoid">
            <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-400 pb-0.5 mb-1.5">
              {sec.title}
            </h2>
            <div className="space-y-1.5 text-[9.5pt]">
              {sec.entries.map((entry) => (
                <div key={entry.id} className="leading-snug">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-zinc-900">{entry.title}</span>
                    {entry.date && <span className="text-[8.5pt] text-zinc-600 font-medium">{entry.date}</span>}
                  </div>
                  {entry.description && <p className="text-[9pt] text-zinc-700">{entry.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
