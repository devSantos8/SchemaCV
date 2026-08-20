"use client";

import React, { useEffect } from "react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { AuthView } from "@/components/auth/AuthView";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function MasterProfilePage() {
  const { isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <DashboardView
      initialSection="master_profile"
      onOpenWorkspace={(profileId?: string) => {
        router.push(profileId ? `/editor/${profileId}` : "/editor");
      }}
      onOpenSettings={() => {
        router.push("/settings");
      }}
    />
  );
}
