"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Loader2,
  ChevronDown,
  MessageSquare,
  Zap,
  Briefcase,
  Target,
  FileText,
  AlertCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

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

export function FloatingAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { resumeData } = useResumeStore();
  const { user } = useAuthStore();
  const { provider, apiKey } = useAISettingsStore();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (messages.length === 0) {
      const candidateName = resumeData.name || user?.name || "profesional";
      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content: `¡Hola ${candidateName}! 👋 Soy tu Copilot de carrera y optimización ATS en SchemaCV.\n\nPuedo ayudarte a:\n• Mejorar la redacción de tu experiencia con métricas de impacto.\n• Auditar la compatibilidad de tu CV con ofertas de empleo.\n• Simular entrevistas técnicas con la metodología STAR.\n\n¿En qué te gustaría trabajar hoy?`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [resumeData.name, user?.name]);

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

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setStreamingContent("");
      setError(null);

      const candidateSkills = resumeData.skills?.flatMap((s) => s.skills).join(", ") || "No especificadas";
      const candidateExperience = resumeData.experience
        ?.map((e) => `${e.position} en ${e.company} (${e.start_date} - ${e.end_date}): ${e.highlights.join(" | ")}`)
        .join("\n") || "Sin experiencia agregada aún";

      const candidateContext = `Nombre: ${resumeData.name || user?.name || "Candidato"}
Título: ${resumeData.headline || "Profesional"}
Resumen: ${resumeData.summary || "Sin resumen"}
Habilidades: ${candidateSkills}
Experiencia: ${candidateExperience}`;

      try {
        if (!apiKey) {
          // Asistente local inteligente si el usuario aún no ingresó API Key
          await new Promise((r) => setTimeout(r, 700));

          let responseText = "";
          const lower = textToSend.toLowerCase();

          if (lower.includes("ats") || lower.includes("match") || lower.includes("puntaje")) {
            responseText = `Para maximizar tu compatibilidad ATS en SchemaCV:\n\n1. **Alinea la Taxonomía:** Incluye exactamente las tecnologías requeridas en tu sección de habilidades (${candidateSkills.slice(0, 60)}...).\n2. **Cuantifica logros:** Utiliza la fórmula *[Verbo de acción] + [Métrica de impacto] + [Tecnología utilizada]*.\n3. **Plantillas ATS Validadas:** Nuestras plantillas Harvard y Tech Minimalist garantizan 100% de lectura secuencial para los robots.\n\n*(💡 Puedes conectar tu API Key en Ajustes → IA para consultar modelos GPT-4o / Claude en streaming).*`;
          } else if (lower.includes("entrevista") || lower.includes("pregunta")) {
            responseText = `Preguntas clave recomendadas para tu perfil de **${resumeData.headline || "Ingeniería de Software"}**:\n\n1. *¿Cuál ha sido el proyecto o arquitectura de mayor impacto en el que has participado y cuáles fueron tus métricas de éxito?*\n2. *Cuéntame sobre una ocasión donde optimizaste el rendimiento o resolviste un cuello de botella crítico.*\n3. *¿Cómo gestionas la deuda técnica y los requerimientos cambiantes en equipos ágiles?*\n\n💡 **Tip STAR:** Estructura tus respuestas en: Situación, Tarea, Acción y Resultado.`;
          } else if (lower.includes("resumen") || lower.includes("perfil")) {
            responseText = `Propuesta de resumen profesional para tu CV:\n\n*"${resumeData.headline || "Ingeniero de Software"} con sólida experiencia en desarrollo de aplicaciones escalables, optimización de arquitecturas y entrega de valor continuo. Especializado en ${candidateSkills.slice(0, 50) || "desarrollo web y cloud"}, con enfoque en mejores prácticas de ingeniería y soluciones de alto rendimiento."*`;
          } else {
            responseText = `He analizado tu consulta. Para tu perfil de **${resumeData.headline || "Ingeniero de Software"}**, la clave está en vincular tus competencias técnicas principales (${candidateSkills.slice(0, 70)}...) con logros cuantificables en cada una de tus experiencias.`;
          }

          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: responseText,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
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
              company: "Empresa de Tecnología",
              jobDescription: "Rol tecnológico enfocado en desarrollo de software y optimización ATS.",
              resumeSummary: candidateContext,
            }),
          });

          if (!res.ok || !res.body) {
            throw new Error("No se pudo obtener respuesta del modelo de IA.");
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
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
          }

          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: accumulated || "Respuesta procesada correctamente.",
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent("");
        }
      } catch (err) {
        console.error("Error en AI Chat:", err);
        setError(err instanceof Error ? err.message : "Error al conectar con el asistente.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, resumeData, user, apiKey, provider]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ─── BOTÓN FLOTANTE PERMANENTE EN LA ESQUINA INFERIOR DERECHA ─── */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 h-12 px-4 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/35 border border-white/20 transition-all cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-950" />
          </div>

          <span className="text-xs font-bold tracking-tight pr-0.5">
            {isOpen ? "Ocultar Copilot" : "Copilot IA"}
          </span>
        </motion.button>
      </div>

      {/* ─── PANEL LATERAL LARGO (Drawer de Arriba a Abajo) ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-3 right-3 bottom-3 w-[92vw] sm:w-[400px] z-50 flex flex-col rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/25 overflow-hidden"
          >
            {/* Header del Drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    SchemaCV Copilot
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
                    {resumeData.headline || "Asistente de Carrera & ATS"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cuerpo del Chat / Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                        isUser
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                          : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                      }`}
                    >
                      {isUser ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-tr-xs font-medium shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-800/80"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                );
              })}

              {/* Streaming Content */}
              {streamingContent && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tl-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {streamingContent}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-1 h-3.5 bg-violet-500 ml-0.5 align-middle"
                    />
                  </div>
                </div>
              )}

              {/* Typing indicator */}
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
              <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_PROMPTS.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/60 dark:hover:border-violet-500/60 transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Icon className="w-3 h-3 text-violet-500" />
                      <span>{chip.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 space-y-1.5">
              <div className="flex items-end gap-2 bg-zinc-100/80 dark:bg-zinc-900 rounded-2xl p-1.5 border border-zinc-200/80 dark:border-zinc-800 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Pregúntale algo sobre tu CV o vacantes..."
                  className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none focus:outline-none max-h-24 leading-relaxed"
                />

                <Button
                  size="icon"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shrink-0 cursor-pointer shadow-xs disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
                Presiona Enter para enviar • Shift+Enter para salto de línea
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
