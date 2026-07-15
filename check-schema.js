
require("dotenv").config({ path: "apps/web/.env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) { console.error("No env vars"); process.exit(1); }

fetch(`${supabaseUrl}/rest/v1/`, {
  headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
})
.then(res => res.json())
.then(data => {
  const profileSchema = data.definitions.profiles;
  if (profileSchema) {
    console.log("Profiles columns:", Object.keys(profileSchema.properties));
  } else {
    console.log("No profiles definition found");
  }
})
.catch(console.error);

