"use client";

import React, { useEffect } from "react";
import { ProfileSettingsView } from "@/components/settings/ProfileSettingsView";
import { AuthView } from "@/components/auth/AuthView";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <ProfileSettingsView
      onBack={() => {
        router.push("/dashboard");
      }}
    />
  );
}
