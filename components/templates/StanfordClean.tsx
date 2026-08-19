import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const StanfordClean: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "skills",
      "projects",
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
      label: sn.username ? `${sn.network}/${sn.username}` : sn.network,
      url: sn.url,
    });
  });

  return (
    <div
      className={`bg-white text-zinc-950 font-sans leading-normal w-full min-h-full selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.5in 0.6in",
        fontSize: "9.5pt",
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header Stanford / Silicon Valley */}
      <header className="border-b-2 border-zinc-900 pb-2.5 mb-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 uppercase">
              {name || "Nombre Completo"}
            </h1>
            {headline && (
              <p className="text-xs font-semibold text-zinc-700 tracking-wide mt-0.5">
                {headline}
              </p>
            )}
          </div>

          {/* Contacto compacto alineado a la derecha en pantallas grandes */}
          <div className="text-[9pt] text-zinc-600 flex flex-wrap gap-x-2.5 gap-y-0.5 sm:justify-end">
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
                {idx < contactItems.length - 1 && (
                  <span className="text-zinc-300 select-none">•</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Secciones dinámicas según section_order */}
      <div className="space-y-3">
        {section_order.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" className="break-inside-avoid">
                  <h2 className="text-[10pt] font-extrabold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5 flex items-center justify-between">
                    <span>{labels.summary}</span>
                  </h2>
                  <p className="text-[9.5pt] text-zinc-800 leading-relaxed text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              if (!experience || experience.length === 0) return null;
              return (
                <section key="experience" className="space-y-2.5">
                  <h2 className="text-[10pt] font-extrabold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5 flex items-center justify-between">
                    <span>{labels.experience}</span>
                  </h2>

                  <div className="space-y-2.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="break-inside-avoid">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-extrabold text-[9.5pt] text-zinc-950">
                              {exp.position}
                            </span>
                            <span className="text-zinc-400 font-normal">|</span>
                            <span className="font-semibold text-[9.5pt] text-zinc-800">
                              {exp.company}
                            </span>
                          </div>

                          <div className="text-[8.5pt] text-zinc-600 font-mono shrink-0">
                            {exp.location ? `${exp.location} • ` : ""}
                            {exp.start_date} – {exp.current ? labels.present : exp.end_date}
                          </div>
                        </div>

                        {exp.summary && (
                          <p className="text-[9pt] text-zinc-700 mt-0.5 leading-snug">
                            {exp.summary}
                          </p>
                        )}

                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-[9pt] text-zinc-800 list-disc list-outside pl-4 leading-relaxed">
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

            case "skills":
              if (!skills || skills.length === 0) return null;
              return (
                <section key="skills" className="break-inside-avoid">
                  <h2 className="text-[10pt] font-extrabold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5 flex items-center justify-between">
                    <span>{labels.skills}</span>
                  </h2>

                  <div className="space-y-1 text-[9pt]">
                    {skills.map((cat) => (
                      <div key={cat.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                        <span className="font-bold text-zinc-900 sm:w-44 shrink-0">
                          {cat.category}:
                        </span>
                        <span className="text-zinc-800 flex-1">
                          {cat.skills.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!projects || projects.length === 0) return null;
              return (
                <section key="projects" className="space-y-2">
                  <h2 className="text-[10pt] font-extrabold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5 flex items-center justify-between">
                    <span>{labels.projects}</span>
                  </h2>

                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="break-inside-avoid">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                          <div className="flex items-baseline gap-2 flex-wrap">
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
                            <div className="text-[8.5pt] text-zinc-600 font-mono shrink-0">
                              {proj.start_date}
                              {proj.end_date ? ` – ${proj.end_date}` : ""}
                            </div>
                          )}
                        </div>

                        {proj.description && (
                          <p className="text-[9pt] text-zinc-700 mt-0.5 leading-snug">
                            {proj.description}
                          </p>
                        )}

                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="mt-0.5 space-y-0.5 text-[9pt] text-zinc-800 list-disc list-outside pl-4 leading-relaxed">
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
                <section key="education" className="space-y-1.5 break-inside-avoid">
                  <h2 className="text-[10pt] font-extrabold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5 flex items-center justify-between">
                    <span>{labels.education}</span>
                  </h2>

                  <div className="space-y-1.5">
                    {education.map((edu) => (
                      <div key={edu.id} className="break-inside-avoid">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-bold text-[9.5pt] text-zinc-950">
                              {edu.degree} {edu.area ? `en ${edu.area}` : ""}
                            </span>
                            <span className="text-zinc-400 font-normal">|</span>
                            <span className="font-semibold text-[9pt] text-zinc-800">
                              {edu.institution}
                            </span>
                          </div>

                          <div className="text-[8.5pt] text-zinc-600 font-mono shrink-0">
                            {edu.location ? `${edu.location} • ` : ""}
                            {edu.start_date} – {edu.current ? labels.present : edu.end_date}
                          </div>
                        </div>

                        {edu.highlights && edu.highlights.length > 0 && (
                          <ul className="mt-0.5 space-y-0.5 text-[8.5pt] text-zinc-700 list-disc list-outside pl-4">
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

            case "certifications":
              if (!certifications || certifications.length === 0) return null;
              return (
                <section key="certifications" className="break-inside-avoid">
                  <h2 className="text-[10pt] font-extrabold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 mb-1.5 flex items-center justify-between">
                    <span>{labels.certifications}</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-semibold text-zinc-900">{cert.name}</span>
                          <span className="text-zinc-600 text-[8.5pt]"> ({cert.issuer})</span>
                        </div>
                        {cert.date && (
                          <span className="text-[8pt] text-zinc-500 font-mono ml-2 shrink-0">
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
