"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Loader2,
  ChevronRight,
  MessageSquare,
  Zap,
  Briefcase,
  Target,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  History,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { useAIChatStore } from "@/store/useAIChatStore";
import { buildResumeContext } from "@/lib/ai/prompts";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types/jobs";

const QUICK_PROMPTS = [
  {
    icon: Target,
    text: "¿Cómo mejorar el match ATS de mi CV?",
  },
  {
    icon: Briefcase,
    text: "Simula 3 preguntas de entrevista técnica",
  },
  {
    icon: Sparkles,
    text: "Redacta un resumen profesional de alto impacto",
  },
  {
    icon: FileText,
    text: "Optimiza los logros con métricas cuantitativas",
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 w-fit rounded-2xl rounded-tl-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MarkdownMessageRenderer({ content, isUser }: { content: string; isUser?: boolean }) {
  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong
            key={index}
            className={`font-bold ${
              isUser ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
        return (
          <em key={index} className="italic opacity-90">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={index}
            className={`px-1 py-0.5 rounded font-mono text-[11px] ${
              isUser
                ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                : "bg-zinc-200/80 dark:bg-zinc-800 text-violet-600 dark:text-violet-400"
            }`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        // Divisores horizontales
        if (/^(\-{2,}|_{2,}|\*{3,})$/.test(trimmed)) {
          return <div key={idx} className="my-1.5 border-b border-border/40" />;
        }

        // Encabezados
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#{1,4}\s+/, "");
          return (
            <h4
              key={idx}
              className={`font-bold text-xs pt-1 ${
                isUser ? "text-white dark:text-zinc-900" : "text-foreground"
              }`}
            >
              {parseInlineMarkdown(headingText)}
            </h4>
          );
        }

        // Citas / Blockquotes
        if (trimmed.startsWith(">")) {
          const quoteText = trimmed.replace(/^>\s*/, "");
          return (
            <div
              key={idx}
              className="border-l-2 border-violet-500/60 pl-2 italic text-muted-foreground my-0.5"
            >
              {parseInlineMarkdown(quoteText)}
            </div>
          );
        }

        // Viñetas
        if (/^[-•*]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-•*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className={`font-bold mt-0.5 ${isUser ? "text-zinc-300" : "text-violet-500"}`}>•</span>
              <span className="flex-1 leading-snug">{parseInlineMarkdown(bulletText)}</span>
            </div>
          );
        }

        // Listas numeradas
        const numMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span
                className={`font-mono font-bold shrink-0 ${
                  isUser ? "text-zinc-300" : "text-violet-600 dark:text-violet-400"
                }`}
              >
                {numMatch[1]}.
              </span>
              <span className="flex-1 leading-snug">{parseInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-snug">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export function AIChatSidebar() {
  const { isOpen, setIsOpen, toggleOpen } = useAIChatStore();
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inactivityNotice, setInactivityNotice] = useState(false);

  const { resumeData } = useResumeStore();
  const { user } = useAuthStore();
  const { provider, apiKey } = useAISettingsStore();

  const {
    sessions,
    getCurrentSession,
    createSession,
    switchSession,
    addMessage,
    clearCurrentSession,
    deleteSession,
    clearAllSessions,
    touchActivity,
    checkInactivity,
  } = useAIChatStore();

  const currentSession = getCurrentSession();
  const messages = currentSession.messages;

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  const candidateName = resumeData.name || user?.name || "profesional";

  useEffect(() => {
    if (isOpen) {
      const expired = checkInactivity();
      if (expired) {
        setInactivityNotice(true);
        setTimeout(() => setInactivityNotice(false), 4000);
      } else {
        touchActivity();
      }
    }
  }, [isOpen, checkInactivity, touchActivity]);

  const handleSendMessage = useCallback(
    async (overrideText?: string) => {
      const textToSend = (overrideText || input).trim();
      if (!textToSend || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: textToSend,
        createdAt: new Date().toISOString(),
      };

      addMessage(userMessage);
      setInput("");
      setIsLoading(true);
      setStreamingContent("");
      setError(null);
      touchActivity();

      const candidateContext = buildResumeContext(resumeData);

      try {
        if (!apiKey) {
          await new Promise((r) => setTimeout(r, 600));

          let responseText = "";
          const lower = textToSend.toLowerCase();

          if (lower.includes("ats") || lower.includes("match") || lower.includes("puntaje")) {
            responseText = `Para maximizar tu compatibilidad ATS en SchemaCV:\n\n1. **Alinea la Taxonomía:** Asegúrate de incluir las tecnologías exactas en tu sección de habilidades.\n2. **Cuantifica logros:** Utiliza la fórmula *[Verbo de acción] + [Métrica de impacto] + [Tecnología utilizada]*.\n3. **Plantillas ATS Validadas:** Nuestras plantillas garantizan 100% de lectura secuencial para sistemas ATS.\n\n💡 *(Para respuestas con razonamiento profundo y personalización total, conecta tu clave de Gemini / OpenAI en Ajustes).*`;
          } else if (lower.includes("entrevista") || lower.includes("pregunta")) {
            responseText = `Preguntas clave recomendadas para tu perfil de **${resumeData.headline || "Ingeniería de Software"}**:\n\n1. *¿Cuál ha sido el proyecto o arquitectura de mayor impacto en el que has participado y cuáles fueron tus métricas de éxito?*\n2. *Cuéntame sobre una ocasión donde optimizaste el rendimiento o resolviste un cuello de botella crítico.*\n3. *¿Cómo gestionas la deuda técnica y los requerimientos cambiantes en equipos ágiles?*\n\n💡 **Tip STAR:** Estructura tus respuestas en: Situación, Tarea, Acción y Resultado.`;
          } else if (lower.includes("resumen") || lower.includes("perfil")) {
            responseText = `Propuesta de resumen profesional para tu CV:\n\n*"${resumeData.headline || "Ingeniero de Software"} con sólida experiencia en desarrollo de aplicaciones escalables, optimización de arquitecturas y entrega de valor continuo. Especializado en mejores prácticas de ingeniería y soluciones de alto rendimiento."*`;
          } else {
            responseText = `He analizado tu consulta. Para tu perfil de **${resumeData.headline || "Profesional"}**, te recomiendo vincular tus competencias técnicas principales con logros cuantificables en cada una de tus experiencias laborales.`;
          }

          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: responseText,
            createdAt: new Date().toISOString(),
          };
          addMessage(assistantMsg);
        } else {
          const apiMessages = [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          }));

          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-AI-Key": apiKey,
              "X-AI-Provider": provider,
            },
            body: JSON.stringify({
              messages: apiMessages,
              jobTitle: resumeData.headline || "Ingeniero de Software",
              company: "Empresa Objetivo",
              jobDescription: "Rol profesional enfocado en tecnología, desarrollo y buenas prácticas ATS.",
              resumeSummary: candidateContext,
            }),
          });

          if (!res.ok || !res.body) {
            const err = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(err.error || "No se pudo obtener respuesta del modelo de IA.");
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk.includes('0:"')) {
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("0:")) {
                  try {
                    const content = JSON.parse(line.slice(2));
                    accumulated += content;
                    setStreamingContent(accumulated);
                  } catch {
                    // chunk incompleto
                  }
                }
              }
            } else {
              accumulated += chunk;
              setStreamingContent(accumulated);
            }
          }

          if (!accumulated.trim()) {
            throw new Error("El modelo de IA no devolvió contenido.");
          }

          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: accumulated,
            createdAt: new Date().toISOString(),
          };
          addMessage(assistantMsg);
          setStreamingContent("");
        }
      } catch (err) {
        console.error("Error en AI Chat:", err);
        setError(err instanceof Error ? err.message : "Error al conectar con el asistente.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, resumeData, apiKey, provider, addMessage, touchActivity]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ─── BOTÓN COLAPSADO FLOTANTE/PESTANA EN EL BORDE DERECHO CUANDO ESTÁ CERRADO ─── */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggleOpen}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-1 px-2 py-3 rounded-l-xl bg-gradient-to-b from-violet-600 to-indigo-600 text-white shadow-xl hover:px-2.5 transition-all cursor-pointer border border-r-0 border-white/20 group"
          title="Abrir Copilot IA (GitHub Copilot style)"
        >
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold vertical-writing uppercase tracking-wider py-1 select-none">
            Copilot
          </span>
        </button>
      )}

      {/* ─── SIDEBAR INTEGRADO QUE EMPUJA EL PREVIEW (GITHUB COPILOT APP STYLE) ─── */}
      <aside
        className={`h-full shrink-0 border-l border-border/70 bg-card/95 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out print:hidden ${
          isOpen
            ? "w-full md:w-[300px] lg:w-[320px] xl:w-[340px] 2xl:w-[360px] opacity-100"
            : "w-0 opacity-0 overflow-hidden border-l-0"
        }`}
      >
        {isOpen && (
          <div className="flex flex-col h-full w-full min-w-[280px]">
            {/* Header del Sidebar estilo Copilot */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                    SchemaCV Copilot
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {currentSession.title}
                  </p>
                </div>
              </div>

              {/* Acciones: Nueva Sesión, Historial, Minimizar / Cerrar */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => createSession("Nueva conversación")}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Nueva sesión de chat"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                    showHistory
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                  }`}
                  title="Historial de sesiones"
                >
                  <History className="w-4 h-4" />
                  {sessions.length > 1 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-violet-600 text-[9px] font-bold text-white flex items-center justify-center">
                      {sessions.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Ocultar Copilot (Shift Sidebar)"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inactivity Notice Banner */}
            {inactivityNotice && (
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Sesión reiniciada tras 15 minutos de inactividad.</span>
              </div>
            )}

            {/* Historial o Conversación */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground">
                    Historial de Conversaciones
                  </span>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={clearAllSessions}
                      className="text-[11px] text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Borrar todo
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {sessions.map((sess) => {
                    const isCurrent = sess.id === currentSession.id;
                    const dateStr = new Date(sess.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const msgCount = sess.messages.filter((m) => m.role === "user").length;

                    return (
                      <div
                        key={sess.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isCurrent
                            ? "border-violet-500/50 bg-violet-500/10 shadow-2xs"
                            : "border-border/60 hover:border-border bg-muted/30"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            switchSession(sess.id);
                            setShowHistory(false);
                          }}
                          className="flex-1 text-left min-w-0 cursor-pointer"
                        >
                          <p className="text-xs font-semibold text-foreground truncate">
                            {sess.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {msgCount} mensajes · Última actividad {dateStr}
                          </p>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          {sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteSession(sess.id)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Eliminar sesión"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Lista de Mensajes con Scroll */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs">
                  {messages.length === 0 && (
                    <motion.div
                      key={`static-welcome-${currentSession.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xs">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="max-w-[88%] p-3.5 rounded-2xl leading-relaxed bg-muted/60 text-foreground rounded-tl-xs border border-border/60">
                        <MarkdownMessageRenderer
                          content={`¡Hola ${candidateName}! 👋 Soy tu Copilot ATS en SchemaCV.\n\nTengo sincronizado tu CV en tiempo real. Puedo ayudarte a:\n• Mejorar la redacción de tus viñetas con impacto cuantitativo.\n• Proponer optimizaciones para roles de ${resumeData.headline || "Ingeniería"}.\n• Resolver dudas sobre compatibilidad ATS.\n\n¿En qué te gustaría trabajar hoy?`}
                        />
                      </div>
                    </motion.div>
                  )}

                  {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                      <motion.div
                        key={`${msg.id}-${index}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                            isUser
                              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950"
                              : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                          }`}
                        >
                          {isUser ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        </div>

                        <div
                          className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                            isUser
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-tr-xs font-medium shadow-xs"
                              : "bg-muted/60 text-foreground rounded-tl-xs border border-border/60"
                          }`}
                        >
                          <MarkdownMessageRenderer content={msg.content} isUser={isUser} />
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Streaming en vivo */}
                  {streamingContent && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="max-w-[88%] p-3.5 rounded-2xl rounded-tl-xs bg-muted/60 text-foreground border border-border/60 leading-relaxed">
                        <MarkdownMessageRenderer content={streamingContent} />
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-1 h-3.5 bg-violet-500 ml-0.5 align-middle"
                        />
                      </div>
                    </div>
                  )}

                  {isLoading && !streamingContent && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <TypingIndicator />
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-snug">{error}</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chips de Preguntas Rápidas */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    {QUICK_PROMPTS.map((chip, idx) => {
                      const Icon = chip.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(chip.text)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-background text-foreground border border-border/80 hover:border-violet-500/60 transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Icon className="w-3 h-3 text-violet-500" />
                          <span>{chip.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Input Bar */}
                <div className="p-3 border-t border-border/60 bg-card shrink-0 space-y-1.5">
                  <div className="flex items-end gap-2 bg-muted/50 rounded-xl p-1.5 border border-border/80 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Pregúntale algo a Copilot..."
                      className="flex-1 bg-transparent px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-24 leading-relaxed"
                    />

                    <Button
                      size="icon"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="h-7 w-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shrink-0 cursor-pointer shadow-xs disabled:opacity-40"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={clearCurrentSession}
                      className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Limpiar chat
                    </button>
                    <p className="text-[10px] text-muted-foreground">
                      Enter para enviar • Shift+Enter para salto
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
