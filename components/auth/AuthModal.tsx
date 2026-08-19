"use client";

import React, { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import {
  FileCode2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { GoogleIcon, LinkedinIcon, GithubIcon } from "@/components/auth/AuthView";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, authMode, login, register, loginWithProvider, loginAsGuest } =
    useAuthStore();

  const [currentTab, setCurrentTab] = useState<"login" | "register">(authMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
    setEmail("");
    setPassword("");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    register(name, email);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => setAuthModalOpen(open)}>
      <DialogContent className="max-w-md bg-card border-border p-6">
        <DialogHeader className="space-y-2 text-center items-center">
          <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-md">
            <FileCode2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {currentTab === "login" ? "Iniciar Sesión en SchemaCV" : "Crear Cuenta en SchemaCV"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Plataforma de ingeniería de currículums optimizados para ATS y sincronización YAML.
          </DialogDescription>
        </DialogHeader>

        {/* Botones OAuth Sociales (Google, LinkedIn, GitHub) */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("google")}
              className="h-9 text-xs font-semibold rounded-xl border-border bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Continuar con Google"
            >
              <GoogleIcon />
              <span className="hidden sm:inline font-medium">Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("linkedin")}
              className="h-9 text-xs font-semibold rounded-xl border-border bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Continuar con LinkedIn"
            >
              <LinkedinIcon />
              <span className="hidden sm:inline font-medium">LinkedIn</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("github")}
              className="h-9 text-xs font-semibold rounded-xl border-border bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Continuar con GitHub"
            >
              <GithubIcon />
              <span className="hidden sm:inline font-medium">GitHub</span>
            </Button>
          </div>

          {/* Separador */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">
                o con correo
              </span>
            </div>
          </div>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={(v) => setCurrentTab(v as "login" | "register")}
          className="w-full mt-1"
        >
          <TabsList className="grid grid-cols-2 w-full h-8 bg-zinc-100 dark:bg-zinc-800 mb-4">
            <TabsTrigger value="login" className="text-xs">
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs">
              Registrarse
            </TabsTrigger>
          </TabsList>

          {/* Formulario de Login */}
          <TabsContent value="login" className="space-y-3.5 m-0">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-8 text-xs pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-8 text-xs pl-8"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-8 text-xs gap-1.5 font-semibold mt-2">
                <span>Ingresar a mi Cuenta</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </TabsContent>

          {/* Formulario de Registro */}
          <TabsContent value="register" className="space-y-3.5 m-0">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="ej. Joain Matias Monroy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-8 text-xs pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-8 text-xs pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-8 text-xs pl-8"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-8 text-xs gap-1.5 font-semibold mt-2">
                <span>Crear Cuenta Gratuita</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Separador y Acceso Rápido Invitado / Demo */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>¿Quieres probar la herramienta primero?</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loginAsGuest}
            className="w-full h-8 text-xs gap-1.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Continuar como Invitado / Cuenta Demo</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
