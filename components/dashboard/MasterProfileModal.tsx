"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Database,
  User,
  Briefcase,
  Layers,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Check,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Globe,
  Mail,
  Phone,
  MapPin,
  FolderGit2,
} from "lucide-react";

export const MasterProfileModal: React.FC = () => {
  const {
    isMasterProfileModalOpen,
    setMasterProfileModalOpen,
    masterProfileData,
    updateMasterProfileData,
    syncActiveCvWithMaster,
    createProfileFromMaster,
    profiles,
  } = useResumeStore();

  const [activeTab, setActiveTab] = useState<"general" | "experience" | "skills" | "projects" | "education">("general");
  const [formData, setFormData] = useState<ResumeData>(masterProfileData);
  const [isSaved, setIsSaved] = useState(false);
  const [newCvName, setNewCvName] = useState("");
  const [newCvRole, setNewCvRole] = useState("");
  const [showCreateCvPrompt, setShowCreateCvPrompt] = useState(false);

  // Sincronizar datos al abrir modal
  React.useEffect(() => {
    if (isMasterProfileModalOpen) {
      setFormData(JSON.parse(JSON.stringify(masterProfileData)));
      setIsSaved(false);
    }
  }, [isMasterProfileModalOpen, masterProfileData]);

  const handleSaveMaster = () => {
    updateMasterProfileData(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateCvFromMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvName.trim()) return;
    createProfileFromMaster(newCvName.trim(), newCvRole.trim() || formData.headline || "");
    setShowCreateCvPrompt(false);
    setNewCvName("");
    setNewCvRole("");
    setMasterProfileModalOpen(false);
  };

  const totalSkills = formData.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0;
  const totalExp = formData.experience?.length || 0;
  const totalProj = formData.projects?.length || 0;

  return (
    <Dialog open={isMasterProfileModalOpen} onOpenChange={setMasterProfileModalOpen}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Encabezado del Perfil Maestro */}
        <DialogHeader className="p-4 sm:p-6 border-b border-border/80 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Database className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  Perfil Base de Carrera (Información Completa)
                </DialogTitle>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  Master Data
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground max-w-xl">
                Tu fuente central de verdad. Almacena aquí todo tu historial, proyectos y habilidades. Desde esta base podrás generar múltiples versiones de CV personalizadas para cada oferta laboral.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveMaster}
                className={`h-8 px-3 text-xs font-semibold gap-1.5 transition-all ${
                  isSaved
                    ? "bg-emerald-600 text-white"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isSaved ? "Guardado en Base" : "Guardar en Base"}</span>
              </Button>
            </div>
          </div>

          {/* Métricas del Repositorio */}
          <div className="flex items-center gap-3 pt-3 text-[11px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 text-foreground font-semibold">
              <Briefcase className="h-3.5 w-3.5 text-blue-500" />
              {totalExp} Empleos
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground font-semibold">
              <Layers className="h-3.5 w-3.5 text-emerald-500" />
              {totalSkills} Habilidades
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground font-semibold">
              <FolderGit2 className="h-3.5 w-3.5 text-amber-500" />
              {totalProj} Proyectos
            </span>
            <span>•</span>
            <span className="text-muted-foreground">
              {profiles.length} CVs creados
            </span>
          </div>
        </DialogHeader>

        {/* Formulario por Pestañas */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 sm:px-6 pt-3 border-b border-border/60 bg-card/40 shrink-0">
              <TabsList className="grid grid-cols-5 w-full max-w-2xl h-8 bg-zinc-100 dark:bg-zinc-800 text-xs">
                <TabsTrigger value="general" className="text-xs gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="experience" className="text-xs gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Experiencia</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Skills</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-xs gap-1">
                  <FolderGit2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Proyectos</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="text-xs gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Educación</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: DATOS GENERALES */}
            <TabsContent value="general" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 m-0 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nombre Completo</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Alexander Vance"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Titular Profesional Principal</Label>
                  <Input
                    value={formData.headline || ""}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="Ej. Senior Full Stack & Cloud Systems Engineer"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Correo Electrónico</Label>
                  <Input
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Teléfono de Contacto</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Ubicación (Ciudad, País)</Label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Santiago, Chile"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Sitio Web / Portafolio</Label>
                  <Input
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://tuportafolio.dev"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold">Resumen Profesional Maestro</Label>
                <Textarea
                  value={formData.summary || ""}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Redacta tu trayectoria profesional completa con tus mayores fortalezas y logros..."
                  className="text-xs min-h-[100px] leading-relaxed"
                />
              </div>
            </TabsContent>

            {/* TAB 2: EXPERIENCIA MAESTRA */}
            <TabsContent value="experience" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 m-0 scrollbar-thin">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Historial Completo de Empleos ({formData.experience?.length || 0})
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Agrega todas tus experiencias laborales pasadas y presentes con sus viñetas cuantitativas.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const newEntry = {
                      id: `exp-${Date.now()}`,
                      company: "Nueva Empresa",
                      position: "Nuevo Cargo",
                      location: "",
                      start_date: "2024",
                      end_date: "Presente",
                      current: true,
                      highlights: ["Logro medible o responsabilidad destacada."],
                    };
                    setFormData({ ...formData, experience: [newEntry, ...(formData.experience || [])] });
                  }}
                  className="h-7 text-xs gap-1 bg-foreground text-background"
                >
                  <Plus className="h-3 w-3" />
                  <span>Añadir Empleo</span>
                </Button>
              </div>

              <div className="space-y-3">
                {formData.experience?.map((exp, idx) => (
                  <div key={exp.id} className="p-3.5 rounded-xl border border-border bg-card/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-foreground">
                          {exp.position} – {exp.company}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = formData.experience.filter((_, i) => i !== idx);
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <Input
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].company = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        placeholder="Empresa"
                        className="h-7 text-xs"
                      />
                      <Input
                        value={exp.position}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].position = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        placeholder="Cargo"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: SKILLS MAESTRAS */}
            <TabsContent value="skills" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 m-0 scrollbar-thin">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Catálogo Maestro de Habilidades & Tecnologías
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Organiza todo tu arsenal técnico por categorías.
                </p>
              </div>

              <div className="space-y-3">
                {formData.skills?.map((cat, catIdx) => (
                  <div key={cat.id} className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground font-mono">
                        {cat.category} ({cat.skills.length} skills)
                      </span>
                    </div>
                    <Input
                      value={cat.skills.join(", ")}
                      onChange={(e) => {
                        const updated = [...formData.skills];
                        updated[catIdx].skills = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        setFormData({ ...formData, skills: updated });
                      }}
                      placeholder="Separadas por comas, ej: React, TypeScript, Docker"
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: PROYECTOS MAESTROS */}
            <TabsContent value="projects" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 m-0 scrollbar-thin">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Repositorio de Proyectos & Productos ({formData.projects?.length || 0})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Todos tus proyectos desarrollados con enlaces a GitHub y métricas STAR.
                </p>
              </div>

              <div className="space-y-3">
                {formData.projects?.map((proj, idx) => (
                  <div key={proj.id} className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2">
                    <div className="font-bold text-xs text-foreground">
                      {proj.name}
                    </div>
                    <Textarea
                      value={proj.description || ""}
                      onChange={(e) => {
                        const updated = [...formData.projects];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      placeholder="Descripción del proyecto..."
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 5: EDUCACIÓN */}
            <TabsContent value="education" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 m-0 scrollbar-thin">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Títulos, Grados & Certificaciones
                </h3>
              </div>

              <div className="space-y-2">
                {formData.education?.map((edu) => (
                  <div key={edu.id} className="p-3 rounded-xl border border-border bg-card/60 text-xs">
                    <div className="font-bold text-foreground">{edu.degree}</div>
                    <div className="text-muted-foreground">{edu.institution}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Barra Inferior con Acciones para Crear CV desde la Base */}
        <div className="p-3 sm:p-4 border-t border-border/80 bg-zinc-50 dark:bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncActiveCvWithMaster}
              className="h-8 text-xs gap-1.5 border-border"
              title="Sobrescribe el CV activo con toda la información de este Perfil Base"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Cargar Base en CV Activo</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {showCreateCvPrompt ? (
              <form onSubmit={handleCreateCvFromMaster} className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  value={newCvName}
                  onChange={(e) => setNewCvName(e.target.value)}
                  placeholder="Nombre versión (ej: CV Backend)"
                  className="h-8 text-xs w-44"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                  Crear CV
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateCvPrompt(false)}
                  className="h-8 text-xs"
                >
                  Cancelar
                </Button>
              </form>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowCreateCvPrompt(true)}
                className="h-8 px-3.5 text-xs font-semibold bg-foreground text-background gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Crear Nuevo CV desde esta Base</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
