import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage, formatSocialDisplay, getSectionLabels } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const CompactSwiss: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
    references = [],
    section_order = [
      "summary",
      "experience",
      "education",
      "projects",
      "skills",
      "certifications",
      "references",
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
      className={`bg-white text-zinc-950 font-sans leading-tight w-full h-auto selection:bg-zinc-200 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.45in 0.55in",
        fontSize: "9pt",
        fontFamily: "var(--font-geist-sans), Helvetica, Arial, sans-serif",
      }}
    >
      {/* Encabezado Compact Swiss Grid */}
      <header className="pb-1.5 mb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-1">
        <div>
          <h1 className="text-[19pt] font-black tracking-tighter text-zinc-950 uppercase leading-none">
            {name || "Nombre Completo"}
          </h1>
          {headline && (
            <p className="text-[8.5pt] font-mono font-medium text-zinc-700 mt-1 uppercase tracking-wider">
              {`// ${headline}`}
            </p>
          )}
        </div>

        {/* Contacto en formato compacto */}
        <div className="text-[8pt] font-mono text-zinc-600 flex flex-wrap gap-x-2 gap-y-0.5 sm:text-right sm:max-w-xs justify-end">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-950 underline underline-offset-2 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {idx < contactItems.length - 1 && (
                <span className="text-zinc-300">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Cuerpo estructurado en cuadrícula compacta */}
      <div className="space-y-2.5">
        {(() => {
          let sectionCounter = 0;
          return section_order.map((sectionKey) => {
            switch (sectionKey) {
              case "summary": {
                if (!summary) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="summary" className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.summary}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>
                    <p className="text-[8.5pt] text-zinc-800 leading-snug pl-1">
                      {summary}
                    </p>
                  </section>
                );
              }

              case "skills": {
                if (!skills || skills.length === 0) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="skills" className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.skills}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>

                    <div className="space-y-1 pl-1 text-[8.5pt]">
                      {skills.map((cat) => (
                        <div key={cat.id} className="leading-snug">
                          <span className="font-bold text-zinc-950 font-mono text-[8pt] mr-1.5">
                            {cat.category}:{" "}
                          </span>
                          <span className="text-zinc-800">
                            {cat.skills.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "experience": {
                if (!experience || experience.length === 0) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="experience" className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.experience}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>

                    <div className="space-y-2 pl-1">
                      {experience.map((exp) => (
                        <div key={exp.id} className="break-inside-avoid">
                          <div className="flex justify-between items-baseline">
                            <div className="flex items-baseline gap-1">
                              <span className="font-extrabold text-[9pt] text-zinc-950">
                                {exp.position}
                              </span>
                              <span className="text-zinc-400"> @ </span>
                              <span className="font-bold text-[9pt] text-zinc-800">
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
                            <p className="text-[8.5pt] text-zinc-600 mt-0.5 leading-tight">
                              {exp.summary}
                            </p>
                          )}

                          {exp.highlights && exp.highlights.length > 0 && (
                            <ul className="mt-0.5 space-y-0.5 text-[8.5pt] text-zinc-800 list-disc list-outside pl-3.5 leading-snug">
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
              }

              case "projects": {
                if (!projects || projects.length === 0) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="projects" className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.projects}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>

                    <div className="space-y-1.5 pl-1">
                      {projects.map((proj) => (
                        <div key={proj.id} className="break-inside-avoid">
                          <div className="flex justify-between items-baseline">
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="font-bold text-[8.5pt] text-zinc-950">
                                {proj.name}
                              </span>
                              {proj.github_url && (
                                <a
                                  href={proj.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[7pt] font-mono text-zinc-600 hover:text-zinc-950 underline font-semibold"
                                >
                                  [GitHub]
                                </a>
                              )}
                              {proj.url && (
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[7pt] font-mono text-zinc-600 hover:text-zinc-950 underline font-semibold"
                                >
                                  [Demo]
                                </a>
                              )}
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
                            <p className="text-[8pt] text-zinc-600 mt-0.5 leading-tight">
                              {proj.description}
                            </p>
                          )}

                          {proj.highlights && proj.highlights.length > 0 && (
                            <ul className="mt-0.5 space-y-0.5 text-[8.5pt] text-zinc-800 list-disc list-outside pl-3.5 leading-snug">
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
              }

              case "education": {
                if (!education || education.length === 0) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="education" className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.education}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>

                    <div className="space-y-1 pl-1">
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
                            {edu.start_date} – {edu.current ? labels.present : (edu.end_date || labels.present)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "certifications": {
                if (!certifications || certifications.length === 0) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="certifications" className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.certifications}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 pl-1 text-[8pt]">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="flex justify-between items-baseline">
                          <span className="font-semibold text-zinc-900">
                            {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ""}{cert.date ? ` (${cert.date})` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "references": {
                if (!references || references.length === 0) return null;
                sectionCounter++;
                const secNum = String(sectionCounter).padStart(2, "0");
                return (
                  <section key="references" className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8.5pt] font-black uppercase tracking-widest text-zinc-950 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
                        {secNum}. {labels.references}
                      </span>
                      <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pl-1 text-[8pt]">
                      {references.map((ref) => (
                        <div key={ref.id} className="space-y-0.5">
                          <div className="font-bold text-zinc-900">{ref.name}</div>
                          <div className="text-zinc-700">
                            {ref.position}{ref.company ? ` — ${ref.company}` : ""}
                            {ref.relationship ? ` (${ref.relationship})` : ""}
                          </div>
                          {(ref.email || ref.phone) && (
                            <div className="text-[7.5pt] text-zinc-500 font-mono flex flex-wrap gap-x-2">
                              {ref.email && <a href={`mailto:${ref.email}`} className="hover:underline">{ref.email}</a>}
                              {ref.phone && <span>{ref.phone}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              default:
                return null;
            }
          });
        })()}
      </div>
    </div>
  );
};
