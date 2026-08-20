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
  Sliders,
  Settings,
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
    text: "¿Cómo puedo mejorar el match ATS de mi CV?",
  },
  {
    icon: Briefcase,
    text: "Simula 3 preguntas de entrevista para mi perfil",
  },
  {
    icon: Sparkles,
    text: "Redacta un resumen profesional de alto impacto",
  },
  {
    icon: FileText,
    text: "Optimiza los logros de mi experiencia laboral",
  },
];

export function FloatingAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const { resumeData, masterProfileData } = useResumeStore();
  const { user } = useAuthStore();
  const { provider, apiKey, enabled } = useAISettingsStore();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  // Mensaje inicial de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      const candidateName = resumeData.name || user?.name || "profesional";
      const headline = resumeData.headline || "tecnología";
      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content: `¡Hola ${candidateName}! 👋 Soy tu Copilot de carrera y optimización ATS en SchemaCV. Puedo ayudarte a mejorar la redacción de tu CV, simular entrevistas, encontrar palabras clave y destacar tus logros reales. ¿En qué te gustaría trabajar hoy?`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [resumeData.name, resumeData.headline, user?.name]);

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
          // Asistente local inteligente si el usuario aún no configuró API key
          await new Promise((r) => setTimeout(r, 800));

          let responseText = "";
          if (textToSend.toLowerCase().includes("ats") || textToSend.toLowerCase().includes("match")) {
            responseText = `Para maximizar tu compatibilidad ATS en SchemaCV te recomiendo:\n\n1. **Usa verbos de acción y métricas cuantitativas** (ej. "Reduje la latencia un 35% mediante índices PostgreSQL").\n2. **Evita columnas complejas o tablas anidadas**; nuestras plantillas Tech Minimalist y Harvard garantizan 100% de lectura limpia.\n3. **Incluye la taxonomía de habilidades técnicas exacta** requerida en la oferta laboral.\n\n*(💡 Tip: Puedes configurar tu propia API Key de OpenAI, Anthropic o Gemini en Ajustes → IA para análisis con modelos avanzados).*`;
          } else if (textToSend.toLowerCase().includes("entrevista")) {
            responseText = `Preguntas clave recomendadas para tu perfil de **${resumeData.headline || "Ingeniería de Software"}**:\n\n1. *¿Cuál ha sido el desafío de arquitectura o escalabilidad más complejo que has resuelto y qué impacto tuvo?*\n2. *Cuéntame sobre una ocasión en la que tuviste que optimizar el rendimiento bajo presión de tiempo.*\n3. *¿Cómo abordas el trabajo en equipo y el code review cuando hay discrepancias técnicas?*\n\nUsa la metodología **STAR** (Situación, Tarea, Acción, Resultado) para estructurar tus respuestas.`;
          } else if (textToSend.toLowerCase().includes("resumen")) {
            responseText = `Aquí tienes una propuesta de resumen profesional optimizado:\n\n*"${resumeData.headline || "Ingeniero de Software"} con sólida experiencia en desarrollo de soluciones escalables, optimización de sistemas y metodologías ágiles. Enfocado en la entrega de código de alta calidad, mejores prácticas y arquitecturas robustas que generan impacto medible en el negocio."*`;
          } else {
            responseText = `He analizado tu consulta sobre "${textToSend}". Como recomendación para tu perfil de **${resumeData.headline || "Ingeniero de Software"}**, enfócate en alinear tus logros medibles y habilidades clave (${candidateSkills.slice(0, 80)}...) con los requerimientos específicos de cada postulación.`;
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
              jobDescription: "Rol tecnológico enfocado en desarrollo de software y mejores prácticas.",
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
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Hubo un problema al procesar tu mensaje. Puedes intentar de nuevo o verificar tu configuración en Ajustes → IA.",
            createdAt: new Date().toISOString(),
          },
        ]);
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
      {/* ─── BOTÓN FLOTANTE EN LA ESQUINA INFERIOR DERECHA ─── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
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
            {isOpen ? "Cerrar Asistente" : "Copilot IA"}
          </span>
        </motion.button>
      </div>

      {/* ─── VENTANA FLOTANTE DE CHAT IA ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[540px] max-h-[82vh] rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/25 flex flex-col overflow-hidden"
          >
            {/* Header del Asistente */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    SchemaCV Copilot
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Asistente de Carrera & Optimización ATS
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isUser
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                          : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                      }`}
                    >
                      {isUser ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    </div>

                    <div
                      className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-tr-xs font-medium"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {/* Streaming Content */}
              {streamingContent && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="max-w-[82%] p-3.5 rounded-2xl rounded-tl-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {streamingContent}
                  </div>
                </div>
              )}

              {/* Indicador de Escritura */}
              {isLoading && !streamingContent && (
                <div className="flex items-center gap-2 text-zinc-400 text-[11px] pl-8">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                  <span>El asistente está pensando...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chips de Preguntas Rápidas */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_PROMPTS.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip.text)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Icon className="w-3 h-3 text-violet-500" />
                      <span>{chip.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
