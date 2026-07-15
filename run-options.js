const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, 'apps/web/.env.local'), 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

console.log("URL:", supabaseUrl);

// Send OPTIONS request to profiles endpoint
fetch(`${supabaseUrl}/rest/v1/profiles`, {
  method: 'OPTIONS',
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  }
})
.then(async res => {
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log("Body:", text);
})
.catch(console.error);
