"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  User,
  Layers,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Users,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SECTION_LABELS, ResumeLanguage } from "@/types/resume";

const SECTION_CONFIG: Record<
  string,
  { defaultKey: keyof typeof SECTION_LABELS.es; description: string; icon: React.ElementType }
> = {
  summary: {
    defaultKey: "summary",
    description: "Perfil general y propuesta de valor",
    icon: User,
  },
  skills: {
    defaultKey: "skills",
    description: "Stack tecnológico categorizado",
    icon: Layers,
  },
  experience: {
    defaultKey: "experience",
    description: "Empresas, cargos y viñetas de impacto (STAR/XYZ)",
    icon: Briefcase,
  },
  projects: {
    defaultKey: "projects",
    description: "Desarrollos, enlaces a repositorios y tecnologías",
    icon: FolderGit2,
  },
  education: {
    defaultKey: "education",
    description: "Títulos universitarios, instituciones y fechas",
    icon: GraduationCap,
  },
  certifications: {
    defaultKey: "certifications",
    description: "Acreditaciones técnicas oficiales",
    icon: Award,
  },
  references: {
    defaultKey: "references",
    description: "Contactos y referencias laborales profesionales",
    icon: Users,
  },
};

interface SortableItemProps {
  id: string;
  index: number;
  isHidden: boolean;
  currentTitle: string;
  defaultTitle: string;
  onToggleVisibility: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onResetTitle: (id: string) => void;
}

function SortableItem({
  id,
  index,
  isHidden,
  currentTitle,
  defaultTitle,
  onToggleVisibility,
  onUpdateTitle,
  onResetTitle,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentTitle || defaultTitle);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const config = SECTION_CONFIG[id] || {
    defaultKey: id,
    description: "Sección de CV",
    icon: Sparkles,
  };
  const Icon = config.icon;
  const isCustomTitle = Boolean(currentTitle && currentTitle.trim() !== defaultTitle.trim());

  const handleSaveTitle = () => {
    if (!tempTitle.trim()) {
      onResetTitle(id);
    } else {
      onUpdateTitle(id, tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelTitle = () => {
    setTempTitle(currentTitle || defaultTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelTitle();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg border transition-all select-none ${
        isDragging
          ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 shadow-lg scale-[1.02]"
          : isHidden
          ? "bg-zinc-50/50 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
          : "bg-card hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 border-border"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground rounded transition-colors shrink-0"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div
          className={`flex items-center justify-center h-8 w-8 rounded-md shrink-0 ${
            isHidden
              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {isEditing ? (
            <div className="flex items-center gap-1.5 animate-in fade-in-50 duration-150">
              <Input
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={defaultTitle}
                className="h-7 text-xs font-semibold py-0 px-2 rounded-md"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleSaveTitle}
                className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                title="Guardar nombre"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleCancelTitle}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold ${
                  isHidden ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {currentTitle || defaultTitle}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTempTitle(currentTitle || defaultTitle);
                  setIsEditing(true);
                }}
                className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                title="Editar nombre de la sección"
              >
                <Pencil className="h-3 w-3" />
              </button>
              {isCustomTitle && (
                <button
                  type="button"
                  onClick={() => onResetTitle(id)}
                  className="text-[10px] text-zinc-400 hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
                  title={`Restablecer nombre original: ${defaultTitle}`}
                >
                  (restablecer)
                </button>
              )}
              <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 rounded">
                #{index + 1}
              </span>
              {isHidden && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Oculta en CV
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {config.description}
            {isCustomTitle && !isEditing && (
              <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                • Título estándar: {defaultTitle}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Botón de Visibilidad (Ojo) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleVisibility(id)}
        className={`h-7 px-2 gap-1 text-xs transition-colors shrink-0 ${
          isHidden
            ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title={isHidden ? "Mostrar sección en el CV" : "Ocultar sección del CV"}
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
    </div>
  );
}

export const SectionOrganizer: React.FC = () => {
  const { resumeData, setSectionOrder, setResumeData } = useResumeStore();
  const sections = resumeData.section_order || [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "references",
  ];
  const hiddenSections = new Set(resumeData.hidden_sections || []);
  const customTitles = resumeData.section_titles || {};

  const lang: ResumeLanguage = (resumeData.language as ResumeLanguage) || "es";
  const defaultLabels = SECTION_LABELS[lang] || SECTION_LABELS.es;

  const handleToggleVisibility = (sectionId: string) => {
    const nextHidden = new Set(resumeData.hidden_sections || []);
    if (nextHidden.has(sectionId)) {
      nextHidden.delete(sectionId);
    } else {
      nextHidden.add(sectionId);
    }
    setResumeData({ hidden_sections: Array.from(nextHidden) });
  };

  const handleUpdateTitle = (sectionId: string, title: string) => {
    setResumeData({
      section_titles: {
        ...(resumeData.section_titles || {}),
        [sectionId]: title,
      },
    });
  };

  const handleResetTitle = (sectionId: string) => {
    const updated = { ...(resumeData.section_titles || {}) };
    delete updated[sectionId];
    setResumeData({ section_titles: updated });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.indexOf(String(active.id));
      const newIndex = sections.indexOf(String(over.id));
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      setSectionOrder(newOrder);
    }
  };

  const handleResetAll = () => {
    setSectionOrder([
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "references",
    ]);
    setResumeData({ section_titles: {} });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Organizador Modular & Nombres de Secciones
          </h3>
          <p className="text-xs text-muted-foreground">
            Arrastra para reordenar, haz clic en el lápiz para renombrar o en el ojo para ocultar/mostrar.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          className="h-8 text-xs gap-1.5 shrink-0"
          title="Restablecer orden predeterminado y nombres originales"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer Todo
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((sectionId, idx) => {
              const defaultTitle = (defaultLabels as any)[sectionId] || sectionId;
              const currentTitle = customTitles[sectionId] || defaultTitle;

              return (
                <SortableItem
                  key={sectionId}
                  id={sectionId}
                  index={idx}
                  isHidden={hiddenSections.has(sectionId)}
                  currentTitle={currentTitle}
                  defaultTitle={defaultTitle}
                  onToggleVisibility={handleToggleVisibility}
                  onUpdateTitle={handleUpdateTitle}
                  onResetTitle={handleResetTitle}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
