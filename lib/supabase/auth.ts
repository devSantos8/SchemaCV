import { createClient, isSupabaseConfigured } from "./client";

export async function signInWithEmail(email: string, password?: string) {
  if (!isSupabaseConfigured()) {
    return { data: { user: { id: `local-${Date.now()}`, email } }, error: null };
  }

  const supabase = createClient();
  if (!password) {
    // Si no hay password, enviar magic link
    return await supabase.auth.signInWithOtp({ email });
  }

  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  if (!isSupabaseConfigured()) {
    return { data: { user: { id: `local-${Date.now()}`, email, user_metadata: { full_name: name } } }, error: null };
  }

  const supabase = createClient();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        name,
      },
    },
  });
}

export async function signInWithOAuth(provider: "google" | "github" | "linkedin" | "linkedin_oidc") {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const supabase = createClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const actualProvider = provider === "linkedin" ? "linkedin_oidc" : provider;

  return await supabase.auth.signInWithOAuth({
    provider: actualProvider as any,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
}

export async function signOutUser() {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const supabase = createClient();
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
