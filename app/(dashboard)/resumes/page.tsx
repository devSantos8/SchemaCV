"use client";

import React, { useEffect } from "react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { AuthView } from "@/components/auth/AuthView";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function ResumesPage() {
  const { isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <AuthView initialMode="login" />;
  }

  return (
    <DashboardView
      initialSection="resumes"
      onOpenWorkspace={(profileId?: string) => {
        router.push(profileId ? `/editor/${profileId}` : "/editor");
      }}
      onOpenSettings={() => {
        router.push("/settings");
      }}
    />
  );
}
