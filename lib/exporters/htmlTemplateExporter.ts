import { ResumeData, TemplateId, PaperSize, getVisibleResumeData, getSectionLabels, formatSocialDisplay } from "@/types/resume";

interface TemplateStyleConfig {
  fontFamily: string;
  nameTransform: string;
  nameSize: string;
  nameWeight: string;
  headlineColor: string;
  headlineSize: string;
  headlineWeight: string;
  headlineTransform: string;
  contactSeparator: string;
  sectionTitleBorder: string;
  sectionTitleColor: string;
  sectionTitleTransform: string;
  sectionTitleWeight: string;
  sectionTitleLetterSpacing: string;
  sectionTitleSize: string;
  isSerif: boolean;
}

const TEMPLATE_STYLES: Record<TemplateId, TemplateStyleConfig> = {
  academic_international: {
    fontFamily: "'Segoe UI', Calibri, Arial, -apple-system, BlinkMacSystemFont, sans-serif",
    nameTransform: "uppercase",
    nameSize: "18px",
    nameWeight: "700",
    headlineColor: "#3f3f46",
    headlineSize: "11px",
    headlineWeight: "500",
    headlineTransform: "none",
    contactSeparator: " • ",
    sectionTitleBorder: "1px solid #a1a1aa",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  harvard: {
    fontFamily: "'Times New Roman', Times, Georgia, serif",
    nameTransform: "uppercase",
    nameSize: "18px",
    nameWeight: "700",
    headlineColor: "#3f3f46",
    headlineSize: "11px",
    headlineWeight: "500",
    headlineTransform: "none",
    contactSeparator: " • ",
    sectionTitleBorder: "1px solid #18181b",
    sectionTitleColor: "#18181b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: true,
  },
  chile_profesional: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "uppercase",
    nameSize: "19px",
    nameWeight: "800",
    headlineColor: "#18181b",
    headlineSize: "11.5px",
    headlineWeight: "700",
    headlineTransform: "none",
    contactSeparator: " | ",
    sectionTitleBorder: "2px solid #18181b",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "11px",
    isSerif: false,
  },
  tech_minimalist: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19px",
    nameWeight: "800",
    headlineColor: "#2563eb",
    headlineSize: "11.5px",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " | ",
    sectionTitleBorder: "1px solid #e4e4e7",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  modern_executive: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19px",
    nameWeight: "800",
    headlineColor: "#0284c7",
    headlineSize: "11.5px",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " • ",
    sectionTitleBorder: "1.5px solid #0284c7",
    sectionTitleColor: "#0f172a",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  compact_swiss: {
    fontFamily: "Helvetica, Arial, system-ui, sans-serif",
    nameTransform: "uppercase",
    nameSize: "18px",
    nameWeight: "900",
    headlineColor: "#3f3f46",
    headlineSize: "10.5px",
    headlineWeight: "700",
    headlineTransform: "uppercase",
    contactSeparator: " / ",
    sectionTitleBorder: "1.5px solid #09090b",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "900",
    sectionTitleLetterSpacing: "0.08em",
    sectionTitleSize: "10px",
    isSerif: false,
  },
  stanford_clean: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "uppercase",
    nameSize: "18px",
    nameWeight: "900",
    headlineColor: "#52525b",
    headlineSize: "10.5px",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " • ",
    sectionTitleBorder: "1px solid #d4d4d8",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  skills_first: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19px",
    nameWeight: "800",
    headlineColor: "#059669",
    headlineSize: "11.5px",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " | ",
    sectionTitleBorder: "1.5px solid #059669",
    sectionTitleColor: "#064e3b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  executive_serif: {
    fontFamily: "'Times New Roman', Georgia, 'EB Garamond', serif",
    nameTransform: "uppercase",
    nameSize: "18px",
    nameWeight: "800",
    headlineColor: "#52525b",
    headlineSize: "10px",
    headlineWeight: "600",
    headlineTransform: "uppercase",
    contactSeparator: " • ",
    sectionTitleBorder: "1px solid #d4d4d8",
    sectionTitleColor: "#18181b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.08em",
    sectionTitleSize: "10.5px",
    isSerif: true,
  },
  tech_compact: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "18px",
    nameWeight: "800",
    headlineColor: "#4f46e5",
    headlineSize: "10.5px",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " | ",
    sectionTitleBorder: "1px solid #e4e4e7",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  modern_minimal: {
    fontFamily: "Arial, Helvetica, system-ui, sans-serif",
    nameTransform: "none",
    nameSize: "18px",
    nameWeight: "900",
    headlineColor: "#52525b",
    headlineSize: "10.5px",
    headlineWeight: "500",
    headlineTransform: "none",
    contactSeparator: " / ",
    sectionTitleBorder: "none",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
  career_changer: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19px",
    nameWeight: "800",
    headlineColor: "#d97706",
    headlineSize: "11.5px",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " • ",
    sectionTitleBorder: "1.5px solid #d97706",
    sectionTitleColor: "#78350f",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5px",
    isSerif: false,
  },
};

/**
 * Compilador de HTML puro independiente para exportación PDF vectorial con Puppeteer.
 * Respeta el diseño visual exacto de cada una de las 12 plantillas.
 */
export function generateTemplateHtml(
  rawData: ResumeData,
  templateId: TemplateId = "tech_minimalist",
  paperSize: PaperSize = "letter"
): string {
  const data = getVisibleResumeData(rawData);
  const labels = getSectionLabels(data);
  const styleConfig = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.tech_minimalist;

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

  const contactLine = contactItems.join(` &nbsp;${styleConfig.contactSeparator}&nbsp; `);

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
                <span class="skill-cat font-bold">${cat.category}: </span>
                <span class="skill-items">${templateId === "chile_profesional" || templateId === "academic_international" ? cat.skills.join(", ") : cat.skills.join(", ")}</span>
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
                      <span class="entry-subtitle font-medium"> — ${exp.company}</span>
                      ${exp.location ? `<span class="entry-loc font-normal text-zinc-600"> (${exp.location})</span>` : ""}
                    </div>
                    <div class="entry-dates">
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
              const dateStr = cert.date ? ` (${cert.date})` : "";
              return `
                <div class="cert-row">
                  <span class="cert-name font-semibold">${cert.name}</span>
                  <span class="cert-issuer"> — ${cert.issuer}${dateStr}</span>
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

  return `
    <div class="cv-document ${templateId} ${styleConfig.isSerif ? "font-serif" : "font-sans"}" style="padding: 10mm 12mm; color: #09090b; line-height: 1.35; font-size: 10px;">
      <style>
        .cv-document {
          font-family: ${styleConfig.fontFamily};
        }
        /* Header: force block-level separation for ATS text extraction */
        .header-title {
          font-size: ${styleConfig.nameSize};
          font-weight: ${styleConfig.nameWeight};
          text-align: center;
          margin: 0;
          padding: 0;
          letter-spacing: -0.02em;
          display: block;
          text-transform: ${styleConfig.nameTransform};
          color: #09090b;
        }
        .header-headline {
          font-size: ${styleConfig.headlineSize};
          text-align: center;
          color: ${styleConfig.headlineColor};
          margin: 2px 0 3px 0;
          padding: 0;
          font-weight: ${styleConfig.headlineWeight};
          text-transform: ${styleConfig.headlineTransform};
          display: block;
        }
        .header-contact {
          font-size: 9px;
          text-align: center;
          color: #52525b;
          margin: 0 0 8px 0;
          display: block;
          font-weight: 500;
        }
        .section-block {
          margin-bottom: 7px;
        }
        .section-title {
          font-size: ${styleConfig.sectionTitleSize};
          font-weight: ${styleConfig.sectionTitleWeight};
          text-transform: ${styleConfig.sectionTitleTransform};
          letter-spacing: ${styleConfig.sectionTitleLetterSpacing};
          border-bottom: ${styleConfig.sectionTitleBorder};
          padding-bottom: 1px;
          margin: 0 0 3px 0;
          color: ${styleConfig.sectionTitleColor};
        }
        .section-text {
          margin: 0;
          font-size: 9.5px;
          line-height: 1.35;
          color: #27272a;
          text-align: justify;
        }
        .skill-row {
          display: block;
          font-size: 9.5px;
          margin-bottom: 1px;
          line-height: 1.35;
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
          margin-bottom: 5px;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 10px;
          margin-bottom: 1px;
        }
        .entry-title {
          color: #09090b;
        }
        .entry-subtitle {
          color: #3f3f46;
        }
        .entry-dates {
          font-size: 9px;
          color: #52525b;
          font-family: ${templateId === "tech_minimalist" || templateId === "tech_compact" ? "monospace" : "inherit"};
          white-space: nowrap;
        }
        .entry-summary {
          margin: 1px 0 2px 0;
          font-size: 9px;
          color: #3f3f46;
        }
        .entry-bullets {
          margin: 1px 0 0 0;
          padding-left: 18px;
          list-style-type: disc !important;
          font-size: 9.5px;
          color: #27272a;
        }
        .entry-bullets li {
          display: list-item !important;
          list-style-type: disc !important;
          margin-bottom: 1px;
          line-height: 1.35;
        }
        /* Certifications: inline text with separator */
        .cert-row {
          display: block;
          font-size: 9px;
          margin-bottom: 1.5px;
          line-height: 1.35;
        }
        .proj-tech {
          font-size: 9px;
          font-family: monospace;
          color: #52525b;
        }
      </style>

      <div class="cv-header">
        <h1 class="header-title">${data.name || "Nombre Completo"}</h1>
        ${data.headline ? `<p class="header-headline">${data.headline}</p>` : ""}
        ${contactLine ? `<p class="header-contact">${contactLine}</p>` : ""}
      </div>

      <div class="cv-body">
        ${sectionsHtml}
      </div>
    </div>
  `;
}
