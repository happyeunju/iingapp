import { describe, it, expect, beforeEach } from "vitest";
import { getSupabase, _resetSupabaseClientForTests } from "./supabase";

describe("getSupabase", () => {
  beforeEach(() => _resetSupabaseClientForTests());

  it("VITE_SUPABASE_URL 없으면 throw", () => {
    const orig = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL = "";
    expect(() => getSupabase()).toThrowError(/VITE_SUPABASE_URL/);
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL = orig;
  });

  it("VITE_SUPABASE_ANON_KEY 없으면 throw", () => {
    const origUrl = import.meta.env.VITE_SUPABASE_URL;
    const origKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL = "https://example.supabase.co";
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_ANON_KEY = "";
    expect(() => getSupabase()).toThrowError(/VITE_SUPABASE_ANON_KEY/);
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL = origUrl;
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_ANON_KEY = origKey;
  });
});
