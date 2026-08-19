import { ResumeData, TemplateId, PaperSize } from "@/types/resume";

/**
 * Compilador de HTML puro independiente (sin dependencias de react-dom/server).
 * Genera HTML semántico optimizado para renderizado PDF vectorial con Puppeteer.
 */
export function generateTemplateHtml(
  data: ResumeData,
  templateId: TemplateId = "tech_minimalist",
  paperSize: PaperSize = "letter"
): string {
  const isA4 = paperSize === "a4";

  // Contact line
  const contactItems: string[] = [];
  if (data.location) contactItems.push(data.location);
  if (data.phone) contactItems.push(data.phone);
  if (data.email) contactItems.push(data.email);
  if (data.website) contactItems.push(data.website.replace(/^https?:\/\//, ""));

  if (data.social_networks && data.social_networks.length > 0) {
    data.social_networks.forEach((sn) => {
      contactItems.push(`${sn.network}: ${sn.username || sn.url.replace(/^https?:\/\//, "")}`);
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
              <h2 class="section-title">Resumen Profesional</h2>
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
                <span class="skill-cat font-semibold">${cat.category}:</span>
                <span class="skill-items">${cat.skills.join(", ")}</span>
              </div>
            `
            )
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">Habilidades Técnicas</h2>
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

              return `
                <div class="entry-block page-break-avoid">
                  <div class="entry-header">
                    <div>
                      <span class="entry-title font-bold">${exp.position}</span>
                      <span class="entry-subtitle font-semibold"> – ${exp.company}</span>
                    </div>
                    <div class="entry-dates">
                      ${exp.location ? `<span class="entry-loc">${exp.location} | </span>` : ""}
                      ${exp.start_date} – ${exp.current ? "Presente" : exp.end_date || ""}
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
              <h2 class="section-title">Experiencia Profesional</h2>
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
              <h2 class="section-title">Proyectos</h2>
              ${projList}
            </div>
          `;
        }
        break;

      case "education":
        if (data.education && data.education.length > 0) {
          const eduList = data.education
            .map((edu) => {
              const bullets = (edu.highlights || [])
                .map((h) => `<li>${h}</li>`)
                .join("");

              return `
                <div class="entry-block page-break-avoid">
                  <div class="entry-header">
                    <div>
                      <span class="entry-title font-bold">${edu.degree} ${edu.area ? `en ${edu.area}` : ""}</span>
                      <span class="entry-subtitle"> – ${edu.institution}</span>
                    </div>
                    <div class="entry-dates">
                      ${edu.location ? `<span>${edu.location} | </span>` : ""}
                      ${edu.start_date} – ${edu.current ? "Presente" : edu.end_date || ""}
                    </div>
                  </div>
                  ${bullets ? `<ul class="entry-bullets">${bullets}</ul>` : ""}
                </div>
              `;
            })
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">Educación</h2>
              ${eduList}
            </div>
          `;
        }
        break;

      case "certifications":
        if (data.certifications && data.certifications.length > 0) {
          const certList = data.certifications
            .map(
              (cert) => `
              <div class="cert-row page-break-avoid">
                <div>
                  <span class="font-bold">${cert.name}</span>
                  <span class="text-zinc-600"> – ${cert.issuer}</span>
                </div>
                ${cert.date ? `<span class="text-zinc-500">${cert.date}</span>` : ""}
              </div>
            `
            )
            .join("");

          sectionsHtml += `
            <div class="section-block">
              <h2 class="section-title">Certificaciones</h2>
              <div class="certs-container">${certList}</div>
            </div>
          `;
        }
        break;
    }
  });

  // Estilos tipográficos según la plantilla
  const isSerif = templateId === "harvard";

  return `
    <div class="cv-document ${templateId} ${isSerif ? "font-serif" : "font-sans"}" style="padding: 28px 36px; color: #09090b; line-height: 1.45; font-size: 11px;">
      <style>
        .cv-document {
          font-family: ${isSerif ? "'EB Garamond', Georgia, serif" : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
        }
        .header-title {
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }
        .header-headline {
          font-size: 13px;
          text-align: center;
          color: #3f3f46;
          margin: 0 0 6px 0;
          font-style: italic;
        }
        .header-contact {
          font-size: 10px;
          text-align: center;
          color: #52525b;
          margin: 0 0 16px 0;
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
          display: flex;
          font-size: 10.5px;
          margin-bottom: 3px;
        }
        .skill-cat {
          width: 140px;
          flex-shrink: 0;
          color: #09090b;
        }
        .skill-items {
          flex: 1;
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
