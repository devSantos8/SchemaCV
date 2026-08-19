import React from "react";
import { ResumeData, TemplateId, PaperSize, getVisibleResumeData } from "@/types/resume";
import { HarvardClassic } from "./HarvardClassic";
import { TechMinimalist } from "./TechMinimalist";
import { ModernExecutive } from "./ModernExecutive";
import { SkillsFirstBuilder } from "./SkillsFirstBuilder";
import { StanfordClean } from "./StanfordClean";
import { CompactSwiss } from "./CompactSwiss";
import { ExecutiveSerif } from "./ExecutiveSerif";
import { TechCompact } from "./TechCompact";
import { ModernMinimal } from "./ModernMinimal";
import { CareerChanger } from "./CareerChanger";
import { AcademicInternational } from "./AcademicInternational";

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
    description: "Monocromático formal estilo Harvard, tipografía serif limpia y divisores horizontales nítidos.",
    bestFor: "Finanzas, Consultoría, Legal, Perfiles Académicos y Corporativos Tradicionales",
    iconName: "GraduationCap",
    fontFamily: "Serif (EB Garamond)",
    density: "Media",
    atsScore: 100,
  },
  tech_minimalist: {
    name: "Engineering Clean",
    description: "Máxima claridad técnica, fechas alineadas a la derecha y tipografía sans-serif limpia.",
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
  executive_serif: {
    name: "Executive Serif",
    description: "Perfil formal senior con tipografía Garamond, encabezado centrado y espaciado generoso.",
    bestFor: "Directores de Tecnología, Consultores Senior, Finanzas y C-Level",
    iconName: "BookOpen",
    fontFamily: "Garamond / Georgia",
    density: "Media",
    atsScore: 100,
  },
  tech_compact: {
    name: "Tech Compact",
    description: "Formato denso de 1 hoja con header condensado en pipes y stack tecnológico prioritario.",
    bestFor: "Desarrolladores Web, Mobile, Cloud y Especialistas en Infraestructura",
    iconName: "Cpu",
    fontFamily: "Sans-Serif + Monospace",
    density: "Máxima (1 Hoja)",
    atsScore: 100,
  },
  modern_minimal: {
    name: "Modern Minimal",
    description: "Estilo limpio y espacioso sin líneas divisorias, ideal para juniors y trayectorias claras.",
    bestFor: "Desarrolladores Junior, Diseñadores de Producto y Nuevos Talentos",
    iconName: "Minimize2",
    fontFamily: "Helvetica / Arial / Geist",
    density: "Media",
    atsScore: 100,
  },
  career_changer: {
    name: "Career Changer",
    description: "Prioriza competencias transferibles y proyectos/portafolio antes de la experiencia laboral.",
    bestFor: "Profesionales en transición de carrera, Bootcamps y Autodidactas",
    iconName: "GitFork",
    fontFamily: "Sans-Serif Clean",
    density: "Alta",
    atsScore: 100,
  },
  academic_international: {
    name: "Academic International",
    description: "Estructura formal internacional/académica con educación al inicio y soporte de publicaciones.",
    bestFor: "Investigadores, Docentes, Doctorados y Postulaciones Internacionales",
    iconName: "Globe2",
    fontFamily: "Times New Roman / Georgia",
    density: "Media",
    atsScore: 100,
  },
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  templateId,
  data,
  paperSize,
}) => {
  const visibleData = getVisibleResumeData(data);

  switch (templateId) {
    case "harvard":
      return <HarvardClassic data={visibleData} paperSize={paperSize} />;
    case "tech_minimalist":
      return <TechMinimalist data={visibleData} paperSize={paperSize} />;
    case "modern_executive":
      return <ModernExecutive data={visibleData} paperSize={paperSize} />;
    case "skills_first":
      return <SkillsFirstBuilder data={visibleData} paperSize={paperSize} />;
    case "stanford_clean":
      return <StanfordClean data={visibleData} paperSize={paperSize} />;
    case "compact_swiss":
      return <CompactSwiss data={visibleData} paperSize={paperSize} />;
    case "executive_serif":
      return <ExecutiveSerif data={visibleData} paperSize={paperSize} />;
    case "tech_compact":
      return <TechCompact data={visibleData} paperSize={paperSize} />;
    case "modern_minimal":
      return <ModernMinimal data={visibleData} paperSize={paperSize} />;
    case "career_changer":
      return <CareerChanger data={visibleData} paperSize={paperSize} />;
    case "academic_international":
      return <AcademicInternational data={visibleData} paperSize={paperSize} />;
    default:
      return <TechMinimalist data={visibleData} paperSize={paperSize} />;
  }
};

