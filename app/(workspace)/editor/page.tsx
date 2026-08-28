"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/navigation/Header";
import { DualModeEditor } from "@/components/editor/DualModeEditor";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { AIChatSidebar } from "@/components/ai/AIChatSidebar";
import { ImportResumeModal } from "@/components/editor/ImportResumeModal";
import { ProfileManagerModal } from "@/components/navigation/ProfileManagerModal";
import { TemplateGalleryModal } from "@/components/templates/TemplateGalleryModal";
import { MasterProfileModal } from "@/components/dashboard/MasterProfileModal";
import { AuthView } from "@/components/auth/AuthView";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAIChatStore } from "@/store/useAIChatStore";
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
  const { isOpen: isChatOpen } = useAIChatStore();
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

  const [mobileView, setMobileView] = React.useState<"editor" | "preview">("editor");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <AuthView initialMode="login" />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground select-none print:h-auto print:overflow-visible print:bg-white">
      {/* 1. Header con navegación */}
      <Header
        onBackToDashboard={() => router.push("/dashboard")}
        onOpenSettings={() => router.push("/settings")}
      />

      {/* 2. Área de Trabajo Principal Dividida (Editor Dual ⟷ Vista Previa ATS ⟷ Copilot Sidebar) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden print:block print:overflow-visible relative">
        {/* Panel Izquierdo: Editor Dual (Visual ⟷ YAML) */}
        <section
          className={`${
            mobileView === "editor" ? "flex" : "hidden"
          } md:flex h-full w-full shrink-0 flex-col print:hidden border-r border-border/60 transition-all duration-300 ease-in-out ${
            isChatOpen
              ? "md:w-[35%] lg:w-[32%] xl:w-[28%] 2xl:w-[26%]"
              : "md:w-[48%] lg:w-[45%] xl:w-[42%] 2xl:w-[38%]"
          }`}
        >
          <DualModeEditor />
        </section>

        {/* Panel Central: Vista Previa ATS en Tiempo Real */}
        <section
          className={`${
            mobileView === "preview" ? "flex" : "hidden"
          } md:flex flex-1 h-full w-full overflow-hidden print:w-full print:h-auto print:overflow-visible min-w-0 transition-all duration-300 flex-col`}
        >
          <ResumePreview />
        </section>

        {/* Panel Derecho: Copilot IA Sidebar (GitHub Copilot style - Pushes Preview en Desktop / Drawer en Móvil) */}
        <AIChatSidebar />
      </main>

      {/* Barra de Navegación Inferior Móvil (Switcher Editor ⟷ Vista Previa) */}
      <div className="md:hidden flex items-center justify-around h-12 bg-card/95 backdrop-blur-md border-t border-border/80 px-4 shrink-0 z-20 pb-[env(safe-area-inset-bottom,0px)]">
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            mobileView === "editor"
              ? "bg-foreground text-background shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Editor & Formulario</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            mobileView === "preview"
              ? "bg-foreground text-background shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Vista Previa CV</span>
        </button>
      </div>

      {/* 3. Modales de Ingesta, Perfiles, Plantillas y Base Maestra */}
      <ImportResumeModal />
      <ProfileManagerModal />
      <TemplateGalleryModal />
      <MasterProfileModal />
    </div>
  );
}
