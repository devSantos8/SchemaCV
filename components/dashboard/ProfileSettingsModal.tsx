"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { useResumeStore } from "@/store/useResumeStore";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Sparkles,
  Save,
  Palette,
  Check,
  ShieldCheck,
  Clock,
  DollarSign,
} from "lucide-react";

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

export const BANNER_THEMES = [
  {
    id: "warm_amber",
    name: "Warm Amber",
    preview: "from-amber-600 via-orange-500 to-amber-700",
  },
  {
    id: "deep_indigo",
    name: "Deep Indigo",
    preview: "from-indigo-600 via-purple-600 to-violet-800",
  },
  {
    id: "emerald_minimal",
    name: "Emerald Green",
    preview: "from-emerald-600 via-teal-500 to-emerald-800",
  },
  {
    id: "cyber_slate",
    name: "Cyber Slate",
    preview: "from-zinc-800 via-zinc-900 to-black",
  },
];

export const ProfileSettingsModal: React.FC = () => {
  const { user, isSettingsModalOpen, setSettingsModalOpen, updateUserProfile } =
    useAuthStore();
  const { setResumeData } = useResumeStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
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
  }, [user, isSettingsModalOpen]);

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
      setSettingsModalOpen(false);
    }, 600);
  };

  return (
    <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
      <DialogContent className="w-[94vw] max-w-[700px] p-0 overflow-hidden bg-card border-border/80 shadow-2xl rounded-2xl outline-none max-h-[88vh] flex flex-col">
        <DialogHeader className="p-6 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Configuración del Perfil Profesional
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Personaliza tus datos globales, enlaces y apariencia de tu tarjeta de perfil.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-3 w-full h-8 bg-zinc-100 dark:bg-zinc-800 mb-4">
                <TabsTrigger value="general" className="text-xs">
                  Datos Principales
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  Redes & Enlaces
                </TabsTrigger>
                <TabsTrigger value="appearance" className="text-xs">
                  Estilo & Banner
                </TabsTrigger>
              </TabsList>

              {/* Pestaña 1: Datos Principales */}
              <TabsContent value="general" className="space-y-3.5 m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Nombre Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Titular / Cargo Profesional *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="ej. Senior Full Stack & Cloud Developer"
                        className="h-8 text-xs pl-8 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Teléfono de Contacto</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Ubicación (Ciudad, País)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Santiago, Chile"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Experiencia / Años</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="ej. 5+ Años de Experiencia"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-medium">Resumen Profesional / Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe brevemente tu especialidad técnica y fortalezas..."
                    className="text-xs min-h-[80px]"
                  />
                </div>
              </TabsContent>

              {/* Pestaña 2: Redes & Enlaces */}
              <TabsContent value="social" className="space-y-3.5 m-0">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Perfil de GitHub</Label>
                    <div className="relative">
                      <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                        <GithubIcon className="h-3.5 w-3.5" />
                      </div>
                      <Input
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/tu-usuario"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Perfil de LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                        <LinkedinIcon className="h-3.5 w-3.5" />
                      </div>
                      <Input
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/tu-perfil"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Portafolio Web / Blog Personal</Label>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://tudominio.dev"
                        className="h-8 text-xs pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Disponibilidad / Estado de Búsqueda</Label>
                    <Input
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="ej. Abierto a ofertas remotas / Inmediato"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña 3: Estilo & Banner */}
              <TabsContent value="appearance" className="space-y-3.5 m-0">
                <Label className="text-xs font-semibold text-foreground block">
                  Tema y Paleta del Banner de Perfil:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {BANNER_THEMES.map((theme) => {
                    const isSelected = bannerTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setBannerTheme(theme.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-foreground ring-1 ring-foreground bg-zinc-50 dark:bg-zinc-900"
                            : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                        }`}
                      >
                        <div
                          className={`h-12 w-full rounded-lg bg-gradient-to-r ${theme.preview} mb-2 shadow-xs`}
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

            {/* Sincronización Automática con el CV Activo */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-border/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Sincronizar cambios con el CV activo</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Actualiza tu nombre, correo, teléfono y resumen en la versión actual del currículum.
                </p>
              </div>
              <input
                type="checkbox"
                checked={syncWithActiveCv}
                onChange={(e) => setSyncWithActiveCv(e.target.checked)}
                className="h-4 w-4 rounded accent-foreground cursor-pointer"
              />
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="p-4 px-6 border-t border-border/60 flex items-center justify-between bg-card/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSettingsModalOpen(false)}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              className="h-8 px-4 text-xs gap-1.5 font-semibold bg-foreground text-background"
            >
              {isSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar Configuración</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
