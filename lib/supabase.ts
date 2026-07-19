import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function readEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

/**
 * Whether Supabase credentials are present. Consumers can use this to render a
 * helpful "not configured" state instead of crashing.
 */
export const isSupabaseConfigured = (() => {
  const { url, key } = readEnv();
  return Boolean(url && key);
})();

function getBrowserSupabaseUrl(url: string) {
  const shouldUseProxy =
    typeof window !== "undefined" &&
    !url.includes(".supabase.co") &&
    !url.includes("localhost") &&
    !url.includes("127.0.0.1");

  return shouldUseProxy ? window.location.origin : url;
}

const NOT_CONFIGURED_ERROR = {
  message:
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  name: "SupabaseNotConfiguredError",
};

let warnedOnce = false;
function warnMissingConfig() {
  if (warnedOnce) return;
  warnedOnce = true;
  console.warn(`[v0] ${NOT_CONFIGURED_ERROR.message}`);
}

/**
 * A minimal stand-in used when Supabase env vars are missing. It resolves auth
 * reads to a logged-out state and returns a descriptive error for writes so the
 * UI can show a message instead of throwing an unhandled runtime error that
 * white-screens the whole page.
 */
function createFallbackClient(): SupabaseClient {
  const noSession = { data: { session: null }, error: null };
  const authError = { data: { user: null, session: null }, error: NOT_CONFIGURED_ERROR };

  const fallbackAuth = {
    getSession: async () => noSession,
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (_cb: unknown) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => authError,
    signUp: async () => authError,
    signOut: async () => ({ error: null }),
    updateUser: async () => authError,
    resetPasswordForEmail: async () => ({ data: {}, error: NOT_CONFIGURED_ERROR }),
  };

  // Cast through unknown: this intentionally implements only the subset of the
  // Supabase surface the app relies on.
  return { auth: fallbackAuth } as unknown as SupabaseClient;
}

function resolveClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { url, key } = readEnv();
  if (!url || !key) {
    warnMissingConfig();
    cachedClient = createFallbackClient();
    return cachedClient;
  }

  cachedClient = createClient(getBrowserSupabaseUrl(url), key);
  return cachedClient;
}

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(resolveClient(), prop);
  },
});
