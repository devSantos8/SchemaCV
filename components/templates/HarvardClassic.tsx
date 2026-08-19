import React from "react";
import { ResumeData, PaperSize } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  paperSize?: PaperSize;
}

export const HarvardClassic: React.FC<TemplateProps> = ({ data, paperSize = "letter" }) => {
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
      "projects",
      "education",
      "certifications",
    ],
  } = data;

  const contactItems: { label: string; url?: string }[] = [];
  if (location) contactItems.push({ label: location });
  if (phone) contactItems.push({ label: phone });
  if (email) contactItems.push({ label: email, url: `mailto:${email}` });
  if (website) contactItems.push({ label: website.replace(/^https?:\/\//, ""), url: website });

  social_networks.forEach((sn) => {
    contactItems.push({
      label: `${sn.network}: ${sn.username || sn.url.replace(/^https?:\/\//, "")}`,
      url: sn.url,
    });
  });

  return (
    <div
      className={`bg-white text-zinc-950 font-serif leading-snug w-full min-h-full selection:bg-zinc-200 ${
        paperSize === "a4" ? "max-w-[210mm]" : "max-w-[8.5in]"
      } mx-auto print:max-w-none print:m-0`}
      style={{
        padding: "0.55in 0.65in",
        fontSize: "10pt",
        fontFamily: "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Encabezado Clásico Centrado */}
      <header className="text-center pb-2 mb-3 border-b border-zinc-900">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 uppercase mb-0.5">
          {name || "Tu Nombre"}
        </h1>
        {headline && (
          <p className="text-xs font-semibold tracking-wide text-zinc-700 uppercase mb-1.5">
            {headline}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="text-[9pt] text-zinc-800 flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-zinc-900"
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

      {/* Renderizado dinámico según section_order */}
      {section_order.map((sectionKey) => {
        switch (sectionKey) {
          case "summary":
            if (!summary) return null;
            return (
              <section key="summary" className="mb-3.5 page-break-avoid">
                <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-1.5">
                  Resumen Profesional
                </h2>
                <p className="text-[9.5pt] leading-relaxed text-zinc-800 text-justify">
                  {summary}
                </p>
              </section>
            );

          case "skills":
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" className="mb-3.5 page-break-avoid">
                <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-1.5">
                  Competencias Técnicas
                </h2>
                <div className="space-y-1 text-[9.5pt]">
                  {skills.map((cat) => (
                    <div key={cat.id || cat.category} className="leading-snug">
                      <span className="font-bold text-zinc-900">{cat.category}: </span>
                      <span className="text-zinc-800">{cat.skills.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "experience":
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-3.5">
                <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                  Experiencia Laboral
                </h2>
                <div className="space-y-2.5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-[10pt] text-zinc-950">
                          {exp.position}
                          <span className="font-normal text-zinc-700"> — {exp.company}</span>
                        </span>
                        <span className="text-[9pt] font-semibold text-zinc-700">
                          {[exp.start_date, exp.end_date || (exp.current ? "Presente" : "")]
                            .filter(Boolean)
                            .join(" – ")}
                        </span>
                      </div>
                      {exp.location && (
                        <div className="text-[8.5pt] italic text-zinc-600 mb-1">
                          {exp.location}
                        </div>
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc ml-4 space-y-0.5 text-[9.5pt] text-zinc-800 leading-snug">
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
                <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                  Proyectos Destacados
                </h2>
                <div className="space-y-2.5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-[10pt] text-zinc-950">
                          {proj.name}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="font-normal italic text-[9pt] text-zinc-700">
                              {" "}
                              | {proj.technologies.join(", ")}
                            </span>
                          )}
                        </span>
                        {(proj.start_date || proj.end_date) && (
                          <span className="text-[9pt] text-zinc-600">
                            {[proj.start_date, proj.end_date].filter(Boolean).join(" – ")}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-[9.5pt] text-zinc-800 mb-1">{proj.description}</p>
                      )}
                      {proj.highlights && proj.highlights.length > 0 && (
                        <ul className="list-disc ml-4 space-y-0.5 text-[9.5pt] text-zinc-800 leading-snug">
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
              <section key="education" className="mb-3.5 page-break-avoid">
                <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                  Educación
                </h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-[10pt] text-zinc-950">
                          {edu.degree}
                          {edu.area && <span className="font-normal">, {edu.area}</span>}
                        </span>
                        <span className="text-[9pt] text-zinc-700">
                          {[edu.start_date, edu.end_date || (edu.current ? "Presente" : "")]
                            .filter(Boolean)
                            .join(" – ")}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9pt] text-zinc-700">
                        <span>{edu.institution}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {edu.highlights && edu.highlights.length > 0 && (
                        <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[9pt] text-zinc-800">
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
              <section key="certifications" className="mb-3 page-break-avoid">
                <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-1.5">
                  Certificaciones
                </h2>
                <div className="space-y-1 text-[9.5pt]">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-baseline">
                      <span>
                        <strong className="text-zinc-950">{cert.name}</strong> —{" "}
                        <span className="text-zinc-700">{cert.issuer}</span>
                      </span>
                      {cert.date && <span className="text-[9pt] text-zinc-600">{cert.date}</span>}
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
