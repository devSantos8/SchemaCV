import React from "react";
import { ResumeData, TemplateId, PaperSize } from "@/types/resume";
import { HarvardClassic } from "./HarvardClassic";
import { TechMinimalist } from "./TechMinimalist";
import { ModernExecutive } from "./ModernExecutive";
import { SkillsFirstBuilder } from "./SkillsFirstBuilder";

import { StanfordClean } from "./StanfordClean";
import { CompactSwiss } from "./CompactSwiss";

interface TemplateRendererProps {
  templateId: TemplateId;
  data: ResumeData;
  paperSize: PaperSize;
}

export const TEMPLATE_METADATA: Record<
  TemplateId,
  {
    name: string;
    description: string;
    bestFor: string;
    iconName: string;
    fontFamily: string;
    density: "Alta" | "Media" | "Máxima (1 Hoja)";
    atsScore: number;
  }
> = {
  harvard: {
    name: "Harvard Classic",
    description: "Monocromático formal, tipografía serif y divisores horizontales nítidos.",
    bestFor: "Finanzas, Consultoría, Legal, Perfiles Académicos y Corporativos Tradicionales",
    iconName: "GraduationCap",
    fontFamily: "Serif (EB Garamond)",
    density: "Media",
    atsScore: 100,
  },
  tech_minimalist: {
    name: "Tech Minimalist",
    description: "Máxima densidad de datos, stack técnico monoespaciado y tipografía sans-serif limpia.",
    bestFor: "Software Engineers, DevOps, Full-Stack, Backend, Frontend Developers",
    iconName: "Terminal",
    fontFamily: "Sans + Monospace",
    density: "Alta",
    atsScore: 100,
  },
  modern_executive: {
    name: "Modern Executive",
    description: "Encabezado con acento lateral, jerarquía limpia y soporte de promociones internas.",
    bestFor: "Tech Leads, Engineering Managers, Arquitectos de Software y Ejecutivos",
    iconName: "Briefcase",
    fontFamily: "Sans-Serif Modern",
    density: "Media",
    atsScore: 99,
  },
  skills_first: {
    name: "Skills-First / Builder",
    description: "Stack tecnológico destacado al inicio y proyectos con métricas cuantificables (STAR/XYZ).",
    bestFor: "Makers, Fundadores Técnicos, Ingenieros orientados a Proyectos y Open Source",
    iconName: "Layers",
    fontFamily: "Sans-Serif Clean",
    density: "Alta",
    atsScore: 100,
  },
  stanford_clean: {
    name: "Stanford Clean",
    description: "Estándar de Silicon Valley con encabezado asimétrico, metadatos en línea y divisores nítidos.",
    bestFor: "Product Managers, Data Scientists, Ingenieros de IA y Startups Tech",
    iconName: "Sparkles",
    fontFamily: "Sans-Serif (Geist)",
    density: "Alta",
    atsScore: 100,
  },
  compact_swiss: {
    name: "Compact Swiss Grid",
    description: "Diseño suizo de ultra-alta densidad optimizado para condensar trayectorias en una sola hoja.",
    bestFor: "Perfiles Senior con amplia experiencia que requieren formato estricto de 1 sola página",
    iconName: "LayoutGrid",
    fontFamily: "Helvetica / Sans Swiss",
    density: "Máxima (1 Hoja)",
    atsScore: 100,
  },
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  templateId,
  data,
  paperSize,
}) => {
  switch (templateId) {
    case "harvard":
      return <HarvardClassic data={data} paperSize={paperSize} />;
    case "tech_minimalist":
      return <TechMinimalist data={data} paperSize={paperSize} />;
    case "modern_executive":
      return <ModernExecutive data={data} paperSize={paperSize} />;
    case "skills_first":
      return <SkillsFirstBuilder data={data} paperSize={paperSize} />;
    case "stanford_clean":
      return <StanfordClean data={data} paperSize={paperSize} />;
    case "compact_swiss":
      return <CompactSwiss data={data} paperSize={paperSize} />;
    default:
      return <TechMinimalist data={data} paperSize={paperSize} />;
  }
};
