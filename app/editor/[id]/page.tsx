"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";
import EditorPage from "../page";

export default function DynamicEditorPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { profiles, setActiveProfile } = useResumeStore();

  useEffect(() => {
    if (id && profiles.some((p) => p.id === id)) {
      setActiveProfile(id);
    }
  }, [id, profiles, setActiveProfile]);

  return <EditorPage />;
}
