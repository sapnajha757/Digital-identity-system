const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, 'apps/web/.env.local'), 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Could not parse supabase credentials");
  process.exit(1);
}

console.log("URL:", supabaseUrl);

fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("Full data response:", JSON.stringify(data, null, 2));
})
.catch(console.error);
