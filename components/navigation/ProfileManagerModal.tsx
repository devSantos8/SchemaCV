"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/store/useResumeStore";
import {
  UserCircle,
  Plus,
  Copy,
  Trash2,
  Check,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

export const ProfileManagerModal: React.FC = () => {
  const {
    profiles,
    activeProfileId,
    isProfileModalOpen,
    setProfileModalOpen,
    setActiveProfile,
    createProfile,
    duplicateProfile,
    deleteProfile,
    updateProfileMeta,
  } = useResumeStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newTargetRole, setNewTargetRole] = useState("");
  const [cloneCurrent, setCloneCurrent] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");

  const handleStartEdit = (id: string, currentName: string, currentRole: string) => {
    setEditingId(id);
    setEditName(currentName);
    setEditRole(currentRole);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateProfileMeta(id, editName.trim(), editRole.trim());
    }
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    createProfile(
      newProfileName.trim(),
      newTargetRole.trim() || "Ingeniero de Software",
      cloneCurrent
    );
    setNewProfileName("");
    setNewTargetRole("");
    setIsCreating(false);
  };

  return (
    <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <UserCircle className="h-5 w-5 text-foreground" />
            <span>Gestión de Perfiles de Currículum</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Crea y administra diferentes versiones de tu CV adaptadas a roles específicos
            (ej. Backend, Full-Stack, DevOps, Tech Lead) reutilizando tus habilidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Lista de Perfiles */}
          <div className="space-y-2.5">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const isEditing = editingId === profile.id;

              return (
                <div
                  key={profile.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50/80 dark:bg-zinc-900/60 shadow-sm"
                      : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-card"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Nombre del Perfil</Label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-xs"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">Rol Objetivo</Label>
                          <Input
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="h-7 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(profile.id)}
                          className="h-7 text-xs"
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {profile.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{profile.targetRole || "Rol no especificado"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveProfile(profile.id);
                              setProfileModalOpen(false);
                            }}
                            className="h-7 text-xs px-2.5"
                          >
                            Seleccionar
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStartEdit(profile.id, profile.name, profile.targetRole)
                          }
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                        >
                          Editar
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateProfile(profile.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Duplicar perfil"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>

                        {profiles.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProfile(profile.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            title="Eliminar perfil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formulario de Creación de Perfil */}
          {isCreating ? (
            <form
              onSubmit={handleCreateNew}
              className="p-3.5 rounded-lg border border-dashed border-border bg-zinc-50 dark:bg-zinc-900/40 space-y-3"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Nuevo Perfil Personalizado</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px]">Nombre del Perfil *</Label>
                  <Input
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="ej. Perfil DevOps & Cloud"
                    className="h-7 text-xs"
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Rol Objetivo *</Label>
                  <Input
                    value={newTargetRole}
                    onChange={(e) => setNewTargetRole(e.target.value)}
                    placeholder="ej. Senior DevOps Engineer"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-7 text-xs">
                  Crear Perfil
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full h-8 text-xs border-dashed gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Crear Nuevo Perfil
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
