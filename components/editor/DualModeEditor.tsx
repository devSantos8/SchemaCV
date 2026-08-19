"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormEditor } from "./FormEditor";
import { YamlCodeEditor } from "./YamlCodeEditor";
import { useResumeStore } from "@/store/useResumeStore";
import {
  SlidersHorizontal,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Undo2,
  Redo2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const DualModeEditor: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    yamlError,
    undo,
    redo,
    canUndo,
    canRedo,
    setMasterProfileModalOpen,
  } = useResumeStore();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background border-r border-border">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "visual" | "yaml")}
        className="flex flex-col h-full"
      >
        {/* Barra de Tabs del Editor */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
          <TabsList className="grid grid-cols-2 w-[260px] h-8 p-0.5 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger
              value="visual"
              className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Formulario Visual</span>
            </TabsTrigger>
            <TabsTrigger
              value="yaml"
              className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Editor YAML</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1.5">
            {/* Botón Acceso Perfil Base */}
            <button
              type="button"
              onClick={() => setMasterProfileModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
              title="Abrir tu Base de Información Completa de Carrera"
            >
              <Database className="h-3 w-3" />
              <span className="hidden md:inline">Perfil Base</span>
            </button>

            {/* Botones de Deshacer / Rehacer contextuales */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-md border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                title="Deshacer cambio (Ctrl+Z)"
              >
                <Undo2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                title="Rehacer cambio (Ctrl+Y)"
              >
                <Redo2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Indicador de estado de sincronización */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium">
              {yamlError ? (
                <span className="flex items-center gap-1 text-rose-500 font-mono">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Error sintaxis
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sincronizado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenido Visual */}
        <TabsContent
          value="visual"
          className="flex-1 overflow-y-auto p-4 m-0 outline-none scrollbar-thin"
        >
          <FormEditor />
        </TabsContent>

        {/* Contenido YAML */}
        <TabsContent
          value="yaml"
          className="flex-1 overflow-hidden p-3 m-0 outline-none"
        >
          <YamlCodeEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
