import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const CareerChanger: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "skills",
      "projects",
      "experience",
      "education",
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
      className={`bg-white text-zinc-900 font-sans leading-normal w-full min-h-full selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.5in 0.6in",
        fontSize: "9.5pt",
        fontFamily: "var(--font-geist-sans), -apple-system, system-ui, sans-serif",
      }}
    >
      {/* Encabezado Career Changer */}
      <header className="border-b-2 border-zinc-900 pb-3 mb-3">
        <h1 className="text-[20pt] font-black tracking-tight text-zinc-950 uppercase">
          {name || "Nombre Completo"}
        </h1>
        {headline && (
          <p className="text-[10pt] font-semibold text-zinc-700 tracking-wide mt-0.5">
            {headline}
          </p>
        )}

        {/* Contacto estructurado */}
        {contactItems.length > 0 && (
          <div className="text-[8.5pt] text-zinc-600 flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1.5">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-950 hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
                {idx < contactItems.length - 1 && <span className="text-zinc-300">•</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Secciones enfocadas en proyectos y skills transferibles */}
      <div className="space-y-3">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="page-break-avoid">
                  <h2 className="text-[9.5pt] font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5">
                    {labels.summary}
                  </h2>
                  <p className="text-[9pt] leading-relaxed text-zinc-800 text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "skills":
              if (!skills || skills.length === 0) return null;
              return (
                <section key="skills" className="page-break-avoid">
                  <h2 className="text-[9.5pt] font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5">
                    {labels.skills}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[9pt]">
                    {skills.map((cat) => (
                      <div key={cat.id || cat.category} className="leading-snug">
                        <span className="font-bold text-zinc-950">{cat.category}: </span>
                        <span className="text-zinc-800">{cat.skills.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!projects || projects.length === 0) return null;
              return (
                <section key="projects" className="space-y-2.5">
                  <h2 className="text-[9.5pt] font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5">
                    {labels.projects}
                  </h2>
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-[9.5pt] text-zinc-950">
                              {proj.name}
                            </span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="text-[8.5pt] font-mono text-zinc-600">
                                [{proj.technologies.join(", ")}]
                              </span>
                            )}
                          </div>
                          {proj.start_date && (
                            <span className="text-[8pt] text-zinc-500 font-mono shrink-0">
                              {proj.start_date}
                              {proj.end_date ? ` – ${proj.end_date}` : ""}
                            </span>
                          )}
                        </div>

                        {proj.description && (
                          <p className="text-[8.5pt] text-zinc-700 mb-1 leading-snug">
                            {proj.description}
                          </p>
                        )}

                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[8.5pt] text-zinc-800 leading-snug">
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

            case "experience":
              if (!experience || experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-2.5">
                  <h2 className="text-[9.5pt] font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5">
                    {labels.experience}
                  </h2>
                  <div className="space-y-2.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div>
                            <span className="font-bold text-[9.5pt] text-zinc-950">
                              {exp.position}
                            </span>
                            <span className="text-zinc-700"> — {exp.company}</span>
                          </div>
                          <span className="text-[8pt] text-zinc-500 font-mono shrink-0">
                            {exp.location ? `${exp.location} | ` : ""}
                            {exp.start_date} – {exp.current ? labels.present : exp.end_date}
                          </span>
                        </div>

                        {exp.summary && (
                          <p className="text-[8.5pt] text-zinc-700 mb-1 leading-snug">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[8.5pt] text-zinc-800 leading-snug">
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
                  <h2 className="text-[9.5pt] font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5">
                    {labels.education}
                  </h2>
                  <div className="space-y-1.5">
                    {education.map((edu) => (
                      <div key={edu.id} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-[9.5pt] text-zinc-950">
                              {edu.institution}
                            </span>
                            <span className="text-zinc-700 text-[9pt]">
                              {" "}
                              — {edu.degree} {edu.area ? `en ${edu.area}` : ""}
                            </span>
                          </div>
                          <span className="text-[8pt] text-zinc-500 font-mono shrink-0">
                            {edu.start_date ? `${edu.start_date} – ` : ""}
                            {edu.current ? labels.present : edu.end_date || ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "certifications":
              if (!certifications || certifications.length === 0) return null;
              return (
                <section key="certifications" className="page-break-avoid">
                  <h2 className="text-[9.5pt] font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5">
                    {labels.certifications}
                  </h2>
                  <div className="space-y-1 text-[8.5pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-zinc-900">{cert.name}</span>
                          <span className="text-zinc-700"> — {cert.issuer}</span>
                        </div>
                        {cert.date && (
                          <span className="text-[8pt] font-mono text-zinc-500">
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
