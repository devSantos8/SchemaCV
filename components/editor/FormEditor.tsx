"use client";

import React from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Layers,
  ListOrdered,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import {
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  SocialNetwork,
} from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SkillsTaxonomyManager } from "./SkillsTaxonomyManager";
import { SectionOrganizer } from "./SectionOrganizer";

export const FormEditor: React.FC = () => {
  const { resumeData, setResumeData } = useResumeStore();
  const hiddenSections = new Set(resumeData.hidden_sections || []);

  // Alternar visibilidad de sección completa
  const handleToggleSectionVisibility = (sectionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextHidden = new Set(resumeData.hidden_sections || []);
    if (nextHidden.has(sectionId)) {
      nextHidden.delete(sectionId);
    } else {
      nextHidden.add(sectionId);
    }
    setResumeData({ hidden_sections: Array.from(nextHidden) });
  };

  // Alternar visibilidad de entradas individuales
  const handleToggleExperienceVisibility = (id: string) => {
    const updated = (resumeData.experience || []).map((exp) =>
      exp.id === id ? { ...exp, hidden: !exp.hidden } : exp
    );
    setResumeData({ experience: updated });
  };

  const handleToggleProjectVisibility = (id: string) => {
    const updated = (resumeData.projects || []).map((p) =>
      p.id === id ? { ...p, hidden: !p.hidden } : p
    );
    setResumeData({ projects: updated });
  };

  const handleToggleEducationVisibility = (id: string) => {
    const updated = (resumeData.education || []).map((e) =>
      e.id === id ? { ...e, hidden: !e.hidden } : e
    );
    setResumeData({ education: updated });
  };

  const handleToggleCertificationVisibility = (id: string) => {
    const updated = (resumeData.certifications || []).map((c) =>
      c.id === id ? { ...c, hidden: !c.hidden } : c
    );
    setResumeData({ certifications: updated });
  };

  // 1. Manejadores de Información Personal
  const handlePersonalChange = (field: string, value: string) => {
    setResumeData({ [field]: value });
  };

  // Redes Sociales
  const handleAddSocial = () => {
    const newSocial: SocialNetwork = {
      network: "LinkedIn",
      username: "",
      url: "https://linkedin.com/in/",
      icon: "linkedin",
    };
    setResumeData({
      social_networks: [...(resumeData.social_networks || []), newSocial],
    });
  };

  const handleUpdateSocial = (index: number, field: keyof SocialNetwork, value: string) => {
    const updated = [...(resumeData.social_networks || [])];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ social_networks: updated });
  };

  const handleRemoveSocial = (index: number) => {
    const updated = (resumeData.social_networks || []).filter((_, i) => i !== index);
    setResumeData({ social_networks: updated });
  };

  // 2. Manejadores de Experiencia Laboral
  const handleAddExperience = () => {
    const newExp: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      company: "Nueva Empresa",
      position: "Cargo / Rol",
      location: "Ciudad, País",
      start_date: "2024",
      end_date: "Presente",
      current: true,
      highlights: [
        "Desarrollé e implementé [solución técnica], logrando [métrica de impacto: X% de mejora] mediante [tecnología].",
      ],
      summary: "",
    };
    setResumeData({ experience: [newExp, ...(resumeData.experience || [])] });
  };

  const handleUpdateExperience = (id: string, updates: Partial<ExperienceEntry>) => {
    const updated = (resumeData.experience || []).map((exp) =>
      exp.id === id ? { ...exp, ...updates } : exp
    );
    setResumeData({ experience: updated });
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData({
      experience: (resumeData.experience || []).filter((exp) => exp.id !== id),
    });
  };

  const handleAddHighlightExp = (expId: string) => {
    const updated = (resumeData.experience || []).map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          highlights: [...(exp.highlights || []), "Nuevo logro o responsabilidad de impacto"],
        };
      }
      return exp;
    });
    setResumeData({ experience: updated });
  };

  const handleUpdateHighlightExp = (expId: string, index: number, value: string) => {
    const updated = (resumeData.experience || []).map((exp) => {
      if (exp.id === expId) {
        const newHighlights = [...exp.highlights];
        newHighlights[index] = value;
        return { ...exp, highlights: newHighlights };
      }
      return exp;
    });
    setResumeData({ experience: updated });
  };

  const handleRemoveHighlightExp = (expId: string, index: number) => {
    const updated = (resumeData.experience || []).map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          highlights: exp.highlights.filter((_, i) => i !== index),
        };
      }
      return exp;
    });
    setResumeData({ experience: updated });
  };

  // 3. Manejadores de Proyectos
  const handleAddProject = () => {
    const newProj: ProjectEntry = {
      id: `proj-${Date.now()}`,
      name: "Nombre del Proyecto",
      description: "Descripción breve del problema que resuelve la solución.",
      url: "",
      github_url: "",
      start_date: "2024",
      end_date: "",
      technologies: ["React", "TypeScript", "Node.js"],
      highlights: ["Construí [funcionalidad clave] optimizando el tiempo de respuesta en un 30%."],
    };
    setResumeData({ projects: [newProj, ...(resumeData.projects || [])] });
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectEntry>) => {
    const updated = (resumeData.projects || []).map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setResumeData({ projects: updated });
  };

  const handleRemoveProject = (id: string) => {
    setResumeData({
      projects: (resumeData.projects || []).filter((p) => p.id !== id),
    });
  };

  // 4. Manejadores de Educación
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu-${Date.now()}`,
      institution: "Universidad / Instituto",
      degree: "Título Profesional / Grado",
      area: "Ingeniería Informática / Software",
      location: "Ciudad, País",
      start_date: "2020",
      end_date: "2024",
      current: false,
      gpa: "",
      highlights: [],
    };
    setResumeData({ education: [...(resumeData.education || []), newEdu] });
  };

  const handleUpdateEducation = (id: string, updates: Partial<EducationEntry>) => {
    const updated = (resumeData.education || []).map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    setResumeData({ education: updated });
  };

  const handleRemoveEducation = (id: string) => {
    setResumeData({
      education: (resumeData.education || []).filter((e) => e.id !== id),
    });
  };

  // 5. Manejadores de Certificaciones
  const handleAddCertification = () => {
    const newCert: CertificationEntry = {
      id: `cert-${Date.now()}`,
      name: "Nombre de Certificación Oficial",
      issuer: "Amazon Web Services / Microsoft / Google",
      date: "2025",
      url: "",
      summary: "",
    };
    setResumeData({ certifications: [...(resumeData.certifications || []), newCert] });
  };

  const handleUpdateCertification = (id: string, updates: Partial<CertificationEntry>) => {
    const updated = (resumeData.certifications || []).map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setResumeData({ certifications: updated });
  };

  const handleRemoveCertification = (id: string) => {
    setResumeData({
      certifications: (resumeData.certifications || []).filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-4 pb-12">
      <Accordion
        type="multiple"
        defaultValue={["personal", "skills", "experience"]}
        className="space-y-3"
      >
        {/* 1. INFORMACIÓN PERSONAL Y CONTACTO */}
        <AccordionItem
          value="personal"
          className="border border-border rounded-lg bg-card overflow-hidden px-4"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-foreground">
                <User className="h-4 w-4" />
              </div>
              <span>Información Personal & Contacto</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre Completo *</Label>
                <Input
                  value={resumeData.name || ""}
                  onChange={(e) => handlePersonalChange("name", e.target.value)}
                  placeholder="ej. Carlos Mendoza Rivera"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Titular Profesional (Headline)</Label>
                <Input
                  value={resumeData.headline || ""}
                  onChange={(e) => handlePersonalChange("headline", e.target.value)}
                  placeholder="ej. Desarrollador Full Stack & DevOps"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Correo Electrónico</Label>
                <Input
                  type="email"
                  value={resumeData.email || ""}
                  onChange={(e) => handlePersonalChange("email", e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input
                  value={resumeData.phone || ""}
                  onChange={(e) => handlePersonalChange("phone", e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ubicación (Ciudad, País)</Label>
                <Input
                  value={resumeData.location || ""}
                  onChange={(e) => handlePersonalChange("location", e.target.value)}
                  placeholder="Santiago, Chile"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Sitio Web / Portafolio</Label>
                <Input
                  value={resumeData.website || ""}
                  onChange={(e) => handlePersonalChange("website", e.target.value)}
                  placeholder="https://tudominio.dev"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Resumen Profesional */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold">Resumen Profesional (Bio / Summary)</Label>
                  {hiddenSections.has("summary") && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                      Oculto en CV
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleToggleSectionVisibility("summary", e)}
                  className={`h-6 px-1.5 gap-1 text-[11px] ${hiddenSections.has("summary") ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                    }`}
                  title={hiddenSections.has("summary") ? "Mostrar resumen en el CV" : "Ocultar resumen del CV"}
                >
                  {hiddenSections.has("summary") ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span className="text-[10px]">Oculto</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] text-emerald-600">Visible</span>
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={resumeData.summary || ""}
                onChange={(e) => handlePersonalChange("summary", e.target.value)}
                placeholder="Ingeniero de Software con experiencia en..."
                className={`text-xs min-h-[70px] resize-y ${hiddenSections.has("summary") ? "opacity-60 bg-zinc-50 dark:bg-zinc-900/50" : ""}`}
              />
            </div>

            {/* Enlaces Sociales / Redes */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Redes Sociales y Enlaces (LinkedIn, GitHub)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSocial}
                  className="h-6 text-[11px] px-2 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Añadir Enlace
                </Button>
              </div>

              <div className="space-y-2">
                {(resumeData.social_networks || []).map((sn, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={sn.network}
                      onChange={(e) => handleUpdateSocial(idx, "network", e.target.value)}
                      placeholder="Plataforma (ej. LinkedIn)"
                      className="h-7 text-xs w-1/4"
                    />
                    <Input
                      value={sn.username || ""}
                      onChange={(e) => handleUpdateSocial(idx, "username", e.target.value)}
                      placeholder="Usuario (ej. jmonroys)"
                      className="h-7 text-xs w-1/4"
                    />
                    <Input
                      value={sn.url}
                      onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                      placeholder="https://..."
                      className="h-7 text-xs flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSocial(idx)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. REORDENAMIENTO MODULAR DRAG & DROP */}
        <AccordionItem
          value="organizer"
          className="border border-border rounded-lg bg-card overflow-hidden px-4"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-foreground">
                <ListOrdered className="h-4 w-4" />
              </div>
              <span>Organizador Modular & Visibilidad (Drag & Drop)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <SectionOrganizer />
          </AccordionContent>
        </AccordionItem>

        {/* 3. COMPETENCIAS TÉCNICAS (TAXONOMÍA) */}
        <AccordionItem
          value="skills"
          className={`border rounded-lg overflow-hidden px-4 transition-all ${hiddenSections.has("skills")
            ? "bg-zinc-50/40 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800"
            : "border-border bg-card"
            }`}
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <div className={`p-1 rounded ${hiddenSections.has("skills")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-foreground"
                  }`}>
                  <Layers className="h-4 w-4" />
                </div>
                <span className={hiddenSections.has("skills") ? "line-through text-muted-foreground" : ""}>
                  Habilidades Técnicas
                </span>
                {hiddenSections.has("skills") && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    Sección Oculta
                  </span>
                )}
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSectionVisibility("skills", e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleSectionVisibility("skills");
                  }
                }}
                className={`inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer h-6 px-1.5 gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${hiddenSections.has("skills") ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                title={hiddenSections.has("skills") ? "Mostrar sección en el CV" : "Ocultar sección del CV"}
              >
                {hiddenSections.has("skills") ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Oculta</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-medium">Visible</span>
                  </>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <SkillsTaxonomyManager />
          </AccordionContent>
        </AccordionItem>

        {/* 4. EXPERIENCIA LABORAL */}
        <AccordionItem
          value="experience"
          className={`border rounded-lg overflow-hidden px-4 transition-all ${hiddenSections.has("experience")
            ? "bg-zinc-50/40 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800"
            : "border-border bg-card"
            }`}
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <div className={`p-1 rounded ${hiddenSections.has("experience")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-foreground"
                  }`}>
                  <Briefcase className="h-4 w-4" />
                </div>
                <span className={hiddenSections.has("experience") ? "line-through text-muted-foreground" : ""}>
                  Experiencia Profesional
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({resumeData.experience?.length || 0})
                </span>
                {hiddenSections.has("experience") && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    Sección Oculta
                  </span>
                )}
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSectionVisibility("experience", e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleSectionVisibility("experience");
                  }
                }}
                className={`inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer h-6 px-1.5 gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${hiddenSections.has("experience") ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                title={hiddenSections.has("experience") ? "Mostrar sección en el CV" : "Ocultar sección del CV"}
              >
                {hiddenSections.has("experience") ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Oculta</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-medium">Visible</span>
                  </>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddExperience}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir Experiencia
              </Button>
            </div>

            {(!resumeData.experience || resumeData.experience.length === 0) ? (
              <div className="text-center py-5 px-4 border border-dashed border-border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
                <Briefcase className="h-5 w-5 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No has añadido experiencias laborales aún.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddExperience}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir primera experiencia</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(resumeData.experience || []).map((exp) => {
                  const isItemHidden = !!exp.hidden;

                  return (
                    <div
                      key={exp.id}
                      className={`p-3.5 rounded-lg border space-y-3 transition-all ${isItemHidden
                        ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                        : "border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isItemHidden ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {exp.position || "Cargo"} en {exp.company || "Empresa"}
                          </span>
                          {isItemHidden && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                              Oculto en CV
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleExperienceVisibility(exp.id)}
                            className={`h-6 px-1.5 gap-1 text-[11px] ${isItemHidden ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                              }`}
                            title={isItemHidden ? "Mostrar experiencia en el CV" : "Ocultar experiencia del CV"}
                          >
                            {isItemHidden ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span className="text-[10px]">Oculto</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600">Visible</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            title="Eliminar experiencia"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Empresa / Organización *</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Cargo / Posición *</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => handleUpdateExperience(exp.id, { position: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Ubicación (ej. Santiago, Chile / Remoto)</Label>
                          <Input
                            value={exp.location || ""}
                            onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-[11px]">Fechas (Inicio – Fin)</Label>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">Actual</span>
                              <Switch
                                checked={exp.current}
                                onCheckedChange={(checked) =>
                                  handleUpdateExperience(exp.id, {
                                    current: checked,
                                    end_date: checked ? "Presente" : "",
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Mar 2022"
                              value={exp.start_date}
                              onChange={(e) => handleUpdateExperience(exp.id, { start_date: e.target.value })}
                              className="h-7 text-xs w-1/2"
                            />
                            <Input
                              placeholder="Presente"
                              disabled={exp.current}
                              value={exp.end_date || ""}
                              onChange={(e) => handleUpdateExperience(exp.id, { end_date: e.target.value })}
                              className="h-7 text-xs w-1/2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Viñetas de logros STAR / XYZ */}
                      <div className="space-y-2 pt-1 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <Label className="text-[11px] font-semibold">
                              Logros e Impacto Cuantificable (Fórmula STAR/XYZ)
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddHighlightExp(exp.id)}
                            className="h-6 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Viñeta
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          {(exp.highlights || []).map((hl, hIdx) => (
                            <div key={hIdx} className="flex gap-1.5 items-start">
                              <span className="text-muted-foreground text-xs mt-1">•</span>
                              <Textarea
                                value={hl}
                                onChange={(e) => handleUpdateHighlightExp(exp.id, hIdx, e.target.value)}
                                className="text-xs min-h-[44px] py-1.5 leading-tight flex-1 resize-y"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveHighlightExp(exp.id, hIdx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 5. PROYECTOS DESTACADOS */}
        <AccordionItem
          value="projects"
          className={`border rounded-lg overflow-hidden px-4 transition-all ${hiddenSections.has("projects")
            ? "bg-zinc-50/40 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800"
            : "border-border bg-card"
            }`}
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <div className={`p-1 rounded ${hiddenSections.has("projects")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-foreground"
                  }`}>
                  <FolderGit2 className="h-4 w-4" />
                </div>
                <span className={hiddenSections.has("projects") ? "line-through text-muted-foreground" : ""}>
                  Proyectos
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({resumeData.projects?.length || 0})
                </span>
                {hiddenSections.has("projects") && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    Sección Oculta
                  </span>
                )}
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSectionVisibility("projects", e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleSectionVisibility("projects");
                  }
                }}
                className={`inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer h-6 px-1.5 gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${hiddenSections.has("projects") ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                title={hiddenSections.has("projects") ? "Mostrar sección en el CV" : "Ocultar sección del CV"}
              >
                {hiddenSections.has("projects") ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Oculta</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-medium">Visible</span>
                  </>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddProject}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir Proyecto
              </Button>
            </div>

            {(!resumeData.projects || resumeData.projects.length === 0) ? (
              <div className="text-center py-5 px-4 border border-dashed border-border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
                <FolderGit2 className="h-5 w-5 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No has añadido proyectos relevantes aún.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddProject}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir primer proyecto</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(resumeData.projects || []).map((proj) => {
                  const isProjHidden = !!proj.hidden;

                  return (
                    <div
                      key={proj.id}
                      className={`p-3 rounded-lg border space-y-2.5 transition-all ${isProjHidden
                        ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                        : "border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isProjHidden ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {proj.name || "Proyecto"}
                          </span>
                          {isProjHidden && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                              Oculto en CV
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleProjectVisibility(proj.id)}
                            className={`h-6 px-1.5 gap-1 text-[11px] ${isProjHidden ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                              }`}
                            title={isProjHidden ? "Mostrar proyecto en el CV" : "Ocultar proyecto del CV"}
                          >
                            {isProjHidden ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span className="text-[10px]">Oculto</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600">Visible</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProject(proj.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            title="Eliminar proyecto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Nombre del Proyecto *</Label>
                          <Input
                            value={proj.name}
                            onChange={(e) => handleUpdateProject(proj.id, { name: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Tecnologías (separadas por coma)</Label>
                          <Input
                            value={proj.technologies?.join(", ") || ""}
                            onChange={(e) =>
                              handleUpdateProject(proj.id, {
                                technologies: e.target.value
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="React, TypeScript, Docker"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">URL Repositorio (GitHub)</Label>
                          <Input
                            value={proj.github_url || ""}
                            onChange={(e) => handleUpdateProject(proj.id, { github_url: e.target.value })}
                            placeholder="https://github.com/..."
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">URL Demo en Vivo</Label>
                          <Input
                            value={proj.url || ""}
                            onChange={(e) => handleUpdateProject(proj.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px]">Descripción / Logro principal</Label>
                        <Textarea
                          value={proj.description || ""}
                          onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                          className="text-xs min-h-[48px] resize-y"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 6. EDUCACIÓN */}
        <AccordionItem
          value="education"
          className={`border rounded-lg overflow-hidden px-4 transition-all ${hiddenSections.has("education")
            ? "bg-zinc-50/40 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800"
            : "border-border bg-card"
            }`}
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <div className={`p-1 rounded ${hiddenSections.has("education")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-foreground"
                  }`}>
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className={hiddenSections.has("education") ? "line-through text-muted-foreground" : ""}>
                  Educación
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({resumeData.education?.length || 0})
                </span>
                {hiddenSections.has("education") && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    Sección Oculta
                  </span>
                )}
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSectionVisibility("education", e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleSectionVisibility("education");
                  }
                }}
                className={`inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer h-6 px-1.5 gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${hiddenSections.has("education") ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                title={hiddenSections.has("education") ? "Mostrar sección en el CV" : "Ocultar sección del CV"}
              >
                {hiddenSections.has("education") ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Oculta</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-medium">Visible</span>
                  </>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddEducation}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir Educación
              </Button>
            </div>

            {(!resumeData.education || resumeData.education.length === 0) ? (
              <div className="text-center py-5 px-4 border border-dashed border-border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No has añadido títulos o estudios aún.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddEducation}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir educación</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(resumeData.education || []).map((edu) => {
                  const isEduHidden = !!edu.hidden;

                  return (
                    <div
                      key={edu.id}
                      className={`p-3 rounded-lg border space-y-2.5 transition-all ${isEduHidden
                        ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                        : "border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isEduHidden ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {edu.degree || "Título"} en {edu.institution || "Institución"}
                          </span>
                          {isEduHidden && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                              Oculto en CV
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleEducationVisibility(edu.id)}
                            className={`h-6 px-1.5 gap-1 text-[11px] ${isEduHidden ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                              }`}
                            title={isEduHidden ? "Mostrar educación en el CV" : "Ocultar educación del CV"}
                          >
                            {isEduHidden ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span className="text-[10px]">Oculto</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600">Visible</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            title="Eliminar educación"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Institución / Universidad *</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Título / Grado Académico *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Área de Estudio / Especialidad</Label>
                          <Input
                            value={edu.area || ""}
                            onChange={(e) => handleUpdateEducation(edu.id, { area: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Fechas (Inicio – Fin)</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="2020"
                              value={edu.start_date || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, { start_date: e.target.value })}
                              className="h-7 text-xs w-1/2"
                            />
                            <Input
                              placeholder="2024"
                              value={edu.end_date || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, { end_date: e.target.value })}
                              className="h-7 text-xs w-1/2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 7. CERTIFICACIONES */}
        <AccordionItem
          value="certifications"
          className={`border rounded-lg overflow-hidden px-4 transition-all ${hiddenSections.has("certifications")
            ? "bg-zinc-50/40 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800"
            : "border-border bg-card"
            }`}
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <div className={`p-1 rounded ${hiddenSections.has("certifications")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-foreground"
                  }`}>
                  <Award className="h-4 w-4" />
                </div>
                <span className={hiddenSections.has("certifications") ? "line-through text-muted-foreground" : ""}>
                  Certificaciones
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({resumeData.certifications?.length || 0})
                </span>
                {hiddenSections.has("certifications") && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    Sección Oculta
                  </span>
                )}
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSectionVisibility("certifications", e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleSectionVisibility("certifications");
                  }
                }}
                className={`inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer h-6 px-1.5 gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${hiddenSections.has("certifications") ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                title={hiddenSections.has("certifications") ? "Mostrar sección en el CV" : "Ocultar sección del CV"}
              >
                {hiddenSections.has("certifications") ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Oculta</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-medium">Visible</span>
                  </>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCertification}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir Certificación
              </Button>
            </div>

            {(!resumeData.certifications || resumeData.certifications.length === 0) ? (
              <div className="text-center py-5 px-4 border border-dashed border-border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
                <Award className="h-5 w-5 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No has añadido certificaciones aún.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddCertification}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir certificación</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {(resumeData.certifications || []).map((cert) => {
                  const isCertHidden = !!cert.hidden;

                  return (
                    <div
                      key={cert.id}
                      className={`flex gap-2 items-center p-2.5 rounded-lg border transition-all ${isCertHidden
                        ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                        : "border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                    >
                      <Input
                        value={cert.name}
                        onChange={(e) => handleUpdateCertification(cert.id, { name: e.target.value })}
                        placeholder="Nombre (ej. AWS Solutions Architect)"
                        className="h-7 text-xs w-2/5"
                      />
                      <Input
                        value={cert.issuer}
                        onChange={(e) => handleUpdateCertification(cert.id, { issuer: e.target.value })}
                        placeholder="Emisor (ej. Amazon Web Services)"
                        className="h-7 text-xs w-2/5"
                      />
                      <Input
                        value={cert.date || ""}
                        onChange={(e) => handleUpdateCertification(cert.id, { date: e.target.value })}
                        placeholder="Año"
                        className="h-7 text-xs w-1/5"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCertificationVisibility(cert.id)}
                        className={`h-7 px-1.5 gap-1 text-[11px] ${isCertHidden ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                          }`}
                        title={isCertHidden ? "Mostrar certificación en el CV" : "Ocultar certificación del CV"}
                      >
                        {isCertHidden ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCertification(cert.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        title="Eliminar certificación"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
