"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  FileCode,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import type { ATSParsedSimulation } from "@/types/evaluator";

interface ATSSimulationTabProps {
  simulation: ATSParsedSimulation;
}

export function ATSSimulationTab({ simulation }: ATSSimulationTabProps) {
  const [copied, setCopied] = useState(false);
  const [rawViewMode, setRawViewMode] = useState<"visual" | "raw">("visual");

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(simulation.rawExtractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { detectedContact, detectedSections, encodingIssues, ocrConfidence, wordCount, characterCount } = simulation;

  return (
    <div className="space-y-5">
      {/* Selector de Vista */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Simulador de Extracción ATS</h4>
          <p className="text-[11px] text-zinc-500">
            {wordCount} palabras procesadas · {characterCount} caracteres · {ocrConfidence}% legibilidad digital
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700">
          <button
            onClick={() => setRawViewMode("visual")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              rawViewMode === "visual"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Vista Estructurada
          </button>
          <button
            onClick={() => setRawViewMode("raw")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              rawViewMode === "raw"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Texto Plano Extraído
          </button>
        </div>
      </div>

      {rawViewMode === "visual" ? (
        <div className="space-y-4">
          {/* 1. Datos de Contacto Detectados */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                1. Datos de Contacto Extraídos
              </h5>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  detectedContact.isInBody
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                }`}
              >
                {detectedContact.isInBody ? "Ubicación: Cuerpo Principal ✓" : "Advertencia: En Header/Footer ✗"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block mb-0.5">Nombre Detectado</span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {detectedContact.name || <span className="text-red-500">No detectado</span>}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block mb-0.5">Correo Electrónico</span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                  {detectedContact.email || <span className="text-red-500">No detectado</span>}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block mb-0.5">Teléfono</span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  {detectedContact.phone || <span className="text-zinc-400 font-normal">Opcional / No detectado</span>}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block mb-0.5">Enlaces & Redes</span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                  {detectedContact.links.length > 0 ? `${detectedContact.links.length} detectados` : "Ninguno"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Secuencia y Secciones Identificadas */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              2. Orden de Lectura y Secciones Detectadas ({detectedSections.length})
            </h5>

            {detectedSections.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 py-3">
                No se detectaron títulos de sección reconocibles. Asegúrate de usar nombres estándar como EXPERIENCIA, HABILIDADES o EDUCACIÓN.
              </p>
            ) : (
              <div className="space-y-2">
                {detectedSections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                          {sec.orderIndex}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{sec.detectedHeader}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            sec.isStandard
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}
                        >
                          {sec.isStandard ? "Canónico" : "No estándar"}
                        </span>
                      </div>
                      {sec.snippet && (
                        <p className="text-[11px] text-zinc-500 line-clamp-1 pl-7">{sec.snippet}...</p>
                      )}
                    </div>

                    <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                      {sec.itemCount} items
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Prueba de Codificación UTF-8 & Mojibake */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              3. Test de Integridad de Caracteres y Encoding
            </h5>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                {encodingIssues.hasMojibake ? (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {encodingIssues.hasMojibake ? "Caracteres Corruptos Detectados" : "Codificación UTF-8 Íntegra"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {encodingIssues.hasMojibake
                      ? `Se encontraron ${encodingIssues.corruptedCharacters.length} secuencias ilegibles que rompen la búsqueda ATS.`
                      : "Todas las tildes, eñes y caracteres especiales son 100% legibles."}
                  </p>
                </div>
              </div>

              {encodingIssues.hasMojibake && (
                <span className="text-[10px] font-mono text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900">
                  {encodingIssues.corruptedCharacters.slice(0, 3).join(" ")}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Texto Plano Literal */
        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-200 p-4 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <span className="text-[10px] text-zinc-400">Texto puro extraído por el parser:</span>
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copiado" : "Copiar todo"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto select-all text-zinc-300">
            {simulation.rawExtractedText || "Sin texto extraído."}
          </pre>
        </div>
      )}
    </div>
  );
}
