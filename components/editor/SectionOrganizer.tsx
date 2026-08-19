"use client";

import React from "react";
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
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";

const SECTION_CONFIG: Record<
  string,
  { label: string; description: string; icon: React.ElementType }
> = {
  summary: {
    label: "Resumen Profesional",
    description: "Perfil general y propuesta de valor",
    icon: User,
  },
  skills: {
    label: "Competencias Técnicas",
    description: "Stack tecnológico categorizado",
    icon: Layers,
  },
  experience: {
    label: "Experiencia Laboral",
    description: "Empresas, cargos y viñetas de impacto (STAR/XYZ)",
    icon: Briefcase,
  },
  projects: {
    label: "Proyectos Destacados",
    description: "Desarrollos, enlaces a repositorios y tecnologías",
    icon: FolderGit2,
  },
  education: {
    label: "Educación & Formación",
    description: "Títulos universitarios, instituciones y fechas",
    icon: GraduationCap,
  },
  certifications: {
    label: "Certificaciones",
    description: "Acreditaciones técnicas oficiales",
    icon: Award,
  },
};

interface SortableItemProps {
  id: string;
  index: number;
  isHidden: boolean;
  onToggleVisibility: (id: string) => void;
}

function SortableItem({ id, index, isHidden, onToggleVisibility }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const config = SECTION_CONFIG[id] || {
    label: id,
    description: "Sección de CV",
    icon: Sparkles,
  };
  const Icon = config.icon;

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
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground rounded transition-colors"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className={`flex items-center justify-center h-8 w-8 rounded-md ${
          isHidden
            ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}>
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${isHidden ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {config.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 rounded">
              #{index + 1}
            </span>
            {isHidden && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Oculta en CV
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {config.description}
          </p>
        </div>
      </div>

      {/* Botón de Visibilidad (Ojo) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleVisibility(id)}
        className={`h-7 px-2 gap-1 text-xs transition-colors ${
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
  ];
  const hiddenSections = new Set(resumeData.hidden_sections || []);

  const handleToggleVisibility = (sectionId: string) => {
    const nextHidden = new Set(resumeData.hidden_sections || []);
    if (nextHidden.has(sectionId)) {
      nextHidden.delete(sectionId);
    } else {
      nextHidden.add(sectionId);
    }
    setResumeData({ hidden_sections: Array.from(nextHidden) });
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

  const handleResetOrder = () => {
    setSectionOrder([
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Orden Modular & Visibilidad de Secciones
          </h3>
          <p className="text-xs text-muted-foreground">
            Arrastra para reordenar o haz clic en el ojo para ocultar/mostrar secciones en el CV.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetOrder}
          className="h-8 text-xs gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((sectionId, idx) => (
              <SortableItem
                key={sectionId}
                id={sectionId}
                index={idx}
                isHidden={hiddenSections.has(sectionId)}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
