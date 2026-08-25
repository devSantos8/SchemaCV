import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage, formatSocialDisplay, getSectionLabels } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const ModernMinimal: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "projects",
      "skills",
      "education",
      "certifications",
    ],
  } = data;

  const labels = getSectionLabels(data);

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
      className={`bg-white text-zinc-900 font-sans leading-relaxed w-full h-auto selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.4in 0.5in",
        fontSize: "9pt",
        fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
      }}
    >
      {/* Header Minimalista */}
      <header className="pb-1.5 mb-2">
        <h1 className="text-[18pt] font-black tracking-tight text-zinc-950">
          {name || "Nombre Completo"}
        </h1>
        {headline && (
          <p className="text-[9pt] font-medium text-zinc-600 mt-0.5">
            {headline}
          </p>
        )}

        {/* Contacto espaciado */}
        {contactItems.length > 0 && (
          <div className="text-[8.5pt] text-zinc-500 flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-950 transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
                {idx < contactItems.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Secciones con separación sutil */}
      <div className="space-y-2">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="page-break-avoid">
                  <h2 className="text-[9.5pt] font-bold text-zinc-950 uppercase tracking-wider mb-1">
                    {labels.summary}
                  </h2>
                  <p className="text-[9pt] text-zinc-700 leading-normal text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "skills":
              if (!skills || skills.length === 0) return null;
              return (
                <section key="skills" className="page-break-avoid">
                  <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider text-zinc-950 mb-1.5">
                    {labels.skills}
                  </h2>
                  <div className="space-y-1 text-[9.5pt]">
                    {skills.map((cat) => (
                      <div key={cat.id || cat.category} className="leading-snug">
                        <span className="font-bold text-zinc-900">{cat.category}: </span>
                        <span className="text-zinc-700">{cat.skills.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "experience":
              if (!experience || experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-3">
                  <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider text-zinc-950 mb-2">
                    {labels.experience}
                  </h2>
                  <div className="space-y-3">
                    {experience.map((exp) => (
                      <div key={exp.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div className="font-bold text-[10pt] text-zinc-950">
                            {exp.position}{" "}
                            <span className="font-normal text-zinc-600">— {exp.company}</span>
                            {exp.location && (
                              <span className="font-normal text-[8.5pt] text-zinc-500">
                                {" "}
                                ({exp.location})
                              </span>
                            )}
                          </div>
                          <span className="text-[8.5pt] text-zinc-500 font-mono shrink-0">
                            {exp.start_date} – {exp.current ? labels.present : (exp.end_date || labels.present)}
                          </span>
                        </div>

                        {exp.summary && (
                          <p className="text-[9pt] text-zinc-600 mb-1 leading-snug">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9pt] text-zinc-700 leading-relaxed">
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
                  <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider text-zinc-950 mb-2">
                    {labels.education}
                  </h2>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <div key={edu.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-[9.5pt] text-zinc-950">
                              {edu.institution}
                            </span>
                            <span className="text-zinc-600 text-[9pt]">
                              {" "}
                              — {edu.degree} {edu.area ? `en ${edu.area}` : ""}
                            </span>
                          </div>
                          <span className="text-[8.5pt] text-zinc-500 font-mono shrink-0">
                            {edu.start_date ? `${edu.start_date} – ` : ""}
                            {edu.current ? labels.present : (edu.end_date || labels.present)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!projects || projects.length === 0) return null;
              return (
                <section key="projects" className="space-y-2">
                  <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider text-zinc-950 mb-2">
                    {labels.projects}
                  </h2>
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-[9.5pt] text-zinc-950">
                            {proj.name}
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="font-normal text-zinc-500 text-[8.5pt]">
                                {" "}
                                ({proj.technologies.join(", ")})
                              </span>
                            )}
                          </span>
                          {proj.start_date && (
                            <span className="text-[8.5pt] text-zinc-500 font-mono shrink-0">
                              {proj.start_date}
                              {proj.end_date ? ` – ${proj.end_date}` : ""}
                            </span>
                          )}
                        </div>

                        {proj.description && (
                          <p className="text-[9pt] text-zinc-600 mb-1 leading-snug">
                            {proj.description}
                          </p>
                        )}

                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9pt] text-zinc-700 leading-relaxed">
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
                  <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider text-zinc-950 mb-1.5">
                    {labels.certifications}
                  </h2>
                  <div className="space-y-1 text-[9pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-semibold text-zinc-900">{cert.name}</span>
                          <span className="text-zinc-600"> — {cert.issuer}{cert.date ? ` (${cert.date})` : ""}</span>
                        </div>
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
