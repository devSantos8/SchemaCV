import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage, formatSocialDisplay } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const ExecutiveSerif: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
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
    contactItems.push(formatSocialDisplay(sn));
  });

  return (
    <div
      className={`bg-white text-zinc-950 font-serif leading-normal w-full h-auto selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.55in 0.65in",
        fontSize: "10pt",
        fontFamily: "var(--font-garamond), Georgia, Cambria, 'Times New Roman', serif",
      }}
    >
      {/* Encabezado Formal Ejecutivo Centrado */}
      <header className="text-center pb-2 mb-2">
        <h1 className="text-[21pt] font-extrabold tracking-wide text-zinc-950 uppercase mb-1">
          {name || "Nombre Completo"}
        </h1>
        {headline && (
          <p className="text-[10pt] font-sans font-medium text-zinc-700 uppercase tracking-widest mb-1.5">
            {headline}
          </p>
        )}

        {/* Contacto en una sola línea */}
        {contactItems.length > 0 && (
          <div className="text-[9pt] font-sans text-zinc-600 flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-950 hover:underline transition-colors"
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

      {/* Secciones estructuradas con espaciado generoso */}
      <div className="space-y-3.5">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                    {labels.summary}
                  </h2>
                  <p className="text-[9.5pt] leading-relaxed text-zinc-800 text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              if (!experience || experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-3">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
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
                            <span className="text-zinc-700 italic"> — {exp.company}</span>
                            {exp.location && <span className="font-normal font-sans text-[8.5pt] text-zinc-600"> ({exp.location})</span>}
                          </div>
                          <span className="text-[8.5pt] font-sans text-zinc-600 shrink-0">
                            {exp.start_date} – {exp.current ? labels.present : (exp.end_date || labels.present)}
                          </span>
                        </div>

                        {exp.summary && (
                          <p className="text-[9pt] italic text-zinc-700 mb-1 leading-snug">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9pt] text-zinc-800 leading-relaxed">
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

            case "education":
              if (!education || education.length === 0) return null;
              return (
                <section key="education" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
                    {labels.education}
                  </h2>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <div key={edu.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-[10pt] text-zinc-950">
                              {edu.institution}
                            </span>
                            {edu.location && (
                              <span className="text-[9pt] italic text-zinc-600 ml-1">
                                , {edu.location}
                              </span>
                            )}
                          </div>
                          <span className="text-[8.5pt] font-sans text-zinc-600 shrink-0">
                            {edu.start_date ? `${edu.start_date} – ` : ""}
                            {edu.current ? labels.present : (edu.end_date || labels.present)}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-[9.5pt] text-zinc-800">
                          <span className="italic">
                            {edu.degree} {edu.area ? `en ${edu.area}` : ""}
                          </span>
                          {edu.gpa && (
                            <span className="font-sans text-[8.5pt] text-zinc-600">
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                        {edu.highlights && edu.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-[9pt] text-zinc-700">
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

            case "skills":
              if (!skills || skills.length === 0) return null;
              return (
                <section key="skills" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                    {labels.skills}
                  </h2>
                  <div className="space-y-1 text-[9.5pt]">
                    {skills.map((cat) => (
                      <div key={cat.id || cat.category} className="leading-snug">
                        <span className="font-bold text-zinc-950 font-sans text-[9pt] mr-1">
                          {cat.category}:{" "}
                        </span>
                        <span className="text-zinc-800">{cat.skills.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!projects || projects.length === 0) return null;
              return (
                <section key="projects" className="space-y-2">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
                    {labels.projects}
                  </h2>
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div>
                            <span className="font-bold text-[9.5pt] text-zinc-950">
                              {proj.name}
                            </span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="text-[8.5pt] font-sans text-zinc-600 ml-1.5">
                                | {proj.technologies.join(", ")}
                              </span>
                            )}
                          </div>
                          {proj.start_date && (
                            <span className="text-[8.5pt] font-sans text-zinc-600 shrink-0">
                              {proj.start_date}
                              {proj.end_date ? ` – ${proj.end_date}` : ""}
                            </span>
                          )}
                        </div>

                        {proj.description && (
                          <p className="text-[9pt] text-zinc-700 mb-1 leading-snug">
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

            case "certifications":
              if (!certifications || certifications.length === 0) return null;
              return (
                <section key="certifications" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                    {labels.certifications}
                  </h2>
                  <div className="space-y-1 text-[9pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-zinc-900">{cert.name}</span>
                          <span className="text-zinc-700"> — {cert.issuer}{" "}</span>
                        </div>
                        {cert.date && (
                          <span className="text-[8.5pt] font-sans text-zinc-600">
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
      </div>
    </div>
  );
};
