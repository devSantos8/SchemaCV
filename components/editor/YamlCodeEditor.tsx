"use client";

import React, { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Sparkles,
  AlertTriangle,
  FileCode,
  Info,
} from "lucide-react";

export const YamlCodeEditor: React.FC = () => {
  const { yamlContent, yamlError, setYamlContent, formatCurrentYaml } = useResumeStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [yamlContent]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-lg overflow-hidden border border-zinc-800">
      {/* Barra Superior del Editor */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span className="font-mono font-semibold text-zinc-200">schema.yaml</span>
          <span className="text-[10px] text-zinc-500 font-mono">RenderCV Compatible</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatCurrentYaml}
            className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1"
            title="Re-formatear y ordenar estructura YAML"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Formatear</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copiar</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerta de Error de Sintaxis si existe */}
      {yamlError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-rose-950/80 border-b border-rose-800/60 text-rose-200 text-xs font-mono">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span className="truncate">{yamlError}</span>
        </div>
      )}

      {/* Editor CodeMirror 6 */}
      <div className="flex-1 overflow-auto text-xs">
        <CodeMirror
          value={yamlContent}
          height="100%"
          theme="dark"
          extensions={[yaml()]}
          onChange={(value) => setYamlContent(value)}
          className="h-full font-mono"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* Pie de estado */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800 text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Sincronización Bidireccional Activa</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Info className="h-3 w-3" />
          <span>Edita el código para actualizar el CV instantáneamente</span>
        </div>
      </div>
    </div>
  );
};
