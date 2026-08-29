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
  contactFontSize?: string;
  sectionTitleBorder: string;
  sectionTitleColor: string;
  sectionTitleTransform: string;
  sectionTitleWeight: string;
  sectionTitleLetterSpacing: string;
  sectionTitleSize: string;
  isSerif: boolean;
  padding: string;
  baseFontSize: string;
  headerAlign: "left" | "center" | "between";
  headerBorderBottom?: string;
  sectionMargin: string;
  entryTitleSize: string;
  entryDateSize: string;
  bulletSize: string;
}

const TEMPLATE_STYLES: Record<TemplateId, TemplateStyleConfig> = {
  academic_international: {
    fontFamily: "'Segoe UI', Calibri, Arial, -apple-system, BlinkMacSystemFont, sans-serif",
    nameTransform: "uppercase",
    nameSize: "18pt",
    nameWeight: "700",
    headlineColor: "#3f3f46",
    headlineSize: "10.5pt",
    headlineWeight: "500",
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #a1a1aa",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10pt",
    isSerif: false,
    padding: "0.42in 0.52in",
    baseFontSize: "9.5pt",
    headerAlign: "center",
    sectionMargin: "8.5px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  harvard: {
    fontFamily: "'Times New Roman', Times, Georgia, serif",
    nameTransform: "uppercase",
    nameSize: "17pt",
    nameWeight: "700",
    headlineColor: "#3f3f46",
    headlineSize: "9.5pt",
    headlineWeight: "500",
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #18181b",
    sectionTitleColor: "#18181b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10pt",
    isSerif: true,
    padding: "0.4in 0.5in",
    baseFontSize: "9.5pt",
    headerAlign: "center",
    sectionMargin: "8px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  chile_profesional: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "uppercase",
    nameSize: "20pt",
    nameWeight: "900",
    headlineColor: "#1e40af",
    headlineSize: "10.5pt",
    headlineWeight: "700",
    headlineTransform: "none",
    contactSeparator: " | ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #d4d4d8",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "900",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "9.5pt",
    isSerif: false,
    padding: "0.42in 0.52in",
    baseFontSize: "9.2pt",
    headerAlign: "left",
    headerBorderBottom: "2px solid #18181b",
    sectionMargin: "9px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  tech_minimalist: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19pt",
    nameWeight: "800",
    headlineColor: "#2563eb",
    headlineSize: "11pt",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " / ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #e4e4e7",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10pt",
    isSerif: false,
    padding: "0.38in 0.48in",
    baseFontSize: "9pt",
    headerAlign: "between",
    sectionMargin: "6.5px",
    entryTitleSize: "9pt",
    entryDateSize: "8.2pt",
    bulletSize: "8.5pt",
  },
  modern_executive: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "20pt",
    nameWeight: "800",
    headlineColor: "#0284c7",
    headlineSize: "11pt",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1.5px solid #0284c7",
    sectionTitleColor: "#0f172a",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5pt",
    isSerif: false,
    padding: "0.45in 0.5in",
    baseFontSize: "9.5pt",
    headerAlign: "left",
    sectionMargin: "9px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  compact_swiss: {
    fontFamily: "Helvetica, Arial, system-ui, sans-serif",
    nameTransform: "uppercase",
    nameSize: "18pt",
    nameWeight: "900",
    headlineColor: "#3f3f46",
    headlineSize: "10pt",
    headlineWeight: "700",
    headlineTransform: "uppercase",
    contactSeparator: " / ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1.5px solid #09090b",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "900",
    sectionTitleLetterSpacing: "0.08em",
    sectionTitleSize: "9.5pt",
    isSerif: false,
    padding: "0.38in 0.45in",
    baseFontSize: "9pt",
    headerAlign: "left",
    sectionMargin: "7px",
    entryTitleSize: "9pt",
    entryDateSize: "8pt",
    bulletSize: "8.5pt",
  },
  stanford_clean: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "uppercase",
    nameSize: "19pt",
    nameWeight: "900",
    headlineColor: "#52525b",
    headlineSize: "10.5pt",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #d4d4d8",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10pt",
    isSerif: false,
    padding: "0.42in 0.52in",
    baseFontSize: "9.5pt",
    headerAlign: "left",
    sectionMargin: "8.5px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  skills_first: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19pt",
    nameWeight: "800",
    headlineColor: "#059669",
    headlineSize: "11pt",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " | ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1.5px solid #059669",
    sectionTitleColor: "#064e3b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10pt",
    isSerif: false,
    padding: "0.42in 0.52in",
    baseFontSize: "9.2pt",
    headerAlign: "left",
    sectionMargin: "8.5px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  executive_serif: {
    fontFamily: "'Times New Roman', Georgia, 'EB Garamond', serif",
    nameTransform: "uppercase",
    nameSize: "19pt",
    nameWeight: "800",
    headlineColor: "#52525b",
    headlineSize: "10pt",
    headlineWeight: "600",
    headlineTransform: "uppercase",
    contactSeparator: " • ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #d4d4d8",
    sectionTitleColor: "#18181b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.08em",
    sectionTitleSize: "10.5pt",
    isSerif: true,
    padding: "0.42in 0.52in",
    baseFontSize: "9.5pt",
    headerAlign: "center",
    sectionMargin: "9px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  tech_compact: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "18pt",
    nameWeight: "800",
    headlineColor: "#4f46e5",
    headlineSize: "10pt",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " | ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1px solid #e4e4e7",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "700",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "9.5pt",
    isSerif: false,
    padding: "0.38in 0.45in",
    baseFontSize: "9pt",
    headerAlign: "between",
    sectionMargin: "7px",
    entryTitleSize: "9pt",
    entryDateSize: "8pt",
    bulletSize: "8.5pt",
  },
  modern_minimal: {
    fontFamily: "Arial, Helvetica, system-ui, sans-serif",
    nameTransform: "none",
    nameSize: "19pt",
    nameWeight: "900",
    headlineColor: "#52525b",
    headlineSize: "10.5pt",
    headlineWeight: "500",
    headlineTransform: "none",
    contactSeparator: " / ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "none",
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10.5pt",
    isSerif: false,
    padding: "0.45in 0.55in",
    baseFontSize: "9.5pt",
    headerAlign: "left",
    sectionMargin: "9px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
  },
  career_changer: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nameTransform: "none",
    nameSize: "19pt",
    nameWeight: "800",
    headlineColor: "#d97706",
    headlineSize: "11pt",
    headlineWeight: "600",
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: "8.5pt",
    sectionTitleBorder: "1.5px solid #d97706",
    sectionTitleColor: "#78350f",
    sectionTitleTransform: "uppercase",
    sectionTitleWeight: "800",
    sectionTitleLetterSpacing: "0.05em",
    sectionTitleSize: "10pt",
    isSerif: false,
    padding: "0.42in 0.52in",
    baseFontSize: "9.5pt",
    headerAlign: "left",
    sectionMargin: "8.5px",
    entryTitleSize: "9.5pt",
    entryDateSize: "8.5pt",
    bulletSize: "9pt",
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
    "references",
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
            <div class="section-block page-break-avoid">
              <h2 class="section-title">${labels.certifications}</h2>
              <div class="certs-container">${certList}</div>
            </div>
          `;
        }
        break;

      case "references":
        if (data.references && data.references.length > 0) {
          const refList = data.references
            .map((ref) => {
              const contactParts = [];
              if (ref.email) contactParts.push(`<a href="mailto:${ref.email}" style="color: inherit; text-decoration: underline;">${ref.email}</a>`);
              if (ref.phone) contactParts.push(ref.phone);
              const contactStr = contactParts.length ? `<div style="font-size: 8.5px; color: #52525b; font-family: monospace;">${contactParts.join(" &nbsp;|&nbsp; ")}</div>` : "";
              const relStr = ref.relationship ? ` (${ref.relationship})` : "";

              return `
                <div class="ref-entry page-break-avoid" style="margin-bottom: 4px;">
                  <div style="font-weight: 700; color: #09090b; font-size: 9.5px;">${ref.name}</div>
                  <div style="color: #3f3f46; font-size: 9px;">${ref.position}${ref.company ? ` — ${ref.company}` : ""}${relStr}</div>
                  ${contactStr}
                </div>
              `;
            })
            .join("");

          sectionsHtml += `
            <div class="section-block page-break-avoid">
              <h2 class="section-title">${labels.references}</h2>
              <div class="references-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px;">${refList}</div>
            </div>
          `;
        }
        break;
    }
  });

  let headerHtml = "";
  if (styleConfig.headerAlign === "between") {
    headerHtml = `
      <div class="cv-header header-between" style="display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-bottom: ${styleConfig.sectionMargin};">
        <div style="flex: 1 1 auto; min-width: 45%;">
          <h1 class="header-title" style="text-align: left; margin: 0; padding: 0; white-space: nowrap;">${data.name || "Nombre Completo"}</h1>
          ${data.headline ? `<p class="header-headline" style="text-align: left; margin: 1px 0 0 0;">${data.headline}</p>` : ""}
        </div>
        ${contactLine ? `<div class="header-contact" style="max-width: 52%; text-align: right; margin: 0; font-size: ${styleConfig.contactFontSize || "8.5pt"}; line-height: 1.35;">${contactLine}</div>` : ""}
      </div>
    `;
  } else if (styleConfig.headerAlign === "left") {
    headerHtml = `
      <div class="cv-header header-left" style="margin-bottom: ${styleConfig.sectionMargin}; ${styleConfig.headerBorderBottom ? `border-bottom: ${styleConfig.headerBorderBottom}; padding-bottom: 6px;` : ""}">
        <h1 class="header-title" style="text-align: left; margin: 0; padding: 0;">${data.name || "Nombre Completo"}</h1>
        ${data.headline ? `<p class="header-headline" style="text-align: left; margin: 2px 0 3px 0;">${data.headline}</p>` : ""}
        ${contactLine ? `<div class="header-contact" style="text-align: left; margin: 2px 0 0 0; font-size: ${styleConfig.contactFontSize || "8.5pt"};">${contactLine}</div>` : ""}
      </div>
    `;
  } else {
    // Centered default
    headerHtml = `
      <div class="cv-header header-center" style="text-align: center; margin-bottom: ${styleConfig.sectionMargin};">
        <h1 class="header-title" style="text-align: center; margin: 0; padding: 0;">${data.name || "Nombre Completo"}</h1>
        ${data.headline ? `<p class="header-headline" style="text-align: center; margin: 2px 0 2px 0;">${data.headline}</p>` : ""}
        ${contactLine ? `<div class="header-contact" style="text-align: center; margin: 2px 0 0 0; font-size: ${styleConfig.contactFontSize || "8.5pt"};">${contactLine}</div>` : ""}
      </div>
    `;
  }

  return `
    <div class="cv-document ${templateId} ${styleConfig.isSerif ? "font-serif" : "font-sans"}" style="padding: ${styleConfig.padding}; color: #09090b; line-height: 1.35; font-size: ${styleConfig.baseFontSize};">
      <style>
        .cv-document {
          font-family: ${styleConfig.fontFamily};
        }
        /* Header: force block-level separation for ATS text extraction */
        .header-title {
          font-size: ${styleConfig.nameSize};
          font-weight: ${styleConfig.nameWeight};
          letter-spacing: -0.02em;
          display: block;
          text-transform: ${styleConfig.nameTransform};
          color: #09090b;
          line-height: 1.1;
        }
        .header-headline {
          font-size: ${styleConfig.headlineSize};
          color: ${styleConfig.headlineColor};
          font-weight: ${styleConfig.headlineWeight};
          text-transform: ${styleConfig.headlineTransform};
          display: block;
          line-height: 1.25;
        }
        .header-contact {
          font-size: ${styleConfig.contactFontSize || "8.5pt"};
          color: #4b5563;
          display: block;
          font-weight: 500;
          line-height: 1.3;
        }
        .section-block {
          margin-bottom: ${styleConfig.sectionMargin};
        }
        .section-title {
          font-size: ${styleConfig.sectionTitleSize};
          font-weight: ${styleConfig.sectionTitleWeight};
          text-transform: ${styleConfig.sectionTitleTransform};
          letter-spacing: ${styleConfig.sectionTitleLetterSpacing};
          border-bottom: ${styleConfig.sectionTitleBorder};
          padding-bottom: 2px;
          margin: 0 0 4px 0;
          color: ${styleConfig.sectionTitleColor};
          line-height: 1.2;
        }
        .section-text {
          margin: 0;
          font-size: ${styleConfig.baseFontSize};
          line-height: 1.38;
          color: #27272a;
          text-align: justify;
        }
        .skill-row {
          display: block;
          font-size: ${styleConfig.baseFontSize};
          margin-bottom: 2px;
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
          margin-bottom: 6px;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: ${styleConfig.entryTitleSize};
          margin-bottom: 1.5px;
        }
        .entry-title {
          color: #09090b;
          font-weight: 700;
        }
        .entry-subtitle {
          color: #3f3f46;
          font-weight: 500;
        }
        .entry-dates {
          font-size: ${styleConfig.entryDateSize};
          color: #52525b;
          font-family: ${templateId === "tech_minimalist" || templateId === "tech_compact" || templateId === "chile_profesional" ? "monospace" : "inherit"};
          white-space: nowrap;
          font-weight: 600;
        }
        .entry-summary {
          margin: 1.5px 0 2px 0;
          font-size: ${styleConfig.baseFontSize};
          color: #3f3f46;
          font-style: italic;
        }
        .entry-bullets {
          margin: 2px 0 0 0;
          padding-left: 18px;
          list-style-type: disc !important;
          font-size: ${styleConfig.bulletSize};
          color: #27272a;
          line-height: 1.35;
        }
        .entry-bullets li {
          display: list-item !important;
          list-style-type: disc !important;
          margin-bottom: 1.5px;
          line-height: 1.35;
        }
        /* Certifications: inline text with separator */
        .cert-row {
          display: block;
          font-size: ${styleConfig.baseFontSize};
          margin-bottom: 2px;
          line-height: 1.35;
        }
        .proj-tech {
          font-size: ${styleConfig.entryDateSize};
          font-family: monospace;
          color: #52525b;
        }
      </style>

      ${headerHtml}

      <div class="cv-body">
        ${sectionsHtml}
      </div>
    </div>
  `;
}
