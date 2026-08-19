"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Bot, User, AlertCircle } from "lucide-react";
import { useAISettingsStore } from "@/store/useAISettingsStore";
import type { ChatMessage } from "@/types/jobs";

interface AIChatProps {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeSummary: string;
  onClose: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 w-fit rounded-2xl rounded-tl-sm bg-zinc-100 dark:bg-zinc-800">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function AIChat({ jobTitle, company, jobDescription, resumeSummary, onClose }: AIChatProps) {
  const { provider, apiKey } = useAISettingsStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setError(null);

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Key": apiKey,
          "X-AI-Provider": provider,
        },
        body: JSON.stringify({
          messages: apiMessages,
          jobTitle,
          company,
          jobDescription,
          resumeSummary,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Error en la respuesta del servidor.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parsear data stream de Vercel AI SDK (formato: "0:"texto"\n")
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const content = JSON.parse(line.slice(2));
              accumulated += content;
              setStreamingContent(accumulated);
            } catch {
              // Linea parcial, continuar
            }
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: accumulated,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, jobTitle, company, jobDescription, resumeSummary, apiKey, provider]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    // Panel flotante fijo a la derecha con margen y esquinas redondeadas
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-4 right-4 bottom-4 w-[380px] z-50 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/20 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Asistente IA</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
              {jobTitle} · {company}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-2 pb-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Hola, soy tu asistente de postulacion
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[260px]">
              Puedo ayudarte a prepararte para esta entrevista, analizar el puesto y mejorar tu perfil.
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                msg.role === "user"
                  ? "bg-zinc-900 dark:bg-zinc-100"
                  : "bg-gradient-to-br from-violet-500 to-indigo-600"
              }`}>
                {msg.role === "user"
                  ? <User className="w-3 h-3 text-white dark:text-zinc-900" />
                  : <Sparkles className="w-3 h-3 text-white" />
                }
              </div>
              <div className={`max-w-[280px] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "rounded-tr-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-tl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Streaming token a token */}
          {isLoading && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 flex-row"
            >
              <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-violet-500 to-indigo-600">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="max-w-[280px] px-3 py-2 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">
                {streamingContent}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-3.5 bg-current ml-0.5 align-middle"
                />
              </div>
            </motion.div>
          )}

          {/* Typing indicator cuando no hay contenido aun */}
          {isLoading && !streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-violet-500 to-indigo-600">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-400 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none max-h-28 overflow-y-auto"
            style={{ height: "auto", minHeight: "20px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
            }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-1.5">
          IA via {provider === "openai" ? "OpenAI" : "Anthropic"} · Shift+Enter para nueva linea
        </p>
      </div>
    </motion.div>
  );
}
