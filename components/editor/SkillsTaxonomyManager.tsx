"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  Sparkles,
  Layers,
  Code2,
  Cloud,
  Database,
  Wrench,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Check,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { SkillCategory } from "@/types/resume";
import {
  SKILL_CATEGORIES_CONFIG,
  COMMON_SKILLS_TAXONOMY,
  SkillCategoryKey,
} from "@/lib/taxonomy/skillsTaxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Languages: Code2,
  "Frameworks & Libraries": Layers,
  "Cloud & DevOps": Cloud,
  "Databases & Storage": Database,
  "Tools & Platforms": Wrench,
  "Methodologies & Soft Skills": CheckCircle2,
};

export const SkillsTaxonomyManager: React.FC = () => {
  const { resumeData, setResumeData } = useResumeStore();
  const skills = resumeData.skills || [];

  const [newSkillInput, setNewSkillInput] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Renombrar subtítulo / categoría de skills
  const handleUpdateCategoryName = (categoryId: string, newName: string) => {
    const updated = skills.map((cat) =>
      cat.id === categoryId ? { ...cat, category: newName } : cat
    );
    setResumeData({ skills: updated });
  };

  // Alternar visibilidad de categoría de skills
  const handleToggleCategoryVisibility = (categoryId: string) => {
    const updated = skills.map((cat) =>
      cat.id === categoryId ? { ...cat, hidden: !cat.hidden } : cat
    );
    setResumeData({ skills: updated });
  };

  // Agregar una habilidad a una categoría existente
  const handleAddSkill = (categoryId: string, skillToAdd?: string) => {
    const text = (skillToAdd || newSkillInput[categoryId] || "").trim();
    if (!text) return;

    const updated = skills.map((cat) => {
      if (cat.id === categoryId) {
        if (cat.skills.some((s) => s.toLowerCase() === text.toLowerCase())) return cat;
        return {
          ...cat,
          skills: [...cat.skills, text],
        };
      }
      return cat;
    });

    setResumeData({ skills: updated });
    setNewSkillInput((prev) => ({ ...prev, [categoryId]: "" }));
  };

  // Eliminar una habilidad
  const handleRemoveSkill = (categoryId: string, skillToRemove: string) => {
    const updated = skills.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          skills: cat.skills.filter((s) => s !== skillToRemove),
        };
      }
      return cat;
    });
    setResumeData({ skills: updated });
  };

  // Agregar una categoría canónica o personalizada
  const handleAddCategory = (categoryKey: string) => {
    const exists = skills.some((cat) => cat.category.toLowerCase() === categoryKey.toLowerCase());
    if (exists) return;

    const newCategory: SkillCategory = {
      id: `skill-cat-${Date.now()}`,
      category: categoryKey,
      skills: [],
      hidden: false,
    };

    setResumeData({ skills: [...skills, newCategory] });
    setNewCategoryName("");
    setIsAddingCustomCategory(false);
  };

  // Eliminar una categoría completa
  const handleRemoveCategory = (categoryId: string) => {
    setResumeData({ skills: skills.filter((cat) => cat.id !== categoryId) });
  };

  return (
    <div className="space-y-4">
      {/* Sugerencias Rápidas de Categorías no añadidas */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-border">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Categorías Canónicas ATS Recomendadas:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SKILL_CATEGORIES_CONFIG) as SkillCategoryKey[]).map((catKey) => {
            const alreadyAdded = skills.some(
              (cat) => cat.category.toLowerCase() === catKey.toLowerCase()
            );
            const Icon = CATEGORY_ICONS[catKey] || Layers;

            if (alreadyAdded) return null;

            return (
              <Button
                key={catKey}
                variant="outline"
                size="sm"
                onClick={() => handleAddCategory(catKey)}
                className="h-7 text-[11px] gap-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100"
              >
                <Icon className="h-3 w-3 text-muted-foreground" />
                <Plus className="h-3 w-3" />
                {catKey}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lista de Categorías de Skills Activas */}
      <div className="space-y-3">
        {skills.map((category) => {
          const Icon = CATEGORY_ICONS[category.category] || Layers;
          const currentInput = newSkillInput[category.id] || "";
          const isHidden = !!category.hidden;

          // Obtener sugerencias comunes para esta categoría que aún no estén añadidas
          const suggestions = COMMON_SKILLS_TAXONOMY.filter(
            (item) =>
              item.category === category.category &&
              !category.skills.some((s) => s.toLowerCase() === item.name.toLowerCase())
          ).slice(0, 6);

          return (
            <div
              key={category.id}
              className={`p-3.5 rounded-lg border space-y-2.5 transition-all ${
                isHidden
                  ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                  : "border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {/* Header de Categoría */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                  <div className={`p-1 rounded shrink-0 ${
                    isHidden
                      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {editingCategoryId === category.id ? (
                    <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                      <Input
                        value={category.category}
                        onChange={(e) => handleUpdateCategoryName(category.id, e.target.value)}
                        onBlur={() => setEditingCategoryId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") setEditingCategoryId(null);
                        }}
                        autoFocus
                        placeholder="Nombre del subtítulo"
                        className="h-6 text-xs font-bold px-2 py-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategoryId(null)}
                        className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 shrink-0"
                        title="Guardar nombre"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/cat truncate">
                      <span
                        onClick={() => setEditingCategoryId(category.id)}
                        className={`text-xs font-bold cursor-pointer hover:text-primary hover:underline decoration-dotted underline-offset-2 transition-colors truncate ${
                          isHidden ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                        title="Haz clic para editar el nombre de este subtítulo"
                      >
                        {category.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(category.id)}
                        className="opacity-0 group-hover/cat:opacity-100 p-0.5 text-muted-foreground hover:text-foreground rounded transition-opacity shrink-0"
                        title="Editar subtítulo"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        ({category.skills.length})
                      </span>
                      {isHidden && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                          Oculto en CV
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleCategoryVisibility(category.id)}
                    className={`h-6 px-1.5 gap-1 text-xs ${
                      isHidden ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={isHidden ? "Mostrar categoría en el CV" : "Ocultar categoría del CV"}
                  >
                    {isHidden ? (
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
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCategory(category.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Badges de Habilidades Añadidas */}
              <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                {category.skills.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    Sin habilidades aún. Escribe abajo o haz clic en las sugerencias.
                  </span>
                )}
                {category.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 text-xs py-0.5 px-2 bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(category.id, skill)}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Input para añadir nueva skill */}
              <div className="flex gap-1.5 pt-1">
                <Input
                  placeholder={`Añadir a ${category.category} (ej. Docker, Python...)`}
                  value={currentInput}
                  onChange={(e) =>
                    setNewSkillInput((prev) => ({
                      ...prev,
                      [category.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(category.id);
                    }
                  }}
                  className="h-7 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddSkill(category.id)}
                  className="h-7 text-xs px-2.5"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Añadir
                </Button>
              </div>

              {/* Sugerencias Rápidas de la Taxonomía */}
              {suggestions.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] text-muted-foreground">Sugeridos:</span>
                  {suggestions.map((sug) => (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => handleAddSkill(category.id, sug.name)}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-50 dark:bg-zinc-900 text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
                    >
                      + {sug.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón para añadir categoría personalizada */}
      {isAddingCustomCategory ? (
        <div className="flex gap-2 p-3 rounded-lg border border-dashed border-border bg-zinc-50 dark:bg-zinc-900/40">
          <Input
            placeholder="Nombre de nueva categoría (ej. Metodologías, Certificaciones...)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCategoryName.trim()) {
                e.preventDefault();
                handleAddCategory(newCategoryName.trim());
              }
            }}
            className="h-8 text-xs"
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => newCategoryName.trim() && handleAddCategory(newCategoryName.trim())}
            className="h-8 text-xs"
          >
            Crear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAddingCustomCategory(false);
              setNewCategoryName("");
            }}
            className="h-8 text-xs"
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingCustomCategory(true)}
          className="w-full h-8 text-xs border-dashed gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva Categoría Personalizada
        </Button>
      )}
    </div>
  );
};
