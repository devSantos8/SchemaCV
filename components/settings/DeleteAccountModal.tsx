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
import { useAuthStore } from "@/store/useAuthStore";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { deleteAccount } = useAuthStore();
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmationText.trim().toLowerCase() === "confirmar";

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      console.error("Error al eliminar la cuenta:", err);
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmationText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-card border-red-200 dark:border-red-950/80 p-6 shadow-2xl">
        <DialogHeader className="space-y-2 text-center items-center">
          <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-400">
            ¿Eliminar cuenta definitivamente?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed text-center">
            Esta acción es <strong className="text-foreground">permanente e irreversible</strong>. Se borrarán todos tus currículums, perfil base, postulaciones del Job Tracker y accesos asociados a esta cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
            Para proceder, escribe la palabra <strong className="font-black underline">confirmar</strong> en el recuadro a continuación:
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Confirmación de seguridad
            </Label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="confirmar"
              disabled={isDeleting}
              className="h-10 text-xs rounded-xl bg-background border-zinc-300 dark:border-zinc-700 focus-visible:ring-red-500 focus-visible:border-red-500 font-mono transition-all"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="h-9 text-xs rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className="h-9 px-4 text-xs gap-1.5 font-semibold rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Eliminando cuenta...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar Cuenta</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
