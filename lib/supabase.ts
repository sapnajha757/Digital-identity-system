import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!cachedClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
      }
      cachedClient = createClient(url, key);
    }
    return Reflect.get(cachedClient, prop);
  },
});
