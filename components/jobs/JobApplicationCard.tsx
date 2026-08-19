"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2, ExternalLink, MoreVertical, Trash2, Copy, CheckCircle2, XCircle, Wifi, WifiOff, Clock, Sparkles,
} from "lucide-react";
import type { JobApplication } from "@/types/jobs";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/jobs";

interface JobApplicationCardProps {
  application: JobApplication;
  isStale: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function JobApplicationCard({
  application, isStale, isSelected, onClick, onDelete, onDuplicate,
}: JobApplicationCardProps) {
  const { title, company, status, matchAnalysis, linkCheck, keywords, url } = application;
  const score = matchAnalysis?.score;
  const hasAIKeywords = keywords.some((k) => k.source === "ai");
  const [menuOpen, setMenuOpen] = React.useState(false);

  const scoreColor =
    score === undefined ? "" :
    score >= 70 ? "text-emerald-600 dark:text-emerald-400" :
    score >= 40 ? "text-amber-600 dark:text-amber-400" :
    "text-red-500 dark:text-red-400";

  const scoreBg =
    score === undefined ? "bg-zinc-100 dark:bg-zinc-800" :
    score >= 70 ? "bg-emerald-50 dark:bg-emerald-950/30" :
    score >= 40 ? "bg-amber-50 dark:bg-amber-950/30" :
    "bg-red-50 dark:bg-red-950/30";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border p-3.5 transition-all ${
        isSelected
          ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/10"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{company}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Badge stale */}
          {isStale && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
              <Clock className="w-2.5 h-2.5" />
              Follow-up
            </span>
          )}

          {/* Link check badge */}
          {linkCheck && (
            <span title={linkCheck.ok ? "Link activo" : "Link inactivo"}>
              {linkCheck.ok
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                : <XCircle className="w-3.5 h-3.5 text-red-500" />
              }
            </span>
          )}

          {/* Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
              >
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Ver oferta
                  </a>
                )}
                <button onClick={() => { onDuplicate(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Copy className="w-3 h-3" /> Duplicar
                </button>
                <button onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        {/* Status badge */}
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>

        <div className="flex items-center gap-2">
          {/* IA indicator */}
          {hasAIKeywords && (
            <span className="flex items-center gap-0.5 text-[10px] text-violet-500 dark:text-violet-400 font-medium">
              <Sparkles className="w-2.5 h-2.5" /> IA
            </span>
          )}

          {/* Match score */}
          {score !== undefined && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${scoreBg} ${scoreColor}`}>
              {score}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
