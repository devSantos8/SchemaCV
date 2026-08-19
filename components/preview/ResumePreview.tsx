"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { DockToolbar } from "@/components/ui/dock-toolbar";

export const ResumePreview: React.FC = () => {
  const { resumeData, activeTemplate, paperSize, zoom } = useResumeStore();

  const isA4 = paperSize === "a4";

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden flex flex-col bg-zinc-100 dark:bg-zinc-950 print:bg-white print:overflow-visible print:h-auto print:block">
      {/* Área con scroll independiente donde el documento se desplaza libremente */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start print:p-0 print:m-0 print:overflow-visible print:block scrollbar-thin">
        {/* Contenedor de Zoom interactivo */}
        <div
          id="cv-zoom-container"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="flex justify-center print:!transform-none print:m-0 print:w-full print:block"
        >
          {/* Hoja de papel simulada con proporciones A4 o Letter */}
          <div
            id="cv-printable-document"
            className={`bg-white text-zinc-950 shadow-2xl rounded-sm transition-all border border-zinc-200/80 dark:border-zinc-800/80 print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:m-0 print:p-0 ${
              isA4
                ? "w-[210mm] min-h-[297mm]"
                : "w-[8.5in] min-h-[11in]"
            }`}
          >
            <TemplateRenderer
              templateId={activeTemplate}
              data={resumeData}
              paperSize={paperSize}
            />
          </div>
        </div>
      </div>

      {/* Cápsula / Barra de herramientas flotante fija en la parte inferior del panel */}
      <DockToolbar />
    </div>
  );
};
