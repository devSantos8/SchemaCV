"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Cargando tu espacio de trabajo...",
  subMessage = "Sincronizando currículums y estándares ATS",
  fullScreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-sm">
      {/* Badge animado de Marca */}
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 flex items-center justify-center font-black text-2xl shadow-xl animate-pulse">
          S
        </div>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-background flex items-center justify-center">
          <Sparkles className="h-2.5 w-2.5 text-white animate-spin" />
        </div>
      </div>

      {/* Título y Subtítulo */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center justify-center gap-2">
          <span>{message}</span>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
        </h3>
        {subMessage && (
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {subMessage}
          </p>
        )}
      </div>

      {/* Barra de progreso shimmer */}
      <div className="w-48 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[shimmer_1.5s_infinite] w-full" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex items-center justify-center">
      {content}
    </div>
  );
};
