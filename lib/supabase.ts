import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function getBrowserSupabaseUrl(url: string) {
  const shouldUseProxy =
    typeof window !== "undefined" &&
    !url.includes(".supabase.co") &&
    !url.includes("localhost") &&
    !url.includes("127.0.0.1");

  return shouldUseProxy ? window.location.origin : url;
}

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!cachedClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
      }
      cachedClient = createClient(getBrowserSupabaseUrl(url), key);
    }
    return Reflect.get(cachedClient, prop);
  },
});
