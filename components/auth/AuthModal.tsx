"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import {
  FileCode2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
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
        <DialogHeader className="space-y-1.5 text-center items-center">
          <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-md">
            <FileCode2 className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-1 justify-center">
            <span className="text-xl font-extrabold tracking-tight text-foreground font-sans">
              Schema<span className="font-semibold text-zinc-400 dark:text-zinc-500">CV</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-0.5 inline-block" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {currentTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </DialogTitle>
        </DialogHeader>

        {/* Botones OAuth Sociales (Google, LinkedIn, GitHub) */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("google")}
              className="h-9 text-xs font-semibold rounded-xl border-border bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              title="Continuar con Google"
            >
              <GoogleIcon />
              <span className="hidden sm:inline font-medium">Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("linkedin")}
              className="h-9 text-xs font-semibold rounded-xl border-border bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              title="Continuar con LinkedIn"
            >
              <LinkedinIcon />
              <span className="hidden sm:inline font-medium">LinkedIn</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("github")}
              className="h-9 text-xs font-semibold rounded-xl border-border bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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

        {/* Selector de Modo (Tabs) */}
        <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center relative border border-border/40">
          <button
            type="button"
            onClick={() => setCurrentTab("login")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer ${
              currentTab === "login"
                ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab("register")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer ${
              currentTab === "register"
                ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario Dinámico */}
        <div className="space-y-3">
          {currentTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs pl-9 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-foreground transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 text-xs pl-9 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-foreground transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-xs gap-2 font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all duration-200 mt-1 cursor-pointer"
              >
                <span>Ingresar a mi Cuenta</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ej. Carlos Mendoza Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 text-xs pl-9 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-foreground transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs pl-9 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-foreground transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 text-xs pl-9 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-foreground transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-xs gap-2 font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all duration-200 mt-1 cursor-pointer"
              >
                <span>Crear Cuenta Gratuita</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          )}

          {/* Separador Sutil */}
          <div className="relative pt-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">o también</span>
            </div>
          </div>

          {/* Acceso Rápido Invitado / Demo */}
          <Button
            type="button"
            variant="outline"
            onClick={loginAsGuest}
            className="w-full h-8.5 text-xs gap-2 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-border/80 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">Continuar como Invitado (Modo Demo)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
