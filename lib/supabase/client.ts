import { createBrowserClient } from "@supabase/ssr";

function sanitizeSupabaseUrl(url?: string): string {
  if (!url) return "https://placeholder.supabase.co";
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    url.trim() !== "" &&
    key.trim() !== "" &&
    url.startsWith("https://") &&
    !url.includes("tu-proyecto") &&
    key !== "placeholder-key" &&
    key !== "tu-anon-key-aqui"
  );
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "placeholder-key";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
