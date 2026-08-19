import React from "react";
import { ResumeData, PaperSize, SECTION_LABELS, ResumeLanguage } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const TechMinimalist: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "experience",
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
      className={`bg-white text-zinc-900 font-sans leading-normal w-full min-h-full selection:bg-zinc-100 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.5in 0.6in",
        fontSize: "9.5pt",
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header Compacto con Identidad Técnica */}
      <header className="pb-2.5 mb-2.5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              {name || "Tu Nombre"}
            </h1>
            {headline && (
              <p className="text-xs font-semibold text-zinc-600 tracking-wide mt-0.5">
                {headline}
              </p>
            )}
          </div>
          {contactItems.length > 0 && (
            <div className="text-[8.5pt] text-zinc-600 flex flex-wrap gap-x-2.5 gap-y-1 sm:justify-end">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-zinc-950 hover:underline font-mono text-[8pt]"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="font-mono text-[8pt]">{item.label}</span>
                  )}
                  {idx < contactItems.length - 1 && <span className="text-zinc-300">/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Renderizado de Secciones */}
      {section_order.map((sectionKey) => {
        switch (sectionKey) {
          case "summary":
            if (!summary) return null;
            return (
              <section key="summary" className="mb-3 page-break-avoid">
                <h2 className="text-[9pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5 mb-1 flex items-center justify-between">
                  <span>{labels.summary}</span>
                </h2>
                <p className="text-[9pt] leading-relaxed text-zinc-700">{summary}</p>
              </section>
            );

          case "skills":
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" className="mb-3 page-break-avoid">
                <h2 className="text-[9pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5 mb-1.5 flex items-center justify-between">
                  <span>{labels.skills}</span>
                </h2>
                <div className="space-y-1 text-[8.5pt]">
                  {skills.map((cat) => (
                    <div key={cat.id || cat.category} className="leading-snug">
                      <span className="font-semibold text-zinc-900 mr-1.5">
                        {cat.category}:
                      </span>
                      <span className="text-zinc-700">
                        {cat.skills.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "experience":
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-3">
                <h2 className="text-[9pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5 mb-2">
                  {labels.experience}
                </h2>
                <div className="space-y-2.5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="page-break-avoid">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[9.5pt] text-zinc-900">
                          {exp.position}{" "}
                          <span className="font-normal text-zinc-600">@ {exp.company}</span>
                        </span>
                        <span className="font-mono text-[8pt] text-zinc-500 font-medium">
                          {[exp.start_date, exp.end_date || (exp.current ? labels.present : "")]
                            .filter(Boolean)
                            .join(" → ")}
                        </span>
                      </div>
                      {exp.location && (
                        <div className="text-[8pt] text-zinc-500 mb-1">{exp.location}</div>
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc ml-4 space-y-0.5 text-[8.5pt] text-zinc-700 leading-snug mt-0.5">
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
              <section key="projects" className="mb-3">
                <h2 className="text-[9pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5 mb-2">
                  {labels.projects}
                </h2>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="page-break-avoid">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[9pt] text-zinc-950">
                            {proj.name}
                          </span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="font-mono text-[8pt] text-zinc-500">
                              ({proj.technologies.join(", ")})
                            </span>
                          )}
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[7.5pt] text-zinc-500 hover:text-zinc-900 underline"
                            >
                              [repo]
                            </a>
                          )}
                          {proj.url && (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[7.5pt] text-zinc-500 hover:text-zinc-900 underline"
                            >
                              [demo]
                            </a>
                          )}
                        </div>
                        {(proj.start_date || proj.end_date) && (
                          <span className="font-mono text-[8pt] text-zinc-500">
                            {[proj.start_date, proj.end_date].filter(Boolean).join(" → ")}
                          </span>
                        )}
                      </div>
                      {proj.description && (!proj.highlights || proj.highlights.length === 0 || proj.highlights[0] !== proj.description) && (
                        <p className="text-[8.5pt] text-zinc-700 my-0.5">{proj.description}</p>
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

          case "education":
            if (!education || education.length === 0) return null;
            return (
              <section key="education" className="mb-3 page-break-avoid">
                <h2 className="text-[9pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5 mb-1.5">
                  {labels.education}
                </h2>
                <div className="space-y-1.5">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[9pt] text-zinc-900">
                          {edu.degree}
                          {edu.area && <span className="font-normal text-zinc-700">, {edu.area}</span>}
                        </span>
                        <span className="font-mono text-[8pt] text-zinc-500">
                          {[edu.start_date, edu.end_date || (edu.current ? labels.present : "")]
                            .filter(Boolean)
                            .join(" → ")}
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
                <h2 className="text-[9pt] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5 mb-1">
                  {labels.certifications}
                </h2>
                <div className="space-y-0.5 text-[8.5pt]">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-baseline">
                      <span>
                        <strong className="text-zinc-900">{cert.name}</strong>
                        <span className="text-zinc-600"> — {cert.issuer}</span>
                      </span>
                      {cert.date && (
                        <span className="font-mono text-[8pt] text-zinc-500">{cert.date}</span>
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
  );
};
