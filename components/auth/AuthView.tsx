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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={`${className} fill-[#0A66C2]`} viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const AuthView: React.FC = () => {
  const { login, register, loginWithProvider, loginAsGuest, isLoading, error } = useAuthStore();

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email, password);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    await register(name, email, password);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col items-center justify-center relative select-none">
      {/* Fondo Ambiental Sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-zinc-200/40 via-zinc-100/10 to-transparent dark:from-zinc-800/20 dark:via-zinc-900/10 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle en esquina superior derecha */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-all duration-200 z-20 cursor-pointer"
        title="Alternar tema claro/oscuro"
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Tarjeta de Autenticación Centrada */}
      <main className="w-full max-w-md px-4 z-10 flex flex-col items-center">
        {/* Título & Logo Central Encima de la Tarjeta (Sin subtítulo) */}
        <div className="flex flex-col items-center justify-center gap-1.5 mb-5 text-center select-none animate-in fade-in-50 slide-in-from-top-3 duration-300">
          <div className="h-11 w-11 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-lg ring-1 ring-zinc-900/10 dark:ring-white/20">
            <FileCode2 className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-1.5 justify-center mt-1">
            <span className="text-2xl font-black tracking-tight text-foreground font-sans">
              Schema<span className="font-bold text-zinc-400 dark:text-zinc-500">CV</span>
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 mb-0.5 inline-block animate-pulse" />
          </div>
        </div>

        <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-7 rounded-3xl shadow-xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-300">
          {/* Encabezado */}
          <div className="text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>
          </div>

          {/* Mensaje de Error si ocurre */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón OAuth Exclusivo: Google */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithProvider("google")}
              className="w-full h-10 text-xs font-semibold rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
              title="Continuar con Google"
            >
              <GoogleIcon className="h-4 w-4" />
              <span className="font-semibold text-foreground">Continuar con Google</span>
            </Button>

            {/* Separador */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-muted-foreground font-semibold tracking-wider">
                  o con correo
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Modo (Tabs) */}
          <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center relative border border-border/40">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer ${
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
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer ${
                mode === "register"
                  ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario */}
          <div className="space-y-3">
            {mode === "login" ? (
              <form
                key="login-form"
                onSubmit={handleLoginSubmit}
                className="space-y-3 animate-in fade-in-50 slide-in-from-left-2 duration-200"
              >
                <div className="space-y-1">
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

                <div className="space-y-1">
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
                  disabled={isLoading}
                  className="w-full h-9 text-xs gap-2 font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all duration-200 mt-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Ingresar a mi Cuenta</span>
                  {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
                </Button>
              </form>
            ) : (
              <form
                key="register-form"
                onSubmit={handleRegisterSubmit}
                className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-200"
              >
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    Nombre Completo
                  </Label>
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

                <div className="space-y-1">
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
                  disabled={isLoading}
                  className="w-full h-9 text-xs gap-2 font-semibold rounded-xl bg-foreground text-background shadow-md hover:opacity-90 active:scale-[0.99] transition-all duration-200 mt-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Crear Cuenta Gratuita</span>
                  {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
                </Button>
              </form>
            )}

            {/* Separador Sutil */}
            <div className="relative pt-1">
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
              className="w-full h-8.5 text-xs gap-2 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-border/80 transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium">Continuar como Invitado (Modo Demo)</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
