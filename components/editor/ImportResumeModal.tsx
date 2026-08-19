"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileUp,
} from "lucide-react";

export const ImportResumeModal: React.FC = () => {
  const { isImportModalOpen, setImportModalOpen, loadImportedResume } = useResumeStore();

  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.includes("pdf") || droppedFile.name.endsWith(".pdf") || droppedFile.name.endsWith(".txt")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Por favor sube un archivo PDF o TXT válido.");
      }
    }
  };

  const handleProcessImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (activeTab === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch("/api/parse-cv", {
          method: "POST",
          body: formData,
        });
      } else if (activeTab === "text" && pastedText.trim()) {
        response = await fetch("/api/parse-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText }),
        });
      } else {
        setError("Por favor proporciona un archivo o texto para procesar.");
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "No se pudo extraer la información del CV.");
      }

      loadImportedResume(result.data);
      setImportModalOpen(false);
      setFile(null);
      setPastedText("");
    } catch (err: any) {
      setError(err.message || "Error al procesar el CV con IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isImportModalOpen} onOpenChange={setImportModalOpen}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Ingesta Inteligente de Currículum (IA / Heurística)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sube tu CV en PDF o pega tu perfil de LinkedIn. El motor extraerá y clasificará
            automáticamente la experiencia, educación y habilidades en la taxonomía ATS.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-8 mb-3 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger value="file" className="text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              <span>Subir Archivo PDF</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Pegar Texto / LinkedIn</span>
            </TabsTrigger>
          </TabsList>

          {/* Subir archivo */}
          <TabsContent value="file" className="space-y-3 m-0">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-foreground bg-zinc-100/80 dark:bg-zinc-800/80"
                  : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground">
                  <FileUp className="h-6 w-6" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB — Clic para cambiar archivo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Arrastra y suelta tu archivo PDF aquí o haz clic para explorar
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Soporta documentos PDF y TXT
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pegar texto */}
          <TabsContent value="text" className="space-y-3 m-0">
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Pega aquí el contenido de tu CV, resumen de LinkedIn o texto crudo..."
              className="text-xs min-h-[160px] resize-y font-sans"
            />
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportModalOpen(false)}
            disabled={isLoading}
            className="text-xs h-8"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleProcessImport}
            disabled={isLoading || (activeTab === "file" && !file) || (activeTab === "text" && !pastedText.trim())}
            className="text-xs h-8 gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Extrayendo y estructurando...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Procesar e Importar</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
