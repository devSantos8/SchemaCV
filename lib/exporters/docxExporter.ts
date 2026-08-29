import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
  convertInchesToTwip,
  ExternalHyperlink,
} from "docx";
import { ResumeData, getVisibleResumeData, getSectionLabels } from "@/types/resume";

/**
 * Genera un documento Microsoft Word (.docx) nativo, 100% optimizado para ATS.
 */
export async function generateResumeDocx(rawResume: ResumeData): Promise<Blob> {
  const resume = getVisibleResumeData(rawResume);
  const labels = getSectionLabels(resume);
  const children: (Paragraph | ExternalHyperlink)[] = [];

  // 1. Encabezado / Nombre
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, before: 0 },
      children: [
        new TextRun({
          text: resume.name,
          bold: true,
          size: 32, // 16pt
          font: "Arial",
        }),
      ],
    })
  );

  // Titular profesional
  if (resume.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: resume.headline,
            size: 22, // 11pt
            color: "444444",
            font: "Arial",
          }),
        ],
      })
    );
  }

  // Línea de contacto consolidada
  const contactParts: string[] = [];
  if (resume.location) contactParts.push(resume.location);
  if (resume.phone) contactParts.push(resume.phone);
  if (resume.email) contactParts.push(resume.email);
  if (resume.website) contactParts.push(resume.website.replace(/^https?:\/\//, ""));

  if (resume.social_networks && resume.social_networks.length > 0) {
    resume.social_networks.forEach((sn) => {
      contactParts.push(`${sn.network}: ${sn.username || sn.url.replace(/^https?:\/\//, "")}`);
    });
  }

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 19, // 9.5pt
            color: "555555",
            font: "Arial",
          }),
        ],
      })
    );
  }

  // Función auxiliar para títulos de sección ATS
  const createSectionHeader = (title: string): Paragraph => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 140, after: 40 },
      border: {
        bottom: {
          color: "333333",
          space: 2,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 20, // 10pt
          font: "Arial",
          color: "111111",
        }),
      ],
    });
  };

  // Renderizar secciones según el orden definido en section_order
  const sectionOrder = resume.section_order || [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "references",
  ];

  sectionOrder.forEach((sectionKey) => {
    switch (sectionKey) {
      case "summary":
        if (resume.summary) {
          children.push(createSectionHeader(labels.summary));
          children.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: resume.summary,
                  size: 18, // 9pt
                  font: "Arial",
                }),
              ],
            })
          );
        }
        break;

      case "skills":
        if (resume.skills && resume.skills.length > 0) {
          children.push(createSectionHeader(labels.skills));
          resume.skills.forEach((skillCat) => {
            children.push(
              new Paragraph({
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: `${skillCat.category}: `,
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: skillCat.skills.join(", "),
                    size: 18,
                    font: "Arial",
                  }),
                ],
              })
            );
          });
        }
        break;

      case "experience":
        if (resume.experience && resume.experience.length > 0) {
          children.push(createSectionHeader(labels.experience));
          resume.experience.forEach((exp) => {
            const dateStr = [exp.start_date, exp.end_date || (exp.current ? "Presente" : "")]
              .filter(Boolean)
              .join(" – ");

            // Línea de Cargo, Empresa, Ubicación y Fechas con Tab stop a la derecha
            children.push(
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { before: 80, after: 20 },
                children: [
                  new TextRun({
                    text: exp.position,
                    bold: true,
                    size: 19,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: ` — ${exp.company}${exp.location ? ` (${exp.location})` : ""}`,
                    size: 18,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: `\t${dateStr}`,
                    bold: true,
                    size: 18,
                    color: "555555",
                    font: "Arial",
                  }),
                ],
              })
            );

            // Viñetas de logros
            if (exp.highlights && exp.highlights.length > 0) {
              exp.highlights.forEach((hl) => {
                children.push(
                  new Paragraph({
                    bullet: { level: 0 },
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: hl,
                        size: 18,
                        font: "Arial",
                      }),
                    ],
                  })
                );
              });
            } else if (exp.summary) {
              children.push(
                new Paragraph({
                  spacing: { after: 40 },
                  children: [
                    new TextRun({
                      text: exp.summary,
                      size: 18,
                      font: "Arial",
                    }),
                  ],
                })
              );
            }
          });
        }
        break;

      case "projects":
        if (resume.projects && resume.projects.length > 0) {
          children.push(createSectionHeader(labels.projects));
          resume.projects.forEach((proj) => {
            const dateStr = [proj.start_date, proj.end_date].filter(Boolean).join(" – ");
            const techStr = proj.technologies?.length ? ` (${proj.technologies.join(", ")})` : "";

            children.push(
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { before: 80, after: 20 },
                children: [
                  new TextRun({
                    text: proj.name,
                    bold: true,
                    size: 19,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: techStr,
                    size: 18,
                    color: "444444",
                    font: "Arial",
                  }),
                  ...(dateStr
                    ? [
                        new TextRun({
                          text: `\t${dateStr}`,
                          size: 18,
                          color: "555555",
                          font: "Arial",
                        }),
                      ]
                    : []),
                ],
              })
            );

            if (proj.description) {
              children.push(
                new Paragraph({
                  spacing: { after: 20 },
                  children: [
                    new TextRun({
                      text: proj.description,
                      size: 18,
                      font: "Arial",
                    }),
                  ],
                })
              );
            }

            if (proj.highlights && proj.highlights.length > 0) {
              proj.highlights.forEach((hl) => {
                children.push(
                  new Paragraph({
                    bullet: { level: 0 },
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: hl,
                        size: 18,
                        font: "Arial",
                      }),
                    ],
                  })
                );
              });
            }
          });
        }
        break;

      case "education":
        if (resume.education && resume.education.length > 0) {
          children.push(createSectionHeader(labels.education));
          resume.education.forEach((edu) => {
            const dateStr = [edu.start_date, edu.end_date || (edu.current ? "Presente" : "")]
              .filter(Boolean)
              .join(" – ");

            children.push(
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { before: 80, after: 10 },
                children: [
                  new TextRun({
                    text: edu.institution,
                    bold: true,
                    size: 19,
                    font: "Arial",
                  }),
                  ...(dateStr
                    ? [
                        new TextRun({
                          text: `\t${dateStr}`,
                          bold: true,
                          size: 18,
                          color: "555555",
                          font: "Arial",
                        }),
                      ]
                    : []),
                ],
              })
            );

            children.push(
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: `${edu.degree}${edu.area ? ` en ${edu.area}` : ""}`,
                    size: 18,
                    font: "Arial",
                  }),
                  ...(edu.location
                    ? [
                        new TextRun({
                          text: `\t${edu.location}`,
                          size: 17,
                          color: "555555",
                          font: "Arial",
                        }),
                      ]
                    : []),
                ],
              })
            );

            if (edu.highlights && edu.highlights.length > 0) {
              edu.highlights.forEach((hl) => {
                children.push(
                  new Paragraph({
                    bullet: { level: 0 },
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: hl,
                        size: 18,
                        font: "Arial",
                      }),
                    ],
                  })
                );
              });
            }
          });
        }
        break;

      case "certifications":
        if (resume.certifications && resume.certifications.length > 0) {
          children.push(createSectionHeader(labels.certifications));
          resume.certifications.forEach((cert) => {
            children.push(
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { before: 40, after: 20 },
                children: [
                  new TextRun({
                    text: cert.name,
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: ` — ${cert.issuer}`,
                    size: 18,
                    font: "Arial",
                  }),
                  ...(cert.date
                    ? [
                        new TextRun({
                          text: `\t${cert.date}`,
                          size: 18,
                          color: "555555",
                          font: "Arial",
                        }),
                      ]
                    : []),
                ],
              })
            );
          });
        }
        break;

      case "references":
        if (resume.references && resume.references.length > 0) {
          children.push(createSectionHeader(labels.references));
          resume.references.forEach((ref) => {
            const contactRuns: TextRun[] = [];
            if (ref.email) {
              contactRuns.push(new TextRun({ text: ref.email, size: 17, color: "555555", font: "Arial" }));
            }
            if (ref.phone) {
              if (contactRuns.length > 0) {
                contactRuns.push(new TextRun({ text: "  |  ", size: 17, color: "888888", font: "Arial" }));
              }
              contactRuns.push(new TextRun({ text: ref.phone, size: 17, color: "555555", font: "Arial" }));
            }

            children.push(
              new Paragraph({
                spacing: { before: 60, after: 10 },
                children: [
                  new TextRun({
                    text: ref.name,
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: ` — ${ref.position}${ref.company ? ` (${ref.company})` : ""}${ref.relationship ? ` [${ref.relationship}]` : ""}`,
                    size: 18,
                    font: "Arial",
                  }),
                ],
              })
            );

            if (contactRuns.length > 0) {
              children.push(
                new Paragraph({
                  spacing: { before: 0, after: 20 },
                  children: contactRuns,
                })
              );
            }
          });
        }
        break;
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.45),
              bottom: convertInchesToTwip(0.45),
              left: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
            },
          },
        },
        children: children as any,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
