"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  helperText?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "ej: TypeScript, React, Next.js, Node.js...",
  className = "",
  inputClassName = "",
  helperText = "Escribe y presiona Coma ( , ) o Enter para crear cada etiqueta (o pega varias separadas por comas).",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTags = (text: string) => {
    const raw = text.split(",").map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return;

    const existingLower = new Set(value.map((v) => v.toLowerCase()));
    const newTags: string[] = [];

    for (const tag of raw) {
      if (!existingLower.has(tag.toLowerCase())) {
        existingLower.add(tag.toLowerCase());
        newTags.push(tag);
      }
    }

    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTags(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTags(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(",")) {
      e.preventDefault();
      addTags(pasted);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Badges de etiquetas existentes */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-h-[26px] items-center pt-0.5">
          {value.map((tag, idx) => (
            <Badge
              key={`${tag}-${idx}`}
              variant="secondary"
              className="text-[11px] font-mono py-1 px-2.5 rounded-lg flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-muted-foreground hover:text-rose-500 cursor-pointer ml-0.5 transition-colors"
                title={`Eliminar ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input para escribir y añadir con coma o Enter */}
      <div className="flex items-center gap-1.5">
        <Input
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val.includes(",")) {
              addTags(val);
            } else {
              setInputValue(val);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={`h-8 text-xs font-mono rounded-xl bg-background ${inputClassName}`}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addTags(inputValue)}
          disabled={!inputValue.trim()}
          className="h-8 text-xs px-2.5 rounded-xl shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Añadir
        </Button>
      </div>

      {helperText && (
        <p className="text-[10px] text-muted-foreground font-mono">
          💡 {helperText}
        </p>
      )}
    </div>
  );
}
