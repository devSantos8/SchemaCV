"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/navigation/Header";
import { DualModeEditor } from "@/components/editor/DualModeEditor";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { ImportResumeModal } from "@/components/editor/ImportResumeModal";
import { ProfileManagerModal } from "@/components/navigation/ProfileManagerModal";
import { useResumeStore } from "@/store/useResumeStore";

export default function SchemaCVApp() {
  const { undo, redo, canUndo, canRedo, activeTab } = useResumeStore();

  // Atajos de teclado globales para Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      // Si el foco está en un input o textarea editable, dejamos que el navegador maneje el undo de texto local a menos que no haya selección
      const target = e.target as HTMLElement;
      const isInputField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.classList.contains("cm-content"));

      // Si estamos en la pestaña visual y fuera de un input específico, o reordenando/borrando elementos
      if (!isInputField) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) undo();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          if (canRedo) redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo, activeTab]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground select-none print:h-auto print:overflow-visible print:bg-white">
      {/* 1. Header de Navegación y Herramientas */}
      <Header />

      {/* 2. Área de Trabajo Principal Dividida (Editor Dual ⟷ Vista Previa ATS) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden print:block print:overflow-visible">
        {/* Panel Izquierdo: Editor Dual (Visual ⟷ YAML) */}
        <section className="w-full md:w-[48%] lg:w-[45%] xl:w-[42%] h-1/2 md:h-full shrink-0 flex flex-col print:hidden">
          <DualModeEditor />
        </section>

        {/* Panel Derecho: Vista Previa ATS en Tiempo Real */}
        <section className="flex-1 h-1/2 md:h-full overflow-hidden print:w-full print:h-auto print:overflow-visible">
          <ResumePreview />
        </section>
      </main>

      {/* 3. Modales de Ingesta y Perfiles */}
      <ImportResumeModal />
      <ProfileManagerModal />
    </div>
  );
}
