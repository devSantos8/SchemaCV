import React from "react";
import { ResumeData, TemplateId, PaperSize } from "@/types/resume";
import { HarvardClassic } from "./HarvardClassic";
import { TechMinimalist } from "./TechMinimalist";
import { ModernExecutive } from "./ModernExecutive";
import { SkillsFirstBuilder } from "./SkillsFirstBuilder";

interface TemplateRendererProps {
  templateId: TemplateId;
  data: ResumeData;
  paperSize: PaperSize;
}

export const TEMPLATE_METADATA: Record<
  TemplateId,
  { name: string; description: string; bestFor: string; iconName: string }
> = {
  harvard: {
    name: "Harvard Classic",
    description: "Monocromático formal, tipografía serif y divisores horizontales nítidos.",
    bestFor: "Finanzas, Consultoría, Legal, Perfiles Académicos y Corporativos Tradicionales",
    iconName: "GraduationCap",
  },
  tech_minimalist: {
    name: "Tech Minimalist",
    description: "Máxima densidad de datos, stack técnico monoespaciado y tipografía sans-serif limpia.",
    bestFor: "Software Engineers, DevOps, Full-Stack, Backend, Frontend Developers",
    iconName: "Terminal",
  },
  modern_executive: {
    name: "Modern Executive",
    description: "Encabezado con acento lateral, jerarquía limpia y soporte de promociones internas.",
    bestFor: "Tech Leads, Engineering Managers, Arquitectos de Software y Ejecutivos",
    iconName: "Briefcase",
  },
  skills_first: {
    name: "Skills-First / Builder",
    description: "Stack tecnológico destacado al inicio y proyectos con métricas cuantificables (STAR/XYZ).",
    bestFor: "Makers, Fundadores Técnicos, Ingenieros orientados a Proyectos y Open Source",
    iconName: "Layers",
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
    default:
      return <TechMinimalist data={data} paperSize={paperSize} />;
  }
};
