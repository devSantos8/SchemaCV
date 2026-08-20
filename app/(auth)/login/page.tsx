"use client";

import React, { useEffect } from "react";
import { AuthView } from "@/components/auth/AuthView";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return <AuthView initialMode="login" />;
}
