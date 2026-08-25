"use client";

import React, { useEffect } from "react";
import { AuthView } from "@/components/auth/AuthView";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const { isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return <AuthView initialMode="login" />;
}
