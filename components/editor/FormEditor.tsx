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
  ChevronUp,
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
  normalizeSocialUrl,
  getSectionLabels,
} from "@/types/resume";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/TagInput";
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
  const sectionLabels = getSectionLabels(resumeData);

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

  // 1. Manejadores de Información Personal
  const handlePersonalChange = (field: string, value: string) => {
    setResumeData({ [field]: value });
  };

  const handleAddSocial = () => {
    const newSocial: SocialNetwork = {
      network: "LinkedIn",
      username: "",
      url: "",
    };
    setResumeData({
      social_networks: [...(resumeData.social_networks || []), newSocial],
    });
  };

  const handleUpdateSocial = (index: number, field: keyof SocialNetwork, value: string) => {
    const updated = [...(resumeData.social_networks || [])];
    const current = { ...updated[index], [field]: value };
    updated[index] = current;
    setResumeData({ social_networks: updated });
  };

  const handleNormalizeSocial = (index: number) => {
    const updated = [...(resumeData.social_networks || [])];
    const current = updated[index];
    if (!current) return;
    const { url, username } = normalizeSocialUrl(current.network, current.url || current.username || "");
    if (url) current.url = url;
    if (username) current.username = username;
    updated[index] = current;
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
      company: "",
      position: "",
      location: "",
      start_date: "",
      end_date: "",
      current: false,
      summary: "",
      highlights: [],
    };
    setResumeData({
      experience: [newExp, ...(resumeData.experience || [])],
    });
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

  const handleAddHighlightExp = (expId: string) => {
    const updated = (resumeData.experience || []).map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          highlights: [...exp.highlights, ""],
        };
      }
      return exp;
    });
    setResumeData({ experience: updated });
  };

  const handleUpdateHighlightExp = (expId: string, index: number, value: string) => {
    const updated = (resumeData.experience || []).map((exp) => {
      if (exp.id === expId) {
        const nextHl = [...exp.highlights];
        nextHl[index] = value;
        return { ...exp, highlights: nextHl };
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

  const handleMoveHighlightExp = (expId: string, index: number, direction: "up" | "down") => {
    const updated = (resumeData.experience || []).map((exp) => {
      if (exp.id === expId) {
        const nextHl = [...exp.highlights];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= nextHl.length) return exp;
        const [moved] = nextHl.splice(index, 1);
        nextHl.splice(targetIndex, 0, moved);
        return { ...exp, highlights: nextHl };
      }
      return exp;
    });
    setResumeData({ experience: updated });
  };

  // 3. Manejadores de Proyectos
  const handleAddProject = () => {
    const newProj: ProjectEntry = {
      id: `proj-${Date.now()}`,
      name: "",
      description: "",
      url: "",
      github_url: "",
      start_date: "",
      end_date: "",
      technologies: [],
      highlights: [],
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

  const handleAddHighlightProj = (projId: string) => {
    const updated = (resumeData.projects || []).map((p) => {
      if (p.id === projId) {
        return {
          ...p,
          highlights: [...(p.highlights || []), ""],
        };
      }
      return p;
    });
    setResumeData({ projects: updated });
  };

  const handleUpdateHighlightProj = (projId: string, index: number, value: string) => {
    const updated = (resumeData.projects || []).map((p) => {
      if (p.id === projId) {
        const nextHl = [...(p.highlights || [])];
        nextHl[index] = value;
        return { ...p, highlights: nextHl };
      }
      return p;
    });
    setResumeData({ projects: updated });
  };

  const handleRemoveHighlightProj = (projId: string, index: number) => {
    const updated = (resumeData.projects || []).map((p) => {
      if (p.id === projId) {
        return {
          ...p,
          highlights: (p.highlights || []).filter((_, i) => i !== index),
        };
      }
      return p;
    });
    setResumeData({ projects: updated });
  };

  const handleMoveHighlightProj = (projId: string, index: number, direction: "up" | "down") => {
    const updated = (resumeData.projects || []).map((p) => {
      if (p.id === projId) {
        const nextHl = [...(p.highlights || [])];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= nextHl.length) return p;
        const [moved] = nextHl.splice(index, 1);
        nextHl.splice(targetIndex, 0, moved);
        return { ...p, highlights: nextHl };
      }
      return p;
    });
    setResumeData({ projects: updated });
  };

  // 4. Manejadores de Educación
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      area: "",
      location: "",
      start_date: "",
      end_date: "",
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

  const handleAddHighlightEdu = (eduId: string) => {
    const updated = (resumeData.education || []).map((e) => {
      if (e.id === eduId) {
        return {
          ...e,
          highlights: [...(e.highlights || []), ""],
        };
      }
      return e;
    });
    setResumeData({ education: updated });
  };

  const handleUpdateHighlightEdu = (eduId: string, index: number, value: string) => {
    const updated = (resumeData.education || []).map((e) => {
      if (e.id === eduId) {
        const nextHl = [...(e.highlights || [])];
        nextHl[index] = value;
        return { ...e, highlights: nextHl };
      }
      return e;
    });
    setResumeData({ education: updated });
  };

  const handleRemoveHighlightEdu = (eduId: string, index: number) => {
    const updated = (resumeData.education || []).map((e) => {
      if (e.id === eduId) {
        return {
          ...e,
          highlights: (e.highlights || []).filter((_, i) => i !== index),
        };
      }
      return e;
    });
    setResumeData({ education: updated });
  };

  const handleMoveHighlightEdu = (eduId: string, index: number, direction: "up" | "down") => {
    const updated = (resumeData.education || []).map((e) => {
      if (e.id === eduId) {
        const nextHl = [...(e.highlights || [])];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= nextHl.length) return e;
        const [moved] = nextHl.splice(index, 1);
        nextHl.splice(targetIndex, 0, moved);
        return { ...e, highlights: nextHl };
      }
      return e;
    });
    setResumeData({ education: updated });
  };

  // 5. Manejadores de Certificaciones
  const handleAddCertification = () => {
    const newCert: CertificationEntry = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
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

  // Reordenamiento de elementos principales dentro de cada sección
  const handleMoveExperience = (index: number, direction: "up" | "down") => {
    const list = [...(resumeData.experience || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setResumeData({ experience: list });
  };

  const handleMoveProject = (index: number, direction: "up" | "down") => {
    const list = [...(resumeData.projects || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setResumeData({ projects: list });
  };

  const handleMoveEducation = (index: number, direction: "up" | "down") => {
    const list = [...(resumeData.education || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setResumeData({ education: list });
  };

  const handleMoveCertification = (index: number, direction: "up" | "down") => {
    const list = [...(resumeData.certifications || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setResumeData({ certifications: list });
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
                  <Label className="text-xs font-semibold">{sectionLabels.summary}</Label>
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
                  <div key={idx} className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={sn.network}
                        onChange={(e) => handleUpdateSocial(idx, "network", e.target.value)}
                        onBlur={() => handleNormalizeSocial(idx)}
                        placeholder="Plataforma (ej. LinkedIn)"
                        className="h-7 text-xs w-1/4"
                      />
                      <Input
                        value={sn.username || ""}
                        onChange={(e) => handleUpdateSocial(idx, "username", e.target.value)}
                        onBlur={() => handleNormalizeSocial(idx)}
                        placeholder="Usuario (ej. jmonroys17)"
                        className="h-7 text-xs w-1/4"
                      />
                      <Input
                        value={sn.url}
                        onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                        onBlur={() => handleNormalizeSocial(idx)}
                        placeholder="https://linkedin.com/in/..."
                        className="h-7 text-xs flex-1 font-mono text-[11px]"
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
                    {sn.network.toLowerCase().includes("linkedin") && sn.url && !sn.url.includes("/in/") && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        ⚠ Formato recomendado: linkedin.com/in/{sn.username || "usuario"}
                      </p>
                    )}
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
                  {sectionLabels.skills}
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
                  {sectionLabels.experience}
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
                {(resumeData.experience || []).map((exp, expIdx) => {
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
                            disabled={expIdx === 0}
                            onClick={() => handleMoveExperience(expIdx, "up")}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                            title="Subir puesto"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={expIdx === ((resumeData.experience || []).length - 1)}
                            onClick={() => handleMoveExperience(expIdx, "down")}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                            title="Bajar puesto"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
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
                            <div key={hIdx} className="flex gap-1.5 items-start group">
                              <span className="text-muted-foreground text-xs mt-1">•</span>
                              <Textarea
                                value={hl}
                                onChange={(e) => handleUpdateHighlightExp(exp.id, hIdx, e.target.value)}
                                className="text-xs min-h-[44px] py-1.5 leading-tight flex-1 resize-y"
                              />
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={hIdx === 0}
                                  onClick={() => handleMoveHighlightExp(exp.id, hIdx, "up")}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                                  title="Subir viñeta"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={hIdx === (exp.highlights.length - 1)}
                                  onClick={() => handleMoveHighlightExp(exp.id, hIdx, "down")}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                                  title="Bajar viñeta"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveHighlightExp(exp.id, hIdx)}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                  title="Eliminar viñeta"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
                  {sectionLabels.projects}
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
                {(resumeData.projects || []).map((proj, pIdx) => {
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
                            disabled={pIdx === 0}
                            onClick={() => handleMoveProject(pIdx, "up")}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                            title="Subir proyecto"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pIdx === ((resumeData.projects || []).length - 1)}
                            onClick={() => handleMoveProject(pIdx, "down")}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                            title="Bajar proyecto"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
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
                            placeholder="ej: SchemaCV, API Gateway, etc."
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-[11px]">Tecnologías del Proyecto</Label>
                          <TagInput
                            value={proj.technologies || []}
                            onChange={(newTechs) =>
                              handleUpdateProject(proj.id, {
                                technologies: newTechs,
                              })
                            }
                            placeholder="React, TypeScript, Next.js, PostgreSQL..."
                            inputClassName="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">URL Repositorio (GitHub)</Label>
                          <Input
                            value={proj.github_url || ""}
                            onChange={(e) => handleUpdateProject(proj.id, { github_url: e.target.value })}
                            placeholder="https://github.com/usuario/repo"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">URL Demo en Vivo</Label>
                          <Input
                            value={proj.url || ""}
                            onChange={(e) => handleUpdateProject(proj.id, { url: e.target.value })}
                            placeholder="https://midemo.com"
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px]">Descripción / Resumen del Proyecto</Label>
                        <Textarea
                          value={proj.description || ""}
                          onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                          placeholder="Describe brevemente el objetivo, arquitectura y problema resuelto..."
                          className="text-xs min-h-[48px] resize-y"
                        />
                      </div>

                      {/* Viñetas de logros del proyecto */}
                      <div className="space-y-2 pt-1 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <Label className="text-[11px] font-semibold">
                              Logros y Viñetas Técnicas (Opcional)
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddHighlightProj(proj.id)}
                            className="h-6 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Viñeta
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          {(proj.highlights || []).map((hl, hIdx) => (
                            <div key={hIdx} className="flex gap-1.5 items-start group">
                              <span className="text-muted-foreground text-xs mt-1">•</span>
                              <Textarea
                                value={hl}
                                onChange={(e) => handleUpdateHighlightProj(proj.id, hIdx, e.target.value)}
                                placeholder="Logro cuantificable o funcionalidad técnica implementada..."
                                className="text-xs min-h-[44px] py-1.5 leading-tight flex-1 resize-y"
                              />
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={hIdx === 0}
                                  onClick={() => handleMoveHighlightProj(proj.id, hIdx, "up")}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                                  title="Subir viñeta"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={hIdx === (proj.highlights.length - 1)}
                                  onClick={() => handleMoveHighlightProj(proj.id, hIdx, "down")}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                                  title="Bajar viñeta"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveHighlightProj(proj.id, hIdx)}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                  title="Eliminar viñeta"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
                  {sectionLabels.education}
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
                {(resumeData.education || []).map((edu, eduIdx) => {
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
                            {edu.degree || "Título"} {edu.institution ? `en ${edu.institution}` : ""}
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
                            disabled={eduIdx === 0}
                            onClick={() => handleMoveEducation(eduIdx, "up")}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                            title="Subir educación"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={eduIdx === ((resumeData.education || []).length - 1)}
                            onClick={() => handleMoveEducation(eduIdx, "down")}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                            title="Bajar educación"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
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
                            placeholder="ej: INACAP, Universidad de Chile, etc."
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Título / Grado Académico *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                            placeholder="ej: Ingeniería en Informática, Licenciatura"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Área de Estudio / Especialidad</Label>
                          <Input
                            value={edu.area || ""}
                            onChange={(e) => handleUpdateEducation(edu.id, { area: e.target.value })}
                            placeholder="ej: Desarrollo de Software, Redes, etc."
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Ubicación (Ciudad, País)</Label>
                          <Input
                            value={edu.location || ""}
                            onChange={(e) => handleUpdateEducation(edu.id, { location: e.target.value })}
                            placeholder="ej: Santiago, Chile"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Promedio / Distinción / Honores (Opcional)</Label>
                          <Input
                            value={edu.gpa || ""}
                            onChange={(e) => handleUpdateEducation(edu.id, { gpa: e.target.value })}
                            placeholder="ej: Distinción Máxima, GPA 3.9, etc."
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-[11px]">Fechas (Inicio – Fin)</Label>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">Cursando</span>
                              <Switch
                                checked={edu.current}
                                onCheckedChange={(checked) =>
                                  handleUpdateEducation(edu.id, {
                                    current: checked,
                                    end_date: checked ? "Presente" : "",
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="2021"
                              value={edu.start_date || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, { start_date: e.target.value })}
                              className="h-7 text-xs w-1/2"
                            />
                            <Input
                              placeholder="2025"
                              disabled={edu.current}
                              value={edu.end_date || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, { end_date: e.target.value })}
                              className="h-7 text-xs w-1/2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Viñetas / Logros / Certificados Académicos adicionales */}
                      <div className="space-y-2 pt-1 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-blue-500" />
                            <Label className="text-[11px] font-semibold">
                              Certificados Académicos o Logros (Opcional)
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddHighlightEdu(edu.id)}
                            className="h-6 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Logro / Certificado
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          {(edu.highlights || []).map((hl, hIdx) => (
                            <div key={hIdx} className="flex gap-1.5 items-start group">
                              <span className="text-muted-foreground text-xs mt-1">•</span>
                              <Input
                                value={hl}
                                onChange={(e) => handleUpdateHighlightEdu(edu.id, hIdx, e.target.value)}
                                placeholder="ej: Certificado de Especialización en Cloud, Tesis destacada, etc."
                                className="h-7 text-xs flex-1"
                              />
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={hIdx === 0}
                                  onClick={() => handleMoveHighlightEdu(edu.id, hIdx, "up")}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                                  title="Subir logro"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={hIdx === ((edu.highlights || []).length - 1)}
                                  onClick={() => handleMoveHighlightEdu(edu.id, hIdx, "down")}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer"
                                  title="Bajar logro"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveHighlightEdu(edu.id, hIdx)}
                                  className="h-7 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                  title="Eliminar viñeta académica"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
                  {sectionLabels.certifications}
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
                {(resumeData.certifications || []).map((cert, cIdx) => {
                  const isCertHidden = !!cert.hidden;
                  const previewText = `${cert.name || "Certificación"}${cert.issuer ? ` — ${cert.issuer}` : ""}${cert.date ? ` (${cert.date})` : ""}`;

                  return (
                    <div
                      key={cert.id}
                      className={`p-2.5 rounded-lg border space-y-1.5 transition-all ${isCertHidden
                        ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                        : "border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                    >
                      <div className="flex gap-1.5 items-center">
                        <Input
                          value={cert.name}
                          onChange={(e) => handleUpdateCertification(cert.id, { name: e.target.value })}
                          placeholder="Nombre (ej. AWS Solutions Architect)"
                          className="h-7 text-xs flex-1"
                        />
                        <Input
                          value={cert.issuer}
                          onChange={(e) => handleUpdateCertification(cert.id, { issuer: e.target.value })}
                          placeholder="Emisor (ej. Amazon Web Services)"
                          className="h-7 text-xs flex-1"
                        />
                        <Input
                          value={cert.date || ""}
                          onChange={(e) => handleUpdateCertification(cert.id, { date: e.target.value })}
                          placeholder="Año (ej. 2024)"
                          className="h-7 text-xs w-20 font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cIdx === 0}
                          onClick={() => handleMoveCertification(cIdx, "up")}
                          className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 shrink-0 cursor-pointer"
                          title="Subir certificación"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cIdx === ((resumeData.certifications || []).length - 1)}
                          onClick={() => handleMoveCertification(cIdx, "down")}
                          className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-25 shrink-0 cursor-pointer"
                          title="Bajar certificación"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
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

                      {/* Live Preview de Extracción ATS */}
                      <div className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100/70 dark:bg-zinc-900/70 px-2 py-0.5 rounded flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold text-zinc-400">ATS Preview:</span>
                        <span className="truncate text-zinc-800 dark:text-zinc-200">{previewText}</span>
                      </div>
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
