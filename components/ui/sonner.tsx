"use client";

import React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-800 dark:group-[.toaster]:bg-zinc-900 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-zinc-400 text-xs",
          actionButton:
            "group-[.toast]:bg-zinc-50 group-[.toast]:text-zinc-900 font-semibold rounded-xl text-xs",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 rounded-xl text-xs",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-emerald-400",
          error:
            "group-[.toaster]:border-rose-500/30 group-[.toaster]:text-rose-400",
          info:
            "group-[.toaster]:border-blue-500/30 group-[.toaster]:text-blue-400",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:text-amber-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
