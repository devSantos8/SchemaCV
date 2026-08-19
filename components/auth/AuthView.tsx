"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Terminal,
  FileDown,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const AuthView: React.FC = () => {
  const { login, register, loginAsGuest } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
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
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      {/* Header Minimalista */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-md">
            <FileCode2 className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            SchemaCV
          </span>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Alternar tema"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* Contenido Principal en 2 Columnas */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Columna Izquierda: Propuesta de Valor ATS (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-border/80">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Plataforma de Ingeniería de CVs para ATS</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Crea currículums aprobados por sistemas ATS en minutos.
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                Diseña, personaliza y sincroniza tus versiones de currículum en tiempo real mediante
                un editor dual visual y código YAML, con exportación vectorial y Word semántico.
              </p>
            </div>

            {/* Puntos Clave de la Plataforma */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Compatibilidad garantizada con Workday, Taleo y Greenhouse.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Terminal className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Sincronización bidireccional continua Formulario ⟷ YAML.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileDown className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Exportación instantánea en PDF Vectorial y Word (.docx).
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Login / Registro (5 cols) */}
          <div className="lg:col-span-5 bg-card/95 backdrop-blur-xl border border-border/80 p-6 sm:p-7 rounded-2xl shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">
                {activeTab === "login" ? "Acceder a tu Cuenta" : "Crear Cuenta Gratuita"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeTab === "login"
                  ? "Ingresa tus credenciales para gestionar tus currículums."
                  : "Regístrate para guardar y personalizar múltiples perfiles."}
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full h-8 bg-zinc-100 dark:bg-zinc-800 mb-3">
                <TabsTrigger value="login" className="text-xs font-medium">
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="text-xs font-medium">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              {/* Formulario de Login */}
              <TabsContent value="login" className="space-y-3 m-0">
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

                  <Button type="submit" className="w-full h-8 text-xs gap-1.5 font-semibold mt-1">
                    <span>Entrar al Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </TabsContent>

              {/* Formulario de Registro */}
              <TabsContent value="register" className="space-y-3 m-0">
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

                  <Button type="submit" className="w-full h-8 text-xs gap-1.5 font-semibold mt-1">
                    <span>Crear Cuenta Gratuita</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Acceso Rápido Modo Invitado / Demo */}
            <div className="pt-3 border-t border-border/80 space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={loginAsGuest}
                className="w-full h-8 text-xs gap-1.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Continuar como Invitado (Demo)</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="h-12 px-6 flex items-center justify-center text-[11px] text-muted-foreground z-10">
        SchemaCV — Plataforma ATS Open-Source
      </footer>
    </div>
  );
};
