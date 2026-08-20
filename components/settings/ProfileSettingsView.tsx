"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Sparkles,
  Save,
  Check,
  ShieldCheck,
  Clock,
  Settings,
  Eye,
  KeyRound,
  ArrowLeft,
  Moon,
  Sun,
  FileCode2,
  Share2,
  CheckCircle2,
  Layers,
  FileDown,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BANNER_THEMES } from "../dashboard/ProfileSettingsModal";
import { DeleteAccountModal } from "./DeleteAccountModal";

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

interface ProfileSettingsViewProps {
  onBack: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onBack }) => {
  const { user, updateUserProfile } = useAuthStore();
  const { profiles, setResumeData } = useResumeStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || "");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || "");
  const [availability, setAvailability] = useState(user?.availability || "");
  const [bannerTheme, setBannerTheme] = useState(user?.bannerTheme || "warm_amber");
  const [syncWithActiveCv, setSyncWithActiveCv] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setHeadline(user.headline || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhone(user.phone || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
      setExperienceYears(user.experienceYears || "");
      setAvailability(user.availability || "");
      setBannerTheme(user.bannerTheme || "warm_amber");
    }
  }, [user]);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      root.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const activeBanner =
    BANNER_THEMES.find((t) => t.id === bannerTheme) || BANNER_THEMES[0];

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "JM";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      name,
      email,
      headline,
      bio,
      location,
      phone,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      experienceYears,
      availability,
      bannerTheme,
    };

    updateUserProfile(updates);

    if (syncWithActiveCv) {
      setResumeData((prev) => ({
        name: name || prev.name,
        headline: headline || prev.headline,
        email: email || prev.email,
        phone: phone || prev.phone,
        location: location || prev.location,
        website: websiteUrl || prev.website,
        summary: bio || prev.summary,
      }));
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-foreground flex flex-col transition-colors duration-300">
      {/* 1. TOPBAR DE NAVEGACIÓN */}
      <header className="h-14 border-b border-border/60 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-border/80 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="font-semibold">Volver al Dashboard</span>
          </Button>

          <div className="h-4 w-[1px] bg-border/80 mx-1 hidden sm:block" />

          <div className="flex items-baseline gap-1 select-none">
            <span className="text-base font-extrabold tracking-tight text-foreground font-sans">
              Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-emerald-500 mb-0.5 inline-block" />
          </div>

          <span className="text-xs font-bold text-muted-foreground hidden md:inline">
            / Configuración de Perfil
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            size="sm"
            className="h-8 px-4 text-xs gap-1.5 font-semibold bg-foreground text-background rounded-lg shadow-sm"
          >
            {isSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>¡Cambios Guardados!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Alternar tema claro/oscuro"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL: APARTADO COMPLETO DE PERFIL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA IZQUIERDA: VISTA PREVIA EN VIVO DE LA TARJETA (4 cols) */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vista Previa de tu Tarjeta
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo
              </span>
            </div>

            {/* Tarjeta de Perfil Hero con Banner y Avatar */}
            <div className="w-full rounded-3xl overflow-hidden bg-card border border-border/80 shadow-xl flex flex-col transition-all">
              {/* Banner */}
              <div className="relative h-28 w-full overflow-hidden bg-zinc-900">
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${activeBanner.preview} opacity-90 transition-all duration-500`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
              </div>

              {/* Avatar + Info */}
              <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative">
                <div className="-mt-10 mb-3 relative">
                  <div className="h-20 w-20 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 ring-4 ring-card flex items-center justify-center font-bold text-xl shadow-xl overflow-hidden">
                    <span className="tracking-tighter">{initials}</span>
                  </div>
                  <span
                    className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-card"
                    title="Perfil Activo"
                  />
                </div>

                <div className="space-y-0.5 mb-4">
                  <h2 className="text-base font-extrabold text-foreground tracking-tight">
                    {name || "Tu Nombre Completo"}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {headline || "Tu Titular / Cargo Profesional"}
                  </p>
                </div>

                {/* Enlaces Sociales */}
                <div className="flex items-center gap-2 mb-5">
                  {githubUrl ? (
                    <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center">
                      <GithubIcon className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                  {linkedinUrl ? (
                    <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center">
                      <LinkedinIcon className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                  {websiteUrl ? (
                    <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                </div>

                {/* Métricas estilo cápsula */}
                <div className="w-full bg-zinc-100/90 dark:bg-zinc-900/90 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center border border-border/50 mb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>98%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">ATS Match</div>
                  </div>

                  <div className="space-y-0.5 border-x border-border/60">
                    <div className="text-xs font-bold text-foreground">
                      {experienceYears || "5+ Años"}
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

                <p className="text-[11px] text-muted-foreground italic line-clamp-2 px-2">
                  {bio || "Tu resumen profesional aparecerá aquí..."}
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIOS DE CONFIGURACIÓN CON PESTAÑAS (8 cols) */}
          <div className="lg:col-span-8 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Ajustes de Perfil, Cuenta y Apariencia
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Personaliza tus datos de usuario, credenciales de inicio de sesión, enlaces y opciones de diseño.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid grid-cols-4 w-full h-9 bg-zinc-100 dark:bg-zinc-800 mb-6">
                  <TabsTrigger value="identity" className="text-xs font-medium">
                    Identidad
                  </TabsTrigger>
                  <TabsTrigger value="account" className="text-xs font-medium">
                    Cuenta & Seguridad
                  </TabsTrigger>
                  <TabsTrigger value="links" className="text-xs font-medium">
                    Redes & Enlaces
                  </TabsTrigger>
                  <TabsTrigger value="style" className="text-xs font-medium">
                    Apariencia
                  </TabsTrigger>
                </TabsList>

                {/* 1. Pestaña: Identidad */}
                <TabsContent value="identity" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nombre Completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-9 text-xs pl-9 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Titular / Cargo Profesional *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          placeholder="ej. Senior Full Stack & Cloud Developer"
                          className="h-9 text-xs pl-9 rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Teléfono de Contacto</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+56 9 1234 5678"
                          className="h-9 text-xs pl-9 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Ubicación (Ciudad, País)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Santiago, Chile"
                          className="h-9 text-xs pl-9 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium">Años de Experiencia / Nivel</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="ej. 5+ Años de Experiencia"
                          className="h-9 text-xs pl-9 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Resumen Profesional (Bio)</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe brevemente tu especialidad técnica, fortalezas y objetivos..."
                      className="text-xs min-h-[90px] rounded-xl"
                    />
                  </div>
                </TabsContent>

                {/* 2. Pestaña: Cuenta & Seguridad (Gmail & Contraseña) */}
                <TabsContent value="account" className="space-y-5 m-0">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Correo Electrónico (Gmail / Cuenta)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu.correo@gmail.com"
                        className="h-9 text-xs pl-9 rounded-xl"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Tu correo se utiliza para iniciar sesión y sincronizar todas tus versiones de CV.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 space-y-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <KeyRound className="h-4 w-4 text-foreground" />
                        <span>Seguridad & Contraseña</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Actualiza tu clave de acceso para proteger tu información.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Contraseña Actual</Label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Nueva Contraseña</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 3. Pestaña: Redes & Portafolio */}
                <TabsContent value="links" className="space-y-4 m-0">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Perfil de GitHub</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <GithubIcon className="h-4 w-4" />
                      </div>
                      <Input
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/tu-usuario"
                        className="h-9 text-xs pl-9 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Perfil de LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <LinkedinIcon className="h-4 w-4" />
                      </div>
                      <Input
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/tu-perfil"
                        className="h-9 text-xs pl-9 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Portafolio Web Personal</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://tuportafolio.dev"
                        className="h-9 text-xs pl-9 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Disponibilidad</Label>
                    <Input
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="ej. Abierto a ofertas remotas / Inmediato"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </TabsContent>

                {/* 4. Pestaña: Apariencia & Banner */}
                <TabsContent value="style" className="space-y-4 m-0">
                  <Label className="text-xs font-semibold text-foreground block">
                    Elige la paleta y temática del Banner de tu Tarjeta:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {BANNER_THEMES.map((theme) => {
                      const isSelected = bannerTheme === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setBannerTheme(theme.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-foreground ring-1 ring-foreground bg-zinc-50 dark:bg-zinc-900"
                              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                          }`}
                        >
                          <div
                            className={`h-12 w-full rounded-xl bg-gradient-to-r ${theme.preview} mb-2 shadow-xs`}
                          />
                          <div className="flex items-center justify-between text-xs font-bold text-foreground">
                            <span>{theme.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-foreground" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Sincronización con CV Activo */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Sincronizar cambios automáticamente con el CV activo</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Al guardar, actualiza inmediatamente tu nombre, contacto y resumen en tu currículum actual.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={syncWithActiveCv}
                  onChange={(e) => setSyncWithActiveCv(e.target.checked)}
                  className="h-4 w-4 rounded accent-foreground cursor-pointer"
                />
              </div>

              {/* Botón de Guardado */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-9 text-xs"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-6 text-xs gap-1.5 font-semibold bg-foreground text-background rounded-xl shadow-sm"
                >
                  {isSaved ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>¡Guardado con Éxito!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar Todos los Cambios</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Zona de Peligro: Eliminar Cuenta */}
            <div className="p-4 sm:p-5 rounded-2xl border border-red-200/80 dark:border-red-950/80 bg-red-50/30 dark:bg-red-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  <span>Zona de Peligro — Eliminar Cuenta</span>
                </div>
                <p className="text-[11px] text-muted-foreground max-w-md">
                  Elimina permanentemente tu cuenta, tus currículums guardados, perfil base y postulaciones. Esta acción no se puede deshacer.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="h-8.5 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-100/50 dark:hover:bg-red-950/40 shrink-0 cursor-pointer"
              >
                Eliminar Cuenta...
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Confirmación para Eliminar Cuenta */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
