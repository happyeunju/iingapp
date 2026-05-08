import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url) throw new Error("VITE_SUPABASE_URL 누락");
  if (!anon) throw new Error("VITE_SUPABASE_ANON_KEY 누락");

  client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "iingapp.auth",
    },
  });

  return client;
}

// 테스트에서 모듈 캐시된 client 를 초기화할 때 사용
export function _resetSupabaseClientForTests(): void {
  client = null;
}
