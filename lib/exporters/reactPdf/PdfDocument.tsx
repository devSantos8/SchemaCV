import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  ResumeData,
  TemplateId,
  PaperSize,
  getVisibleResumeData,
  getSectionLabels,
  formatSocialDisplay,
} from "@/types/resume";

export interface PdfDocumentProps {
  data: ResumeData;
  templateId?: TemplateId;
  paperSize?: PaperSize;
  title?: string;
}

interface TemplateConfig {
  fontFamily: string;
  isSerif: boolean;
  nameTransform: "uppercase" | "none";
  nameSize: number;
  nameWeight: "bold" | "normal";
  headlineColor: string;
  headlineSize: number;
  headlineTransform: "uppercase" | "none";
  contactSeparator: string;
  contactFontSize: number;
  sectionTitleBorder: boolean;
  sectionTitleBorderColor: string;
  sectionTitleBorderWidth: number;
  sectionTitleColor: string;
  sectionTitleTransform: "uppercase" | "none";
  sectionTitleSize: number;
  headerAlign: "left" | "center" | "between";
  headerBorderBottom?: boolean;
  headerBorderBottomColor?: string;
  headerBorderBottomWidth?: number;
  paddingTop: number;
  paddingBottom: number;
  paddingHorizontal: number;
  baseFontSize: number;
  sectionMargin: number;
  entryTitleSize: number;
  entryDateSize: number;
  bulletSize: number;
}

const TEMPLATE_CONFIGS: Record<TemplateId, TemplateConfig> = {
  academic_international: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "uppercase",
    nameSize: 14.5,
    nameWeight: "bold",
    headlineColor: "#3f3f46",
    headlineSize: 8.5,
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#a1a1aa",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  chile_profesional: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "uppercase",
    nameSize: 15.5,
    nameWeight: "bold",
    headlineColor: "#1e40af",
    headlineSize: 8.8,
    headlineTransform: "none",
    contactSeparator: " | ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#d4d4d8",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "left",
    headerBorderBottom: true,
    headerBorderBottomColor: "#18181b",
    headerBorderBottomWidth: 1.5,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  harvard: {
    fontFamily: "Times-Roman",
    isSerif: true,
    nameTransform: "uppercase",
    nameSize: 14.5,
    nameWeight: "bold",
    headlineColor: "#3f3f46",
    headlineSize: 8.5,
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#18181b",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#18181b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 8.0,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.8,
  },
  tech_minimalist: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "none",
    nameSize: 15,
    nameWeight: "bold",
    headlineColor: "#2563eb",
    headlineSize: 8.8,
    headlineTransform: "none",
    contactSeparator: " / ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#e4e4e7",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "between",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  modern_executive: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "none",
    nameSize: 15.5,
    nameWeight: "bold",
    headlineColor: "#0284c7",
    headlineSize: 8.8,
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#0284c7",
    sectionTitleBorderWidth: 1.0,
    sectionTitleColor: "#0f172a",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.8,
    headerAlign: "left",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.8,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  compact_swiss: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "uppercase",
    nameSize: 14,
    nameWeight: "bold",
    headlineColor: "#3f3f46",
    headlineSize: 7.8,
    headlineTransform: "uppercase",
    contactSeparator: " / ",
    contactFontSize: 6.8,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#09090b",
    sectionTitleBorderWidth: 1.0,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 7.8,
    headerAlign: "left",
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    baseFontSize: 7.4,
    sectionMargin: 3.0,
    entryTitleSize: 7.8,
    entryDateSize: 6.8,
    bulletSize: 7.2,
  },
  stanford_clean: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "uppercase",
    nameSize: 15,
    nameWeight: "bold",
    headlineColor: "#52525b",
    headlineSize: 8.5,
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#d4d4d8",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "left",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  skills_first: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "none",
    nameSize: 15,
    nameWeight: "bold",
    headlineColor: "#059669",
    headlineSize: 8.8,
    headlineTransform: "none",
    contactSeparator: " | ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#059669",
    sectionTitleBorderWidth: 1.0,
    sectionTitleColor: "#064e3b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "left",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  executive_serif: {
    fontFamily: "Times-Roman",
    isSerif: true,
    nameTransform: "uppercase",
    nameSize: 15,
    nameWeight: "bold",
    headlineColor: "#52525b",
    headlineSize: 8.5,
    headlineTransform: "uppercase",
    contactSeparator: " • ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#d4d4d8",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#18181b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.8,
    headerAlign: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 8.0,
    sectionMargin: 3.8,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.8,
  },
  tech_compact: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "none",
    nameSize: 14,
    nameWeight: "bold",
    headlineColor: "#4f46e5",
    headlineSize: 7.8,
    headlineTransform: "none",
    contactSeparator: " | ",
    contactFontSize: 6.8,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#e4e4e7",
    sectionTitleBorderWidth: 0.8,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 7.8,
    headerAlign: "between",
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    baseFontSize: 7.4,
    sectionMargin: 3.0,
    entryTitleSize: 7.8,
    entryDateSize: 6.8,
    bulletSize: 7.2,
  },
  modern_minimal: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "none",
    nameSize: 15,
    nameWeight: "bold",
    headlineColor: "#52525b",
    headlineSize: 8.5,
    headlineTransform: "none",
    contactSeparator: " / ",
    contactFontSize: 7.2,
    sectionTitleBorder: false,
    sectionTitleBorderColor: "transparent",
    sectionTitleBorderWidth: 0,
    sectionTitleColor: "#09090b",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.8,
    headerAlign: "left",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.8,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
  career_changer: {
    fontFamily: "Helvetica",
    isSerif: false,
    nameTransform: "none",
    nameSize: 15,
    nameWeight: "bold",
    headlineColor: "#d97706",
    headlineSize: 8.8,
    headlineTransform: "none",
    contactSeparator: " • ",
    contactFontSize: 7.2,
    sectionTitleBorder: true,
    sectionTitleBorderColor: "#d97706",
    sectionTitleBorderWidth: 1.0,
    sectionTitleColor: "#78350f",
    sectionTitleTransform: "uppercase",
    sectionTitleSize: 8.5,
    headerAlign: "left",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
    baseFontSize: 7.8,
    sectionMargin: 3.5,
    entryTitleSize: 8.2,
    entryDateSize: 7.2,
    bulletSize: 7.6,
  },
};

export const PdfDocument: React.FC<PdfDocumentProps> = ({
  data: rawData,
  templateId = "chile_profesional",
  paperSize = "letter",
  title = "Curriculum_Vitae",
}) => {
  const data = getVisibleResumeData(rawData);
  const labels = getSectionLabels(data);
  const config = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS.chile_profesional;

  // Contact items
  const contactItems: { label: string; url?: string }[] = [];
  if (data.location) contactItems.push({ label: data.location });
  if (data.phone) contactItems.push({ label: data.phone });
  if (data.email) contactItems.push({ label: data.email, url: `mailto:${data.email}` });
  if (data.website) {
    const webClean = data.website.replace(/^https?:\/\//, "");
    const webUrl = data.website.startsWith("http") ? data.website : `https://${data.website}`;
    contactItems.push({ label: webClean, url: webUrl });
  }

  (data.social_networks || []).forEach((sn) => {
    const formatted = formatSocialDisplay(sn);
    if (formatted.label) {
      contactItems.push(formatted);
    }
  });

  const baseFont = config.fontFamily;
  const boldFont = config.isSerif ? "Times-Bold" : "Helvetica-Bold";
  const italicFont = config.isSerif ? "Times-Italic" : "Helvetica-Oblique";
  const monoFont = "Courier";

  const styles = StyleSheet.create({
    page: {
      paddingTop: config.paddingTop,
      paddingBottom: config.paddingBottom,
      paddingHorizontal: config.paddingHorizontal,
      fontFamily: baseFont,
      color: "#09090b",
      lineHeight: 1.18,
    },
    headerCenter: {
      textAlign: "center",
      marginBottom: config.sectionMargin,
      alignItems: "center",
    },
    headerLeft: {
      marginBottom: config.sectionMargin,
      borderBottomWidth: config.headerBorderBottom ? (config.headerBorderBottomWidth || 1.5) : 0,
      borderBottomColor: config.headerBorderBottomColor || "#18181b",
      paddingBottom: config.headerBorderBottom ? 2.0 : 0,
    },
    headerBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: config.sectionMargin,
    },
    name: {
      fontSize: config.nameSize,
      fontFamily: boldFont,
      textTransform: config.nameTransform,
      color: "#09090b",
      letterSpacing: -0.2,
      marginBottom: 0.3,
    },
    headline: {
      fontSize: config.headlineSize,
      fontFamily: boldFont,
      color: config.headlineColor,
      textTransform: config.headlineTransform,
      marginBottom: 0.8,
    },
    contactContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: config.headerAlign === "center" ? "center" : "flex-start",
      marginTop: 0.3,
    },
    contactItem: {
      fontSize: config.contactFontSize,
      color: "#4b5563",
    },
    contactLink: {
      fontSize: config.contactFontSize,
      color: "#1e40af",
      textDecoration: "none",
    },
    contactSeparator: {
      fontSize: config.contactFontSize,
      color: "#9ca3af",
      marginHorizontal: 1.5,
    },
    section: {
      marginBottom: config.sectionMargin,
    },
    sectionTitle: {
      fontSize: config.sectionTitleSize,
      fontFamily: boldFont,
      color: config.sectionTitleColor,
      textTransform: config.sectionTitleTransform,
      letterSpacing: 0.3,
      borderBottomWidth: config.sectionTitleBorder ? config.sectionTitleBorderWidth : 0,
      borderBottomColor: config.sectionTitleBorderColor,
      paddingBottom: 0.4,
      marginBottom: 1.5,
    },
    summaryText: {
      fontSize: config.baseFontSize,
      color: "#27272a",
      textAlign: "justify",
      lineHeight: 1.20,
    },
    skillRow: {
      flexDirection: "row",
      marginBottom: 0.35,
      fontSize: config.baseFontSize,
      lineHeight: 1.18,
    },
    skillCat: {
      fontFamily: boldFont,
      color: "#09090b",
      marginRight: 2,
    },
    skillItems: {
      color: "#27272a",
      flex: 1,
    },
    entryBlock: {
      marginBottom: 1.8,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 0.3,
    },
    entryTitle: {
      fontSize: config.entryTitleSize,
      fontFamily: boldFont,
      color: "#09090b",
    },
    entrySubtitle: {
      fontSize: config.entryTitleSize,
      color: "#3f3f46",
    },
    entryDates: {
      fontSize: config.entryDateSize,
      fontFamily: (templateId === "tech_minimalist" || templateId === "tech_compact" || templateId === "chile_profesional") ? monoFont : baseFont,
      color: "#52525b",
    },
    entrySummary: {
      fontSize: config.baseFontSize,
      color: "#3f3f46",
      fontFamily: italicFont,
      marginVertical: 0.3,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 0.35,
      paddingLeft: 2.0,
    },
    bulletDot: {
      fontSize: config.bulletSize,
      color: "#27272a",
      marginRight: 2.5,
      lineHeight: 1.15,
    },
    bulletText: {
      fontSize: config.bulletSize,
      color: "#27272a",
      flex: 1,
      lineHeight: 1.18,
    },
    certRow: {
      flexDirection: "row",
      marginBottom: 0.35,
      fontSize: config.baseFontSize,
      lineHeight: 1.18,
    },
    certName: {
      fontFamily: boldFont,
      color: "#09090b",
    },
    certIssuer: {
      color: "#3f3f46",
    },
    referencesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    referenceCard: {
      width: "48%",
      marginBottom: 1.5,
    },
    refName: {
      fontSize: config.entryTitleSize,
      fontFamily: boldFont,
      color: "#09090b",
    },
    refDetails: {
      fontSize: config.baseFontSize,
      color: "#3f3f46",
    },
    refContact: {
      fontSize: config.entryDateSize,
      fontFamily: monoFont,
      color: "#52525b",
      marginTop: 0.3,
    },
  });

  const renderHeader = () => {
    if (config.headerAlign === "between") {
      return (
        <View style={styles.headerBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{data.name || "Nombre Completo"}</Text>
            {data.headline && <Text style={styles.headline}>{data.headline}</Text>}
          </View>
          {contactItems.length > 0 && (
            <View style={[styles.contactContainer, { justifyContent: "flex-end", maxWidth: "50%" }]}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.url ? (
                    <Link src={item.url} style={styles.contactLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text style={styles.contactItem}>{item.label}</Text>
                  )}
                  {idx < contactItems.length - 1 && (
                    <Text style={styles.contactSeparator}>{config.contactSeparator}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
      );
    }

    const headerStyle = config.headerAlign === "center" ? styles.headerCenter : styles.headerLeft;

    return (
      <View style={headerStyle}>
        <Text style={styles.name}>{data.name || "Nombre Completo"}</Text>
        {data.headline && <Text style={styles.headline}>{data.headline}</Text>}
        {contactItems.length > 0 && (
          <View style={styles.contactContainer}>
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.url ? (
                  <Link src={item.url} style={styles.contactLink}>
                    {item.label}
                  </Link>
                ) : (
                  <Text style={styles.contactItem}>{item.label}</Text>
                )}
                {idx < contactItems.length - 1 && (
                  <Text style={styles.contactSeparator}>{config.contactSeparator}</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "summary":
        if (!data.summary) return null;
        return (
          <View key="summary" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{labels.summary}</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        );

      case "skills":
        if (!data.skills || data.skills.length === 0) return null;
        const separator = templateId === "chile_profesional" ? " • " : ", ";
        return (
          <View key="skills" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{labels.skills}</Text>
            {data.skills.map((cat) => (
              <View key={cat.id || cat.category} style={styles.skillRow} wrap={false}>
                <Text style={styles.skillCat}>{cat.category}: </Text>
                <Text style={styles.skillItems}>{cat.skills.join(separator)}</Text>
              </View>
            ))}
          </View>
        );

      case "experience":
        if (!data.experience || data.experience.length === 0) return null;
        const expSeparator = templateId === "chile_profesional" ? " | " : (templateId === "tech_minimalist" || templateId === "compact_swiss" ? " @ " : " — ");
        return (
          <View key="experience" style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.experience}</Text>
            {data.experience.map((exp) => {
              const endDateStr = exp.current ? labels.present : (exp.end_date || labels.present);
              return (
                <View key={exp.id} style={styles.entryBlock} wrap={false}>
                  <View style={styles.entryHeader}>
                    <Text>
                      <Text style={styles.entryTitle}>{exp.position}</Text>
                      <Text style={styles.entrySubtitle}>{expSeparator}{exp.company}</Text>
                      {exp.location && <Text style={{ color: "#52525b", fontSize: config.entryDateSize }}> ({exp.location})</Text>}
                    </Text>
                    <Text style={styles.entryDates}>
                      {exp.start_date} – {endDateStr}
                    </Text>
                  </View>

                  {exp.summary && <Text style={styles.entrySummary}>{exp.summary}</Text>}

                  {(exp.highlights || []).map((h, i) => (
                    <View key={i} style={styles.bulletRow} wrap={false}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );

      case "projects":
        if (!data.projects || data.projects.length === 0) return null;
        return (
          <View key="projects" style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.projects}</Text>
            {data.projects.map((proj) => {
              const techStr = proj.technologies && proj.technologies.length > 0
                ? (templateId === "academic_international" || templateId === "harvard" ? ` | ${proj.technologies.join(", ")}` : ` [${proj.technologies.join(", ")}]`)
                : "";

              return (
                <View key={proj.id} style={styles.entryBlock} wrap={false}>
                  <View style={styles.entryHeader}>
                    <Text>
                      <Text style={styles.entryTitle}>{proj.name}</Text>
                      {techStr && (
                        <Text style={{ fontSize: config.entryDateSize, color: "#52525b" }}>
                          {techStr}
                        </Text>
                      )}
                    </Text>
                    {proj.start_date && (
                      <Text style={styles.entryDates}>
                        {proj.start_date}{proj.end_date ? ` – ${proj.end_date}` : ""}
                      </Text>
                    )}
                  </View>

                  {proj.description && (!proj.highlights || proj.highlights.length === 0 || proj.highlights[0] !== proj.description) && (
                    <Text style={{ fontSize: config.baseFontSize, color: "#3f3f46", marginVertical: 0.3 }}>
                      {proj.description}
                    </Text>
                  )}

                  {(proj.highlights || []).map((h, i) => (
                    <View key={i} style={styles.bulletRow} wrap={false}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );

      case "education":
        if (!data.education || data.education.length === 0) return null;
        const isAcademicLayout = templateId === "academic_international" || templateId === "harvard" || templateId === "tech_minimalist" || templateId === "modern_executive" || templateId === "skills_first";

        return (
          <View key="education" style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.education}</Text>
            {data.education.map((edu) => {
              const eduEndDate = edu.current ? labels.present : (edu.end_date || "");
              const dateRange = edu.start_date ? `${edu.start_date}${eduEndDate ? ` – ${eduEndDate}` : ""}` : eduEndDate;

              if (isAcademicLayout) {
                return (
                  <View key={edu.id} style={styles.entryBlock} wrap={false}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>{edu.institution}</Text>
                      {dateRange && <Text style={styles.entryDates}>{dateRange}</Text>}
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 0.3 }}>
                      <Text style={{ fontSize: config.baseFontSize, color: "#27272a" }}>
                        {edu.degree}{edu.area ? ` en ${edu.area}` : ""}
                      </Text>
                      {edu.location && (
                        <Text style={{ fontSize: config.entryDateSize, color: "#52525b" }}>
                          {edu.location}
                        </Text>
                      )}
                    </View>
                    {edu.gpa && (
                      <Text style={{ fontSize: config.entryDateSize, color: "#52525b", marginBottom: 0.3 }}>
                        GPA: {edu.gpa}
                      </Text>
                    )}
                    {(edu.highlights || []).map((h, i) => (
                      <View key={i} style={styles.bulletRow} wrap={false}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                );
              }

              // Chilean / Compact / Stanford inline format
              const eduSeparator = templateId === "stanford_clean" ? " | " : (templateId === "compact_swiss" || templateId === "tech_compact" ? " · " : " — ");
              return (
                <View key={edu.id} style={styles.entryBlock} wrap={false}>
                  <View style={styles.entryHeader}>
                    <Text>
                      <Text style={styles.entryTitle}>{edu.degree}{edu.area ? ` en ${edu.area}` : ""}</Text>
                      <Text style={styles.entrySubtitle}>{eduSeparator}{edu.institution}</Text>
                      {edu.location && <Text style={{ color: "#52525b", fontSize: config.entryDateSize }}> ({edu.location})</Text>}
                    </Text>
                    {dateRange && <Text style={styles.entryDates}>{dateRange}</Text>}
                  </View>
                  {edu.gpa && (
                    <Text style={{ fontSize: config.entryDateSize, color: "#52525b", marginBottom: 0.3 }}>
                      GPA: {edu.gpa}
                    </Text>
                  )}
                  {(edu.highlights || []).map((h, i) => (
                    <View key={i} style={styles.bulletRow} wrap={false}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );

      case "certifications":
        if (!data.certifications || data.certifications.length === 0) return null;
        return (
          <View key="certifications" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{labels.certifications}</Text>
            {data.certifications.map((cert) => {
              const dateStr = cert.date ? ` (${cert.date})` : "";
              return (
                <View key={cert.id} style={styles.certRow} wrap={false}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certIssuer}> — {cert.issuer}{dateStr}</Text>
                </View>
              );
            })}
          </View>
        );

      case "references":
        if (!data.references || data.references.length === 0) return null;
        return (
          <View key="references" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{labels.references}</Text>
            <View style={styles.referencesGrid}>
              {data.references.map((ref) => {
                const relStr = ref.relationship ? ` (${ref.relationship})` : "";
                const contacts = [ref.email, ref.phone].filter(Boolean).join("  |  ");
                return (
                  <View key={ref.id} style={styles.referenceCard} wrap={false}>
                    <Text style={styles.refName}>{ref.name}</Text>
                    <Text style={styles.refDetails}>
                      {ref.position}{ref.company ? ` — ${ref.company}` : ""}{relStr}
                    </Text>
                    {contacts && <Text style={styles.refContact}>{contacts}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const order = data.section_order || [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "references",
  ];

  return (
    <Document
      title={title}
      author={data.name || "SchemaCV"}
      subject={`Currículum Vitae - ${data.name || ""}`}
      keywords="CV, Resume, ATS, Software Engineer, SchemaCV"
      creator="SchemaCV ATS Engine"
      producer="SchemaCV (React-PDF Native Engine)"
    >
      <Page size={paperSize === "a4" ? "A4" : "LETTER"} style={styles.page}>
        {renderHeader()}
        {order.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
};
