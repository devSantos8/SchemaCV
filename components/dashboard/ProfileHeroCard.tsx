"use client";

import React from "react";
import {
  User,
  Settings,
  Star,
  Clock,
  Briefcase,
  ExternalLink,
  Globe,
  ShieldCheck,
  Sparkles,
  Edit3,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { BANNER_THEMES } from "./ProfileSettingsModal";

const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-3.5 w-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "h-3.5 w-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface ProfileHeroCardProps {
  onOpenWorkspace: () => void;
  onOpenSettings?: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  onOpenWorkspace,
  onOpenSettings,
}) => {
  const { user, setSettingsModalOpen } = useAuthStore();
  const { profiles } = useResumeStore();

  const handleOpenSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setSettingsModalOpen(true);
    }
  };

  const currentTheme =
    BANNER_THEMES.find((t) => t.id === user?.bannerTheme) || BANNER_THEMES[0];

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "JM";

  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-card border border-border/80 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
      {/* 1. BANNER SUPERIOR CON ESTILO ARTÍSTICO & ACCIONES */}
      <div className="relative h-32 w-full overflow-hidden bg-zinc-900">
        {/* Gradiente o Ilustración del Banner */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${currentTheme.preview} opacity-90 transition-all duration-500 group-hover:scale-105`}
        />
        {/* Patrón de líneas sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Botón de Configuración Rápida en el Banner */}
        <button
          type="button"
          onClick={handleOpenSettingsClick}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
          title="Configurar Perfil Profesional"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* 2. AVATAR FLOTANTE CENTRAL & INFORMACIÓN DE PERFIL */}
      <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative">
        {/* Avatar Circular Flotante */}
        <div className="-mt-12 mb-3 relative">
          <div className="h-20 w-20 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 ring-4 ring-card flex items-center justify-center font-bold text-xl shadow-xl overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="tracking-tighter">{initials}</span>
            )}
          </div>
          {/* Indicador de Disponibilidad */}
          <span
            className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-card"
            title="Perfil Activo"
          />
        </div>

        {/* Nombre y Cargo Profesional */}
        <div className="space-y-0.5 mb-4">
          <h2 className="text-base font-extrabold text-foreground tracking-tight">
            {user?.name || "Joain Matias Monroy"}
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            {user?.headline || "Senior Full Stack & Cloud Developer"}
          </p>
        </div>

        {/* Enlaces Sociales / Portafolio */}
        <div className="flex items-center gap-2 mb-5">
          {user?.githubUrl && (
            <a
              href={user.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              title="GitHub"
            >
              <GithubIcon className="h-3.5 w-3.5" />
            </a>
          )}
          {user?.linkedinUrl && (
            <a
              href={user.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              title="LinkedIn"
            >
              <LinkedinIcon className="h-3.5 w-3.5" />
            </a>
          )}
          {user?.websiteUrl && (
            <a
              href={user.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              title="Sitio Web"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={handleOpenSettingsClick}
            className="h-7 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            <span>Editar</span>
          </button>
        </div>

        {/* 3. CONTENEDOR OSCURO DE 3 MÉTRICAS (Estilo Foto Referencia) */}
        <div className="w-full bg-zinc-100/90 dark:bg-zinc-900/90 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center border border-border/50 shadow-2xs mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>98%</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">ATS Match</div>
          </div>

          <div className="space-y-0.5 border-x border-border/60">
            <div className="text-xs font-bold text-foreground">
              {user?.experienceYears || "5+ Años"}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Experiencia</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xs font-bold text-foreground">
              {profiles.length} CVs
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Versiones</div>
          </div>
        </div>

        {/* 4. BOTÓN DE ACCIÓN PRINCIPAL */}
        <Button
          onClick={onOpenWorkspace}
          className="w-full h-9 text-xs font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all"
        >
          <span>Abrir Espacio de Trabajo</span>
          <ExternalLink className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
