"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/navigation/Header";
import { DualModeEditor } from "@/components/editor/DualModeEditor";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { ImportResumeModal } from "@/components/editor/ImportResumeModal";
import { ProfileManagerModal } from "@/components/navigation/ProfileManagerModal";
import { TemplateGalleryModal } from "@/components/templates/TemplateGalleryModal";
import { MasterProfileModal } from "@/components/dashboard/MasterProfileModal";
import { AuthView } from "@/components/auth/AuthView";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    resumeData,
    saveCurrentResumeToSupabase,
  } = useResumeStore();
  const { user, isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Autoguardado silencioso debounced en Supabase (cada 2 segundos de inactividad)
  useEffect(() => {
    if (!user || user.isDemoUser || !user.id) return;
    const isSupabaseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isSupabaseUuid) return;

    const timer = setTimeout(() => {
      saveCurrentResumeToSupabase(user.id).catch(console.error);
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData, user, saveCurrentResumeToSupabase]);

  // Atajos de teclado globales para Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const target = e.target as HTMLElement;
      const isInputField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.classList.contains("cm-content"));

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
  }, [undo, redo, canUndo, canRedo]);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground select-none print:h-auto print:overflow-visible print:bg-white">
      {/* 1. Header con navegación */}
      <Header
        onBackToDashboard={() => router.push("/dashboard")}
        onOpenSettings={() => router.push("/settings")}
      />

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

      {/* 3. Modales de Ingesta, Perfiles, Plantillas y Base Maestra */}
      <ImportResumeModal />
      <ProfileManagerModal />
      <TemplateGalleryModal />
      <MasterProfileModal />
    </div>
  );
}
