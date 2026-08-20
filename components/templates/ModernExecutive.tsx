import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage, formatSocialDisplay } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const ModernExecutive: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      className={`bg-white text-zinc-900 font-sans leading-normal w-full h-auto selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.5in 0.65in",
        fontSize: "9.5pt",
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Encabezado Ejecutivo con Barra de Acento */}
      <header className="border-l-4 border-zinc-900 pl-4 py-1 mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 uppercase">
          {name || "Tu Nombre"}
        </h1>
        {headline && (
          <p className="text-xs font-semibold tracking-wider text-zinc-700 uppercase mt-0.5">
            {headline}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="text-[8.5pt] text-zinc-600 flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
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
                {idx < contactItems.length - 1 && <span className="text-zinc-300">|</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Renderizado de Secciones */}
      {section_order.map((sectionKey) => {
        switch (sectionKey) {
          case "summary":
            if (!summary) return null;
            return (
              <section key="summary" className="mb-3.5 page-break-avoid">
                <h2 className="text-[9.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-1 mb-1.5">
                  {labels.summary}
                </h2>
                <p className="text-[9pt] leading-relaxed text-zinc-700 text-justify">
                  {summary}
                </p>
              </section>
            );

          case "experience":
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-3.5">
                <h2 className="text-[9.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-1 mb-2">
                  {labels.experience}
                </h2>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div>
                          <span className="font-bold text-[9.5pt] text-zinc-950">
                            {exp.position}
                          </span>
                          <span className="font-semibold text-zinc-700 text-[9pt]">
                            {" "}
                            — {exp.company}
                          </span>
                          {exp.location && (
                            <span className="font-normal text-zinc-500 text-[8.5pt]">
                              {" "}
                              ({exp.location})
                            </span>
                          )}
                        </div>
                        <span className="text-[8.5pt] font-semibold text-zinc-600">
                          {[exp.start_date, exp.current ? labels.present : (exp.end_date || labels.present)]
                            .filter(Boolean)
                            .join(" – ")}
                        </span>
                      </div>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc ml-4 space-y-0.5 text-[8.5pt] text-zinc-700 leading-snug">
                          {exp.highlights.map((hl, i) => (
                            <li key={i}>{hl}</li>
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
              <section key="projects" className="mb-3.5">
                <h2 className="text-[9.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-1 mb-2">
                  {labels.projects}
                </h2>
                <div className="space-y-2.5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-bold text-[9pt] text-zinc-950">
                            {proj.name}
                          </span>
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[7.5pt] font-mono text-indigo-700 hover:underline font-semibold"
                            >
                              [GitHub]
                            </a>
                          )}
                          {proj.url && (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[7.5pt] font-mono text-indigo-700 hover:underline font-semibold"
                            >
                              [Demo]
                            </a>
                          )}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="font-normal text-zinc-600 text-[8.5pt]">
                              ({proj.technologies.join(", ")})
                            </span>
                          )}
                        </div>
                        {(proj.start_date || proj.end_date) && (
                          <span className="text-[8pt] text-zinc-600">
                            {[proj.start_date, proj.end_date].filter(Boolean).join(" – ")}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-[8.5pt] text-zinc-700 mb-1">{proj.description}</p>
                      )}
                      {proj.highlights && proj.highlights.length > 0 && (
                        <ul className="list-disc ml-4 space-y-0.5 text-[8.5pt] text-zinc-700 leading-snug">
                          {proj.highlights.map((hl, i) => (
                            <li key={i}>{hl}</li>
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
              <section key="skills" className="mb-3.5 page-break-avoid">
                <h2 className="text-[9.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-1 mb-1.5">
                  {labels.skills}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[8.5pt]">
                  {skills.map((cat) => (
                    <div key={cat.id || cat.category} className="leading-snug">
                      <strong className="text-zinc-900">{cat.category}: </strong>
                      <span className="text-zinc-700">{cat.skills.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "education":
            if (!education || education.length === 0) return null;
            return (
              <section key="education" className="mb-3 page-break-avoid">
                <h2 className="text-[9.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-1 mb-1.5">
                  {labels.education}
                </h2>
                <div className="space-y-1.5">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[9pt] text-zinc-900">
                          {edu.degree}
                          {edu.area && <span className="font-normal">, {edu.area}</span>}
                        </span>
                        <span className="text-[8pt] text-zinc-600 font-semibold">
                          {[edu.start_date, edu.current ? labels.present : (edu.end_date || labels.present)]
                            .filter(Boolean)
                            .join(" – ")}
                        </span>
                      </div>
                      <div className="flex justify-between text-[8.5pt] text-zinc-600">
                        <span>{edu.institution}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {edu.highlights && edu.highlights.length > 0 && (
                        <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-[8pt] text-zinc-700">
                          {edu.highlights.map((hl, i) => (
                            <li key={i}>{hl}</li>
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
              <section key="certifications" className="mb-2 page-break-avoid">
                <h2 className="text-[9.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-1 mb-1">
                  {labels.certifications}
                </h2>
                <div className="space-y-0.5 text-[8.5pt]">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-baseline">
                      <span>
                        <strong className="text-zinc-900">{cert.name}</strong>
                        <span className="text-zinc-600"> — {cert.issuer}{" "}</span>
                      </span>
                      {cert.date && <span className="text-[8pt] text-zinc-500">({cert.date})</span>}
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
  );
};
