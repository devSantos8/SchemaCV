"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AuthView: React.FC = () => {
  const { login, register, loginAsGuest } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    register(name, email);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col justify-between relative overflow-hidden transition-colors duration-300 select-none">
      {/* Fondo Ambiental Sutil con Gradiente Radial Minimalista */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-zinc-200/50 via-zinc-100/20 to-transparent dark:from-zinc-800/20 dark:via-zinc-900/10 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Superior Minimalista */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-sm transition-transform hover:scale-105 duration-200">
            <FileCode2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            SchemaCV
          </span>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-all duration-200"
          title="Alternar tema claro/oscuro"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* Tarjeta de Autenticación Centrada & Minimalista */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-7 sm:p-9 rounded-3xl shadow-2xl space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
          {/* Logo y Encabezado */}
          <div className="text-center space-y-1.5">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center mx-auto shadow-md transition-all duration-300 hover:rotate-3 hover:scale-105">
              <FileCode2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground pt-1">
              {mode === "login" ? "Bienvenido de nuevo" : "Crear tu cuenta"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "login"
                ? "Ingresa tus datos para acceder a tus currículums"
                : "Comienza a diseñar tu CV optimizado para ATS"}
            </p>
          </div>

          {/* Selector de Modo (Tabs con Píldora Animada) */}
          <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center relative border border-border/40">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center ${
                mode === "login"
                  ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center ${
                mode === "register"
                  ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario Dinámico con Transición Suave */}
          <div className="space-y-4">
            {mode === "login" ? (
              <form
                key="login-form"
                onSubmit={handleLoginSubmit}
                className="space-y-3.5 animate-in fade-in-50 slide-in-from-left-2 duration-200"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Correo Electrónico
                  </Label>
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Contraseña
                  </Label>
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
                  className="w-full h-9 text-xs gap-2 font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all duration-200 mt-2"
                >
                  <span>Ingresar a mi Cuenta</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            ) : (
              <form
                key="register-form"
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5 animate-in fade-in-50 slide-in-from-right-2 duration-200"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Nombre Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ej. Joain Matias Monroy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-9 text-xs pl-9 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-foreground transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Correo Electrónico
                  </Label>
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Contraseña
                  </Label>
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
                  className="w-full h-9 text-xs gap-2 font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all duration-200 mt-2"
                >
                  <span>Crear Cuenta Gratuita</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            )}

            {/* Separador Sutil */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-muted-foreground">
                  o también
                </span>
              </div>
            </div>

            {/* Acceso Rápido Invitado / Demo */}
            <Button
              type="button"
              variant="outline"
              onClick={loginAsGuest}
              className="w-full h-9 text-xs gap-2 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-border/80 transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium">Continuar como Invitado (Modo Demo)</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="h-14 px-6 flex items-center justify-center text-[11px] text-muted-foreground z-10">
        SchemaCV — Plataforma ATS y Sincronización YAML
      </footer>
    </div>
  );
};
