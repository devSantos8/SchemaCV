import { ResumeData, TemplateId, PaperSize, SECTION_LABELS, ResumeLanguage, getVisibleResumeData, formatSocialDisplay } from "@/types/resume";

/**
 * Compilador de HTML puro independiente (sin dependencias de react-dom/server).
 * Genera HTML semántico optimizado para renderizado PDF vectorial con Puppeteer.
 */
export function generateTemplateHtml(
  rawData: ResumeData,
  templateId: TemplateId = "tech_minimalist",
  paperSize: PaperSize = "letter"
): string {
  const data = getVisibleResumeData(rawData);
  const isA4 = paperSize === "a4";
  const lang: ResumeLanguage = (data.language as ResumeLanguage) || "es";
  const labels = SECTION_LABELS[lang] || SECTION_LABELS.es;

  // Contact line
  const contactItems: string[] = [];
  if (data.location) contactItems.push(data.location);
  if (data.phone) contactItems.push(data.phone);
  if (data.email) contactItems.push(`<a href="mailto:${data.email}" style="color: inherit; text-decoration: underline;">${data.email}</a>`);
  if (data.website) {
    const webClean = data.website.replace(/^https?:\/\//, "");
    const webUrl = data.website.startsWith("http") ? data.website : `https://${data.website}`;
    contactItems.push(`<a href="${webUrl}" target="_blank" rel="noreferrer" style="color: inherit; text-decoration: underline;">${webClean}</a>`);
  }

  if (data.social_networks && data.social_networks.length > 0) {
    data.social_networks.forEach((sn) => {
      const { label, url } = formatSocialDisplay(sn);
      if (url) {
        contactItems.push(`<a href="${url}" target="_blank" rel="noreferrer" style="color: inherit; text-decoration: underline;">${label}</a>`);
      } else {
        contactItems.push(label);
      }
    });
  }

  const contactLine = contactItems.join(" &nbsp;|&nbsp; ");

  // Orden de secciones
  const order = data.section_order || [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
  ];

  let sectionsHtml = "";

  order.forEach((sectionKey) => {
    switch (sectionKey) {
      case "summary":
        if (data.summary) {
          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">${labels.summary}</h2>
              <p class="section-text">${data.summary}</p>
            </div>
          `;
        }
        break;

      case "skills":
        if (data.skills && data.skills.length > 0) {
          const skillsList = data.skills
            .map(
              (cat) => `
              <div class="skill-row">
                <span class="skill-cat font-semibold">${cat.category}: </span>
                <span class="skill-items">${cat.skills.join(", ")}</span>
              </div>
            `
            )
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">${labels.skills}</h2>
              <div class="skills-container">${skillsList}</div>
            </div>
          `;
        }
        break;

      case "experience":
        if (data.experience && data.experience.length > 0) {
          const expList = data.experience
            .map((exp) => {
              const bullets = (exp.highlights || [])
                .map((h) => `<li>${h}</li>`)
                .join("");
              const endDateStr = exp.current ? labels.present : (exp.end_date || labels.present);

              return `
                <div class="entry-block page-break-avoid">
                  <div class="entry-header">
                    <div>
                      <span class="entry-title font-bold">${exp.position}</span>
                      <span class="entry-subtitle font-semibold"> — ${exp.company}</span>
                      ${exp.location ? `<span class="entry-loc font-normal text-zinc-600"> (${exp.location})</span>` : ""}
                    </div>
                    <div class="entry-dates font-mono">
                      ${exp.start_date} – ${endDateStr}
                    </div>
                  </div>
                  ${exp.summary ? `<p class="entry-summary">${exp.summary}</p>` : ""}
                  ${bullets ? `<ul class="entry-bullets">${bullets}</ul>` : ""}
                </div>
              `;
            })
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">${labels.experience}</h2>
              ${expList}
            </div>
          `;
        }
        break;

      case "projects":
        if (data.projects && data.projects.length > 0) {
          const projList = data.projects
            .map((proj) => {
              const bullets = (proj.highlights || [])
                .map((h) => `<li>${h}</li>`)
                .join("");

              return `
                <div class="entry-block page-break-avoid">
                  <div class="entry-header">
                    <div>
                      <span class="entry-title font-bold">${proj.name}</span>
                      ${proj.technologies && proj.technologies.length ? `<span class="proj-tech"> [${proj.technologies.join(", ")}]</span>` : ""}
                    </div>
                    ${proj.start_date ? `<div class="entry-dates">${proj.start_date}${proj.end_date ? ` – ${proj.end_date}` : ""}</div>` : ""}
                  </div>
                  ${proj.description ? `<p class="entry-summary">${proj.description}</p>` : ""}
                  ${bullets ? `<ul class="entry-bullets">${bullets}</ul>` : ""}
                </div>
              `;
            })
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">${labels.projects}</h2>
              ${projList}
            </div>
          `;
        }
        break;

      case "education":
        if (data.education && data.education.length > 0) {
          const eduList = data.education
            .map((edu) => {
              const eduEndDate = edu.current ? labels.present : (edu.end_date || "");
              return `
                <div class="entry-block page-break-avoid">
                  <div class="entry-header">
                    <div>
                      <span class="entry-title font-bold">${edu.institution}</span>
                      <span class="entry-subtitle"> — ${edu.degree}${edu.area ? ` en ${edu.area}` : ""}</span>
                      ${edu.gpa ? `<span class="entry-gpa"> (GPA: ${edu.gpa})</span>` : ""}
                    </div>
                    ${edu.start_date ? `<div class="entry-dates">${edu.start_date}${eduEndDate ? ` – ${eduEndDate}` : ""}</div>` : ""}
                  </div>
                  ${(edu.highlights && edu.highlights.length > 0) ? `<ul class="entry-bullets">${edu.highlights.map(h => `<li>${h}</li>`).join("")}</ul>` : ""}
                </div>
              `;
            })
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">${labels.education}</h2>
              ${eduList}
            </div>
          `;
        }
        break;

      case "certifications":
        if (data.certifications && data.certifications.length > 0) {
          const certList = data.certifications
            .map((cert) => {
              return `
                <div class="cert-row">
                  <div>
                    <span class="cert-name font-semibold">${cert.name}</span>
                    <span class="cert-issuer"> — ${cert.issuer}</span>
                  </div>
                  ${cert.date ? `<span class="cert-date font-mono">${cert.date}</span>` : ""}
                </div>
              `;
            })
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">${labels.certifications}</h2>
              <div class="certs-container">${certList}</div>
            </div>
          `;
        }
        break;
    }
  });

  // Estilos tipográficos según la plantilla
  const isSerif =
    templateId === "harvard" ||
    templateId === "executive_serif";

  return `
    <div class="cv-document ${templateId} ${isSerif ? "font-serif" : "font-sans"}" style="padding: 28px 36px; color: #09090b; line-height: 1.45; font-size: 11px;">
      <style>
        .cv-document {
          font-family: ${isSerif ? "'EB Garamond', Georgia, 'Times New Roman', serif" : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
        }
        .header-title {
          font-size: 22px;
          font-weight: 800;
          text-align: center;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
          display: block;
        }
        .header-headline {
          font-size: 13px;
          text-align: center;
          color: #3f3f46;
          margin: 0 0 6px 0;
          font-weight: 500;
          display: block;
        }
        .header-contact {
          font-size: 10px;
          text-align: center;
          color: #52525b;
          margin: 0 0 16px 0;
          display: block;
        }
        .section-block {
          margin-bottom: 14px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #18181b;
          padding-bottom: 2px;
          margin: 0 0 6px 0;
          color: #09090b;
        }
        .section-text {
          margin: 0;
          font-size: 11px;
          line-height: 1.5;
          color: #27272a;
        }
        .skill-row {
          display: block;
          font-size: 10.5px;
          margin-bottom: 3px;
          line-height: 1.4;
        }
        .skill-cat {
          font-weight: 700;
          margin-right: 4px;
          color: #09090b;
        }
        .skill-items {
          color: #27272a;
        }
        .entry-block {
          margin-bottom: 10px;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 11.5px;
          margin-bottom: 2px;
        }
        .entry-title {
          color: #09090b;
        }
        .entry-subtitle {
          color: #3f3f46;
        }
        .entry-dates {
          font-size: 10.5px;
          color: #52525b;
          font-family: monospace;
          white-space: nowrap;
        }
        .entry-summary {
          margin: 2px 0 4px 0;
          font-size: 10.5px;
          color: #3f3f46;
        }
        .entry-bullets {
          margin: 2px 0 0 0;
          padding-left: 18px;
          font-size: 10.5px;
          color: #27272a;
        }
        .entry-bullets li {
          margin-bottom: 2px;
          line-height: 1.4;
        }
        .cert-row {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          margin-bottom: 3px;
        }
        .proj-tech {
          font-size: 10px;
          font-family: monospace;
          color: #52525b;
        }
      </style>

      <div class="cv-header">
        <h1 class="header-title">${data.name || "Nombre Completo"}</h1>
        ${data.headline ? `<div class="header-headline">${data.headline}</div>` : ""}
        ${contactLine ? `<div class="header-contact">${contactLine}</div>` : ""}
      </div>

      <div class="cv-body">
        ${sectionsHtml}
      </div>
    </div>
  `;
}
