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
        {/* Barra Superior Minimalista del Editor */}
        <div className="flex items-center justify-between px-3 py-1.5 h-10 border-b border-border/60 bg-muted/20 backdrop-blur-xs shrink-0">
          <TabsList className="h-7 p-0.5 bg-muted/70 rounded-md border border-border/40">
            <TabsTrigger
              value="visual"
              className="h-6 px-2.5 text-[11px] font-medium rounded-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Formulario</span>
            </TabsTrigger>
            <TabsTrigger
              value="yaml"
              className="h-6 px-2.5 text-[11px] font-medium rounded-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all cursor-pointer"
            >
              <FileCode className="h-3 w-3" />
              <span>YAML</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Botón Acceso Perfil Base Minimalista */}
            <button
              type="button"
              onClick={() => setMasterProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-border/40"
              title="Abrir tu Base de Información Completa de Carrera"
            >
              <Database className="h-3 w-3 text-emerald-500" />
              <span className="hidden sm:inline">Perfil Base</span>
            </button>

            <div className="h-3.5 w-[1px] bg-border/60" />

            {/* Deshacer / Rehacer Minimalista */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-20 transition-colors cursor-pointer"
                title="Deshacer (Ctrl+Z)"
              >
                <Undo2 className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-20 transition-colors cursor-pointer"
                title="Rehacer (Ctrl+Y)"
              >
                <Redo2 className="h-3 w-3" />
              </button>
            </div>

            <div className="h-3.5 w-[1px] bg-border/60 hidden sm:block" />

            {/* Indicador de estado de sincronización */}
            <div className="hidden sm:flex items-center text-[11px] font-mono">
              {yamlError ? (
                <span className="flex items-center gap-1 text-rose-500 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Error</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span className="text-[10px]">Sincronizado</span>
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
